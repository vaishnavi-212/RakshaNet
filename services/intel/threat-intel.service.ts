import { ReputationService } from "./reputation.service.ts";
import { ReputationIntelService } from "../reputation-intel.service.ts";

export class ThreatIntelService {
  static async checkUrlReputation(url: string): Promise<{ isMalicious: boolean; details: string }> {
    return ReputationService.checkUrlReputation(url);
  }

  /**
   * Looks up the entity reputation against actual prior session reports in the database.
   */
  static async getEntityReputation(type: string, value: string) {
    return ReputationIntelService.getEntityReputation(type, value);
  }
}

