/**
 * Quick env verification for the AI service. Prints what the API process
 * sees (with secrets masked). Run with `npx ts-node-dev --transpile-only scripts/verify-ai-env.ts`
 * from apps/api/.
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const APP_ROOT = path.resolve(__dirname, "..");
const WORKSPACE_ROOT = path.resolve(APP_ROOT, "..", "..");
dotenv.config({ path: path.resolve(WORKSPACE_ROOT, ".env") });
const apiEnvPath = path.resolve(APP_ROOT, ".env");
if (fs.existsSync(apiEnvPath)) {
  const parsed = dotenv.parse(fs.readFileSync(apiEnvPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== "") process.env[key] = value;
  }
}

function mask(v: string | undefined): string {
  if (!v) return "(empty)";
  if (v.length < 12) return "(short)";
  return `${v.slice(0, 7)}...${v.slice(-4)}`;
}

console.log("--- API env load ---");
console.log("AI_PROVIDER         :", process.env.AI_PROVIDER || "(unset)");
console.log("OPENAI_API_KEY      :", mask(process.env.OPENAI_API_KEY));
console.log(
  "OPENAI_LISTING_MODEL:",
  process.env.OPENAI_LISTING_MODEL || "(unset, default gpt-5-mini)",
);
console.log("USE_MEMORY_STORE    :", process.env.USE_MEMORY_STORE || "(unset)");
console.log("PORT                :", process.env.PORT || "(unset)");
