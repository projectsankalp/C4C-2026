/**
 * One-shot setup helper.
 *
 * Run with:
 *   npm run setup -- --phone 919876543210 --openai sk-....
 *   npm run setup -- --phone 919876543210            (no OpenAI; mock transcription)
 *   npm run setup -- --check                         (just validate current .env)
 *
 * What it does:
 *   - Updates .env so ALLOWED_TEST_NUMBERS contains the demo phone digits.
 *   - Updates .env so OPENAI_API_KEY is set (when provided).
 *   - Optionally pings OpenAI with the key (does not transcribe anything,
 *     just lists available models) so we know the key is valid before demo.
 *   - Never prints the key in full. Only the first 7 + last 4 chars.
 *
 * The .env file is gitignored, so nothing leaks.
 */
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const ENV_EXAMPLE = path.join(ROOT, ".env.example");

interface CliArgs {
  phone?: string;
  openai?: string;
  check?: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--phone") out.phone = argv[++i];
    else if (a === "--openai") out.openai = argv[++i];
    else if (a === "--check") out.check = true;
  }
  return out;
}

function maskKey(key: string): string {
  if (!key) return "(empty)";
  if (key.length < 12) return "(too short)";
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

function loadEnv(): Record<string, string> {
  if (!fs.existsSync(ENV_PATH)) {
    if (fs.existsSync(ENV_EXAMPLE)) {
      console.log("→ .env not found, copying from .env.example");
      fs.copyFileSync(ENV_EXAMPLE, ENV_PATH);
    } else {
      fs.writeFileSync(ENV_PATH, "", "utf8");
    }
  }
  const raw = fs.readFileSync(ENV_PATH, "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function writeEnv(values: Record<string, string>): void {
  // Read the existing file to preserve comments and ordering.
  const lines = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/) : [];
  const seen = new Set<string>();
  const updated = lines.map((line) => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (!m) return line;
    const key = m[1];
    if (key in values) {
      seen.add(key);
      return `${key}=${values[key]}`;
    }
    return line;
  });
  // Append any new keys that were not in the file.
  for (const [key, value] of Object.entries(values)) {
    if (!seen.has(key)) {
      updated.push(`${key}=${value}`);
    }
  }
  fs.writeFileSync(ENV_PATH, updated.join("\n"), "utf8");
}

async function pingOpenAI(key: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const client = new OpenAI({ apiKey: key });
    const list = await client.models.list();
    const hasWhisper = list.data.some((m) => m.id.includes("whisper"));
    return {
      ok: true,
      detail: `Listed ${list.data.length} models. Whisper available: ${hasWhisper ? "yes" : "no"}.`,
    };
  } catch (error: any) {
    return {
      ok: false,
      detail: error?.message || String(error),
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();

  console.log("===== HastKala BolKeBecho — setup =====\n");

  if (args.check) {
    console.log("Current configuration:");
    console.log(`  ALLOWED_TEST_NUMBERS = ${env.ALLOWED_TEST_NUMBERS || "(empty)"}`);
    console.log(`  OPENAI_API_KEY       = ${maskKey(env.OPENAI_API_KEY || "")}`);
    console.log(`  USE_MOCK_DRAFT       = ${env.USE_MOCK_DRAFT || "false"}`);
    console.log(`  DEMO_MODE            = ${env.DEMO_MODE || "true"}`);
    if (env.OPENAI_API_KEY) {
      console.log("\n→ Pinging OpenAI to validate the key...");
      const ping = await pingOpenAI(env.OPENAI_API_KEY);
      console.log(`  ${ping.ok ? "✅" : "❌"} ${ping.detail}`);
    }
    return;
  }

  const updates: Record<string, string> = {};

  if (args.phone) {
    const digits = args.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      console.error(`✗ Invalid phone number: "${args.phone}" — need at least 10 digits.`);
      process.exit(1);
    }
    // Append to existing list if not already present.
    const existing = (env.ALLOWED_TEST_NUMBERS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!existing.includes(digits)) existing.push(digits);
    updates.ALLOWED_TEST_NUMBERS = existing.join(",");
    console.log(`✓ Allowlisting phone: ${digits}`);
  }

  if (args.openai) {
    const key = args.openai.trim();
    if (!key.startsWith("sk-")) {
      console.error(`✗ OpenAI key should start with "sk-". Got: ${maskKey(key)}`);
      process.exit(1);
    }
    console.log(`→ Validating OpenAI key (${maskKey(key)})...`);
    const ping = await pingOpenAI(key);
    if (!ping.ok) {
      console.error(`✗ Key validation failed: ${ping.detail}`);
      console.error("  Aborting. Check the key and try again.");
      process.exit(1);
    }
    console.log(`✓ ${ping.detail}`);
    updates.OPENAI_API_KEY = key;
  }

  if (Object.keys(updates).length === 0) {
    console.log("Nothing to update. Use --phone <digits> or --openai <sk-...> or --check.");
    return;
  }

  writeEnv(updates);
  console.log("\n✓ .env updated.\n");
  console.log("Next steps:");
  console.log("  1. Start mock backend (or wait for Person 4):");
  console.log("       npm run dev:mock-backend");
  console.log("  2. In another terminal, start the bot:");
  console.log("       npm run dev");
  console.log("  3. Scan the QR code with the demo phone, then send 'hi' from that phone.\n");
}

main().catch((err) => {
  console.error("Setup failed:", err?.message || err);
  process.exit(1);
});
