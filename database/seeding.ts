import { SessionRepository } from "../repositories/session.repository.ts";
import { MemoryStore } from "./memory-store.ts";
import { db } from "./connection.ts";
import { sessions } from "../src/db/schema.ts";

const SEED_SESSIONS = [
  {
    id: "SESS-2026-001",
    createdAt: new Date("2026-07-14T09:14:22Z"),
    district: "Jamtara",
    classification: "danger" as const,
    scamType: "digital_arrest",
    confidence: 96,
    riskScore: 94,
    riskBand: "red",
    riskReasons: ["impersonating CBI/police", "urgency language detected", "matches known pattern DA-02"],
    mode: "decoy" as const,
    messages: [
      { role: "user", text: "I received a Skype video call saying they are CBI officer. They say my FedEx parcel contains illegal items and I am under digital arrest.", timestamp: "2026-07-14T09:14:22Z" },
      { role: "model", text: "You must transfer verification funds immediately or face prosecution.", timestamp: "2026-07-14T09:19:05Z" }
    ],
    explanation: "Classic digital arrest scam pattern using CBI impersonation and urgency.",
    actionableAdvice: "Do not transfer money. Disconnect immediately.",
    entities: { upiIds: ["paytmcbi@okaxis"], phoneNumbers: ["9834120934"], bankAccounts: [], urls: ["http://cbi-verification-portal.com"] }
  },
  {
    id: "SESS-2026-002",
    createdAt: new Date("2026-07-15T14:32:05Z"),
    district: "Bharatpur (Mewat)",
    classification: "danger" as const,
    scamType: "investment_fraud",
    confidence: 92,
    riskScore: 81,
    riskBand: "orange",
    riskReasons: ["fraudulent investment pitch", "urgency language detected"],
    mode: "detect" as const,
    messages: [
      { role: "user", text: "They added me to a VIP Stock Group promising 500% returns on IPO allotments.", timestamp: "2026-07-15T14:32:05Z" }
    ],
    explanation: "VIP WhatsApp stock group promising astronomical returns.",
    actionableAdvice: "Only invest through SEBI-registered brokers.",
    entities: { upiIds: ["mewattrade@ybl"], phoneNumbers: ["9728411029"], bankAccounts: [], urls: ["http://vip-stock-academy.net"] }
  },
  {
    id: "SESS-2026-003",
    createdAt: new Date("2026-07-16T11:45:12Z"),
    district: "Mumbai",
    classification: "danger" as const,
    scamType: "digital_arrest",
    confidence: 98,
    riskScore: 91,
    riskBand: "red",
    riskReasons: ["fake customs/parcel claim", "similar to 1 previous reports", "flagged upi"],
    mode: "detect" as const,
    messages: [
      { role: "user", text: "Got a call from FedEx claiming a passport with my Aadhaar was seized, patched to fake Mumbai Police wanting bank details.", timestamp: "2026-07-16T11:45:12Z" }
    ],
    explanation: "Same syndicate as SESS-2026-001 — shares UPI ID and phone number.",
    actionableAdvice: "Hang up. Never share Aadhaar or bank details over unsolicited calls.",
    entities: { upiIds: ["paytmcbi@okaxis"], phoneNumbers: ["9834120934"], bankAccounts: [], urls: ["http://fedex-customs-clearance.net"] }
  },
  {
    id: "SESS-2026-004",
    createdAt: new Date("2026-07-17T16:08:40Z"),
    district: "Bengaluru",
    classification: "danger" as const,
    scamType: "job_scam",
    confidence: 89,
    riskScore: 78,
    riskBand: "orange",
    riskReasons: ["fake job offer pattern", "asks for money upfront"],
    mode: "decoy" as const,
    messages: [
      { role: "user", text: "Earn Rs. 8,000 daily by liking YouTube videos in a Telegram app.", timestamp: "2026-07-17T16:08:40Z" }
    ],
    explanation: "Task-based job scam requiring upfront deposits.",
    actionableAdvice: "Legitimate jobs never require payment to start earning.",
    entities: { upiIds: [], phoneNumbers: ["9002134821"], bankAccounts: [], urls: [] }
  },
  {
    id: "SESS-2026-005",
    createdAt: new Date("2026-07-18T08:22:15Z"),
    district: "Kolkata",
    classification: "suspicious" as const,
    scamType: "lottery_prize",
    confidence: 70,
    riskScore: 52,
    riskBand: "amber",
    riskReasons: ["fake prize/lottery claim"],
    mode: "detect" as const,
    messages: [
      { role: "user", text: "You have won Rs 25 lakh in a lucky draw, pay processing fee to claim.", timestamp: "2026-07-18T08:22:15Z" }
    ],
    explanation: "Standard advance-fee lottery scam.",
    actionableAdvice: "Legitimate lotteries never require an upfront fee.",
    entities: { upiIds: ["luckydraw2026@oksbi"], phoneNumbers: [], bankAccounts: [], urls: [] }
  },
  {
    id: "SESS-2026-006",
    createdAt: new Date("2026-07-18T19:50:33Z"),
    district: "Hyderabad",
    classification: "suspicious" as const,
    scamType: "family_emergency",
    confidence: 75,
    riskScore: 61,
    riskBand: "orange",
    riskReasons: ["urgency language detected", "similar to 1 previous reports"],
    mode: "detect" as const,
    messages: [
      { role: "user", text: "Mom, my phone broke, this is a friend's number, send Rs 12,000 urgently for a doctor.", timestamp: "2026-07-18T19:50:33Z" }
    ],
    explanation: "Family emergency impersonation scam — shares phone number with SESS-2026-004's telecom infrastructure.",
    actionableAdvice: "Call your family member on their known number to verify first.",
    entities: { upiIds: ["helpfriend@paytm"], phoneNumbers: ["9002134821"], bankAccounts: [], urls: [] }
  },
  {
    id: "SESS-2026-007",
    createdAt: new Date("2026-07-19T10:15:00Z"),
    district: "Delhi NCR",
    classification: "safe" as const,
    scamType: "legitimate_communication",
    confidence: 96,
    riskScore: 12,
    riskBand: "green",
    riskReasons: ["standard transactional notification", "no threat or financial coercion detected", "verified sender header format"],
    mode: "detect" as const,
    messages: [
      { role: "user", text: "Dear SBI customer, your OTP for transaction of Rs. 2,450 at Croma Online is 481902. Valid for 10 mins. Do not share OTP with anyone.", timestamp: "2026-07-19T10:15:00Z" }
    ],
    explanation: "Standard bank transaction OTP SMS notification without coercion, pressure, or suspicious payment redirects.",
    actionableAdvice: "Legitimate bank SMS notification. Never share your OTP with anyone over the phone.",
    entities: { upiIds: [], phoneNumbers: [], bankAccounts: [], urls: [] }
  }
];

export async function seedDatabaseIfEmpty() {
  try {
    const existingMemory = MemoryStore.getSessions();
    if (existingMemory.length === 0) {
      for (const seed of SEED_SESSIONS) {
        const { entities, ...sessionData } = seed;
        MemoryStore.createSession(
          { ...sessionData, explanation: seed.explanation, actionableAdvice: seed.actionableAdvice },
          entities
        );
      }
      console.log(`[Seeding] Seeded ${SEED_SESSIONS.length} demo sessions into MemoryStore.`);
    }

    if (db) {
      const existing = await db.select().from(sessions).limit(1);
      if (existing.length === 0) {
        for (const seed of SEED_SESSIONS) {
          const { entities, ...sessionData } = seed;
          await SessionRepository.createSession(
            { ...sessionData, explanation: seed.explanation, actionableAdvice: seed.actionableAdvice },
            entities
          );
        }
        console.log(`[Seeding] Inserted ${SEED_SESSIONS.length} demo sessions with shared entity clusters into DB.`);
      }
    }
  } catch (err: any) {
    console.warn("[Seeding] Database seeding note:", err.message);
  }
}

