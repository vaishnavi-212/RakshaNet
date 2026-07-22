import { GoogleGenAI, Type } from "@google/genai";
import { config } from "../../config/index.ts";
import { DECOY_SYSTEM_INSTRUCTION, DECOY_AGENT_PROMPT_TEMPLATE } from "../../agents/decoy.agent.ts";
import { ADVISORY_SYSTEM_INSTRUCTION, ADVISORY_PROMPT_TEMPLATE } from "../../agents/advisory.agent.ts";

export class AIService {
  private static ai: GoogleGenAI | null = null;

  static getGeminiClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = config.geminiApiKey;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
      }
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return this.ai;
  }

  // Tactical decoy roleplay reply generator
  static async generateDecoyReply(params: { formattedHistory: string }) {
    const { formattedHistory } = params;
    try {
      const client = this.getGeminiClient();
      const promptText = DECOY_AGENT_PROMPT_TEMPLATE(formattedHistory);

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: DECOY_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              decoyResponse: { type: Type.STRING, description: "Stalling message to keep scammer engaged." }
            },
            required: ["decoyResponse"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.warn("[AIService] Decoy generation failed or key missing, using fallback:", err.message);
      return {
        decoyResponse: "Sir, I am trying to complete the bank transaction now. Please guide me slowly on how to transfer from my account."
      };
    }
  }

  // Generate an official MHA advisory document for a session using cross-referenced entities
  static async generateAdvisory(params: {
    session: any;
    linkedSessions: Array<{ id: string; district: string; scamType: string }>;
  }) {
    const { session, linkedSessions } = params;

    let ragContext = "No reference formatting files retrieved. Use standard I4C advisory format.";
    try {
      const reasonsStr = Array.isArray(session.riskReasons)
        ? session.riskReasons.map((r: any) => typeof r === "string" ? r : (r?.text || "")).join(" ")
        : "";
      const queryText = `${session.scamType || ""} ${reasonsStr} ${session.actionableAdvice || ""}`;
      const { KnowledgeBaseService } = await import("./knowledge-base.service.ts");
      const matches = await KnowledgeBaseService.findSimilarPatterns(queryText, 3);
      if (matches.length > 0) {
        ragContext = KnowledgeBaseService.buildGroundingContext(matches);
      }
    } catch (err) {
      console.error("[AIService] Failed to build grounding context for advisory:", err);
    }

    try {
      const client = this.getGeminiClient();
      const promptText = ADVISORY_PROMPT_TEMPLATE({
        session,
        linkedSessions,
        ragContext
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: ADVISORY_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              generatedText: { type: Type.STRING, description: "Official format advisory memorandum in Markdown." }
            },
            required: ["generatedText"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (err: any) {
      console.warn("[AIService] Advisory generation failed or key missing, using fallback:", err.message);
      const fallbackMd = `### SUBJECT: CYBER THREAT ADVISORY — ${session.scamType?.toUpperCase() || "DIGITAL FRAUD"}

**Advisory Ref:** MHA-I4C-2026-${session.id || "GENERIC"}  
**Target Category:** ${session.scamType || "Digital Arrest / Financial Fraud"}  
**Risk Level:** ${session.riskBand?.toUpperCase() || "HIGH"} (Score: ${session.riskScore || 85}/100)  

---

### 1. SUMMARY OF THREAT
A cross-jurisdictional cyber syndicate operating in **${session.district || "Multiple Districts"}** has been flagged for deploying ${session.scamType || "digital impersonation"} tactics against Indian citizens.

### 2. DETECTED SYNDICATE INDICATORS
- **Report ID:** ${session.id}
- **Cross-Referenced Reports:** ${linkedSessions.length} linked cases in database
- **Key Directive:** ${session.actionableAdvice || "Do not initiate financial transactions or disclose personal verification codes."}

### 3. MANDATED ACTION FOR LAW ENFORCEMENT
1. Freeze associated payment infrastructure immediately via National Cyber Crime Reporting Portal (NCRP).
2. Issue telecom blocking requests for flagged MSISDNs.
3. Initiate formal FIR registration under IT Act Section 66D and IPC 420.
`;
      return { generatedText: fallbackMd };
    }
  }

  // Generate text embeddings using gemini-embedding-2-preview
  static async getEmbedding(text: string): Promise<number[]> {
    try {
      const client = this.getGeminiClient();
      const res = await client.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: text,
      });
      const anyRes = res as any;
      if (anyRes.embeddings && anyRes.embeddings[0] && anyRes.embeddings[0].values) {
        return anyRes.embeddings[0].values;
      }
      if (anyRes.embedding && anyRes.embedding.values) {
        return anyRes.embedding.values;
      }
      throw new Error("No embedding values returned in response.");
    } catch (err: any) {
      console.error("[EMBEDDING ERROR]", err.message);
      throw err;
    }
  }
}
