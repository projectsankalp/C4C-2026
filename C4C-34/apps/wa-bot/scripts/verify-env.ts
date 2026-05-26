/**
 * Quick env verifier. Reads config, masks secrets, prints what's loaded.
 *   npm run setup -- --check
 * already does this with prettier output. This is the minimal version
 * for one-line CI assertions.
 */
import { config } from "../src/config";

function mask(value: string): string {
  if (!value) return "(empty)";
  if (value.length < 12) return "(short)";
  return `${value.slice(0, 7)}...${value.slice(-4)}`;
}

console.log("--- bot env load ---");
console.log("backendUrl          :", config.backendUrl);
console.log("port                :", config.port);
console.log("botSecret           :", mask(config.botSecret));
console.log("OPENAI_API_KEY      :", mask(config.openaiApiKey));
console.log("ALLOWED_TEST_NUMBERS:", config.allowedTestNumbers.join(", ") || "(empty)");
console.log("demoMode            :", config.demoMode);
console.log("useMockDraft        :", config.useMockDraft);
