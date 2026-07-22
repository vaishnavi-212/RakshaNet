import { ExtractionResult, ExtractedEntity } from "./extraction.service.ts";
import { ExtractedEntities } from "../../src/types.ts";

export function flattenForSession(
  result: ExtractionResult,
  obscured: ExtractedEntity[] = []
): ExtractedEntities {
  const onlyValidValues = (entities: ExtractedEntity[]) =>
    entities.filter((e) => e.isValid).map((e) => e.value);

  const obscuredPhones = obscured.filter((e) => e.type === "phone").map((e) => e.value);

  return {
    upiIds: onlyValidValues(result.upiIds),
    phoneNumbers: Array.from(new Set([...onlyValidValues(result.phoneNumbers), ...obscuredPhones])),
    bankAccounts: onlyValidValues(result.bankAccounts),
    urls: onlyValidValues(result.urls)
  };
}
