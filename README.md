<div align="center">

# 🛡️ RakshaNet

### AI-Powered Cyber Scam Detection, Disruption & Threat Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)]()
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()

*Transforming isolated scam reports into actionable cyber intelligence.*

</div>

---

# 📖 Overview

RakshaNet is an AI-driven cybersecurity platform designed to help citizens identify digital fraud, assist investigators through intelligent evidence extraction, and uncover organized scam networks.

Instead of merely classifying suspicious messages as spam or scam, RakshaNet explains **why** a message is dangerous, extracts critical indicators, correlates reports across victims, and generates intelligence that can assist cybercrime investigators.

The platform follows a complete intelligence pipeline:

```
Citizen Report
      │
      ▼
 AI Detection
      │
      ▼
 Risk Analysis
      │
      ▼
 Evidence Extraction
      │
      ▼
 Threat Intelligence
      │
      ▼
 Network Analysis
      │
      ▼
 Advisory Generation
```

---

# ✨ Key Features

## 🔍 Detect

- OCR for screenshots
- AI-powered scam classification
- Explainable Risk Score (0–100)
- Threat intelligence lookup
- Entity extraction
- Similarity-based scam detection
- Knowledge-base powered reasoning

---

## 🎭 Disrupt

- AI Decoy Chat
- Evidence gathering from scam conversations
- Automatic extraction of new indicators
- Continuous session enrichment

---

## 📊 Escalate

- Officer Dashboard
- Scam Network Graph
- Threat clustering
- Advisory generation
- Session history
- Intelligence repository

---

# 🚀 System Architecture

```
Citizen
   │
   ▼
Message / Screenshot
   │
   ▼
OCR
   │
   ▼
Threat Intelligence
   │
   ▼
AI Scam Classifier
   │
   ▼
Knowledge Base Matching
   │
   ▼
Composite Risk Engine
   │
   ▼
Entity Extraction
   │
   ▼
Threat Repository
   │
   ▼
Decoy Agent
   │
   ▼
Graph Intelligence
   │
   ▼
Officer Dashboard
   │
   ▼
Advisory Generator
```

---

# ⚙️ Core Capabilities

### 📄 OCR Processing

Extracts text from uploaded screenshots before analysis.

---

### 🤖 AI Classification

Identifies scams such as:

- Digital Arrest
- UPI Fraud
- Job Scam
- Lottery Scam
- Investment Fraud
- Family Emergency Scam

---

### 📈 Explainable Risk Engine

Instead of giving a generic warning, RakshaNet produces:

- Numerical Risk Score
- Confidence
- Evidence-backed reasoning
- Risk category
- Detection indicators

Example

```
Risk Score : 92/100

✓ Impersonation detected
✓ Requests financial transfer
✓ Suspicious UPI ID
✓ Matches known fraud pattern
✓ High urgency language
```

---

### 🧠 Knowledge-Based Detection

Incoming messages are compared against previously identified scam patterns to improve detection accuracy.

---

### 🕵 Threat Intelligence

Automatically detects:

- Phone numbers
- UPI IDs
- URLs
- Bank accounts

and checks them against previously reported indicators.

---

### 🎭 Decoy Agent

High-risk conversations can continue with an AI persona that safely engages scammers while collecting additional intelligence.

---

### 🌐 Network Graph

Links multiple scam reports sharing common entities such as

- Phone Numbers
- UPI IDs
- URLs
- Bank Accounts

to identify organized fraud networks.

---

### 📑 Advisory Generator

Creates structured cybercrime advisories containing

- Threat summary
- Indicators
- Linked reports
- Recommended actions

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- CSS

## Backend

- Node.js
- Express

## Database

- PostgreSQL

## AI

- Large Language Models
- OCR
- Embeddings
- Retrieval-Augmented Generation (RAG)

---

# 📂 Project Structure

```
RakshaNet
│
├── assets
├── config
├── database
├── middleware
├── routes
├── services
│     ├── OCR
│     ├── Threat Intelligence
│     ├── Risk Engine
│     ├── Entity Extraction
│     ├── Knowledge Base
│     └── Advisory
│
├── src
│     ├── components
│     ├── pages
│     └── types
│
├── server.ts
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/RakshaNet.git
```

```
cd RakshaNet
```

---

## Install Dependencies

```
npm install
```

---

## Environment Variables

Create

```
.env
```

```
# Example

API_KEY=your_api_key
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

---

## Start Development

```
npm run dev
```

---

## Build

```
npm run build
```

---

# 🎯 Use Cases

- Digital Arrest Scam Detection
- UPI Fraud Detection
- Investment Scam Detection
- Cybercrime Investigation
- Threat Intelligence
- Citizen Cyber Safety
- Fraud Pattern Analysis

---

# 🔒 Security

RakshaNet follows secure development practices:

- Environment variables excluded from version control
- JWT authentication
- Rate limiting
- Input validation
- Error handling
- Secure API architecture

---

# 📈 Future Enhancements

- Real-time threat feeds
- Multilingual scam detection
- Voice scam analysis
- Mobile application
- Live cyber intelligence dashboard
- Law enforcement integration

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a feature branch

```
git checkout -b feature-name
```

3. Commit changes

```
git commit -m "Add feature"
```

4. Push

```
git push origin feature-name
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Built to make digital spaces safer.

</div>