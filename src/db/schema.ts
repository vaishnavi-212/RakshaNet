import { integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, doublePrecision, boolean } from "drizzle-orm/pg-core";

// Sessions table
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  district: text("district").notNull(),
  classification: text("classification").notNull(), // "safe" | "suspicious" | "danger"
  scamType: text("scam_type").notNull(),
  confidence: integer("confidence").notNull(),
  riskScore: integer("risk_score").notNull().default(0),
  riskBand: text("risk_band").notNull().default("green"), // "green" | "amber" | "orange" | "red"
  riskReasons: jsonb("risk_reasons").notNull().default([]),
  mode: text("mode").notNull().default("detect"), // "detect" | "decoy" — used starting Level 9
  messages: jsonb("messages").notNull().default([]), // used starting Level 9
  escalationConfidence: doublePrecision("escalation_confidence").default(0.0).notNull(),
  agentActive: boolean("agent_active").default(false).notNull(),
  totalMessages: integer("total_messages").default(0).notNull(),
  explanation: text("explanation"),
  actionableAdvice: text("actionable_advice"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Entities table (for tracking unique entities across sessions)
export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "upi" | "phone" | "bank_account" | "url"
  value: text("value").notNull(),
  firstSeenSessionId: text("first_seen_session_id")
    .references(() => sessions.id, { onDelete: "set null" })
    .notNull()
}, (table) => [
  uniqueIndex("type_value_idx").on(table.type, table.value)
]);

// Join table — many-to-many, this is what makes "repeated" entities detectable
export const sessionEntities = pgTable("session_entities", {
  sessionId: text("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  entityId: integer("entity_id")
    .references(() => entities.id, { onDelete: "cascade" })
    .notNull()
}, (table) => [
  uniqueIndex("session_entity_pk").on(table.sessionId, table.entityId)
]);

// Audit log — one row per pipeline stage, for legal admissibility
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id")
    .references(() => sessions.id, { onDelete: "cascade" }),
  stepName: text("step_name").notNull(), // "ocr" | "threat_intel" | "classify" | "rag_retrieve" | "risk_score" | "entity_extract"
  inputSummary: text("input_summary").notNull(),
  outputSummary: text("output_summary").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
