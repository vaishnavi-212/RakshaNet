import React, { useState } from "react";
import { 
  ShieldAlert, Send, HelpCircle, Upload, Radio, Check, X, RefreshCw, Sparkles,
  AlertTriangle, TrendingUp, Database, Brain, History, ShieldCheck, Clock, CreditCard, Fingerprint, BookOpen
} from "lucide-react";
import { ExplainableAiPanel } from "../components/ExplainableAiPanel.tsx";

const scamTypeLabels: Record<string, string> = {
  digital_arrest: "Digital Arrest Coercion",
  upi_fraud: "UPI / QR Code Fraud",
  job_scam: "Work-from-Home / Part-Time Job Scam",
  lottery_prize: "KBC Lucky Draw / Fake Lottery Prize",
  investment_fraud: "High-Yield Stock/Crypto Trading Scam",
  family_emergency: "Impersonation Family Emergency",
  other: "Suspicious Engagement Pattern"
};

interface CategorizedReason {
  text: string;
  category: "identity" | "pressure" | "financial" | "pattern";
}

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

const bandStyles = {
  red: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    label: "Critical Threat",
    glow: "shadow-rose-500/20"
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    label: "High Risk",
    glow: "shadow-orange-500/20"
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    label: "Moderate Risk",
    glow: "shadow-amber-500/20"
  },
  green: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    label: "Safe / Low Risk",
    glow: "shadow-emerald-500/20"
  }
};

interface CitizenPortalPageProps {
  onNavigateToLearn?: () => void;
}

export default function CitizenPortalPage({ onNavigateToLearn }: CitizenPortalPageProps) {
  // SCANNER STATE
  const [inputText, setInputText] = useState("");
  const [district, setDistrict] = useState("New Delhi");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // DECOY INTERCEPT STATE
  const [decoyModeActive, setDecoyModeActive] = useState(false);
  const [decoySessionId, setDecoySessionId] = useState<string | null>(null);
  const [decoyMessages, setDecoyMessages] = useState<Array<{ role: "user" | "model"; text: string; timestamp: string }>>([]);
  const [decoyInputText, setDecoyInputText] = useState("");
  const [decoyLoading, setDecoyLoading] = useState(false);
  const [escalationConfidence, setEscalationConfidence] = useState(0.0);
  const [agentActive, setAgentActive] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  // File Upload Handler (Screenshot)
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit handler — for Level 1, just POST and log; real handling comes later
  const handleRunAnalysis = async () => {
    if (!inputText && !selectedFile) return;
    setAnalysisLoading(true);
    try {
      const payload = {
        text: inputText,
        image: selectedFile ? selectedFile.split(",")[1] : null,
        district
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        console.log("pipeline response:", data);
        setAnalysisResult(data);

        // Auto-open decoy panel if riskBand is red (score 86+)
        if (data.riskResult?.band === "red" && data.sessionId) {
          setDecoySessionId(data.sessionId);
          setDecoyModeActive(true);
          setDecoyMessages([]);
          setEscalationConfidence(0.0);
          setAgentActive(false);
          setTotalMessages(0);
        }
      }
    } catch (err) {
      console.error("Analysis request failed:", err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Relay a scammer's message to the decoy agent API
  const handleRelayMessage = async () => {
    if (!decoyInputText.trim() || !decoySessionId) return;

    const userMsg = decoyInputText.trim();
    setDecoyInputText("");

    const newMsgObj = {
      role: "user" as const,
      text: userMsg,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...decoyMessages, newMsgObj];
    setDecoyMessages(updatedMessages);
    setDecoyLoading(true);

    try {
      const res = await fetch("/api/decoy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: decoySessionId,
          messages: updatedMessages
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDecoyMessages([
            ...updatedMessages,
            {
              role: "model" as const,
              text: data.response,
              timestamp: new Date().toISOString()
            }
          ]);
          setEscalationConfidence(data.escalationConfidence ?? 0.0);
          setAgentActive(data.agentActive ?? false);
          setTotalMessages(data.totalMessages ?? 0);
        }
      }
    } catch (err) {
      console.error("Failed to relay decoy message:", err);
    } finally {
      setDecoyLoading(false);
    }
  };

  // Reset scanner state
  const resetScanner = () => {
    setInputText("");
    setSelectedFile(null);
    setAnalysisResult(null);
    setDecoyModeActive(false);
    setDecoySessionId(null);
    setDecoyMessages([]);
    setDecoyInputText("");
    setEscalationConfidence(0.0);
    setAgentActive(false);
    setTotalMessages(0);
  };

  return (
    <div id="citizen-portal-container" className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Hero/Info & Stats */}
        <div className="lg:col-span-7 flex flex-col justify-center gap-6">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Portal: Citizen Center
            </span>
            <h1 id="citizen-portal-heading" className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Defend Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Digital Space.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed mt-4">
              RakshaNet uses advanced AI to detect scams before they reach you. Upload suspicious messages or links to activate a decoy and help law enforcement catch organized networks.
            </p>
            {onNavigateToLearn && (
              <div className="pt-1">
                <button
                  onClick={onNavigateToLearn}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>How RakshaNet Works &rarr;</span>
                </button>
              </div>
            )}
          </div>

          {/* Real-time stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <p className="text-[10px] uppercase text-indigo-400 font-bold mb-1">Protected</p>
              <h3 className="text-2xl font-bold text-white">12,402</h3>
              <p className="text-xs text-slate-500 mt-1">Messages Scanned</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <p className="text-[10px] uppercase text-emerald-400 font-bold mb-1">Active</p>
              <h3 className="text-2xl font-bold text-white">482</h3>
              <p className="text-xs text-slate-500 mt-1">AI Decoys Running</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <p className="text-[10px] uppercase text-rose-400 font-bold mb-1">Impact</p>
              <h3 className="text-2xl font-bold text-white">12</h3>
              <p className="text-xs text-slate-500 mt-1">Networks Busted</p>
            </div>
          </div>
        </div>        {/* Right Column: Interactive Intake Form & Live Feeds */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-[32px] p-6 md:p-8 flex flex-col shadow-2xl h-full space-y-4">
            {decoyModeActive ? (
              // DECOY INTERCEPT TERMINAL CHAT VIEW
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                    <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Decoy Intercept Terminal</h3>
                  </div>
                  <button
                    onClick={() => {
                      setDecoyModeActive(false);
                      setAnalysisResult(null);
                    }}
                    className="text-xs font-mono text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close</span>
                  </button>
                </div>

                {/* Agent Persona Card */}
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono text-xs">
                      RK
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 leading-none">Rajesh Kumar</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Retired Gov. Employee, 52 • Naive/Compliant</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                    PERSONA ACTIVE
                  </span>
                </div>

                {/* Escalation Telemetry Ribbon */}
                <div className="p-3.5 bg-black/40 border border-white/5 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-slate-400">
                    <span>Escalation Confidence</span>
                    <span className={agentActive ? "text-emerald-400" : "text-amber-400"}>
                      {Math.round(escalationConfidence * 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${agentActive ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} 
                      style={{ width: `${escalationConfidence * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${agentActive ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`}></span>
                      {agentActive ? "AI Intercept Deploy Active" : "Gating Mode: Collecting evidence"}
                    </span>
                    <span>Messages: {totalMessages}</span>
                  </div>
                </div>

                {/* Scrollable chat log */}
                <div className="h-64 bg-black/30 border border-white/5 rounded-2xl p-4 overflow-y-auto flex flex-col space-y-3 font-mono text-xs">
                  {decoyMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2">
                      <ShieldAlert className="w-8 h-8 text-slate-600 animate-pulse" />
                      <p className="text-[11px] max-w-[220px] leading-relaxed">
                        No messages relayed yet. Paste the scammer's latest WhatsApp/SMS reply below to initialize decoy counter-measures.
                      </p>
                    </div>
                  ) : (
                    decoyMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex flex-col space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[9px] text-slate-500">
                          {msg.role === "user" ? "CITIZEN RELAYED (SCAMMER)" : "AI DECOY PERSONA"}
                        </span>
                        <div 
                          className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                            msg.role === "user" 
                              ? "bg-white/10 text-slate-200 rounded-tr-none" 
                              : "bg-indigo-600/20 text-indigo-200 border border-indigo-500/20 rounded-tl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                  {decoyLoading && (
                    <div className="flex flex-col items-start space-y-1">
                      <span className="text-[9px] text-slate-500">AI DECOY THINKING...</span>
                      <div className="bg-indigo-600/10 text-indigo-300 border border-indigo-500/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[10px] text-indigo-400/80">Drafting counter-measures...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply/Relay box */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={decoyInputText}
                      onChange={(e) => setDecoyInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRelayMessage();
                      }}
                      disabled={decoyLoading}
                      placeholder={decoyLoading ? "Please wait..." : "Paste the scammer's latest text reply here..."}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-3 pr-10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                    />
                    <button
                      onClick={handleRelayMessage}
                      disabled={!decoyInputText.trim() || decoyLoading}
                      className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/5 text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center font-mono leading-normal">
                    Tip: Relay messages verbatim. The decoy Rajesh Kumar will dynamically adjust tactics to isolate their coordinates.
                  </p>
                </div>
              </div>
            ) : analysisResult ? (
              // ANALYSIS RESULTS VIEW (HIGH FIDELITY RISK CARD)
              <div className="flex flex-col h-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${bandStyles[analysisResult.riskResult.band as keyof typeof bandStyles]?.text || "text-white"}`} />
                    <h3 className="text-lg font-semibold text-white">Risk Assessment Report</h3>
                  </div>
                  <button
                    onClick={resetScanner}
                    className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Scan New</span>
                  </button>
                </div>

                {/* Score Circular Metric */}
                <div className="flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-dashed border-white/10 p-1 mb-3">
                    {/* Glowing outer circle indicating severity */}
                    <div className={`absolute inset-0 rounded-full blur-md opacity-25 ${bandStyles[analysisResult.riskResult.band as keyof typeof bandStyles]?.bg || "bg-indigo-500/10"}`}></div>
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-4xl font-extrabold tracking-tight ${bandStyles[analysisResult.riskResult.band as keyof typeof bandStyles]?.text || "text-white"}`}>
                        {analysisResult.riskResult.score}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Risk Score</span>
                    </div>
                  </div>

                  <span className={`inline-block px-3 py-1 text-xs font-bold font-mono rounded-full border mb-1 uppercase tracking-wider ${bandStyles[analysisResult.riskResult.band as keyof typeof bandStyles]?.badge || "bg-indigo-500/20 text-indigo-300"}`}>
                    {bandStyles[analysisResult.riskResult.band as keyof typeof bandStyles]?.label || "Unknown"}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Classification: <strong className="text-slate-200">{scamTypeLabels[analysisResult.classification?.scamType] || analysisResult.classification?.scamType || "Unclassified"}</strong>
                  </p>
                </div>

                {/* Explainable AI Decision Section */}
                <ExplainableAiPanel
                  riskScore={analysisResult.riskResult.score}
                  scamType={analysisResult.classification?.scamType || "unknown"}
                  riskBand={analysisResult.riskResult.band}
                  explanation={analysisResult.riskResult.explanation}
                  actionableAdvice={analysisResult.riskResult.actionableAdvice}
                  riskReasons={analysisResult.riskResult.reasons}
                  extractedEntities={analysisResult.extractedEntities}
                  ocrText={analysisResult.ocrResult?.text}
                  confidenceScore={analysisResult.classification?.confidence ? Math.round(analysisResult.classification.confidence * 100) : undefined}
                />

                {/* Reasons List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Detection Indicators & Evidence:
                  </h4>
                  {(() => {
                    const normReasons = normalizeReasons(analysisResult.riskResult.reasons);
                    const sections = [
                      {
                        key: "identity",
                        label: "Identity & Impersonation",
                        icon: <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />,
                        reasons: normReasons.filter(r => r.category === "identity")
                      },
                      {
                        key: "pressure",
                        label: "Psychological Pressure",
                        icon: <Clock className="w-4 h-4 text-rose-400 shrink-0" />,
                        reasons: normReasons.filter(r => r.category === "pressure")
                      },
                      {
                        key: "financial",
                        label: "Financial Request",
                        icon: <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />,
                        reasons: normReasons.filter(r => r.category === "financial")
                      },
                      {
                        key: "pattern",
                        label: "Known Pattern Match",
                        icon: <Fingerprint className="w-4 h-4 text-amber-400 shrink-0" />,
                        reasons: normReasons.filter(r => r.category === "pattern")
                      }
                    ];
                    const activeSections = sections.filter(s => s.reasons.length > 0);

                    if (activeSections.length > 0) {
                      return (
                        <div className="space-y-4">
                          {activeSections.map((sec) => (
                            <div key={sec.key} className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-white/5 pb-1">
                                {sec.icon}
                                <span className="font-mono tracking-wider text-[11px] uppercase">{sec.label}</span>
                              </div>
                              <div className="space-y-1.5 pl-2">
                                {sec.reasons.map((reason, idx) => (
                                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.01] border border-white/5">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-xs text-slate-300 leading-snug font-mono capitalize">{reason.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.01] border border-white/5 text-slate-400 text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>No suspicious indicators detected in heuristic or model-based reviews.</span>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Composite Signals Breakdown:
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                        <span>Blacklist Match</span>
                        <span>{analysisResult.riskResult.breakdown?.blacklist}/35</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(analysisResult.riskResult.breakdown?.blacklist / 35) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                        <span>RAG Similarity</span>
                        <span>{analysisResult.riskResult.breakdown?.ragSimilarity}/25</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: `${(analysisResult.riskResult.breakdown?.ragSimilarity / 25) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                        <span>Behavioral Rules</span>
                        <span>{analysisResult.riskResult.breakdown?.behavioral}/20</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(analysisResult.riskResult.breakdown?.behavioral / 20) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                        <span>AI Confidence</span>
                        <span>{analysisResult.riskResult.breakdown?.geminiConfidence}/20</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(analysisResult.riskResult.breakdown?.geminiConfidence / 20) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top RAG Pattern Match */}
                {analysisResult.ragMatches && analysisResult.ragMatches.length > 0 && analysisResult.ragMatches[0].similarity > 0.4 && (
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-400">
                      <span>Matched Threat Pattern: {analysisResult.ragMatches[0].id}</span>
                      <span className="text-indigo-400 font-bold">{(analysisResult.ragMatches[0].similarity * 100).toFixed(0)}% Similar</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/30 pl-2.5">
                      "{analysisResult.ragMatches[0].text}"
                    </p>
                  </div>
                )}

                {/* Model Explanation */}
                {analysisResult.classification?.explanation && (
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-300 font-mono text-[10px] uppercase block mb-1">Gemini Classifier Note:</span> 
                    {analysisResult.classification.explanation}
                  </div>
                )}

                {/* Escalate to AI Decoy (Disruption Layer) */}
                {(analysisResult.riskResult.band === "red" || analysisResult.riskResult.band === "orange" || analysisResult.riskResult.band === "amber") && (
                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <Radio className="w-4 h-4 text-indigo-400 animate-pulse shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono uppercase leading-tight">AI Decoy Interception Available</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          This threat level is scored high enough to deploy an automated AI persona to stall the attacker and harvest digital payment evidence.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDecoySessionId(analysisResult.sessionId);
                        setDecoyModeActive(true);
                        setDecoyMessages([]);
                        setEscalationConfidence(0.0);
                        setAgentActive(false);
                        setTotalMessages(0);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs py-2 px-4 rounded-xl border border-indigo-500 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Deploy Intercept Decoy</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={resetScanner}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-mono text-xs py-3 rounded-xl border border-white/10 transition cursor-pointer flex items-center justify-center gap-2 pt-4"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Message</span>
                </button>
              </div>
            ) : (
              // INTAKE FORM VIEW
              <>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-lg font-semibold text-white">Scan a Message</h3>
                  <span className="text-[10px] font-mono text-slate-500">V-2.4.0-REL</span>
                </div>

                {/* District dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">
                    Reporting Hub / District:
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="bg-black/50 text-xs font-mono border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer w-full [&>option]:bg-[#0d1117] [&>option]:text-slate-300"
                  >
                    <option value="New Delhi">New Delhi (NCR)</option>
                    <option value="Jamtara">Jamtara (Jharkhand)</option>
                    <option value="Bharatpur (Mewat)">Bharatpur (Mewat)</option>
                    <option value="Mumbai">Mumbai (MH)</option>
                    <option value="Bengaluru">Bengaluru (KA)</option>
                    <option value="Hyderabad">Hyderabad (TS)</option>
                    <option value="Kolkata">Kolkata (WB)</option>
                    <option value="Ahmedabad">Ahmedabad (GJ)</option>
                    <option value="Pune">Pune (MH)</option>
                    <option value="Chennai">Chennai (TN)</option>
                  </select>
                </div>

                {/* Input message text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    Pasted scam text or script
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste suspicious SMS text, stock market IPO links, fake job offers, or enter custom details..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500/50 font-mono text-slate-200 placeholder-slate-500 leading-relaxed resize-none"
                  />
                </div>

                {/* File upload trigger and status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 cursor-pointer transition select-none">
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Upload screenshot</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>

                    {selectedFile && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-emerald-400">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Image loaded</span>
                        <button 
                          onClick={() => setSelectedFile(null)} 
                          className="hover:text-emerald-300 ml-0.5 cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {(inputText || selectedFile) && (
                      <button
                        onClick={resetScanner}
                        className="bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 px-3 py-2 rounded-xl border border-white/10 transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={handleRunAnalysis}
                      disabled={(!inputText && !selectedFile) || analysisLoading}
                      className={`text-xs font-mono font-semibold px-4 py-2 rounded-xl border flex items-center gap-1.5 transition select-none ${
                        (!inputText && !selectedFile) || analysisLoading
                          ? "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 cursor-pointer shadow-lg shadow-indigo-500/20"
                      }`}
                    >
                      {analysisLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>
                        {analysisLoading 
                          ? (selectedFile ? "Reading screenshot..." : "Analyzing...") 
                          : "Run risk analysis"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Live Ticker Feed */}
                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                    Live Feed
                  </p>
                  
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-200">Decoy #992 engaged with WhatsApp scammer</p>
                      <p className="text-[10px] text-slate-500">Evidence extraction in progress: 68%</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-200">Network Cluster identified in Southeast Asia</p>
                      <p className="text-[10px] text-slate-500">Sent to Officer Dashboard</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

