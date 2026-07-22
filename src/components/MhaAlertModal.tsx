import React from "react";
import { X, Printer, Download, ShieldCheck } from "lucide-react";
import Markdown from "react-markdown";
import { CaseAlert } from "../types.ts";

interface MhaAlertModalProps {
  alert: CaseAlert | null;
  onClose: () => void;
}

export default function MhaAlertModal({ alert, onClose }: MhaAlertModalProps) {
  if (!alert) return null;

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([alert.generatedText], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${alert.id}-MHA-Advisory.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Styles to inject print-specific layout */}
      <style>{`
        @media print {
          /* Hide everything except the print document */
          body * {
            visibility: hidden;
          }
          #mha-print-document, #mha-print-document * {
            visibility: visible;
          }
          #mha-print-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[92vh] sm:h-[88vh] md:h-[85vh] max-h-[920px] overflow-hidden">
        {/* Modal Top Actions Header (Fixed at top, not printed) */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/5 bg-slate-950/40 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-[11px] sm:text-xs md:text-sm font-mono uppercase tracking-wider sm:tracking-widest text-slate-300 font-bold truncate">
              <span className="hidden md:inline">Draft Intelligence Advisory Generated</span>
              <span className="inline md:hidden">Draft Advisory</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs font-mono text-slate-300 px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/5 transition flex items-center gap-1.5 cursor-pointer"
              title="Print Advisory"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-500 text-[11px] sm:text-xs font-mono text-white px-2.5 sm:px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              title="Download Markdown"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Download .md</span>
              <span className="sm:hidden">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-lg transition cursor-pointer shrink-0"
              title="Close Panel"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 md:p-8 bg-slate-950/60 flex justify-center w-full">
          {/* Print Document Paper (Styled like official Government memo) */}
          <div
            id="mha-print-document"
            className="w-full max-w-3xl bg-white text-slate-900 p-4 sm:p-6 md:p-10 shadow-lg border border-slate-200 rounded-lg text-left h-fit my-auto max-w-full overflow-x-hidden"
          >
            {/* National Crest / Gov Header */}
            <div className="border-b-2 border-slate-900 pb-3 sm:pb-4 mb-4 sm:mb-6 text-center">
              <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-red-600 font-bold mb-1 break-words">
                RESTRICTED // FOR LAW ENFORCEMENT ONLY
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-wide text-slate-900 uppercase leading-tight">
                Ministry of Home Affairs
              </h2>
              <h3 className="text-[11px] sm:text-xs md:text-sm font-bold tracking-wider text-slate-700 uppercase mt-0.5 leading-tight">
                Indian Cyber Crime Coordination Centre (I4C)
              </h3>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider leading-tight">
                Cyber Threat Intelligence & National Security Desk • Government of India
              </p>
            </div>

            {/* Memorandum Meta Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono text-slate-600 bg-slate-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-slate-200">
              <div className="flex justify-between md:block">
                <span className="font-bold text-slate-800">REF NO:</span> <span className="break-all">{alert.id}</span>
              </div>
              <div className="flex justify-between md:text-right">
                <span className="font-bold text-slate-800">DATE:</span> {new Date(alert.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </div>
              <div className="flex justify-between md:block">
                <span className="font-bold text-slate-800">CLASSIFICATION:</span> PRIORITY ALERT
              </div>
              <div className="flex justify-between md:text-right">
                <span className="font-bold text-slate-800">CASE ID:</span> <span className="break-all">{alert.sessionId}</span>
              </div>
            </div>

            {/* Document Content */}
            <div className="text-slate-800 leading-relaxed font-sans text-xs sm:text-sm space-y-3.5 break-words [&_h1]:text-sm sm:[&_h1]:text-base [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-xs sm:[&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-[11px] sm:[&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-2.5 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:leading-normal [&_strong]:font-bold [&_strong]:text-slate-900">
              <Markdown>{alert.generatedText}</Markdown>
            </div>

            {/* Signature block */}
            <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-0">
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center mb-1.5 sm:mb-2">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                </div>
                <p className="text-[9px] sm:text-[10px] font-mono text-slate-500">Generated by RakshaNet AI — Pending Human Review</p>
              </div>
              <div className="text-left md:text-right">
                <div className="font-bold text-[11px] sm:text-xs font-mono text-slate-800">CHIEF INTELLIGENCE OFFICER</div>
                <p className="text-[9px] sm:text-[10px] font-mono text-slate-500">I4C Cyber Crime Cell, TAU</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info footer (Fixed at bottom, not printed) */}
        <div className="p-3 sm:p-4 border-t border-white/5 bg-slate-950/40 text-center shrink-0">
          <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 leading-normal">
            Ensure this draft is reviewed thoroughly before official clearance or publishing to external law enforcement systems.
          </p>
        </div>
      </div>
    </div>
  );
}
