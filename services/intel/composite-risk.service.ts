import { RiskEngineService, RiskIndicators } from "./risk-engine.service.ts";
import { PatternMatch } from "./knowledge-base.service.ts";

export type RiskBand = "green" | "amber" | "orange" | "red";

export interface RiskResult {
  score: number;
  band: RiskBand;
  reasons: Array<{ text: string; category: "identity" | "pressure" | "financial" | "pattern" }>;
  breakdown: {
    blacklist: number;
    ragSimilarity: number;
    behavioral: number;
    geminiConfidence: number;
  };
}

function shortReason(name: string): string {
  const map: Record<string, string> = {
    GOVERNMENT_IMPERSONATION: "impersonating CBI/police",
    URGENCY_PSYCH_PRESSURE: "urgency language detected",
    OTP_HARVEST_REQUEST: "asks for OTP/PIN",
    REMOTE_ACCESS_COERCION: "requests remote access software",
    FRAUDULENT_INVESTMENT: "fraudulent investment pitch",
    PARCEL_CONTRABAND_SCAM: "fake customs/parcel claim",
    LOTTERY_REWARD_TRAP: "fake prize/lottery claim",
    FAKE_CUSTOMER_SUPPORT: "impersonating customer support",
    REPEATED_PHONE: "phone number seen in prior reports",
    REPEATED_UPI: "UPI ID seen in prior reports",
    KNOWN_MALICIOUS_URL: "known malicious link",
    HIGH_SCAM_SIMILARITY: "very close match to known scam text"
  };
  return map[name] || name.toLowerCase().replace(/_/g, " ");
}

function getBand(score: number): RiskBand {
  if (score >= 86) return "red";
  if (score >= 61) return "orange";
  if (score >= 31) return "amber";
  return "green";
}

function getCategoryForReason(name: string, text: string): "identity" | "pressure" | "financial" | "pattern" {
  const lowerName = name.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (
    lowerName.includes("impersonat") ||
    lowerName.includes("support") ||
    lowerName.includes("phone") ||
    lowerName.includes("upi") ||
    lowerName.includes("url") ||
    lowerName.includes("link") ||
    lowerText.includes("impersonat") ||
    lowerText.includes("fake customs") ||
    lowerText.includes("fake customer") ||
    lowerText.includes("support") ||
    lowerText.includes("phone") ||
    lowerText.includes("upi") ||
    lowerText.includes("url") ||
    lowerText.includes("link") ||
    lowerText.includes("flagged")
  ) {
    return "identity";
  }
  
  if (
    lowerName.includes("urgency") ||
    lowerName.includes("pressure") ||
    lowerName.includes("otp") ||
    lowerName.includes("pin") ||
    lowerName.includes("coercion") ||
    lowerName.includes("remote") ||
    lowerName.includes("access") ||
    lowerName.includes("parcel") ||
    lowerName.includes("contraband") ||
    lowerText.includes("urgency") ||
    lowerText.includes("pressure") ||
    lowerText.includes("otp") ||
    lowerText.includes("pin") ||
    lowerText.includes("coercion") ||
    lowerText.includes("remote") ||
    lowerText.includes("access") ||
    lowerText.includes("parcel") ||
    lowerText.includes("contraband")
  ) {
    return "pressure";
  }
  
  if (
    lowerName.includes("investment") ||
    lowerName.includes("pitch") ||
    lowerName.includes("lottery") ||
    lowerName.includes("prize") ||
    lowerName.includes("reward") ||
    lowerText.includes("investment") ||
    lowerText.includes("pitch") ||
    lowerText.includes("lottery") ||
    lowerText.includes("prize") ||
    lowerText.includes("reward") ||
    lowerText.includes("bank") ||
    lowerText.includes("account") ||
    lowerText.includes("money") ||
    lowerText.includes("transfer") ||
    lowerText.includes("payment") ||
    lowerText.includes("fraudulent")
  ) {
    return "financial";
  }
  
  return "pattern";
}

export class CompositeRiskService {
  static evaluate(params: {
    cleanText: string;
    reputationResults: any[];
    ragMatches: PatternMatch[];
    geminiConfidence: number;
  }): RiskResult {
    const { cleanText, reputationResults, ragMatches, geminiConfidence } = params;

    // Signal 1: Blacklist match (0-35)
    let blacklistScore = 0;
    let maxReportCount = 0;
    let worstEntity: any = null;

    for (const r of reputationResults) {
      const isKnown = r.isKnownScam === true || r.isBlacklisted === true || r.isMalicious === true;
      const count = r.reportCount !== undefined ? r.reportCount : (r.reportsCount || 0);

      let score = 0;
      if (isKnown) {
        score = 35;
      } else if (count > 0) {
        score = Math.min(35, count * 7);
      }

      if (score > blacklistScore) {
        blacklistScore = score;
        worstEntity = r;
      }
      if (count > maxReportCount) {
        maxReportCount = count;
      }
    }

    // Signal 2: RAG similarity (0-25)
    const topMatch = ragMatches[0];
    const ragScore = topMatch ? topMatch.similarity * 25 : 0;

    // Signal 3: Behavioral/keyword risk (0-20)
    const indicators: RiskIndicators = {
      hasRepeatedPhone: reputationResults.some(
        (r) => r.type === "phone" && (r.isBlacklisted || (r.reportCount || 0) > 0 || (r.reportsCount || 0) > 0)
      ),
      hasRepeatedUpi: reputationResults.some(
        (r) => r.type === "upi" && (r.isBlacklisted || (r.reportCount || 0) > 0 || (r.reportsCount || 0) > 0)
      ),
      hasMaliciousUrl: reputationResults.some(
        (r) => r.type === "url" && (r.isMalicious || (r.reportCount || 0) > 0 || (r.reportsCount || 0) > 0)
      ),
      hasHighScamSimilarity: !!topMatch && topMatch.similarity > 0.75,
      hasOtpRequest: false,
      hasRemoteAccess: false,
      hasInvestmentScam: false,
      hasParcelScam: false,
      hasGovImpersonation: false,
      hasLotteryReward: false,
      hasUrgencyPressure: false,
      hasFakeSupport: false
    };
    const behavioral = RiskEngineService.evaluateRisk({ text: cleanText, indicators });
    const behavioralScore = (behavioral.score / 100) * 20;

    // Signal 4: Gemini classification confidence (0-20)
    const confidenceScore = (geminiConfidence / 100) * 20;

    const total = Math.min(100, Math.round(blacklistScore + ragScore + behavioralScore + confidenceScore));

    // Build reasons
    const reasons: Array<{ text: string; category: "identity" | "pressure" | "financial" | "pattern" }> = [];
    behavioral.matched.slice(0, 3).forEach((m) => {
      const txt = shortReason(m.name);
      reasons.push({ text: txt, category: getCategoryForReason(m.name, txt) });
    });
    if (worstEntity) {
      const txt = `flagged ${worstEntity.type || "entity"}`;
      reasons.push({ text: txt, category: getCategoryForReason("", txt) });
    }
    if (maxReportCount > 0) {
      const txt = `similar to ${maxReportCount} previous reports`;
      reasons.push({ text: txt, category: "pattern" });
    }
    if (topMatch && topMatch.similarity > 0.6) {
      const txt = `matches known pattern ${topMatch.id}`;
      reasons.push({ text: txt, category: "pattern" });
    }

    return {
      score: total,
      band: getBand(total),
      reasons: reasons.slice(0, 6),
      breakdown: {
        blacklist: Math.round(blacklistScore),
        ragSimilarity: Math.round(ragScore),
        behavioral: Math.round(behavioralScore),
        geminiConfidence: Math.round(confidenceScore)
      }
    };
  }
}
