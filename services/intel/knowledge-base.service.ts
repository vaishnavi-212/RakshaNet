import { AIService } from "./ai.service.ts";
import { SEED_SCAM_CORPUS, SeedPattern } from "../data/seed-corpus.ts";

interface EmbeddedPattern extends SeedPattern {
  embedding: number[];
}

export interface PatternMatch {
  id: string;
  scamType: string;
  text: string;
  similarity: number;
}

export class KnowledgeBaseService {
  private static cache: EmbeddedPattern[] = [];
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      let successCount = 0;
      for (const pattern of SEED_SCAM_CORPUS) {
        try {
          const embedding = await AIService.getEmbedding(pattern.text);
          this.cache.push({ ...pattern, embedding });
          successCount++;
        } catch (err: any) {
          console.error(`[KnowledgeBaseService] Failed to embed ${pattern.id}:`, err.message);
        }
      }
      this.initialized = true;
      console.log(`[KnowledgeBaseService] Embedded ${successCount}/${SEED_SCAM_CORPUS.length} seed patterns.`);
    })();

    return this.initPromise;
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  static async findSimilarPatterns(text: string, topN: number = 5): Promise<PatternMatch[]> {
    await this.initialize();
    if (!text || this.cache.length === 0) return [];

    try {
      const queryEmbedding = await AIService.getEmbedding(text);
      const scored = this.cache.map(p => ({
        id: p.id,
        scamType: p.scamType,
        text: p.text,
        similarity: this.cosineSimilarity(queryEmbedding, p.embedding)
      }));

      scored.sort((a, b) => b.similarity - a.similarity);
      return scored.slice(0, topN);
    } catch (err: any) {
      console.error("[KnowledgeBaseService] Similarity search failed:", err.message);
      return [];
    }
  }

  static buildGroundingContext(matches: PatternMatch[]): string {
    if (matches.length === 0) return "No past patterns retrieved yet.";
    return matches
      .map(m => `Matches known pattern ${m.id} (${m.scamType}) at ${(m.similarity * 100).toFixed(0)}% similarity: "${m.text.slice(0, 120)}..."`)
      .join("\n");
  }

  static async addPattern(pattern: { id: string; scamType: string; text: string }): Promise<void> {
    try {
      const embedding = await AIService.getEmbedding(pattern.text);
      this.cache.push({ ...pattern, embedding });
      console.log(`[KnowledgeBaseService] Learned new pattern ${pattern.id}. Corpus size: ${this.cache.length}`);
    } catch (err: any) {
      console.error(`[KnowledgeBaseService] Failed to learn pattern ${pattern.id}:`, err.message);
    }
  }

  static getStats(): { seedCount: number; learnedCount: number; totalCount: number } {
    const learnedCount = this.cache.filter((p) => p.id.startsWith("LEARNED-")).length;
    return {
      seedCount: this.cache.length - learnedCount,
      learnedCount,
      totalCount: this.cache.length
    };
  }
}
