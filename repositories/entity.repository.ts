import { eq, and, sql } from "drizzle-orm";
import { db } from "../database/connection.ts";
import { MemoryStore } from "../database/memory-store.ts";
import { entities, sessionEntities, sessions } from "../src/db/schema.ts";

export class EntityRepository {
  static async insertEntityAndLink(sessionId: string, type: string, value: string) {
    if (!db) {
      MemoryStore.insertEntityAndLink(sessionId, type, value);
      return;
    }
    try {
      await db.transaction(async (tx) => {
        await tx.insert(entities).values({
          type,
          value,
          firstSeenSessionId: sessionId
        }).onConflictDoNothing();

        const [existing] = await tx
          .select({ id: entities.id })
          .from(entities)
          .where(and(eq(entities.type, type), eq(entities.value, value)));

        if (existing) {
          await tx.insert(sessionEntities).values({
            sessionId,
            entityId: existing.id
          }).onConflictDoNothing();
        }
      });
    } catch (err) {
      console.warn("[Database] insertEntityAndLink failed, falling back to MemoryStore:", err);
      MemoryStore.insertEntityAndLink(sessionId, type, value);
    }
  }

  static async getNetworkGraphData() {
    if (!db) {
      return MemoryStore.getNetworkGraphData();
    }
    try {
      const allSessions = await db.select({ id: sessions.id, scamType: sessions.scamType }).from(sessions);
      const allEntities = await db.select().from(entities);
      const allRelations = await db.select().from(sessionEntities);

      return { allSessions, allEntities, allRelations };
    } catch (err) {
      console.warn("[Database] getNetworkGraphData failed, falling back to MemoryStore:", err);
      return MemoryStore.getNetworkGraphData();
    }
  }

  static async getLinkedEntities(sessionId: string) {
    if (!db) {
      const data = MemoryStore.getNetworkGraphData();
      return data.allRelations.filter((r) => r.sessionId === sessionId).map((r) => ({ entityId: r.entityId }));
    }
    try {
      return await db
        .select({ entityId: sessionEntities.entityId })
        .from(sessionEntities)
        .where(eq(sessionEntities.sessionId, sessionId));
    } catch (err) {
      const data = MemoryStore.getNetworkGraphData();
      return data.allRelations.filter((r) => r.sessionId === sessionId).map((r) => ({ entityId: r.entityId }));
    }
  }

  static async getOtherSharedSessions(sessionId: string, entityId: number): Promise<string[]> {
    if (!db) {
      const data = MemoryStore.getNetworkGraphData();
      return data.allRelations
        .filter((r) => r.entityId === entityId && r.sessionId !== sessionId)
        .map((r) => r.sessionId);
    }
    try {
      const shares = await db
        .select({ sessionId: sessionEntities.sessionId })
        .from(sessionEntities)
        .where(
          and(
            eq(sessionEntities.entityId, entityId),
            sql`${sessionEntities.sessionId} != ${sessionId}`
          )
        );
      return shares.map((s) => s.sessionId);
    } catch (err) {
      const data = MemoryStore.getNetworkGraphData();
      return data.allRelations
        .filter((r) => r.entityId === entityId && r.sessionId !== sessionId)
        .map((r) => r.sessionId);
    }
  }
}

