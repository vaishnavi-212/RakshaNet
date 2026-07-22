import { AIService } from "./ai.service.ts";

export interface ClassificationResult {
  scamType: string;
  confidence: number;
  explanation: string;
}

export class ClassifierService {
  static async classifyThreat(
    text: string,
    ragGroundingContext: string = "No past patterns retrieved yet."
  ): Promise<ClassificationResult> {
    try {
      const client = AIService.getGeminiClient();
      
      const prompt = `You are a professional cybersecurity threat intelligence classifier for RakshaNet.
Analyze the following citizen scam report and classify it into exactly one of these scam categories:
- digital_arrest
- upi_fraud
- job_scam
- lottery_prize
- investment_fraud
- family_emergency
- other

Here is the RAG grounding context containing historically similar scam scripts from our knowledge base:
${ragGroundingContext}

Citizen Report text:
"${text}"

Provide your assessment in STRICT valid JSON format. Return ONLY the JSON object, with no markdown code blocks, explanations, or backticks:
{
  "scamType": "digital_arrest" | "upi_fraud" | "job_scam" | "lottery_prize" | "investment_fraud" | "family_emergency" | "other",
  "confidence": <float between 0.0 and 1.0>,
  "explanation": "<brief 1-2 sentence explanation of why this fits the category>"
}

JSON Output:`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text?.trim() || "";
      const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);
      
      return {
        scamType: parsed.scamType || "other",
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
        explanation: parsed.explanation || "No explanation provided."
      };
    } catch (err: any) {
      console.error("[ClassifierService] Error during classification:", err.message);
      return {
        scamType: "other",
        confidence: 0,
        explanation: `Classification failed: ${err.message}`
      };
    }
  }
}
