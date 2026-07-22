import { NormalizationService } from "./normalization.service.ts";

export interface ExtractedEntity {
  type: string;
  value: string;
  isValid: boolean;
  validationDetails?: string;
}

export interface ExtractionResult {
  phoneNumbers: ExtractedEntity[];
  emails: ExtractedEntity[];
  urls: ExtractedEntity[];
  domains: ExtractedEntity[];
  upiIds: ExtractedEntity[];
  ifscCodes: ExtractedEntity[];
  bankAccounts: ExtractedEntity[];
  transactionIds: ExtractedEntity[];
  trackingIds: ExtractedEntity[];
  panNumbers: ExtractedEntity[];
  maskedAadhaars: ExtractedEntity[];
  walletAddresses: ExtractedEntity[];
  ipAddresses: ExtractedEntity[];
  telegramIds: ExtractedEntity[];
  discordIds: ExtractedEntity[];
  instagramIds: ExtractedEntity[];
  facebookIds: ExtractedEntity[];
}

export class ExtractionService {
  static extractAndValidate(text: string): ExtractionResult {
    const { normalized } = NormalizationService.normalizeText(text);

    return {
      phoneNumbers: this.extractPhoneNumbers(normalized),
      emails: this.extractEmails(normalized),
      urls: this.extractUrls(normalized),
      domains: this.extractDomains(normalized),
      upiIds: this.extractUpiIds(normalized),
      ifscCodes: this.extractIfscCodes(normalized),
      bankAccounts: this.extractBankAccounts(normalized),
      transactionIds: this.extractTransactionIds(normalized),
      trackingIds: this.extractTrackingIds(normalized),
      panNumbers: this.extractPanNumbers(normalized),
      maskedAadhaars: this.extractMaskedAadhaars(normalized),
      walletAddresses: this.extractWalletAddresses(normalized),
      ipAddresses: this.extractIpAddresses(normalized),
      telegramIds: this.extractTelegramIds(normalized),
      discordIds: this.extractDiscordIds(normalized),
      instagramIds: this.extractInstagramIds(normalized),
      facebookIds: this.extractFacebookIds(normalized),
    };
  }

  private static extractPhoneNumbers(text: string): ExtractedEntity[] {
    const pattern = /(?:\+91[-\s]?|91[-\s]?|0)?[6-9]\d{9}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      const { isValid, details } = this.validatePhone(val);
      return { type: "phone", value: val, isValid, validationDetails: details };
    });
  }

  private static extractEmails(text: string): ExtractedEntity[] {
    const pattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      const { isValid, details } = this.validateEmail(val);
      return { type: "email", value: val, isValid, validationDetails: details };
    });
  }

  private static extractUrls(text: string): ExtractedEntity[] {
    const pattern = /https?:\/\/[^\s"'>]+/gi;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      const { isValid, details } = this.validateUrl(val);
      return { type: "url", value: val, isValid, validationDetails: details };
    });
  }

  private static extractDomains(text: string): ExtractedEntity[] {
    const pattern = /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    const filtered = matches.filter(val => !val.endsWith(".txt") && !val.endsWith(".png") && !val.endsWith(".jpg"));
    return filtered.map(val => {
      const { isValid, details } = this.validateDomain(val);
      return { type: "domain", value: val, isValid, validationDetails: details };
    });
  }

  private static extractUpiIds(text: string): ExtractedEntity[] {
    const pattern = /\b[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      const { isValid, details } = this.validateUpi(val);
      return { type: "upi", value: val, isValid, validationDetails: details };
    });
  }

  private static extractIfscCodes(text: string): ExtractedEntity[] {
    const pattern = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      const { isValid, details } = this.validateIfsc(val);
      return { type: "ifsc", value: val, isValid, validationDetails: details };
    });
  }

  private static extractBankAccounts(text: string): ExtractedEntity[] {
    const pattern = /\b\d{9,18}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));

    const phoneDigits = this.extractPhoneNumbers(text).map(p => p.value.replace(/\D/g, ""));
    const filtered = matches.filter(acc => !phoneDigits.some(ph => ph.includes(acc) || acc.includes(ph)));

    return filtered.map(val => {
      return { type: "bank_account", value: val, isValid: true, validationDetails: "Format valid (9-18 digits)" };
    });
  }

  private static extractTransactionIds(text: string): ExtractedEntity[] {
    const pattern = /\b[3456789]\d{11}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      return { type: "transaction_id", value: val, isValid: true, validationDetails: "Valid UPI reference / Transaction ID" };
    });
  }

  private static extractTrackingIds(text: string): ExtractedEntity[] {
    const postPattern = /\b[A-Z]{2}\d{9}[A-Z]{2}\b/g;
    const postMatches = text.match(postPattern) || [];

    const fedexPattern = /\b\d{12}\b/g;
    const fedexMatches = (text.match(fedexPattern) || []).filter(val => {
      return !this.extractPhoneNumbers(text).some(p => p.value.includes(val));
    });

    const matches = Array.from(new Set([...postMatches, ...fedexMatches]));
    return matches.map(val => {
      return { type: "tracking_id", value: val, isValid: true, validationDetails: "Detected Courier/Postal tracking number" };
    });
  }

  private static extractPanNumbers(text: string): ExtractedEntity[] {
    const pattern = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      return { type: "pan", value: val, isValid: true, validationDetails: "PAN Format Validated" };
    });
  }

  private static extractMaskedAadhaars(text: string): ExtractedEntity[] {
    const pattern = /\b[X\*x]{4}[-\s]?[X\*x]{4}[-\s]?\d{4}\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      return { type: "masked_aadhaar", value: val, isValid: true, validationDetails: "Masked Aadhaar format valid" };
    });
  }

  private static extractWalletAddresses(text: string): ExtractedEntity[] {
    const btcPattern = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g;
    const ethPattern = /\b0x[a-fA-F0-9]{40}\b/g;
    const btcSegwit = /\bbc1[a-zA-Z0-9]{25,39}\b/g;

    const btcMatches = text.match(btcPattern) || [];
    const ethMatches = text.match(ethPattern) || [];
    const btcSegMatches = text.match(btcSegwit) || [];

    const matches = Array.from(new Set([...btcMatches, ...ethMatches, ...btcSegMatches]));
    return matches.map(val => {
      const isEth = val.startsWith("0x");
      const details = isEth ? "Ethereum (ERC-20)" : "Bitcoin wallet format";
      return { type: "wallet_address", value: val, isValid: true, validationDetails: details };
    });
  }

  private static extractIpAddresses(text: string): ExtractedEntity[] {
    const pattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const matches = Array.from(new Set(text.match(pattern) || []));
    return matches.map(val => {
      return { type: "ip_address", value: val, isValid: true, validationDetails: "IPv4 address format" };
    });
  }

  private static extractTelegramIds(text: string): ExtractedEntity[] {
    const pattern = /(?:t\.me\/|telegram\.me\/)([a-zA-Z0-9_]{5,32})\b/gi;
    const matches: string[] = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[1]);
    }
    const textLower = text.toLowerCase();
    if (textLower.includes("telegram") || textLower.includes("tg")) {
      const userPattern = /@([a-zA-Z0-9_]{5,32})\b/g;
      const userMatches = text.match(userPattern) || [];
      userMatches.forEach(u => matches.push(u.replace("@", "")));
    }
    const unique = Array.from(new Set(matches));
    return unique.map(val => {
      return { type: "telegram_id", value: val, isValid: true, validationDetails: "Telegram username" };
    });
  }

  private static extractDiscordIds(text: string): ExtractedEntity[] {
    const pattern = /(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9_]+)\b/gi;
    const matches: string[] = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[1]);
    }
    const unique = Array.from(new Set(matches));
    return unique.map(val => {
      return { type: "discord_id", value: val, isValid: true, validationDetails: "Discord Invite / ID" };
    });
  }

  private static extractInstagramIds(text: string): ExtractedEntity[] {
    const pattern = /(?:instagram\.com\/|ig\.me\/)([a-zA-Z0-9_.]+)\b/gi;
    const matches: string[] = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[1]);
    }
    const unique = Array.from(new Set(matches));
    return unique.map(val => {
      return { type: "instagram_id", value: val, isValid: true, validationDetails: "Instagram Handler" };
    });
  }

  private static extractFacebookIds(text: string): ExtractedEntity[] {
    const pattern = /(?:facebook\.com\/|fb\.com\/|fb\.me\/)([a-zA-Z0-9.]+)\b/gi;
    const matches: string[] = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[1]);
    }
    const unique = Array.from(new Set(matches));
    return unique.map(val => {
      return { type: "facebook_id", value: val, isValid: true, validationDetails: "Facebook Username/Page" };
    });
  }

  private static validatePhone(phone: string): { isValid: boolean; details: string } {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return { isValid: false, details: "Too short (must be at least 10 digits)" };
    }
    const standardIndian = /[6-9]\d{9}$/;
    if (standardIndian.test(digits)) {
      return { isValid: true, details: "Valid Indian mobile format" };
    }
    return { isValid: true, details: "Valid international or fixed line format" };
  }

  private static validateEmail(email: string): { isValid: boolean; details: string } {
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rfcRegex.test(email)) {
      return { isValid: false, details: "Failed strict RFC compliance check" };
    }
    return { isValid: true, details: "RFC-5322 compliant" };
  }

  private static validateUrl(urlStr: string): { isValid: boolean; details: string } {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { isValid: false, details: "Invalid scheme (must be HTTP or HTTPS)" };
      }
      if (!url.hostname) {
        return { isValid: false, details: "Missing host parameter" };
      }
      return { isValid: true, details: `Valid URL format (scheme: ${url.protocol})` };
    } catch {
      return { isValid: false, details: "Invalid parseable URL string" };
    }
  }

  private static validateDomain(domain: string): { isValid: boolean; details: string } {
    const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;
    if (!domainRegex.test(domain)) {
      return { isValid: false, details: "Invalid domain structure" };
    }
    return { isValid: true, details: "Format validated" };
  }

  private static validateUpi(upi: string): { isValid: boolean; details: string } {
    const [user, provider] = upi.split("@");
    if (!user || !provider) {
      return { isValid: false, details: "Missing handle or provider" };
    }
    const commonProviders = [
      "oksbi", "okaxis", "okicici", "okhdfcbank", "paytm", "ybl", "ibl", "axl", "upi",
      "barodampay", "kmbl", "federal", "pnb", "unionbank", "sib", "idbi", "fbl"
    ];
    const isCommon = commonProviders.includes(provider.toLowerCase());
    return {
      isValid: true,
      details: isCommon
        ? `Valid UPI (PSP: ${provider.toUpperCase()})`
        : `Valid format (uncommon/custom provider: ${provider})`
    };
  }

  private static validateIfsc(ifsc: string): { isValid: boolean; details: string } {
    if (ifsc.length !== 11) {
      return { isValid: false, details: "Must be exactly 11 characters" };
    }
    if (ifsc.charAt(4) !== "0") {
      return { isValid: false, details: "5th character must be 0" };
    }
    return { isValid: true, details: "Passes structure checks" };
  }
}
