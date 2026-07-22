import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, Users, BookOpen } from "lucide-react";
import CitizenPortalPage from "./components/CitizenPortalPage.tsx";
import OfficerDashboardPage from "./components/OfficerDashboardPage.tsx";
import HowItWorksPage from "./components/HowItWorksPage.tsx";

type Tab = "citizen" | "officer" | "learn";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("citizen");
  const [threatLevelInfo, setThreatLevelInfo] = useState<{ level: string; color: string }>({
    level: "CRITICAL",
    color: "text-red-400 font-bold"
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activeTab]);

  useEffect(() => {
    const updateThreatLevel = async () => {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const maxScore = Math.max(...data.map((s: any) => s.riskScore ?? 0));
          if (maxScore >= 85) {
            setThreatLevelInfo({ level: "CRITICAL", color: "text-red-400 font-bold" });
          } else if (maxScore >= 70) {
            setThreatLevelInfo({ level: "HIGH", color: "text-orange-400 font-bold" });
          } else if (maxScore >= 40) {
            setThreatLevelInfo({ level: "MODERATE", color: "text-amber-400 font-bold" });
          } else {
            setThreatLevelInfo({ level: "LOW", color: "text-emerald-400 font-bold" });
          }
        }
      } catch {
        // Fallback default remains active
      }
    };

    updateThreatLevel();
    const interval = setInterval(updateThreatLevel, 4000);
    window.addEventListener("sessions-updated", updateThreatLevel);
    return () => {
      clearInterval(interval);
      window.removeEventListener("sessions-updated", updateThreatLevel);
    };
  }, []);

  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col relative overflow-hidden bg-[#04060b]">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 h-20 flex items-center justify-between px-6 md:px-10 border-b border-white/5 backdrop-blur-md bg-[#04060b]/80">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-none">
              RakshaNet
            </span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold block mt-1">
              AI Public Safety Network
            </span>
          </div>
        </div>

        {/* Navigation Controls */}
        <nav className="flex gap-1 bg-black/30 p-1 rounded-full border border-white/10 relative z-50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab("citizen");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all cursor-pointer relative z-50 ${
              activeTab === "citizen"
                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">Citizen Center</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab("officer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all cursor-pointer relative z-50 ${
              activeTab === "officer"
                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Officer Dashboard</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab("learn");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all cursor-pointer relative z-50 ${
              activeTab === "learn"
                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">How It Works</span>
          </button>
        </nav>

        {/* Connection status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-medium text-white">Secure Connection</p>
            <p className="text-[10px] text-emerald-400 font-mono uppercase">● System Live</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10"></div>
        </div>
      </header>

      {/* Main Content Render Area */}
      <main className="flex-1 relative z-10">
        {activeTab === "citizen" ? (
          <CitizenPortalPage onNavigateToLearn={() => setActiveTab("learn")} />
        ) : activeTab === "officer" ? (
          <OfficerDashboardPage />
        ) : (
          <HowItWorksPage onNavigateToCitizen={() => setActiveTab("citizen")} />
        )}
      </main>

      {/* Simplified Footer */}
      <footer className="relative z-10 py-6 mt-12 text-center border-t border-white/5 bg-black/20 text-[10px] font-mono tracking-widest text-slate-500 flex flex-col md:flex-row justify-between items-center px-10 gap-2">
        <div className="flex gap-6 uppercase">
          <span>Global Threat Level: <span className={threatLevelInfo.color}>{threatLevelInfo.level}</span></span>
          <span>● API: Connected</span>
          <span>● Node: ASIA-SOUTH-1</span>
        </div>
        <div className="uppercase">
          &copy; 2026 RakshaNet AI • Secure Governance Framework
        </div>
      </footer>
    </div>
  );
}

