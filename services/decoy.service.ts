import { SessionRepository } from "../repositories/session.repository.ts";
import { EntityRepository } from "../repositories/entity.repository.ts";
import { AuditRepository } from "../repositories/audit.repository.ts";
import { AIService } from "./intel/ai.service.ts";
import { extractIntelligence, detectScam } from "../utils/scam-filter.ts";

export interface DecoyResult {
  decoyResponse: string;
  extractedEntities: any;
  escalationConfidence: number;
  agentActive: boolean;
  totalMessages: number;
}

export class DecoyService {
  static async handleDecoy(params: { messages: any[]; sessionId: string }): Promise<DecoyResult> {
    const { messages, sessionId } = params;
    const lastUserMsg = messages[messages.length - 1]?.text || "";

    const decoyExtracted = extractIntelligence(lastUserMsg);

    await AuditRepository.writeAuditLog(
      sessionId,
      "decoy_regex_extract",
      `Decoy mode scan on message: "${lastUserMsg.substring(0, 200)}"`,
      JSON.stringify(decoyExtracted)
    );

    const insertEntityAndLink = async (type: string, value: string) => {
      try {
        await EntityRepository.insertEntityAndLink(sessionId, type, value);
      } catch (entErr) {
        console.error(`[DECOY ENTITY ERROR] ${type}:${value}:`, entErr);
      }
    };

    for (const u of decoyExtracted.upiIds) await insertEntityAndLink("upi", u);
    for (const p of decoyExtracted.phoneNumbers) await insertEntityAndLink("phone", p);
    for (const b of decoyExtracted.bankAccounts) await insertEntityAndLink("bank_account", b);
    for (const u of decoyExtracted.urls) await insertEntityAndLink("url", u);

    const existingSession = await SessionRepository.getSessionById(sessionId);
    if (!existingSession) throw new Error("Session not found.");

    const currentEscalationConfidence = existingSession.escalationConfidence ?? 0.0;
    const currentAgentActive = existingSession.agentActive ?? false;
    const currentTotalMessages = existingSession.totalMessages ?? 0;

    let delta = 0.0;
    if (decoyExtracted.upiIds.length > 0) delta += 0.20;
    if (decoyExtracted.bankAccounts.length > 0) delta += 0.20;
    if (decoyExtracted.phoneNumbers.length > 0) delta += 0.15;
    if (decoyExtracted.urls.length > 0) delta += 0.15;

    const scoringResult = detectScam(lastUserMsg);
    if (scoringResult.isScam) delta += 0.20;
    if (delta === 0) delta += 0.10;

    const newConfidence = Math.min(1.0, currentEscalationConfidence + delta);
    const newTotalMessages = currentTotalMessages + 1;
    const shouldActivateAgent = currentAgentActive || newConfidence >= 0.6;

    await AuditRepository.writeAuditLog(
      sessionId,
      "escalation_gating",
      `Gating decision: Delta: ${delta.toFixed(2)}. New confidence: ${newConfidence.toFixed(2)}. Threshold: 0.60.`,
      `Decoy Active: ${shouldActivateAgent}. Cumulative confidence score: ${newConfidence.toFixed(2)}`
    );

    let decoyReply = "";

    if (shouldActivateAgent) {
      const formattedHistory = messages.map((msg) => `${msg.role === "user" ? "Scammer" : "AI Decoy"}: ${msg.text}`).join("\n");
      const parsedResult = await AIService.generateDecoyReply({ formattedHistory });
      decoyReply = parsedResult.decoyResponse || "I am trying to log in but my internet is slow, wait beta...";

      await AuditRepository.writeAuditLog(
        sessionId,
        "decoy_gpt_reply",
        `Stall reply generation using gemini-3.5-flash.`,
        `Drafted: "${decoyReply.substring(0, 150)}"`
      );
    } else {
      const isMalicious = scoringResult.isScam || decoyExtracted.upiIds.length > 0 || decoyExtracted.phoneNumbers.length > 0 || decoyExtracted.bankAccounts.length > 0 || decoyExtracted.urls.length > 0;
      const classification = isMalicious ? "SUSPICIOUS" : "SAFE";
      const confidencePct = Math.round(newConfidence * 100);

      decoyReply = `[Intelligence Case File: ${sessionId}]\nThreat level: ${classification}\nConfidence: ${confidencePct}%\n\nExplanation: Fast-filter indicators have been scanned and added to ledger. Continue relaying scammer messages to raise escalation confidence.\n\nAdvice: Do not send any funds or click links. RakshaNet needs more signal (currently ${confidencePct}%, must be 60%+ to deploy the AI decoy).`;

      await AuditRepository.writeAuditLog(
        sessionId,
        "decoy_static_reply",
        `Gating active: below threshold.`,
        `Returned static analysis digest: ${confidencePct}%`
      );
    }

    const completeMessages = [...messages, { role: "model", text: decoyReply, timestamp: new Date().toISOString() }];

    await SessionRepository.updateSession(sessionId, {
      messages: completeMessages,
      mode: "decoy",
      escalationConfidence: newConfidence,
      agentActive: shouldActivateAgent,
      totalMessages: newTotalMessages
    });

    return { 
      decoyResponse: decoyReply, 
      extractedEntities: decoyExtracted,
      escalationConfidence: newConfidence,
      agentActive: shouldActivateAgent,
      totalMessages: newTotalMessages
    };
  }
}
