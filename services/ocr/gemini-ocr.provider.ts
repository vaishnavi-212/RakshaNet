import { GoogleGenAI } from "@google/genai";
import { OCRProvider, OCRResult } from "./ocr.interface.ts";
import { config } from "../../config/index.ts";

export class GeminiOCRProvider implements OCRProvider {
  name = "GeminiOCR";

  async extractText(imageBase64: string, mimeType: string = "image/jpeg"): Promise<OCRResult> {
    try {
      const apiKey = config.geminiApiKey;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
      }
      
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType,
              data: imageBase64
            }
          },
          {
            text: "Extract all text visible in this image accurately. Do not add explanations, interpretation, or extra commentary. Simply output the exact extracted text as is. If no text is found, return an empty string."
          }
        ]
      });

      const extractedText = response.text?.trim() || "";
      return {
        text: extractedText,
        confidence: extractedText ? 0.95 : 0.0,
        metadata: { model: "gemini-3.5-flash" }
      };
    } catch (err: any) {
      console.error("[GeminiOCR] Error extracting text:", err.message);
      return {
        text: "",
        confidence: 0,
        metadata: { error: err.message }
      };
    }
  }
}
