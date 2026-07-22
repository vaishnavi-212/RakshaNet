export interface URLReputationResponse {
  isMalicious: boolean;
  score: number;
  details: string;
  source: string;
}

export interface IPReputationResponse {
  isMalicious: boolean;
  score: number;
  details: string;
  source: string;
}

export interface ScamLookupResponse {
  isBlacklisted: boolean;
  reportsCount: number;
  category: string;
  source: string;
}

export interface URLReputationProvider {
  checkUrl(url: string): Promise<URLReputationResponse>;
}

export interface IPReputationProvider {
  checkIp(ip: string): Promise<IPReputationResponse>;
}

export interface ScamDatabaseProvider {
  lookupIndicator(type: "upi" | "phone" | "bank_account", value: string): Promise<ScamLookupResponse>;
}
