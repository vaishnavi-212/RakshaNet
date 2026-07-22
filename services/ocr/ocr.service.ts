import { OCRProvider, OCRResult } from "./ocr.interface.ts";
import { GeminiOCRProvider } from "./gemini-ocr.provider.ts";

export class OCRService {
  private static providers: OCRProvider[] = [
    new GeminiOCRProvider()
  ];

  static async extractText(imageBase64: string, mimeType: string = "image/jpeg"): Promise<OCRResult> {
    for (const provider of this.providers) {
      try {
        console.log(`[OCRService] Attempting extraction with provider: ${provider.name}`);
        const result = await provider.extractText(imageBase64, mimeType);
        if (result.text) {
          console.log(`[OCRService] Successfully extracted text with ${provider.name} (confidence: ${result.confidence})`);
          return result;
        }
      } catch (err: any) {
        console.error(`[OCRService] Provider ${provider.name} failed:`, err.message);
      }
    }

    return {
      text: "",
      confidence: 0,
      metadata: { error: "All OCR providers failed or returned empty text." }
    };
  }
}
