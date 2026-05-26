/**
 * Direct test of gpt-5-mini availability + JSON response_format support.
 * Run: npx ts-node-dev --transpile-only scripts/test-gpt5mini.ts
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

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

async function run() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("OPENAI_API_KEY not set.");
    process.exit(1);
  }
  const model = process.env.OPENAI_LISTING_MODEL || "gpt-5-mini";
  console.log(`Testing model: ${model}`);

  const client = new OpenAI({ apiKey: key });

  console.log('\n[1/3] List models containing "gpt-5"...');
  try {
    const list = await client.models.list();
    const matches = list.data
      .filter((m) => m.id.includes("gpt-5"))
      .map((m) => m.id)
      .sort();
    console.log(`  Found ${matches.length} gpt-5 variants:`);
    matches.forEach((m) => console.log(`    - ${m}`));
  } catch (err: any) {
    console.error(`  ❌ ${err?.message || err}`);
    process.exit(1);
  }

  console.log(`\n[2/3] Calling ${model} with response_format=json_object...`);
  try {
    const t0 = Date.now();
    const res = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You output JSON only. No prose." },
        {
          role: "user",
          content:
            "Make a JSON listing for: Handmade red sandalwood Ganesha statue, 2500 rupees, 3 pieces, polished. From Mysuru, Karnataka. Fields: title, description, category, material, price (number), quantity (number), tags (string array).",
        },
      ],
      response_format: { type: "json_object" },
    });
    const dt = Date.now() - t0;
    const text = res.choices[0]?.message?.content || "";
    console.log(`  ✓ Got response in ${dt}ms (${text.length} chars)`);
    console.log("  Raw:", text.slice(0, 500));
    try {
      const parsed = JSON.parse(text);
      console.log("  Parsed JSON:", JSON.stringify(parsed, null, 2).slice(0, 500));
    } catch (e: any) {
      console.error("  ⚠️  JSON parse failed:", e?.message);
    }
  } catch (err: any) {
    console.error(`  ❌ ${err?.message || err}`);
    if (err?.error || err?.code)
      console.error("  ", { code: err.code, type: err.type, error: err.error });
    process.exit(1);
  }

  console.log("\n[3/3] Done.");
}

run();
