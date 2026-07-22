export const ADVISORY_SYSTEM_INSTRUCTION = "You are the Chief Intelligence Drafting Officer at I4C Cyber Crime Cell. Draft official advisories in strict JSON.";

export const ADVISORY_PROMPT_TEMPLATE = (params: {
  session: any;
  linkedSessions: Array<{ id: string; district: string; scamType: string }>;
  ragContext: string;
}) => `
Draft an official Ministry of Home Affairs (MHA) style Cyber Security Advisory / Law Enforcement Alert based on this active scam intelligence session:

Session ID: ${params.session.id}
Risk Score: ${params.session.riskScore}/100 (${params.session.riskBand} band)
Scam Type: ${params.session.scamType}
Location District: ${params.session.district}

Risk Assessment Reasons:
${(params.session.riskReasons || []).map((r: any) => `- ${typeof r === "string" ? r : (r?.text || "")}`).join("\n") || "- No specific reasons recorded"}

Extracted Threat Indicators:
- UPI Handles: ${params.session.extractedEntities?.upiIds?.join(", ") || "None"}
- Fraudulent Phone Numbers: ${params.session.extractedEntities?.phoneNumbers?.join(", ") || "None"}
- Target/Phishing URLs: ${params.session.extractedEntities?.urls?.join(", ") || "None"}
- Bank Accounts Flagged: ${params.session.extractedEntities?.bankAccounts?.join(", ") || "None"}

Cross-Referenced Reports:
${
  params.linkedSessions.length > 0
    ? params.linkedSessions.map((s) => `- ${s.id} (${s.district}) — ${s.scamType}`).join("\n")
    : "No cross-referenced reports at this time."
}

RAG STYLE & GUIDELINES TEMPLATES:
${params.ragContext || "No reference formatting files retrieved. Use standard I4C advisory format."}

IMPORTANT FORMATTING INSTRUCTION:
Do not include a letterhead, ministry name, logo, header, or document title. The UI already renders the official letterhead. Begin your response directly with the SUBJECT section.

Provide a highly professional MHA Advisory layout in Markdown format inside the "generatedText" JSON field.
Explicitly note in the advisory body whether this indicates an organized/coordinated fraud network based on
the cross-referenced reports above, or an isolated single-actor case if none were found.
Maintain official government memorandum formatting style.
Return strict JSON only.
`;
