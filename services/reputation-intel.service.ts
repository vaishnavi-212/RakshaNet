import { eq, and } from "drizzle-orm";
import { db } from "../database/connection.ts";
import { MemoryStore } from "../database/memory-store.ts";
import { entities, sessionEntities, sessions } from "../src/db/schema.ts";

export interface EntityReputation {
  value: string;
  type: string;
  reportCount: number;
  firstSeen: Date | null;
  lastSeen: Date | null;
  victimCount: number;
  isKnownScam: boolean;
}

export class ReputationIntelService {
  static async getEntityReputation(type: string, value: string): Promise<EntityReputation> {
    if (!db) {
      return MemoryStore.getEntityReputation(type, value);
    }
    try {
      const [entity] = await db
        .select()
        .from(entities)
        .where(and(eq(entities.type, type), eq(entities.value, value)));

      if (!entity) {
        return { value, type, reportCount: 0, firstSeen: null, lastSeen: null, victimCount: 0, isKnownScam: false };
      }

      const linkedSessions = await db
        .select({
          sessionId: sessionEntities.sessionId,
          createdAt: sessions.createdAt,
          classification: sessions.classification
        })
        .from(sessionEntities)
        .innerJoin(sessions, eq(sessionEntities.sessionId, sessions.id))
        .where(eq(sessionEntities.entityId, entity.id));

      if (linkedSessions.length === 0) {
        return { value, type, reportCount: 0, firstSeen: null, lastSeen: null, victimCount: 0, isKnownScam: false };
      }

      const dates = linkedSessions.map((s) => s.createdAt.getTime());
      const firstSeen = new Date(Math.min(...dates));
      const lastSeen = new Date(Math.max(...dates));
      const victimCount = new Set(linkedSessions.map((s) => s.sessionId)).size;
      const isKnownScam = linkedSessions.some((s) => s.classification === "danger" || s.classification === "suspicious") || victimCount >= 2;

      return { value, type, reportCount: linkedSessions.length, firstSeen, lastSeen, victimCount, isKnownScam };
    } catch (err: any) {
      console.warn(`[ReputationIntel] Error looking up reputation for ${type}:${value}, using MemoryStore:`, err.message);
      return MemoryStore.getEntityReputation(type, value);
    }
  }
}

