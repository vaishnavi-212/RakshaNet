import React, { useState, useEffect, useRef } from "react";
import {
  Activity, FileText, Lock, Layers, RefreshCw, BrainCircuit, Network,
  ShieldAlert, Clock, CreditCard, Fingerprint, Check, ShieldCheck
} from "lucide-react";
import { Session, CaseAlert, CategorizedReason } from "../types.ts";
import NetworkGraph from "../components/NetworkGraph.tsx";
import MhaAlertModal from "../components/MhaAlertModal.tsx";
import { ExplainableAiPanel } from "../components/ExplainableAiPanel.tsx";

function getCategoryFromText(text: string): "identity" | "pressure" | "financial" | "pattern" {
  const lower = text.toLowerCase();
  if (
    lower.includes("impersonat") ||
    lower.includes("fake customs") ||
    lower.includes("fake customer") ||
    lower.includes("support") ||
    lower.includes("phone") ||
    lower.includes("upi") ||
    lower.includes("url") ||
    lower.includes("link") ||
    lower.includes("flagged") ||
    lower.includes("identity")
  ) {
    return "identity";
  }
  if (
    lower.includes("urgency") ||
    lower.includes("pressure") ||
    lower.includes("otp") ||
    lower.includes("pin") ||
    lower.includes("coercion") ||
    lower.includes("remote") ||
    lower.includes("access") ||
    lower.includes("parcel") ||
    lower.includes("contraband")
  ) {
    return "pressure";
  }
  if (
    lower.includes("investment") ||
    lower.includes("pitch") ||
    lower.includes("lottery") ||
    lower.includes("prize") ||
    lower.includes("reward") ||
    lower.includes("bank") ||
    lower.includes("account") ||
    lower.includes("money") ||
    lower.includes("transfer") ||
    lower.includes("payment") ||
    lower.includes("fraudulent") ||
    lower.includes("financial")
  ) {
    return "financial";
  }
  return "pattern";
}

function normalizeReasons(reasons: any[] | undefined | null): CategorizedReason[] {
  if (!reasons || !Array.isArray(reasons)) return [];
  return reasons.map((r) => {
    if (r && typeof r === "object" && typeof r.text === "string") {
      return {
        text: r.text,
        category: (r.category || getCategoryFromText(r.text)) as any
      };
    } else if (typeof r === "string") {
      return {
        text: r,
        category: getCategoryFromText(r)
      };
    }
    return { text: String(r), category: "pattern" };
  });
}

const bandStyles: Record<string, string> = {
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20"
};

const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-300",
    border: "border-teal-500/20"
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/20"
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    border: "border-indigo-500/20"
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/20"
  }
};

interface OfficerDashboardPageProps {
  onGenerateAlert?: (session: Session) => void;
}

export default function OfficerDashboardPage({ onGenerateAlert }: OfficerDashboardPageProps = {}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [graphStats, setGraphStats] = useState<{ nodes: number; edges: number }>({ nodes: 0, edges: 0 });
  const [kbStats, setKbStats] = useState<{ seedCount: number; learnedCount: number; totalCount: number } | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<CaseAlert | null>(null);
  const [alertLoadingId, setAlertLoadingId] = useState<string | null>(null);

  const detailPanelRef = useRef<HTMLDivElement>(null);

  const fetchData = () => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.sessions)) {
          setSessions(data.sessions);
        } else if (Array.isArray(data)) {
          setSessions(data);
        } else {
          setSessions([]);
        }
      })
      .catch((err) => console.error("Error fetching sessions:", err));
    fetch("/api/network-graph")
      .then((r) => r.json())
      .then((data) => setGraphStats({ nodes: data.nodes?.length || 0, edges: data.edges?.length || 0 }))
      .catch((err) => console.error("Error fetching network graph:", err));
    fetch("/api/knowledge-base/stats")
      .then((r) => r.json())
      .then(setKbStats)
      .catch((err) => console.error("Error fetching knowledge base stats:", err));
  };

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleResetDatabase = async () => {
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        fetchData();
        setSelectedSessionId(null);
      } else {
        console.log("POST /api/reset responded with non-ok. Mocking reset locally.");
      }
    } catch (err) {
      console.error("Failed to reset database tables:", err);
    }
  };

  const handleGenerateAlert = async (sess: Session) => {
    setAlertLoadingId(sess.id);
    try {
      const res = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sess.id })
      });
      if (res.ok) {
        const alertData = await res.json();
        setActiveAlert(alertData);
      } else {
        console.error("Failed to generate advisory: Server returned non-ok status");
      }
    } catch (err) {
      console.error("Failed to generate advisory:", err);
    } finally {
      setAlertLoadingId(null);
    }
    if (onGenerateAlert) {
      onGenerateAlert(sess);
    }
  };

  const handleSelectNode = (nodeId: string) => {
    if (nodeId.startsWith("SESS-")) {
      setSelectedSessionId(nodeId);
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } else {
      const value = nodeId.split(":")[1];
      if (!value) return;
      const matchingSess = sessions.find(
        (s) =>
          s.extractedEntities?.upiIds?.includes(value) ||
          s.extractedEntities?.phoneNumbers?.includes(value) ||
          s.extractedEntities?.bankAccounts?.includes(value) ||
          s.extractedEntities?.urls?.includes(value)
      );
      if (matchingSess) {
        setSelectedSessionId(matchingSess.id);
        setTimeout(() => {
          detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div id="officer-dashboard-container" className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-12 space-y-6 animate-in fade-in duration-300 text-left scroll-mt-32">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
            Portal: Intel Desk
          </span>
          <h1 id="officer-dashboard-heading" className="text-3xl font-extrabold tracking-tight text-white scroll-mt-32">
            Officer Command Center
          </h1>
          <p className="text-slate-400 mt-1 max-w-xl">
            Analyze organized threat structures, inspect clustered entity networks, and generate actionable public advisories.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Intelligence Feed Connected
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm hover:bg-white/10 transition-colors">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1 font-bold">Active Security Cases</span>
          <p className="text-2xl font-display font-bold text-white">{sessions.length}</p>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Online & Persistent
          </span>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm hover:bg-white/10 transition-colors">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1 font-bold">Syndicate Nodes Tracked</span>
          <p className="text-2xl font-display font-bold text-teal-400">{graphStats.nodes}</p>
          <span className="text-[10px] text-slate-400 font-mono">VPAs, URLs, and Phones</span>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm hover:bg-white/10 transition-colors">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1 font-bold">Network Associations</span>
          <p className="text-2xl font-display font-bold text-emerald-400">{graphStats.edges}</p>
          <span className="text-[10px] text-slate-400 font-mono">Cross-case intersections</span>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm hover:bg-white/10 transition-colors">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1 font-bold flex items-center gap-1">
            <BrainCircuit className="w-3 h-3 text-indigo-400" /> Knowledge Base
          </span>
          <p className="text-2xl font-display font-bold text-indigo-400">{kbStats?.totalCount ?? "—"}</p>
          <span className="text-[10px] text-slate-400 font-mono">{kbStats?.seedCount ?? 0} seed + {kbStats?.learnedCount ?? 0} learned</span>
        </div>
      </div>

      {/* Network Graph — full width */}
      <div id="network-graph-section" className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm scroll-mt-28">
        <div className="mb-4">
          <h3 className="font-display font-bold text-white text-base flex items-center gap-1.5">
            <Network className="w-5 h-5 text-teal-400" />
            <span>Fraud Network Intelligence (Cross-Case Clustered Nodes)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
            Threat indicators (UPI handles, bank numbers, websites) extracted across citizen reports. Entities shared across sessions link their cases visually, surfacing organized fraud rings.
          </p>
        </div>
        <NetworkGraph onSelectNode={handleSelectNode} />
      </div>

      {/* Case Registry table */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-3">
          <div>
            <h3 className="font-display font-bold text-white text-base flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-teal-400" />
              <span>Central Cyber Threat Registry</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Citizen reports, risk scores, and extracted indicators. Generate official advisories per case.
            </p>
          </div>
          {/* Hidden for demo build */}
          {/* <button
            onClick={handleResetDatabase}
            className="bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-400 px-3 py-1.5 rounded-lg border border-white/10 transition cursor-pointer"
          >
            Reset Sample Database
          </button> */}
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/5 bg-slate-950/20">
          <table className="w-full text-left border-collapse text-xs md:text-sm font-sans">
            <thead>
              <tr className="bg-white/5 text-slate-400 font-mono text-[10px] uppercase border-b border-white/5">
                <th className="p-3">Case ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">District</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Scam Category</th>
                <th className="p-3 text-center">Indicators</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {sessions.map((sess) => {
                const totalInd =
                  (sess.extractedEntities?.upiIds?.length || 0) +
                  (sess.extractedEntities?.phoneNumbers?.length || 0) +
                  (sess.extractedEntities?.bankAccounts?.length || 0) +
                  (sess.extractedEntities?.urls?.length || 0);
                const isSelected = selectedSessionId === sess.id;

                return (
                  <tr
                    key={sess.id}
                    className={`hover:bg-white/5 transition cursor-pointer ${isSelected ? "bg-teal-500/10 text-white font-medium" : ""}`}
                    onClick={() => {
                      setSelectedSessionId(sess.id);
                      setTimeout(() => {
                        detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 120);
                    }}
                  >
                    <td className="p-3 font-mono font-semibold text-teal-400">{sess.id}</td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {sess.createdAt ? new Date(sess.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{sess.district || "—"}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${bandStyles[sess.riskBand || "green"]}`}>
                        {sess.riskScore ?? "—"}/100
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300 uppercase text-[10px]">{sess.scamType || "unknown"}</td>
                    <td className="p-3 text-center">
                      <span className="bg-white/5 px-2 py-0.5 rounded font-mono text-[11px] font-semibold text-slate-300 border border-white/10">
                        {totalInd} indicators
                      </span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleGenerateAlert(sess)}
                        disabled={alertLoadingId !== null}
                        className="bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {alertLoadingId === sess.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        <span>{alertLoadingId === sess.id ? "Drafting..." : "Draft MHA Alert"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No records found in the Threat Registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedSessionId && selectedSession && (
          <div ref={detailPanelRef} className="mt-6 p-5 bg-white/5 rounded-xl border border-white/10 shadow-sm animate-in fade-in duration-200 scroll-mt-32">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-teal-400" />
                  <h4 className="font-display font-bold text-white text-sm">Intelligence Dossier: {selectedSession.id}</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Created: {selectedSession.createdAt ? new Date(selectedSession.createdAt).toUTCString() : "—"}
                </span>
              </div>

              {/* Explainable AI Decision Panel */}
              <ExplainableAiPanel
                riskScore={selectedSession.riskScore ?? 0}
                scamType={selectedSession.scamType || "unknown"}
                riskBand={selectedSession.riskBand}
                explanation={selectedSession.explanation}
                actionableAdvice={selectedSession.actionableAdvice}
                riskReasons={selectedSession.riskReasons}
                extractedEntities={selectedSession.extractedEntities}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider font-bold">Risk Reasons</span>
                    <div className="text-xs text-slate-300 leading-relaxed bg-black/30 border border-white/5 p-3 rounded-lg mt-1 font-mono space-y-3">
                      {(() => {
                        const normReasons = normalizeReasons(selectedSession.riskReasons);
                        const sections = [
                          {
                            key: "identity",
                            label: "Identity & Impersonation",
                            icon: <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />,
                            reasons: normReasons.filter(r => r.category === "identity")
                          },
                          {
                            key: "pressure",
                            label: "Psychological Pressure",
                            icon: <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
                            reasons: normReasons.filter(r => r.category === "pressure")
                          },
                          {
                            key: "financial",
                            label: "Financial Request",
                            icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
                            reasons: normReasons.filter(r => r.category === "financial")
                          },
                          {
                            key: "pattern",
                            label: "Known Pattern Match",
                            icon: <Fingerprint className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
                            reasons: normReasons.filter(r => r.category === "pattern")
                          }
                        ];
                        const activeSections = sections.filter(s => s.reasons.length > 0);

                        if (activeSections.length > 0) {
                          return (
                            <div className="space-y-3">
                              {activeSections.map((sec) => (
                                <div key={sec.key} className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 border-b border-white/5 pb-0.5">
                                    {sec.icon}
                                    <span className="uppercase tracking-wider">{sec.label}</span>
                                  </div>
                                  <ul className="space-y-1 pl-1">
                                    {sec.reasons.map((reason, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-emerald-400 font-bold">✓</span>
                                        <span>{reason.text}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex items-center gap-1.5 text-slate-500 italic">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                              <span>No specific risk reasons recorded.</span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider font-bold">Actionable Guidance</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-black/30 border border-white/5 p-3 rounded-lg mt-1 font-mono">
                      {selectedSession.actionableAdvice || "No directives saved."}
                    </p>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/5 p-4 rounded-lg space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 block border-b border-white/5 pb-2 uppercase tracking-widest font-bold">Extracted Threat Ledger</span>
                  <div className="space-y-2.5 text-xs font-mono">
                    {[
                      { label: "UPI Handles", key: "upiIds", color: "teal" },
                      { label: "Phone Numbers", key: "phoneNumbers", color: "emerald" },
                      { label: "Bank Accounts", key: "bankAccounts", color: "indigo" },
                      { label: "URLs", key: "urls", color: "purple" }
                    ].map(({ label, key, color }) => {
                      const styles = colorStyles[color];
                      const values = (selectedSession.extractedEntities as any)?.[key] || [];
                      return (
                        <div key={key}>
                          <span className="text-slate-400 text-[10px] font-semibold">{label}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {values.length > 0 ? (
                              values.map((v: string, i: number) => (
                                <span key={i} className={`${styles.bg} ${styles.text} border ${styles.border} px-2 py-0.5 rounded text-[10px] font-semibold`}>
                                  {v}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic">None extracted</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <MhaAlertModal alert={activeAlert} onClose={() => setActiveAlert(null)} />
    </div>
  );
}
