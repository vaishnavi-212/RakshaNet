import { Session, EntityNode, EntityEdge } from "../src/types.ts";

export function buildNetworkGraph(sessions: Session[]): { nodes: EntityNode[]; edges: EntityEdge[] } {
  const nodesMap = new Map<string, EntityNode>();
  const edges: EntityEdge[] = [];

  sessions.forEach((session) => {
    nodesMap.set(session.id, {
      id: session.id,
      type: "session",
      value: `${session.id} (${session.scamType || "unknown"})`,
      firstSeenSessionId: session.id,
      sessionIds: [session.id]
    });
  });

  sessions.forEach((session) => {
    const entities = session.extractedEntities;
    if (!entities) return;

    const processType = (values: string[] | undefined, type: "upi" | "phone" | "bank_account" | "url") => {
      if (!values) return;
      values.forEach((val) => {
        const key = `${type}:${val}`;
        if (nodesMap.has(key)) {
          const node = nodesMap.get(key)!;
          if (!node.sessionIds.includes(session.id)) {
            node.sessionIds.push(session.id);
          }
        } else {
          nodesMap.set(key, {
            id: key,
            type,
            value: val,
            firstSeenSessionId: session.id,
            sessionIds: [session.id]
          });
        }
        edges.push({ source: session.id, target: key });
      });
    };

    processType(entities.upiIds, "upi");
    processType(entities.phoneNumbers, "phone");
    processType(entities.bankAccounts, "bank_account");
    processType(entities.urls, "url");
  });

  return { nodes: Array.from(nodesMap.values()), edges };
}
