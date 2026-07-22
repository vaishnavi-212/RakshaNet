import { ExtractionService, ExtractedEntity, ExtractionResult } from "./extraction.service.ts";

export class EntityExtractionService {
  /**
   * Deterministically extracts and validates all standard entities.
   */
  static extractAndValidate(text: string): ExtractionResult {
    return ExtractionService.extractAndValidate(text);
  }

  /**
   * Discovers obscured, masked, or complex entities that deterministic regex might miss.
   * This is part of our HoneyPot Scam intelligence extraction capability.
   */
  static async discoverObscuredEntities(text: string): Promise<ExtractedEntity[]> {
    const discovered: ExtractedEntity[] = [];
    const textLower = text.toLowerCase();

    const hasWrittenNumbers = /(?:zero|one|two|three|four|five|six|seven|eight|nine)/.test(textLower);
    if (hasWrittenNumbers) {
      const wordsToDigits: Record<string, string> = {
        zero: "0", one: "1", two: "2", three: "3", four: "4",
        five: "5", six: "6", seven: "7", eight: "8", nine: "9"
      };

      const parts = textLower.split(/\s+/);
      let reconstructed = "";
      for (const part of parts) {
        const cleanedPart = part.replace(/[^a-z]/g, "");
        if (wordsToDigits[cleanedPart] !== undefined) {
          reconstructed += wordsToDigits[cleanedPart];
        }
      }

      if (reconstructed.length >= 10) {
        discovered.push({
          type: "phone",
          value: reconstructed.slice(0, 10),
          isValid: true,
          validationDetails: "Discovered obscured/verbalized phone number"
        });
      }
    }

    return discovered;
  }
}
