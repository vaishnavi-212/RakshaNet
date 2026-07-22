import { HeuristicReputationProvider } from "./providers/heuristic.provider.ts";
import { URLReputationProvider, IPReputationProvider, ScamDatabaseProvider } from "./providers/threat-intel.provider.ts";

export class ReputationService {
  private static urlProvider: URLReputationProvider = new HeuristicReputationProvider();
  private static ipProvider: IPReputationProvider = new HeuristicReputationProvider();
  private static scamProvider: ScamDatabaseProvider = new HeuristicReputationProvider();

  static configureProviders(providers: {
    url?: URLReputationProvider;
    ip?: IPReputationProvider;
    scam?: ScamDatabaseProvider;
  }) {
    if (providers.url) this.urlProvider = providers.url;
    if (providers.ip) this.ipProvider = providers.ip;
    if (providers.scam) this.scamProvider = providers.scam;
  }

  static async checkUrlReputation(userUrl: string): Promise<{ isMalicious: boolean; details: string }> {
    try {
      const response = await this.urlProvider.checkUrl(userUrl);
      return {
        isMalicious: response.isMalicious,
        details: response.details
      };
    } catch (err: any) {
      console.error("[REPUTATION SERVICE ERROR] url lookup failed:", err.message);
      return { isMalicious: false, details: `Lookup error: ${err.message}` };
    }
  }

  static async checkIpReputation(ip: string): Promise<{ isMalicious: boolean; details: string; score: number }> {
    try {
      const response = await this.ipProvider.checkIp(ip);
      return {
        isMalicious: response.isMalicious,
        details: response.details,
        score: response.score
      };
    } catch (err: any) {
      console.error("[REPUTATION SERVICE ERROR] ip lookup failed:", err.message);
      return { isMalicious: false, details: `Lookup error: ${err.message}`, score: 0 };
    }
  }

  static async lookupScamIndicator(type: "upi" | "phone" | "bank_account", value: string) {
    try {
      return await this.scamProvider.lookupIndicator(type, value);
    } catch (err: any) {
      console.error("[REPUTATION SERVICE ERROR] indicator lookup failed:", err.message);
      return { isBlacklisted: false, reportsCount: 0, category: "ERROR", source: "Unknown" };
    }
  }
}
