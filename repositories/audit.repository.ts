import { sql } from "drizzle-orm";
import { db } from "../database/connection.ts";
import { MemoryStore } from "../database/memory-store.ts";
import { auditLog } from "../src/db/schema.ts";

export class AuditRepository {
  static async writeAuditLog(sessionId: string | null, stepName: string, inputSummary: string, outputSummary: string) {
    if (!db) {
      MemoryStore.createAuditLogs([{ sessionId, stepName, inputSummary, outputSummary }]);
      return;
    }
    try {
      await db.insert(auditLog).values({
        sessionId,
        stepName,
        inputSummary: inputSummary.substring(0, 1000),
        outputSummary: outputSummary.substring(0, 1000)
      });
    } catch (err) {
      console.warn("[AUDIT LOG INSERT ERROR], falling back to MemoryStore:", err);
      MemoryStore.createAuditLogs([{ sessionId, stepName, inputSummary, outputSummary }]);
    }
  }

  static async linkOrphanLogs(sessionId: string) {
    if (!db) return;
    try {
      await db.update(auditLog)
        .set({ sessionId })
        .where(sql`session_id IS NULL`);
    } catch (err) {
      console.warn("[AUDIT LOG LINK ERROR]:", err);
    }
  }
}

