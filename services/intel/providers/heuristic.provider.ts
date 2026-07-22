import {
  URLReputationProvider,
  IPReputationProvider,
  ScamDatabaseProvider,
  URLReputationResponse,
  IPReputationResponse,
  ScamLookupResponse
} from "./threat-intel.provider.ts";

export class HeuristicReputationProvider
  implements URLReputationProvider, IPReputationProvider, ScamDatabaseProvider {

  async checkUrl(url: string): Promise<URLReputationResponse> {
    const maliciousKeywords = [
      "skype-arrest", "cbi-verification", "pnb-kyc", "hdfc-secure",
      "telegram-tasks", "vip-invest", "easy-earn", "free-money"
    ];

    const parsedUrl = url.toLowerCase();
    const matchesKeyword = maliciousKeywords.some(kw => parsedUrl.includes(kw));
    if (matchesKeyword) {
      return {
        isMalicious: true,
        score: 0.95,
        details: "Heuristic: Matches known high-risk phishing keywords",
        source: "HeuristicEngine"
      };
    }

    return {
      isMalicious: false,
      score: 0.05,
      details: "No suspicious patterns detected.",
      source: "HeuristicEngine"
    };
  }

  async checkIp(ip: string): Promise<IPReputationResponse> {
    const localIps = ["127.0.0.1", "::1", "localhost"];
    if (localIps.includes(ip) || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return {
        isMalicious: false,
        score: 0.01,
        details: "Private or loopback routing IP.",
        source: "IPHeuristicEngine"
      };
    }

    const highRiskMockIps = ["185.220.101.", "109.70.100."];
    const matchesTorRange = highRiskMockIps.some(range => ip.startsWith(range));

    if (matchesTorRange) {
      return {
        isMalicious: true,
        score: 0.90,
        details: "Heuristic match for known Tor exit relay ranges.",
        source: "IPHeuristicEngine"
      };
    }

    return {
      isMalicious: false,
      score: 0.10,
      details: "Public IP cleanly routed with no current reputation issues.",
      source: "IPHeuristicEngine"
    };
  }

  async lookupIndicator(type: "upi" | "phone" | "bank_account", value: string): Promise<ScamLookupResponse> {
    const cleanValue = value.toLowerCase().trim();

    if (type === "upi") {
      const suspiciousUpiKeywords = ["cbi", "police", "surveillance", "fine", "arrest", "invest", "trading", "crypto"];
      const matchesKeyword = suspiciousUpiKeywords.some(kw => cleanValue.includes(kw));

      if (matchesKeyword) {
        return {
          isBlacklisted: true,
          reportsCount: 12,
          category: "IMPERSONATION_PHISHING",
          source: "ScamHeuristicRegistry"
        };
      }
    }

    if (type === "phone") {
      if (cleanValue.startsWith("+92") || cleanValue.startsWith("92")) {
        return {
          isBlacklisted: true,
          reportsCount: 45,
          category: "INTERNATIONAL_SPOOFING",
          source: "ScamHeuristicRegistry"
        };
      }
    }

    if (type === "bank_account") {
      const flagAccounts = ["999912", "0024500", "888201"];
      const isSuspectBank = flagAccounts.some(acc => cleanValue.startsWith(acc));

      if (isSuspectBank) {
        return {
          isBlacklisted: true,
          reportsCount: 8,
          category: "MULE_ACCOUNT_FRAUD",
          source: "ScamHeuristicRegistry"
        };
      }
    }

    return {
      isBlacklisted: false,
      reportsCount: 0,
      category: "NONE",
      source: "ScamHeuristicRegistry"
    };
  }
}
