import { ExtractedEntities } from "../src/types.ts";

export interface InMemorySession {
  id: string;
  district: string;
  classification: string;
  scamType: string;
  confidence: number;
  riskScore: number;
  riskBand: string;
  riskReasons: any[];
  mode: string;
  messages: any[];
  escalationConfidence?: number;
  agentActive?: boolean;
  totalMessages?: number;
  explanation?: string;
  actionableAdvice?: string;
  createdAt: Date;
}

export interface InMemoryEntity {
  id: number;
  type: string;
  value: string;
  firstSeenSessionId: string;
}

export interface InMemorySessionEntity {
  sessionId: string;
  entityId: number;
}

export interface InMemoryAuditLog {
  id: number;
  sessionId: string | null;
  stepName: string;
  inputSummary: string;
  outputSummary: string;
  timestamp: Date;
}

export class MemoryStore {
  private static sessions: InMemorySession[] = [];
  private static entities: InMemoryEntity[] = [];
  private static sessionEntities: InMemorySessionEntity[] = [];
  private static auditLogs: InMemoryAuditLog[] = [];
  private static entityIdCounter = 1;
  private static auditIdCounter = 1;

  static hasSessions(): boolean {
    return this.sessions.length > 0;
  }

  static createSession(
    data: any,
    sessionEntitiesData: ExtractedEntities
  ) {
    const existingIdx = this.sessions.findIndex((s) => s.id === data.id);
    const newSession: InMemorySession = {
      id: data.id,
      district: data.district || "Unknown",
      classification: data.classification || "safe",
      scamType: data.scamType || "other",
      confidence: data.confidence ?? 0,
      riskScore: data.riskScore ?? 0,
      riskBand: data.riskBand || "green",
      riskReasons: data.riskReasons || [],
      mode: data.mode || "detect",
      messages: data.messages || [],
      escalationConfidence: data.escalationConfidence ?? 0,
      agentActive: data.agentActive ?? false,
      totalMessages: data.totalMessages ?? 0,
      explanation: data.explanation,
      actionableAdvice: data.actionableAdvice,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    };

    if (existingIdx >= 0) {
      this.sessions[existingIdx] = newSession;
    } else {
      this.sessions.unshift(newSession);
    }

    const entityRows: Array<{ type: string; value: string }> = [
      ...(sessionEntitiesData?.upiIds || []).map((v) => ({ type: "upi", value: v })),
      ...(sessionEntitiesData?.phoneNumbers || []).map((v) => ({ type: "phone", value: v })),
      ...(sessionEntitiesData?.bankAccounts || []).map((v) => ({ type: "bank_account", value: v })),
      ...(sessionEntitiesData?.urls || []).map((v) => ({ type: "url", value: v })),
    ];

    for (const row of entityRows) {
      this.insertEntityAndLink(data.id, row.type, row.value);
    }
  }

  static insertEntityAndLink(sessionId: string, type: string, value: string) {
    let existingEntity = this.entities.find((e) => e.type === type && e.value === value);
    if (!existingEntity) {
      existingEntity = {
        id: this.entityIdCounter++,
        type,
        value,
        firstSeenSessionId: sessionId,
      };
      this.entities.push(existingEntity);
    }

    const existsLink = this.sessionEntities.some(
      (se) => se.sessionId === sessionId && se.entityId === existingEntity.id
    );
    if (!existsLink) {
      this.sessionEntities.push({
        sessionId,
        entityId: existingEntity.id,
      });
    }
  }

  static updateSession(id: string, data: Partial<InMemorySession>) {
    const session = this.sessions.find((s) => s.id === id);
    if (session) {
      Object.assign(session, data);
    }
  }

  static getSessions() {
    return this.sessions.map((sess) => {
      const linkedEntityIds = this.sessionEntities
        .filter((se) => se.sessionId === sess.id)
        .map((se) => se.entityId);

      const linkedEntities = this.entities.filter((e) => linkedEntityIds.includes(e.id));

      const extractedEntities: ExtractedEntities = {
        upiIds: linkedEntities.filter((e) => e.type === "upi").map((e) => e.value),
        phoneNumbers: linkedEntities.filter((e) => e.type === "phone").map((e) => e.value),
        bankAccounts: linkedEntities.filter((e) => e.type === "bank_account").map((e) => e.value),
        urls: linkedEntities.filter((e) => e.type === "url").map((e) => e.value),
      };

      return {
        id: sess.id,
        createdAt: sess.createdAt.toISOString(),
        district: sess.district,
        classification: sess.classification as any,
        scamType: sess.scamType as any,
        confidence: sess.confidence,
        riskScore: sess.riskScore,
        riskBand: sess.riskBand,
        riskReasons: sess.riskReasons,
        mode: sess.mode as any,
        messages: sess.messages,
        explanation: sess.explanation,
        actionableAdvice: sess.actionableAdvice,
        extractedEntities,
      };
    });
  }

  static getSessionById(id: string) {
    return this.sessions.find((s) => s.id === id) || null;
  }

  static createAuditLogs(logs: any[]) {
    for (const log of logs) {
      this.auditLogs.push({
        id: this.auditIdCounter++,
        sessionId: log.sessionId || null,
        stepName: log.stepName,
        inputSummary: (log.inputSummary || "").slice(0, 1000),
        outputSummary: (log.outputSummary || "").slice(0, 1000),
        timestamp: new Date(),
      });
    }
  }

  static getNetworkGraphData() {
    return {
      allSessions: this.sessions.map((s) => ({ id: s.id, scamType: s.scamType })),
      allEntities: [...this.entities],
      allRelations: [...this.sessionEntities],
    };
  }

  static getEntityReputation(type: string, value: string) {
    const entity = this.entities.find((e) => e.type === type && e.value === value);
    if (!entity) {
      return { value, type, reportCount: 0, firstSeen: null, lastSeen: null, victimCount: 0, isKnownScam: false };
    }

    const linkedSessionEntities = this.sessionEntities.filter((se) => se.entityId === entity.id);
    const linkedSessionIds = linkedSessionEntities.map((se) => se.sessionId);
    const linkedSessions = this.sessions.filter((s) => linkedSessionIds.includes(s.id));

    if (linkedSessions.length === 0) {
      return { value, type, reportCount: 0, firstSeen: null, lastSeen: null, victimCount: 0, isKnownScam: false };
    }

    const dates = linkedSessions.map((s) => s.createdAt.getTime());
    const firstSeen = new Date(Math.min(...dates));
    const lastSeen = new Date(Math.max(...dates));
    const victimCount = new Set(linkedSessionIds).size;
    const isKnownScam =
      linkedSessions.some((s) => s.classification === "danger" || s.classification === "suspicious") ||
      victimCount >= 2;

    return { value, type, reportCount: linkedSessions.length, firstSeen, lastSeen, victimCount, isKnownScam };
  }
}
