import { ExtractedEntities } from "../src/types.ts";

export function redactPersonalDetails(text: string, entities: ExtractedEntities): string {
  let redacted = text;

  for (const upi of entities.upiIds || []) {
    redacted = redacted.split(upi).join("[UPI]");
  }
  for (const phone of entities.phoneNumbers || []) {
    redacted = redacted.split(phone).join("[PHONE]");
  }
  for (const bank of entities.bankAccounts || []) {
    redacted = redacted.split(bank).join("[BANK_ACCOUNT]");
  }
  for (const url of entities.urls || []) {
    redacted = redacted.split(url).join("[URL]");
  }

  return redacted;
}
