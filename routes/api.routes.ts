import { Router } from "express";
import crypto from "crypto";
import { OCRService } from "../services/ocr/ocr.service.ts";
import { redactPersonalDetails } from "../utils/redact.ts";
import { ExtractionService } from "../services/intel/extraction.service.ts";
import { NormalizationService } from "../services/intel/normalization.service.ts";
import { ReputationService } from "../services/intel/reputation.service.ts";
import { ThreatIntelService } from "../services/intel/threat-intel.service.ts";
import { KnowledgeBaseService } from "../services/intel/knowledge-base.service.ts";
import { ClassifierService } from "../services/intel/classifier.service.ts";
import { CompositeRiskService } from "../services/intel/composite-risk.service.ts";
import { EntityExtractionService } from "../services/intel/entity-extraction.service.ts";
import { flattenForSession } from "../services/intel/flatten-entities.ts";
import { SessionRepository } from "../repositories/session.repository.ts";
import { DecoyService } from "../services/decoy.service.ts";
import { buildNetworkGraph } from "../services/graph.service.ts";
import { AIService } from "../services/intel/ai.service.ts";
import { AuditRepository } from "../repositories/audit.repository.ts";

export const apiRouter = Router();

function getActionableAdvice(scamType: string, score: number): string {
  if (score < 30) {
    return "This interaction appears safe. However, always remain cautious and never share personal information or OTPs.";
  }
  
  const adviceMap: Record<string, string> = {
    digital_arrest: "Immediately disconnect the call. Indian law enforcement never uses video calls for arrests or digital custody. Report the official department name to cybersecurity police.",
    upi_fraud: "Do not approve any request or click on any payment links in UPI apps. Verify the receiver's name and do not enter your UPI PIN under any circumstance.",
    job_scam: "Do not pay any 'registration fees' or 'security deposits' to get a job. Official organizations never charge money to candidates. Avoid sharing bank details.",
    lottery_prize: "Do not transfer processing fees or taxes to claim a prize. Genuine lotteries or rewards never ask for payments or registration fees beforehand.",
    investment_fraud: "Avoid high-yield schemes offering guaranteed high returns. Verify registration details of investment platforms with SEBI or relevant authorities.",
    family_emergency: "Independently contact your relative or family member through their known, trusted phone number before transferring any money or acting on urgent demands.",
    other: "Avoid sharing any OTP, bank credentials, personal identification, or clicking on unknown links. Verify credentials independently."
  };
  return adviceMap[scamType] || "Do not share passwords, PINs, or financial information. Report this case to local cybercrime units.";
}

// Ingestion and OCR Pipeline Route
apiRouter.post("/analyze", async (req, res, next) => {
  try {
    const { text, image, district } = req.body;
    let workingText = text || "";
    let ocrResult = null;

    if (image) {
      console.log(`[Analyze API] Received image for district ${district}. Initiating OCR pipeline...`);
      const result = await OCRService.extractText(image, "image/jpeg");
      ocrResult = result;
      workingText = result.text;
      console.log(`[Analyze API] OCR extraction completed. Extracted length: ${workingText.length}`);
    } else {
      console.log(`[Analyze API] Direct text received for district ${district}. Text length: ${workingText.length}`);
    }

    // Normalization step
    const { normalized } = NormalizationService.normalizeText(workingText);

    // Extraction step
    const entities = ExtractionService.extractAndValidate(normalized);

    // Threat intelligence checks (Heuristics + DB Reputation lookup)
    const checkedUrls = await Promise.all(
      entities.urls.map(async (u) => {
        const rep = await ThreatIntelService.checkUrlReputation(u.value);
        const dbRep = await ThreatIntelService.getEntityReputation("url", u.value);
        
        const isKnown = rep.isMalicious || dbRep.isKnownScam;
        const count = (dbRep.reportCount || 0);

        return {
          type: "url",
          value: u.value,
          isFlagged: isKnown || count > 0,
          isMalicious: isKnown,
          isKnownScam: isKnown,
          reportCount: dbRep.reportCount,
          reportsCount: count,
          details: `${rep.details || "URL check completed"}. DB reports: ${dbRep.reportCount}`,
          source: "HeuristicEngine"
        };
      })
    );

    const checkedIps = await Promise.all(
      entities.ipAddresses.map(async (ip) => {
        const rep = await ReputationService.checkIpReputation(ip.value);
        const dbRep = await ThreatIntelService.getEntityReputation("ip_address", ip.value);

        const isKnown = rep.isMalicious || dbRep.isKnownScam;
        const count = (dbRep.reportCount || 0);

        return {
          type: "ip_address",
          value: ip.value,
          isFlagged: isKnown || count > 0,
          isMalicious: isKnown,
          isKnownScam: isKnown,
          reportCount: dbRep.reportCount,
          reportsCount: count,
          details: `${rep.details || "IP check completed"}. DB reports: ${dbRep.reportCount}`,
          source: "IPHeuristicEngine"
        };
      })
    );

    const checkedUpis = await Promise.all(
      entities.upiIds.map(async (upi) => {
        const rep = await ReputationService.lookupScamIndicator("upi", upi.value);
        const dbRep = await ThreatIntelService.getEntityReputation("upi", upi.value);

        const isKnown = rep.isBlacklisted || dbRep.isKnownScam;
        const count = (rep.reportsCount || 0) + (dbRep.reportCount || 0);

        return {
          type: "upi",
          value: upi.value,
          isFlagged: isKnown || count > 0,
          isBlacklisted: isKnown,
          isKnownScam: isKnown,
          reportCount: dbRep.reportCount,
          reportsCount: count,
          details: `Heuristic match: ${rep.category} (reports: ${rep.reportsCount}), DB reports: ${dbRep.reportCount}`,
          source: rep.source || "HistoricalScamRegistry"
        };
      })
    );

    const checkedPhones = await Promise.all(
      entities.phoneNumbers.map(async (phone) => {
        const rep = await ReputationService.lookupScamIndicator("phone", phone.value);
        const dbRep = await ThreatIntelService.getEntityReputation("phone", phone.value);

        const isKnown = rep.isBlacklisted || dbRep.isKnownScam;
        const count = (rep.reportsCount || 0) + (dbRep.reportCount || 0);

        return {
          type: "phone",
          value: phone.value,
          isFlagged: isKnown || count > 0,
          isBlacklisted: isKnown,
          isKnownScam: isKnown,
          reportCount: dbRep.reportCount,
          reportsCount: count,
          details: `Heuristic match: ${rep.category} (reports: ${rep.reportsCount}), DB reports: ${dbRep.reportCount}`,
          source: rep.source || "HistoricalScamRegistry"
        };
      })
    );

    const checkedBankAccounts = await Promise.all(
      entities.bankAccounts.map(async (acc) => {
        const rep = await ReputationService.lookupScamIndicator("bank_account", acc.value);
        const dbRep = await ThreatIntelService.getEntityReputation("bank_account", acc.value);

        const isKnown = rep.isBlacklisted || dbRep.isKnownScam;
        const count = (rep.reportsCount || 0) + (dbRep.reportCount || 0);

        return {
          type: "bank_account",
          value: acc.value,
          isFlagged: isKnown || count > 0,
          isBlacklisted: isKnown,
          isKnownScam: isKnown,
          reportCount: dbRep.reportCount,
          reportsCount: count,
          details: `Heuristic match: ${rep.category} (reports: ${rep.reportsCount}), DB reports: ${dbRep.reportCount}`,
          source: rep.source || "HistoricalScamRegistry"
        };
      })
    );

    // For other entities, check general reputation using getEntityReputation (fully backed by DB)
    const otherEntityTypes = [
      ...entities.emails.map(e => ({ type: "email", value: e.value })),
      ...entities.domains.map(d => ({ type: "domain", value: d.value })),
      ...entities.ifscCodes.map(i => ({ type: "ifsc", value: i.value })),
      ...entities.transactionIds.map(t => ({ type: "transaction_id", value: t.value })),
      ...entities.trackingIds.map(tr => ({ type: "tracking_id", value: tr.value })),
      ...entities.panNumbers.map(p => ({ type: "pan", value: p.value })),
      ...entities.maskedAadhaars.map(a => ({ type: "masked_aadhaar", value: a.value })),
      ...entities.walletAddresses.map(w => ({ type: "wallet_address", value: w.value })),
      ...entities.telegramIds.map(tg => ({ type: "telegram_id", value: tg.value })),
      ...entities.discordIds.map(ds => ({ type: "discord_id", value: ds.value })),
      ...entities.instagramIds.map(ig => ({ type: "instagram_id", value: ig.value })),
      ...entities.facebookIds.map(fb => ({ type: "facebook_id", value: fb.value }))
    ];

    const checkedOthers = await Promise.all(
      otherEntityTypes.map(async (item) => {
        const rep = await ThreatIntelService.getEntityReputation(item.type, item.value);
        return {
          type: item.type,
          value: item.value,
          isFlagged: rep.isKnownScam,
          isBlacklisted: rep.isKnownScam,
          isKnownScam: rep.isKnownScam,
          reportCount: rep.reportCount,
          reportsCount: rep.reportCount,
          details: `DB reports: ${rep.reportCount}`,
          source: "HistoricalScamRegistry"
        };
      })
    );

    const allChecked = [
      ...checkedUrls,
      ...checkedIps,
      ...checkedUpis,
      ...checkedPhones,
      ...checkedBankAccounts,
      ...checkedOthers
    ];

    const flaggedEntities = allChecked.filter(e => e.isFlagged);

    const flaggedUpiCount = checkedUpis.filter(e => e.isFlagged).length;
    const flaggedUrlCount = checkedUrls.filter(e => e.isFlagged).length;
    const flaggedPhoneCount = checkedPhones.filter(e => e.isFlagged).length;
    const flaggedIpCount = checkedIps.filter(e => e.isFlagged).length;
    const flaggedBankAccountCount = checkedBankAccounts.filter(e => e.isFlagged).length;

    console.log(`[Analyze API] Threat intel: ${flaggedUpiCount} flagged UPI, ${flaggedUrlCount} flagged URLs, ${flaggedPhoneCount} flagged Phone, ${flaggedIpCount} flagged IP, ${flaggedBankAccountCount} flagged bank account.`);

    // Level 5 RAG Knowledge Base Retrieval
    const ragMatches = await KnowledgeBaseService.findSimilarPatterns(normalized, 5);
    const ragGroundingContext = KnowledgeBaseService.buildGroundingContext(ragMatches);

    // Level 4 Classifier Call
    const classification = await ClassifierService.classifyThreat(normalized, ragGroundingContext);

    console.log(`[Analyze API] RAG-grounded Classification completed. Top Match: ${ragMatches[0]?.id || 'None'} (similarity: ${((ragMatches[0]?.similarity || 0) * 100).toFixed(0)}%), Classified Scam Type: ${classification.scamType}`);

    // Level 6 Composite Risk Engine Evaluation
    const geminiConfidence = (classification.confidence || 0) * 100;
    const riskResult = CompositeRiskService.evaluate({
      cleanText: normalized,
      reputationResults: allChecked,
      ragMatches,
      geminiConfidence
    });

    console.log(`[Analyze API] Composite Risk Engine evaluated. Score: ${riskResult.score}/100, Band: ${riskResult.band}, Reasons: ${riskResult.reasons.map(r => r.text).join(", ")}`);

    // Level 7/8 Entity Extractor & Flattener
    const obscuredEntities = await EntityExtractionService.discoverObscuredEntities(normalized);

    // Merge any newly-discovered obscured entities into the main extraction result
    for (const obs of obscuredEntities) {
      if (obs.type === "phone") {
        if (!entities.phoneNumbers.some(p => p.value === obs.value)) {
          entities.phoneNumbers.push(obs);
        }
      }
    }

    const sessionEntities = flattenForSession(entities, obscuredEntities);

    console.log(
      `[EntityExtractor] Final entity record — UPIs: ${sessionEntities.upiIds.length}, ` +
      `Phones: ${sessionEntities.phoneNumbers.length}, Banks: ${sessionEntities.bankAccounts.length}, ` +
      `URLs: ${sessionEntities.urls.length}${obscuredEntities.length ? ` (+${obscuredEntities.length} obscured)` : ""}`
    );

    // Map Risk Band to Classification Verdict
    let classificationVerdict = "safe";
    if (riskResult.score >= 60) {
      classificationVerdict = "danger";
    } else if (riskResult.score >= 30) {
      classificationVerdict = "suspicious";
    }

    const advice = getActionableAdvice(classification.scamType, riskResult.score);

    // Create session record in database
    const sessionId = crypto.randomUUID();
    await SessionRepository.createSession({
      id: sessionId,
      district: district || "Unknown",
      classification: classificationVerdict,
      scamType: classification.scamType,
      confidence: Math.round(classification.confidence * 100),
      riskScore: riskResult.score,
      riskBand: riskResult.band,
      riskReasons: riskResult.reasons,
      mode: "detect",
      messages: [],
      explanation: classification.explanation,
      actionableAdvice: advice,
    }, sessionEntities);

    // Auto-learning/RAG expansion
    if (riskResult.score >= 61) {
      const redactedText = redactPersonalDetails(normalized, sessionEntities);
      const learnedId = `LEARNED-${sessionId.slice(0, 8)}-${Date.now()}`;

      await KnowledgeBaseService.addPattern({
        id: learnedId,
        scamType: classification.scamType,
        text: redactedText
      });

      const stats = KnowledgeBaseService.getStats();
      console.log(`[Pipeline] Knowledge base grew: ${stats.totalCount} patterns (${stats.seedCount} seed + ${stats.learnedCount} learned)`);
    }

    // Write one audit_log row per pipeline stage
    const auditLogs = [
      {
        sessionId,
        stepName: "ocr",
        inputSummary: image ? "Received image attachment for OCR extraction" : "Direct text report received, skipping OCR",
        outputSummary: ocrResult ? `Extracted ${ocrResult.text.length} characters of text via OCR` : "No OCR run"
      },
      {
        sessionId,
        stepName: "threat_intel",
        inputSummary: `Checked reputation for ${allChecked.length} extracted entities`,
        outputSummary: `Flagged ${flaggedEntities.length} matching malicious/scam records`
      },
      {
        sessionId,
        stepName: "rag_retrieve",
        inputSummary: `Querying similar scam scripts in RAG knowledge base`,
        outputSummary: `Retrieved ${ragMatches.length} matching prior scam patterns`
      },
      {
        sessionId,
        stepName: "classify",
        inputSummary: `Classifying scam category for citizen report text`,
        outputSummary: `Classified as ${classification.scamType} with ${(classification.confidence * 100).toFixed(0)}% confidence`
      },
      {
        sessionId,
        stepName: "risk_score",
        inputSummary: `Evaluating composite risk score from multi-signal engine`,
        outputSummary: `Composite Risk Score: ${riskResult.score}/100, Band: ${riskResult.band.toUpperCase()}`
      },
      {
        sessionId,
        stepName: "entity_extract",
        inputSummary: `Running standard and verbalized-word heuristic extraction`,
        outputSummary: `Extracted ${sessionEntities.upiIds.length} UPIs, ${sessionEntities.phoneNumbers.length} Phones, ${sessionEntities.bankAccounts.length} Banks, ${sessionEntities.urls.length} URLs`
      }
    ];
    await SessionRepository.createAuditLogs(auditLogs);

    res.json({
      success: true,
      sessionId,
      workingText,
      ocrResult,
      district,
      normalizedText: normalized,
      extractedEntities: entities,
      threatIntel: {
        flaggedEntities,
        checkedEntities: allChecked,
        summary: {
          flaggedUpiCount,
          flaggedUrlCount,
          flaggedPhoneCount,
          flaggedIpCount,
          flaggedBankAccountCount,
          totalFlaggedCount: flaggedEntities.length
        }
      },
      ragMatches,
      ragGroundingContext,
      classification,
      riskResult,
      sessionEntities,
      richEntities: entities,
      message: "Ingestion, OCR, Threat Intelligence, RAG Retrieval, Classification, Composite Risk Engine, Entity Extraction, and DB Ingestion pipelines executed successfully."
    });
  } catch (err) {
    next(err);
  }
});

// GET sessions route for the Officer Dashboard
apiRouter.get("/sessions", async (req, res, next) => {
  try {
    const sessions = await SessionRepository.getSessions();
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
});

// Skeleton API routes
apiRouter.get("/scams", (req, res) => {
  res.json({ scams: [] });
});

apiRouter.post("/scams/detect", (req, res) => {
  res.json({ success: true, message: "Detection skeleton placeholder" });
});

apiRouter.post("/decoy", async (req, res, next) => {
  try {
    const { sessionId, messages } = req.body;
    if (!sessionId || !messages) {
       res.status(400).json({ success: false, error: "Missing sessionId or messages" });
       return;
    }
    const result = await DecoyService.handleDecoy({ sessionId, messages });
    res.json({
      success: true,
      response: result.decoyResponse,
      extractedEntities: result.extractedEntities,
      escalationConfidence: result.escalationConfidence,
      agentActive: result.agentActive,
      totalMessages: result.totalMessages
    });
  } catch (err) {
    next(err);
  }
});

apiRouter.get("/decoy/sessions", (req, res) => {
  res.json({ sessions: [] });
});

apiRouter.get("/knowledge-base/stats", (req, res) => {
  res.json(KnowledgeBaseService.getStats());
});

apiRouter.get("/network-graph", async (req, res) => {
  try {
    const sessions = await SessionRepository.getSessions();
    const graph = buildNetworkGraph(sessions);
    res.json(graph);
  } catch (err: any) {
    console.error("[NETWORK GRAPH ERROR]", err.message);
    res.status(500).json({ nodes: [], edges: [] });
  }
});

apiRouter.get("/clusters", (req, res) => {
  res.json({ clusters: [] });
});

apiRouter.post("/advisory", async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const session = await SessionRepository.getSessionById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const allSessions = await SessionRepository.getSessions();
    const currentSession = allSessions.find((s) => s.id === sessionId);
    if (!currentSession) {
      res.status(404).json({ error: "Session not found in list" });
      return;
    }

    const sharedIds = new Set<string>();
    const entityValues = [
      ...(currentSession.extractedEntities?.upiIds || []),
      ...(currentSession.extractedEntities?.phoneNumbers || []),
      ...(currentSession.extractedEntities?.bankAccounts || []),
      ...(currentSession.extractedEntities?.urls || [])
    ];

    for (const other of allSessions) {
      if (other.id === sessionId) continue;
      const otherValues = [
        ...(other.extractedEntities?.upiIds || []),
        ...(other.extractedEntities?.phoneNumbers || []),
        ...(other.extractedEntities?.bankAccounts || []),
        ...(other.extractedEntities?.urls || [])
      ];
      if (otherValues.some((v) => entityValues.includes(v))) {
        sharedIds.add(other.id);
      }
    }

    const linkedSessions = allSessions
      .filter((s) => sharedIds.has(s.id))
      .map((s) => ({ id: s.id, district: s.district || "unknown", scamType: s.scamType || "unknown" }));

    const result = await AIService.generateAdvisory({
      session: currentSession,
      linkedSessions
    });

    await AuditRepository.writeAuditLog(
      sessionId,
      "advisory_generated",
      `Advisory drafted with ${linkedSessions.length} cross-referenced reports.`,
      `Generated ${result.generatedText?.length || 0} characters of advisory text.`
    );

    const alert = {
      id: `MHA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      sessionId,
      generatedText: result.generatedText,
      createdAt: new Date().toISOString()
    };

    res.json(alert);
  } catch (err: any) {
    console.error("[ADVISORY GENERATION ERROR]", err.message);
    res.status(500).json({ error: "Failed to generate advisory" });
  }
});


