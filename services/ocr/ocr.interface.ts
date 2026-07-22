export interface OCRResult {
  text: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface OCRProvider {
  name: string;
  extractText(imageBase64: string, mimeType?: string): Promise<OCRResult>;
}
