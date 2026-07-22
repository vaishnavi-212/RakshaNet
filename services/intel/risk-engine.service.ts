export interface RiskIndicators {
  hasRepeatedPhone: boolean;
  hasRepeatedUpi: boolean;
  hasMaliciousUrl: boolean;
  hasHighScamSimilarity: boolean;
  hasOtpRequest: boolean;
  hasRemoteAccess: boolean;
  hasInvestmentScam: boolean;
  hasParcelScam: boolean;
  hasGovImpersonation: boolean;
  hasLotteryReward: boolean;
  hasUrgencyPressure: boolean;
  hasFakeSupport: boolean;
}

export interface RiskWeights {
  repeatedPhone: number;
  repeatedUpi: number;
  maliciousUrl: number;
  highScamSimilarity: number;
  otpRequest: number;
  remoteAccess: number;
  investmentScam: number;
  parcelScam: number;
  govImpersonation: number;
  lotteryReward: number;
  urgencyPressure: number;
  fakeSupport: number;
}

export class RiskEngineService {
  private static WEIGHTS: RiskWeights = {
    repeatedPhone: 20,
    repeatedUpi: 25,
    maliciousUrl: 30,
    highScamSimilarity: 15,
    otpRequest: 25,
    remoteAccess: 20,
    investmentScam: 15,
    parcelScam: 15,
    govImpersonation: 25,
    lotteryReward: 15,
    urgencyPressure: 15,
    fakeSupport: 10
  };

  static configureWeights(customWeights: Partial<RiskWeights>) {
    this.WEIGHTS = { ...this.WEIGHTS, ...customWeights };
  }

  static getWeights(): RiskWeights {
    return this.WEIGHTS;
  }

  static evaluateRisk(params: {
    text: string;
    indicators: RiskIndicators;
  }): {
    score: number;
    classification: "safe" | "suspicious" | "danger";
    matched: Array<{ name: string; weight: number; description: string }>;
  } {
    const { text, indicators } = params;
    const lowerText = text.toLowerCase();
    const matched: Array<{ name: string; weight: number; description: string }> = [];

    if (indicators.hasRepeatedPhone) {
      matched.push({ name: "REPEATED_PHONE", weight: this.WEIGHTS.repeatedPhone, description: "Phone number has been previously reported in other cases" });
    }
    if (indicators.hasRepeatedUpi) {
      matched.push({ name: "REPEATED_UPI", weight: this.WEIGHTS.repeatedUpi, description: "UPI ID has been previously reported in other cases" });
    }
    if (indicators.hasMaliciousUrl) {
      matched.push({ name: "KNOWN_MALICIOUS_URL", weight: this.WEIGHTS.maliciousUrl, description: "URL intelligence flagged a link as unsafe" });
    }
    if (indicators.hasHighScamSimilarity) {
      matched.push({ name: "HIGH_SCAM_SIMILARITY", weight: this.WEIGHTS.highScamSimilarity, description: "Case text has extremely high semantic similarity to verified fraud scripts" });
    }
    if (indicators.hasOtpRequest || /\b(otp|one time password|verification code|security pin)\b/i.test(lowerText)) {
      matched.push({ name: "OTP_HARVEST_REQUEST", weight: this.WEIGHTS.otpRequest, description: "Text explicitly requests a high-security OTP or transaction PIN" });
    }
    if (indicators.hasRemoteAccess || /\b(anydesk|teamviewer|rustdesk|remote access|download screen share)\b/i.test(lowerText)) {
      matched.push({ name: "REMOTE_ACCESS_COERCION", weight: this.WEIGHTS.remoteAccess, description: "Solicitations to download remote control screen-sharing software" });
    }
    if (indicators.hasInvestmentScam || /\b(trading|ipo|yield|deposit capital|double money|crypto profit|stock academy)\b/i.test(lowerText)) {
      matched.push({ name: "FRAUDULENT_INVESTMENT", weight: this.WEIGHTS.investmentScam, description: "High-yield investment academy, fake IPOs, or VIP stock groups" });
    }
    if (indicators.hasParcelScam || /\b(fedex|customs|illegal parcel|passport seized|contraband|banned drugs)\b/i.test(lowerText)) {
      matched.push({ name: "PARCEL_CONTRABAND_SCAM", weight: this.WEIGHTS.parcelScam, description: "Fabricated customs issues claiming illegal parcels contain the victim's ID" });
    }
    if (indicators.hasGovImpersonation || /\b(cbi|ips|supreme court|digital arrest|dcp|virtual custody|warrant issued)\b/i.test(lowerText)) {
      matched.push({ name: "GOVERNMENT_IMPERSONATION", weight: this.WEIGHTS.govImpersonation, description: "Scammers impersonate police, court, or CBI officers to force digital arrest" });
    }
    if (indicators.hasLotteryReward || /\b(lottery|won prize|lucky draw|reward points|gift voucher|claims bonus)\b/i.test(lowerText)) {
      matched.push({ name: "LOTTERY_REWARD_TRAP", weight: this.WEIGHTS.lotteryReward, description: "False claims of unexpected prize winnings, lotteries, or bonus points" });
    }
    if (indicators.hasUrgencyPressure || /\b(immediate|penalty|arrest you|jail|within 24 hours|suspended immediately|court actions)\b/i.test(lowerText)) {
      matched.push({ name: "URGENCY_PSYCH_PRESSURE", weight: this.WEIGHTS.urgencyPressure, description: "High pressure language demanding compliance under threat of legal action" });
    }
    if (indicators.hasFakeSupport || /\b(customer care|toll free|helpdesk support|bank executive help)\b/i.test(lowerText)) {
      matched.push({ name: "FAKE_CUSTOMER_SUPPORT", weight: this.WEIGHTS.fakeSupport, description: "Unsolicited contact claiming to be bank helpdesks or utility supports" });
    }

    let totalScore = matched.reduce((sum, item) => sum + item.weight, 0);
    totalScore = Math.min(100, totalScore);

    let classification: "safe" | "suspicious" | "danger" = "safe";
    if (totalScore >= 70) classification = "danger";
    else if (totalScore >= 30) classification = "suspicious";

    return { score: totalScore, classification, matched };
  }
}
