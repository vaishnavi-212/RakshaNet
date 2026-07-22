export class NormalizationService {
  /**
   * Normalize input text by resolving unicode homoglyphs, whitespace, zero-width characters, and common obfuscations.
   * Preserves the original text by returning an object containing both original and normalized versions.
   */
  static normalizeText(text: string): { original: string; normalized: string } {
    if (!text) return { original: "", normalized: "" };

    let normalized = text.normalize("NFKC");
    normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "");
    normalized = normalized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
    normalized = normalized.replace(/\s+/g, " ").trim();
    normalized = this.deobfuscateKeywords(normalized);

    return {
      original: text,
      normalized
    };
  }

  private static deobfuscateKeywords(text: string): string {
    let cleaned = text;
    const obfuscatedTerms = ["otp", "upi", "kyc", "bank", "cbi", "ips", "fedex", "post", "refund", "card"];

    for (const term of obfuscatedTerms) {
      const regexStr = term.split("").map(char => `${char}`).join("[\\s._-]*");
      const regex = new RegExp(`\\b${regexStr}\\b`, "gi");
      cleaned = cleaned.replace(regex, term.toUpperCase());
    }

    return cleaned;
  }

  static normalizeUrl(urlStr: string): string {
    try {
      const url = new URL(urlStr);
      const protocol = url.protocol.toLowerCase();
      const host = url.hostname.toLowerCase();

      let pathname = url.pathname;
      if (pathname === "/") pathname = "";

      return `${protocol}//${host}${pathname}${url.search}`;
    } catch {
      return urlStr.trim().toLowerCase();
    }
  }
}
