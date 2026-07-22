export enum ScamType {
  PHISHING = "PHISHING",
  OTP_FRAUD = "OTP_FRAUD",
  JOB_SCAM = "JOB_SCAM",
  INVESTMENT_SCAM = "INVESTMENT_SCAM",
  IMPOSTER = "IMPOSTER",
  OTHER = "OTHER",
}

export enum ScamStatus {
  PENDING = "PENDING",
  ANALYZED = "ANALYZED",
  ENGAGING = "ENGAGING",
  ESCALATED = "ESCALATED",
}

export interface ScamMessageReport {
  id: string;
  content: string;
  senderPhone?: string;
  senderEmail?: string;
  scamType: ScamType;
  confidenceScore: number; // 0 to 100
  screenshotUrl?: string;
  status: ScamStatus;
  evidenceExtracted?: string[];
  notes?: string;
  createdAt: string;
}

export interface DecoyMessage {
  id: string;
  sender: "SCAMMER" | "DECOY";
  text: string;
  timestamp: string;
}

export interface DecoySession {
  id: string;
  reportId: string;
  scammerContact: string;
  botPersona: string;
  messages: DecoyMessage[];
  isActive: boolean;
  intelLevel: number; // 0 to 100 indicator of evidence gathered
  createdAt: string;
}

export interface FraudCluster {
  id: string;
  name: string;
  scamType: ScamType;
  relatedReportsCount: number;
  threatScore: number; // 1 to 10
  keyIndicators: string[];
  status: "ACTIVE" | "UNDER_INVESTIGATION" | "DISSOLVED";
  primaryLocation?: string;
  createdAt: string;
}

export interface ExtractedEntities {
  upiIds: string[];
  phoneNumbers: string[];
  bankAccounts: string[];
  urls: string[];
}

export interface CategorizedReason {
  text: string;
  category: "identity" | "pressure" | "financial" | "pattern";
}

export interface Session {
  id: string;
  createdAt?: string;
  district?: string;
  classification?: "safe" | "suspicious" | "danger";
  scamType?: string;
  confidence?: number;
  riskScore?: number;
  riskBand?: string;
  riskReasons?: Array<CategorizedReason | string>;
  mode?: "detect" | "decoy";
  messages?: any;
  explanation?: string;
  actionableAdvice?: string;
  extractedEntities?: ExtractedEntities;
}

export interface EntityNode {
  id: string;
  type: string; // "session" | "upi" | "phone" | "bank_account" | "url"
  value: string;
  firstSeenSessionId: string;
  sessionIds: string[];
}

export interface EntityEdge {
  source: string;
  target: string;
}

export interface CaseAlert {
  id: string;
  sessionId: string;
  generatedText: string;
  createdAt: string;
}


