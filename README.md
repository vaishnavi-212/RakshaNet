<div align="center">

# RakshaNet

### AI-Powered Cyber Scam Detection, Disruption & Threat Intelligence Platform

<p>
<b>Turning isolated scam reports into actionable cyber intelligence — detect fraud, disrupt scammers, and expose organized networks.</b>
</p>

<p>
<a href="https://rakshanet-production.up.railway.app/"><img src="https://img.shields.io/badge/🚀_Live_Demo-rakshanet--production.up.railway.app-6366F1?style=for-the-badge&logoColor=white" /></a>
</p>

<p>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Gemini_API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white" />
</p>

</div>

---

## 🚨 Problem Statement

India registered **1.14 million cybercrime complaints in 2023** (+60% YoY). "Digital arrest" scams — fraudsters impersonating CBI/ED/Customs officers, trapping victims on video calls — alone cost citizens **₹1,776+ crore** in the first nine months of 2024 (MHA). These are industrialized, cross-border operations reusing the same scripts and infrastructure against thousands of victims.

The gap isn't evidence after the fact — it's **intelligence before mass victimization**. Complaints today are investigated in isolation, after the money has moved, with no explanation, no cross-victim linkage, and no evidence gathered while the scam is live. RakshaNet closes that gap.

## 🧭 What It Does

RakshaNet is an end-to-end anti-fraud platform for digital scams in India — digital arrest coercion, UPI fraud, job/lottery/investment scams, and family-emergency impersonation. Every report runs through a full intelligence pipeline, not a spam filter:

- **Detects** — OCR + 17 entity extractors (UPI, phone, bank, wallets, socials, obfuscated numbers) feed an *explainable* 0–100 risk score.
- **Disrupts** — high-confidence scams trigger an AI decoy that stalls the scammer and extracts their payment details live.
- **Escalates** — reports sharing entities auto-link on a network graph, exposing syndicates. One click generates a print-ready advisory.

Every stage writes an audit log entry — the full decision trail is reconstructable.

## 💡 Key Innovations

- ✅ **Explainable Hybrid Risk Engine** — weighted score, not a black box
- ✅ **AI Decoy Intelligence Gathering** — extracts evidence from live scams
- ✅ **Self-Learning Threat Knowledge Base** — grows with every confirmed scam
- ✅ **Cross-Report Entity Correlation** — links victims into syndicate networks
- ✅ **Automated Investigation Advisories** — one-click, print-ready, evidence-backed


## 🎥 Live Demo

**🔗 [rakshanet-production.up.railway.app](https://rakshanet-production.up.railway.app/)**

Try the full flow live: submit a report through the **Citizen Portal**, watch the **AI Decoy** engage a high-risk scammer in real time, then switch to the **Officer Dashboard** to see the case land on the network graph with a generated advisory. The in-app **How It Works** page walks through each pipeline stage (OCR → extraction → RAG lookup → classification → composite risk score) with the same explanations used below.

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 🔍 Detect
- OCR extraction from screenshots via Gemini Vision
- Explainable composite risk score (0–100) with categorized reasons — identity, pressure, financial, pattern
- 17+ entity extractors: UPI, phone, IFSC, PAN, masked Aadhaar, bank accounts, crypto wallets, socials
- Catches obfuscated indicators (spelled-out numbers, spaced-out keywords like "o.t.p")
- RAG-grounded classification against a self-learning scam pattern library

</td>
<td width="33%" valign="top">

### 🎭 Disrupt
- AI decoy persona engages high-confidence scammers automatically
- Confidence-gated escalation — activates only once enough signal accumulates
- Extracts UPI handles, bank details, and contact info mid-conversation
- Every message updates the live case file in real time

</td>
<td width="33%" valign="top">

### 📊 Escalate
- Officer dashboard with live session feed and per-case audit trail
- Network graph linking reports sharing entities — surfaces organized syndicates
- One-click formatted intelligence advisory (print/download as Markdown)
- Growing knowledge base — confirmed high-risk reports feed back into detection

</td>
</tr>
</table>

## 🏗️ Architecture

**Pipeline flow — every citizen report moves through this chain:**

```
 Citizen Report (text or screenshot)
        │
        ▼
   OCR Extraction  ──────────────  Gemini Vision reads screenshot text
        │
        ▼
  Text Normalization  ───────────  Unicode cleanup, de-obfuscation
        │
        ▼
  Entity Extraction  ────────────  UPI / phone / bank / URL / wallet / social IDs
        │
        ▼
  Threat Intelligence Lookup  ───  Heuristic engine + cross-report DB correlation
        │
        ▼
  RAG Pattern Retrieval  ────────  Embedding similarity vs. scam pattern library
        │
        ▼
  AI Classification  ────────────  Gemini, grounded in retrieved patterns
        │
        ▼
  Composite Risk Engine  ────────  Weighted score: blacklist + RAG + behavioral + AI confidence
        │
        ▼
  ┌─────────────┴─────────────┐
  ▼                             ▼
Session + Audit Log Storage    AI Decoy Agent (if risk is high)
  │                             │
  ▼                             ▼
Network Graph Correlation ──────┘
        │
        ▼
  Officer Dashboard → Advisory Generator
```

**How the risk score is built** — this is the core of RakshaNet's explainability:

| Signal | Weight | Source |
|---|---|---|
| Known-scam entity match | 0–35 pts | Cross-report database correlation + heuristic blacklist |
| RAG pattern similarity | 0–25 pts | Embedding similarity to known scam scripts |
| Behavioral/keyword signals | 0–20 pts | Rule-based engine (urgency language, OTP requests, gov impersonation, remote-access solicitation, etc.) |
| AI classification confidence | 0–20 pts | Gemini's own confidence in its classification |

Score bands: 🟢 **Green** (0–30) · 🟡 **Amber** (31–60) · 🟠 **Orange** (61–85) · 🔴 **Red** (86–100)

**Resilience** — if PostgreSQL is unavailable, the app falls back to an in-memory store with the same schema, so the pipeline keeps working unchanged.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL via Drizzle ORM (with automatic in-memory fallback) |
| **AI / ML** | Google Gemini — classification, OCR, embeddings (RAG), decoy generation |
| **Deployment** | Railway |

## 📂 Project Structure

```
RakshaNet
│
├── agents/                       # LLM prompt templates
│   ├── decoy.agent.ts             → AI decoy persona instructions
│   └── advisory.agent.ts           → Intelligence advisory generator prompt
│
├── config/                      # Environment configuration
│   └── index.ts
│
├── database/                     # DB connection, seeding, in-memory fallback store
│   ├── connection.ts
│   ├── memory-store.ts
│   └── seeding.ts
│
├── drizzle/                      # Schema migrations
│   ├── 0000_freezing_orphan.sql
│   └── meta/
│       ├── 0000_snapshot.json
│       └── _journal.json
│
├── middleware/                    # Logging, error handling, rate limiting
│   ├── error.middleware.ts
│   ├── logging.middleware.ts
│   └── rate-limiting.middleware.ts
│
├── repositories/                   # Data access layer
│   ├── audit.repository.ts
│   ├── entity.repository.ts
│   └── session.repository.ts
│
├── routes/
│   └── api.routes.ts               → All REST endpoints (/analyze, /decoy, /sessions, /advisory...)
│
├── services/
│   ├── data/
│   │   └── seed-corpus.ts            → Seed data for scam pattern knowledge base
│   ├── decoy.service.ts              → Decoy escalation & conversation logic
│   ├── graph.service.ts              → Network graph builder
│   ├── reputation-intel.service.ts     → Cross-report entity correlation
│   ├── intel/                     # Core intelligence pipeline
│   │   ├── ai.service.ts               → Gemini API client wrapper
│   │   ├── classifier.service.ts         → Gemini scam classification
│   │   ├── composite-risk.service.ts      → Final weighted risk score
│   │   ├── entity-extraction.service.ts    → Obscured/verbalized entity discovery
│   │   ├── extraction.service.ts          → Regex-based entity extraction
│   │   ├── flatten-entities.ts           → Entity result normalization helper
│   │   ├── knowledge-base.service.ts       → RAG pattern store & similarity search
│   │   ├── normalization.service.ts        → Text cleanup & de-obfuscation
│   │   ├── reputation.service.ts          → Heuristic reputation checks
│   │   ├── risk-engine.service.ts         → Behavioral keyword scoring
│   │   ├── threat-intel.service.ts        → Threat intel orchestration
│   │   └── providers/                 → Swappable reputation data providers
│   │       ├── heuristic.provider.ts
│   │       └── threat-intel.provider.ts
│   └── ocr/                       → OCR provider abstraction (Gemini Vision)
│       ├── gemini-ocr.provider.ts
│       ├── ocr.interface.ts
│       └── ocr.service.ts
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── components/
│   │   ├── CitizenPortalPage.tsx        → Report intake + results + decoy chat
│   │   ├── OfficerDashboardPage.tsx       → Case list, detail view, graph
│   │   ├── NetworkGraph.tsx           → Entity relationship visualization
│   │   ├── ExplainableAiPanel.tsx        → Risk score breakdown UI
│   │   ├── MhaAlertModal.tsx           → Printable advisory document
│   │   └── HowItWorksPage.tsx          → Pipeline explainer page
│   └── db/                       → Drizzle schema & client
│       ├── index.ts
│       ├── schema.ts
│       └── drizzle.config.ts
│
├── utils/
│   ├── redact.ts                  → PII redaction before RAG corpus growth
│   └── scam-filter.ts               → Lightweight decoy-mode intel extraction
│
└── server.ts                      # App entry point
```

## 🚀 Getting Started

### Clone & Install
```bash
git clone https://github.com/vaishnavi-212/RakshaNet.git
cd RakshaNet
npm install
```

### Environment Variables
Create a `.env` file in the project root:
```bash
PORT=3000
NODE_ENV=development

# Google Gemini API key — powers classification, OCR, embeddings, and the decoy agent
GEMINI_API_KEY=your_gemini_api_key

# PostgreSQL connection (optional — the app falls back to an in-memory store if unset)
SQL_HOST=your_postgres_host
SQL_USER=your_postgres_user
SQL_PASSWORD=your_postgres_password
SQL_DB_NAME=your_postgres_database
```

### Run Locally
```bash
npm run dev
```

### Build & Start (production)
```bash
npm run build
npm start
```

## 🎯 Use Cases

- Digital arrest scam detection
- UPI / payment fraud detection
- Investment & job scam detection
- Cybercrime investigation support
- Cross-report threat intelligence & organized network analysis
- Citizen cyber safety education

## 🔒 Security

- Environment variables excluded from version control
- Helmet security headers, CORS, and per-IP rate limiting
- Centralized input validation and error handling
- Personal data redacted before any content is added to the learning corpus

## 📈 Roadmap

- [ ] Real-time external threat intelligence feeds
- [ ] Multilingual scam detection (12 regional languages)
- [ ] Voice / AI-generated speech scam analysis
- [ ] Counterfeit currency identification (computer vision agent)
- [ ] Geospatial crime pattern mapping for patrol prioritization
- [ ] Mobile application & WhatsApp/IVR citizen access
- [ ] Direct law enforcement portal integration (NCRP/I4C)

## 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature-name
git commit -m "Add feature"
git push origin feature-name
```

Then open a Pull Request.

---

<div align="center">

**⭐ If you found this project useful, consider giving it a star!**

Built to make digital spaces safer.

</div>
