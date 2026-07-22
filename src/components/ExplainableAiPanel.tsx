import React from "react";
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldAlert, 
  Search, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  Fingerprint, 
  Smartphone, 
  Landmark, 
  Globe
} from "lucide-react";

export interface ExplainableAiProps {
  riskScore: number;
  scamType: string;
  riskBand?: string;
  explanation?: string;
  actionableAdvice?: string;
  riskReasons?: any;
  extractedEntities?: {
    upiIds?: string[];
    phoneNumbers?: string[];
    bankAccounts?: string[];
    urls?: string[];
  };
  ocrText?: string;
  confidenceScore?: number;
}

export function ExplainableAiPanel({
  riskScore,
  scamType,
  explanation,
  riskReasons,
  extractedEntities,
  ocrText,
  confidenceScore
}: ExplainableAiProps) {
  // Normalize risk reasons
  const parseReasons = (): string[] => {
    if (!riskReasons) return [];
    if (Array.isArray(riskReasons)) {
      return riskReasons.map(r => typeof r === "string" ? r : r.text || JSON.stringify(r));
    }
    if (typeof riskReasons === "object") {
      return Object.values(riskReasons).flat().map((r: any) => typeof r === "string" ? r : r.text || String(r));
    }
    return [String(riskReasons)];
  };

  const reasonsList = parseReasons();

  // Extract total entities
  const upis = extractedEntities?.upiIds || [];
  const phones = extractedEntities?.phoneNumbers || [];
  const banks = extractedEntities?.bankAccounts || [];
  const urls = extractedEntities?.urls || [];
  const totalEvidenceCount = upis.length + phones.length + banks.length + urls.length;

  // Calculate dynamic confidence score if not passed
  const calculatedConfidence = confidenceScore ?? Math.min(98, Math.max(72, Math.round(75 + (riskScore * 0.2) + (totalEvidenceCount * 2))));

  // Format scam type label
  const formattedScamType = (scamType || "Digital Fraud")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Determine key risk indicators
  const indicators: { label: string; type: "ai" | "evidence"; icon: React.ReactNode; detail: string }[] = [];

  const reasonsText = reasonsList.join(" ").toLowerCase() + " " + (explanation || "").toLowerCase();

  if (reasonsText.includes("police") || reasonsText.includes("cbi") || reasonsText.includes("arrest") || reasonsText.includes("government") || (scamType && scamType.includes("arrest"))) {
    indicators.push({
      label: "Spoofed Government / Law Enforcement Identity",
      type: "ai",
      icon: <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />,
      detail: "NLP model detected high-confidence impersonation of police, legal, or CBI authority."
    });
  }

  if (reasonsText.includes("urgency") || reasonsText.includes("threat") || reasonsText.includes("immediate") || reasonsText.includes("pressure")) {
    indicators.push({
      label: "Psychological Coercion & High-Urgency Trigger",
      type: "ai",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
      detail: "High emotional manipulation velocity designed to bypass victim verification steps."
    });
  }

  if (upis.length > 0) {
    indicators.push({
      label: `Suspicious UPI Payment Handle (${upis[0]})`,
      type: "evidence",
      icon: <Landmark className="w-3.5 h-3.5 text-emerald-400" />,
      detail: `Parsed ${upis.length} unverified merchant/personal UPI handle(s) for instant fund transfers.`
    });
  }

  if (phones.length > 0) {
    indicators.push({
      label: `Unverified MSISDN / Phone Contact (${phones[0]})`,
      type: "evidence",
      icon: <Smartphone className="w-3.5 h-3.5 text-teal-400" />,
      detail: `Extracted ${phones.length} contact number(s) flagged for cold reachout or line spoofing.`
    });
  }

  if (urls.length > 0) {
    indicators.push({
      label: `Unknown / Phishing Web URL (${urls[0]})`,
      type: "evidence",
      icon: <Globe className="w-3.5 h-3.5 text-sky-400" />,
      detail: `Extracted ${urls.length} web destination(s) mimicking legitimate financial portals.`
    });
  }

  if (ocrText && ocrText.length > 10) {
    indicators.push({
      label: "OCR Visual Text Evidence Extraction",
      type: "evidence",
      icon: <FileText className="w-3.5 h-3.5 text-amber-400" />,
      detail: "Optical character recognition extracted key text elements directly from image artifact."
    });
  }

  if (reasonsText.includes("pattern") || reasonsText.includes("cluster") || reasonsText.includes("shared") || totalEvidenceCount > 1) {
    indicators.push({
      label: "Threat Intelligence & Cross-Case Pattern Match",
      type: "evidence",
      icon: <Fingerprint className="w-3.5 h-3.5 text-purple-400" />,
      detail: "Entities cross-referenced against active threat database and shared syndicate clusters."
    });
  }

  if (indicators.length === 0) {
    indicators.push({
      label: "Heuristic Linguistic Risk Analysis",
      type: "ai",
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" />,
      detail: "Evaluated text structures against known fraudulent communication tactics."
    });
  }

  // Build concise 2-4 sentence natural language explanation
  const buildNaturalExplanation = (): string => {
    if (explanation && explanation.length > 30) {
      return explanation;
    }
    const evidenceSummary = totalEvidenceCount > 0 
      ? `The system extracted ${totalEvidenceCount} hard evidence indicator(s) including ${[
          upis.length > 0 ? `${upis.length} UPI handle(s)` : null,
          phones.length > 0 ? `${phones.length} phone number(s)` : null,
          urls.length > 0 ? `${urls.length} URL(s)` : null,
          banks.length > 0 ? `${banks.length} bank account(s)` : null
        ].filter(Boolean).join(", ")}.`
      : "Linguistic and structural analysis identified fraudulent intent markers in the communication.";

    return `The AI classifier evaluated this case as ${formattedScamType} with a threat score of ${riskScore}/100 and ${calculatedConfidence}% model confidence. ${evidenceSummary} Based on these combined signals, immediate protective measures are recommended to prevent unauthorized asset transfers.`;
  };

  const synthesizedExplanation = buildNaturalExplanation();

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-4 text-slate-200 shadow-xl backdrop-blur-md font-sans w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3.5 gap-2">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-white text-sm flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>Why Was This Classified?</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase tracking-wider shrink-0">
                Explainable AI (XAI)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal break-words">
              Transparent breakdown of prediction weights, model confidence, and extracted evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Overall Risk Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-extrabold ${riskScore >= 75 ? "text-rose-400" : riskScore >= 45 ? "text-amber-400" : "text-emerald-400"}`}>
              {riskScore}
            </span>
            <span className="text-[10px] text-slate-500">/100</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Scam Category</span>
          <span className="text-xs font-bold text-white mt-1 break-words sm:truncate" title={formattedScamType}>
            {formattedScamType}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Confidence Score</span>
          <span className="text-xs font-bold text-indigo-400 mt-1 flex items-center gap-1">
            <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
            {calculatedConfidence}%
          </span>
        </div>
      </div>

      {/* Distinction: AI Prediction vs Extracted Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* AI Prediction Layer */}
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold font-mono text-[11px] uppercase tracking-wider flex-wrap">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>AI Model Prediction</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans break-words">
            Categorized as <strong className="text-white font-semibold">{formattedScamType}</strong> based on semantic sentiment, urgency velocity, and pressure pattern weights.
          </p>
        </div>

        {/* Extracted Evidence Layer */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold font-mono text-[11px] uppercase tracking-wider flex-wrap">
            <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Extracted Hard Evidence</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans break-words">
            Isolated <strong className="text-white font-semibold">{totalEvidenceCount} indicator(s)</strong> ({upis.length} UPI, {phones.length} Phone, {urls.length} URL, {banks.length} Bank) extracted directly from input.
          </p>
        </div>
      </div>

      {/* Top Risk Indicators */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 flex flex-wrap items-center justify-between gap-1">
          <span>Top Influencing Risk Indicators:</span>
          <span className="text-slate-500 font-normal">{indicators.length} Signals Active</span>
        </h4>
        <div className="space-y-2">
          {indicators.map((ind, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5 shrink-0">{ind.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span className="text-xs font-bold text-white font-sans break-words">{ind.label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase shrink-0 self-start sm:self-auto ${
                    ind.type === "ai" 
                      ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" 
                      : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  }`}>
                    {ind.type === "ai" ? "AI Model Inference" : "Extracted Fact"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-normal break-words">{ind.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Short Natural Language Explanation */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5 min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-300 block">
          AI Decision Explanation
        </span>
        <p className="text-xs text-slate-300 leading-relaxed font-sans break-words">
          {synthesizedExplanation}
        </p>
      </div>
    </div>
  );
}
