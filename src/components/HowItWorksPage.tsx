import React from "react";
import { 
  Shield, ShieldAlert, Upload, CheckCircle2, HelpCircle, Radio, Share2, 
  FileText, Activity, Lock, ArrowRight, PhoneCall, CreditCard, Award, 
  TrendingUp, Users, Network, AlertTriangle, Sparkles, Eye, Phone, Globe,
  AlertOctagon, ShieldCheck, ExternalLink, Clock
} from "lucide-react";

interface HowItWorksPageProps {
  onNavigateToCitizen: () => void;
}

export default function HowItWorksPage({ onNavigateToCitizen }: HowItWorksPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 space-y-16 animate-in fade-in duration-300 text-left">
      
      {/* 1. Hero Intro Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          How RakshaNet Works
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
          Simple AI Protection for Everyday Citizens & Law Enforcement
        </h1>
        <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          RakshaNet is built to protect citizens from cyber scams while helping law enforcement officers identify organized fraud networks. Whether you received a suspicious text or want to know how our system keeps you safe, here is everything you need to know.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onNavigateToCitizen}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            Check a Message Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. What Can You Do Here? — Citizen-Facing Features */}
      <div className="space-y-8">
        <div className="border-b border-white/10 pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-1">
            For Citizens
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            What You Can Do in the Citizen Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Easy tools designed to analyze threats instantly and protect you from losing money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/[0.07] transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Paste or Upload a Suspicious Message</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Type in any text message, email, or link — or simply upload a screenshot. Our system automatically reads text directly from images so you never have to retype anything.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/[0.07] transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Risk Check</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Within seconds, you get a clear verdict: Safe, Suspicious, or Dangerous. You will see a plain-English explanation, like "it's asking for your bank PIN" or "it matches a known scam pattern."
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/[0.07] transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">See Exactly Why Something Was Flagged</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              We don't just say "dangerous" — we show you the exact warning signs, such as urgent threats, requests for money, or phone numbers reported by other victims before.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/[0.07] transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Helping Catch the Scammer</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              If a message looks like an active scam, our system can safely continue the conversation with the scammer using an AI persona — buying time and quietly gathering evidence, like phone numbers and payment IDs, without you ever responding to them yourself.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:bg-white/[0.07] transition-all md:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Your Report Helps Protect Others</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Flagged details (like phone numbers, UPI IDs, fake bank accounts, or suspicious links) get checked against past reports across the network. If the same scammer targets someone else, the system already knows and alerts them instantly.
            </p>
          </div>
        </div>
      </div>

      {/* 3. What Happens Behind the Scenes for Law Enforcement */}
      <div className="space-y-8">
        <div className="border-b border-white/10 pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold block mb-1">
            For Law Enforcement & Investigators
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            What Happens Behind the Scenes
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            How RakshaNet helps police officers turn individual citizen reports into organized cybercrime investigations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Officer Feature 1 */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Connecting the Dots Between Cases</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              If two people report scams that share the same phone number or payment ID, RakshaNet visually connects those cases — helping police see when they're dealing with one organized group, not separate incidents.
            </p>
          </div>

          {/* Officer Feature 2 */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">A Running Case File for Every Report</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Every report is logged in the Central Cyber Threat Registry with its risk score, category, and gathered evidence, so officers can review active threats at a glance.
            </p>
          </div>

          {/* Officer Feature 3 */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Ready-to-Send Official Alerts</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              For serious cases, RakshaNet can draft a formal advisory report — summarizing the threat and evidence — ready for an officer to review and forward to the right authorities.
            </p>
          </div>

          {/* Officer Feature 4 */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">A Permanent Record for Every Step</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Every action RakshaNet takes on a report is time-stamped and recorded, so there's a clear trail if the case ever needs to go to court.
            </p>
          </div>
        </div>
      </div>

      {/* 4. How Your Information Is Handled — Privacy Section */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950/80 border border-indigo-500/20 rounded-3xl p-8 md:p-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Data Governance & Ethics
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              How Your Information Is Handled
            </h2>
          </div>
        </div>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
          When you submit a message, RakshaNet extracts scam indicators — like phone numbers, payment IDs, or links — to check if they match known fraud networks. Your reports are used solely to detect threats, protect the public, and assist law enforcement in identifying scammers — never to expose or sell your personal details.
        </p>
      </div>

      {/* 5. Categories of Scams We Detect */}
      <div className="space-y-8">
        <div className="border-b border-white/10 pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold block mb-1">
            Common Threat Patterns
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Categories of Scams We Detect
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Learn how to recognize these common digital fraud tactics before they target you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>Digital Arrest Scams</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Fake police, CBI, or customs officers calling over video claiming your parcel contains illegal items and demanding immediate money to avoid arrest.
            </p>
          </div>

          {/* Category 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>UPI & Payment Fraud</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Tricky requests asking you to scan a QR code or enter your UPI PIN to "receive" a refund or payment, which actually drains your account.
            </p>
          </div>

          {/* Category 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Users className="w-4 h-4 shrink-0" />
              <span>Fake Job Offers</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Promises of daily earnings for liking YouTube videos or doing simple Telegram tasks that eventually require upfront deposits.
            </p>
          </div>

          {/* Category 4 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Award className="w-4 h-4 shrink-0" />
              <span>Lottery & Prize Scams</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Messages claiming you won a huge cash prize or lucky draw, but asking for a "processing fee" or tax payment before releasing funds.
            </p>
          </div>

          {/* Category 5 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Investment Fraud</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Exclusive stock trading WhatsApp groups or fake apps promising guaranteed 500%+ returns on IPO allotments or crypto.
            </p>
          </div>

          {/* Category 6 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Family Emergency Scams</span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Urgent messages pretending to be a relative calling from a friend's phone who claims to be in legal trouble or hospital needing quick funds.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Emergency Action — If You've Already Been Scammed */}
      <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900/60 border border-rose-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
              Urgent Response
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              If You've Already Been Scammed — Act Immediately
            </h2>
          </div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs md:text-sm text-rose-200 flex items-start gap-3">
          <Clock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Golden Hours Rule:</strong> If money has already been transferred, call <strong>1930</strong> immediately — banks and payment gateways can sometimes freeze or reverse a transaction only within the first few hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Helpline 1930 */}
          <a 
            href="tel:1930" 
            className="bg-white/5 border border-rose-500/30 hover:bg-rose-500/10 transition-all rounded-2xl p-5 space-y-2 block group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">National Cyber Helpline</span>
              <Phone className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-rose-400">
              1930
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Official 24x7 cybercrime helpline for reporting financial fraud instantly in India.
            </p>
          </a>

          {/* Portal cybercrime.gov.in */}
          <a 
            href="https://cybercrime.gov.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white/5 border border-amber-500/30 hover:bg-amber-500/10 transition-all rounded-2xl p-5 space-y-2 block group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Reporting Portal</span>
              <ExternalLink className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-amber-300 font-mono tracking-tight truncate">
              cybercrime.gov.in
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Official Government of India portal to file a formal cybercrime complaint.
            </p>
          </a>

          {/* Emergency 112 */}
          <a 
            href="tel:112" 
            className="bg-white/5 border border-indigo-500/30 hover:bg-indigo-500/10 transition-all rounded-2xl p-5 space-y-2 block group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Police Emergency</span>
              <Phone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-indigo-400">
              112
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              India's national emergency number for immediate physical safety threats or ongoing coercion.
            </p>
          </a>
        </div>
      </div>

      {/* 7. Quick Safety Advisory */}
      <div className="space-y-8">
        <div className="border-b border-white/10 pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
            Protection Rules
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Quick Safety Advisory
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Essential plain-language dos and don'ts to protect yourself and your loved ones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-5 space-y-2 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Never Share OTPs, PINs, or Passwords</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No bank, police officer, or government official will ever ask for your OTPs, PINs, or passwords.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-5 space-y-2 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Disconnect "Digital Arrest" & Threat Calls Immediately</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hang up right away if someone claims you are under "digital arrest" or threatens legal action over video call — this is always a scam.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-5 space-y-2 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Don't Transfer Money to "Verify Identity"</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Never send money or pay "fees" to verify identity or avoid legal consequences — no genuine government procedure asks for this.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-5 space-y-2 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Take Screenshots Before Blocking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Capture chat logs, phone numbers, UPI IDs, or links before blocking the scammer so you can submit them as official evidence.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-5 space-y-2 flex items-start gap-3.5 md:col-span-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">When in Doubt, Call Family or Helpline</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pause before taking any action. Contact a family member or call official bank/government helpline numbers directly to verify.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Closing Call-To-Action */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Ready to Check a Suspicious Message?
        </h2>
        <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto">
          Protect yourself and your loved ones. Paste any text, link, or image now to get instant AI analysis.
        </p>
        <div className="pt-2">
          <button
            onClick={onNavigateToCitizen}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition shadow-xl shadow-indigo-600/25 inline-flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5" />
            Go to Citizen Center
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}
