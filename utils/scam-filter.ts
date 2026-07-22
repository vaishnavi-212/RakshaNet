export function extractIntelligence(text: string) {
  const textLower = text.toLowerCase();

  const BANK_ACCOUNT_PATTERN = /\b\d{9,18}\b/g;
  const UPI_PATTERN = /\b[a-zA-Z0-9.\-_]{3,}@[a-zA-Z]{2,}\b/g;
  const PHONE_PATTERN = /(?:\+91[-\s]?|0)?[6-9]\d{9}\b/g;
  const URL_PATTERN = /https?:\/\/[^\s"'>]+/g;

  const rawBankAccounts = Array.from(new Set(text.match(BANK_ACCOUNT_PATTERN) || []));
  const rawPhoneNumbers = Array.from(new Set(text.match(PHONE_PATTERN) || []));
  const upiIds = Array.from(new Set(text.match(UPI_PATTERN) || []));
  const urls = Array.from(new Set(text.match(URL_PATTERN) || []));

  const normalizedPhones = new Set(rawPhoneNumbers.map((p) => p.replace(/\D/g, "")));
  const cleanedBankAccounts = rawBankAccounts.filter(
    (acc) => !normalizedPhones.has(acc.replace(/\D/g, ""))
  );

  const keywordsList = [
    "otp", "upi", "bank", "verify", "blocked", "urgent", "suspended",
    "kyc", "pin", "refund", "gift card", "crypto", "bitcoin", "btc",
    "gold", "money"
  ];
  const suspiciousKeywords = keywordsList.filter((kw) => textLower.includes(kw));

  return { bankAccounts: cleanedBankAccounts, upiIds, phoneNumbers: rawPhoneNumbers, urls, suspiciousKeywords };
}

const SUSPICIOUS_KEYWORDS_DETECT = ["urgent", "verify", "account", "blocked", "suspended", "kyc", "refund", "debit", "credit", "bank", "upi", "money"];
const STRONG_KEYWORDS_DETECT = ["otp", "upi pin", "pin", "one time password"];

export function detectScam(text: string): { isScam: boolean; score: number } {
  const lower = text.toLowerCase();
  if (STRONG_KEYWORDS_DETECT.some((sk) => lower.includes(sk))) {
    return { isScam: true, score: 0.9 };
  }
  const hits = SUSPICIOUS_KEYWORDS_DETECT.filter((kw) => lower.includes(kw)).length;
  if (hits >= 2) {
    return { isScam: true, score: 0.7 };
  }
  return { isScam: false, score: 0.0 };
}
