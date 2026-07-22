import { eq, desc, and } from "drizzle-orm";
import { db } from "../database/connection.ts";
import { MemoryStore } from "../database/memory-store.ts";
import { sessions, sessionEntities, entities, auditLog } from "../src/db/schema.ts";
import { ExtractedEntities } from "../src/types.ts";
import { EntityRepository } from "./entity.repository.ts";

export class SessionRepository {
  static async createSession(
    data: typeof sessions.$inferInsert,
    sessionEntitiesData: ExtractedEntities
  ) {
    if (!db) {
      MemoryStore.createSession(data, sessionEntitiesData);
      return;
    }
    try {
      await db.insert(sessions).values(data);

      const entityRows: Array<{ type: string; value: string }> = [
        ...sessionEntitiesData.upiIds.map((v) => ({ type: "upi", value: v })),
        ...sessionEntitiesData.phoneNumbers.map((v) => ({ type: "phone", value: v })),
        ...sessionEntitiesData.bankAccounts.map((v) => ({ type: "bank_account", value: v })),
        ...sessionEntitiesData.urls.map((v) => ({ type: "url", value: v }))
      ];

      for (const row of entityRows) {
        await EntityRepository.insertEntityAndLink(data.id as string, row.type, row.value);
      }
    } catch (error) {
      console.warn("[Database] createSession failed, falling back to MemoryStore:", error);
      MemoryStore.createSession(data, sessionEntitiesData);
    }
  }

  static async updateSession(id: string, data: Partial<typeof sessions.$inferInsert>) {
    if (!db) {
      MemoryStore.updateSession(id, data as any);
      return;
    }
    try {
      return await db.update(sessions).set(data).where(eq(sessions.id, id));
    } catch (error) {
      console.warn(`[Database] updateSession failed for ${id}, falling back to MemoryStore:`, error);
      MemoryStore.updateSession(id, data as any);
    }
  }

  static async getSessions() {
    if (!db) {
      return MemoryStore.getSessions();
    }
    try {
      const sessionsList = await db.select().from(sessions).orderBy(desc(sessions.createdAt));

      const allSessionEntities = await db
        .select({
          sessionId: sessionEntities.sessionId,
          type: entities.type,
          value: entities.value,
        })
        .from(sessionEntities)
        .innerJoin(entities, eq(sessionEntities.entityId, entities.id));

      const entitiesMap = new Map<string, ExtractedEntities>();

      allSessionEntities.forEach((row) => {
        if (!entitiesMap.has(row.sessionId)) {
          entitiesMap.set(row.sessionId, { upiIds: [], phoneNumbers: [], bankAccounts: [], urls: [] });
        }
        const bag = entitiesMap.get(row.sessionId)!;
        if (row.type === "upi") bag.upiIds.push(row.value);
        else if (row.type === "phone") bag.phoneNumbers.push(row.value);
        else if (row.type === "bank_account") bag.bankAccounts.push(row.value);
        else if (row.type === "url") bag.urls.push(row.value);
      });

      return sessionsList.map((sess) => ({
        id: sess.id,
        createdAt: sess.createdAt.toISOString(),
        district: sess.district,
        classification: sess.classification as any,
        scamType: sess.scamType as any,
        confidence: sess.confidence,
        riskScore: sess.riskScore,
        riskBand: sess.riskBand,
        riskReasons: sess.riskReasons as any[],
        mode: sess.mode as any,
        messages: sess.messages as any,
        explanation: sess.explanation || undefined,
        actionableAdvice: sess.actionableAdvice || undefined,
        extractedEntities: entitiesMap.get(sess.id) || { upiIds: [], phoneNumbers: [], bankAccounts: [], urls: [] }
      }));
    } catch (error) {
      console.warn("[Database] getSessions failed, falling back to MemoryStore:", error);
      return MemoryStore.getSessions();
    }
  }

  static async getSessionById(id: string) {
    if (!db) {
      return MemoryStore.getSessionById(id);
    }
    try {
      const [sess] = await db.select().from(sessions).where(eq(sessions.id, id));
      return sess || MemoryStore.getSessionById(id);
    } catch (error) {
      console.warn(`[Database] getSessionById failed for ${id}, falling back to MemoryStore:`, error);
      return MemoryStore.getSessionById(id);
    }
  }

  static async createAuditLogs(logs: Array<typeof auditLog.$inferInsert>) {
    if (!db) {
      MemoryStore.createAuditLogs(logs);
      return;
    }
    try {
      if (logs.length > 0) {
        await db.insert(auditLog).values(logs);
      }
    } catch (error) {
      console.warn("[Database] createAuditLogs failed, falling back to MemoryStore:", error);
      MemoryStore.createAuditLogs(logs);
    }
  }
}

