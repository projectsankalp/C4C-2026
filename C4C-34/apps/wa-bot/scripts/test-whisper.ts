/**
 * Whisper integration smoke test.
 *
 * Validates that:
 *   1. OPENAI_API_KEY is loaded from .env.
 *   2. The OpenAI client can list models.
 *   3. transcribeAudio() with no buffer falls back to the mock.
 *   4. transcribeAudio() with a small wav buffer hits Whisper successfully.
 *
 * Run: npm run test:whisper
 *
 * Requires OPENAI_API_KEY in .env. Without it, only the mock test runs.
 */
import OpenAI from "openai";
import { config } from "../src/config";
import { transcribeAudio } from "../src/services/transcribeService";

// A 1-second silent WAV file (44 bytes RIFF header + samples).
// Whisper will return an empty/short transcript but the API call succeeds,
// proving the pipeline works without spending real audio quota.
function makeSilentWav(): Buffer {
  const sampleRate = 16000;
  // Whisper rejects audio < 0.1s. Use 0.5s of silence to stay safely above.
  const numSamples = sampleRate / 2;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  // samples are zero (silence) — already filled by Buffer.alloc
  return buf;
}

async function run() {
  console.log("===== Whisper integration probe =====\n");

  // 1. Mock path
  console.log("[1/3] Mock fallback (no audio buffer)");
  const mock = await transcribeAudio({
    contextHint: "lamp 600 rupees 2 pieces",
  });
  console.log(`  source = ${mock.source}`);
  console.log(`  text   = "${mock.text}"`);
  console.log(`  lang   = ${mock.language}`);
  console.log(`  ${mock.source === "mock" ? "✅" : "❌"} expected mock\n`);

  if (!config.openaiApiKey) {
    console.log("ℹ️  OPENAI_API_KEY not set. Skipping live Whisper tests.");
    console.log("   Run `npm run setup -- --openai sk-...` to enable.");
    return;
  }

  // 2. List models
  console.log("[2/3] Listing OpenAI models");
  try {
    const client = new OpenAI({ apiKey: config.openaiApiKey });
    const list = await client.models.list();
    const whisper = list.data.find((m) => m.id.includes("whisper"));
    console.log(`  Found ${list.data.length} models. Whisper: ${whisper?.id || "not found"}`);
    console.log(`  ✅ key valid\n`);
  } catch (error: any) {
    console.error(`  ❌ ${error?.message || error}\n`);
    process.exit(1);
  }

  // 3. Live Whisper call with silent audio
  console.log("[3/3] Live Whisper call with silent test audio");
  const silentBuffer = makeSilentWav();
  const result = await transcribeAudio({
    audioBuffer: silentBuffer,
    mimetype: "audio/wav",
    language: "en",
  });
  console.log(`  source = ${result.source}`);
  console.log(`  text   = "${result.text}"`);
  console.log(`  lang   = ${result.language}`);
  console.log(`  ${result.source === "whisper" ? "✅" : "⚠️ "} expected whisper`);

  if (result.source !== "whisper") {
    console.log("\n  Whisper returned mock — check the warn log above for the real reason.");
    process.exit(1);
  }

  console.log("\n===== probe complete =====");
}

run().catch((err) => {
  console.error("Probe failed:", err?.message || err);
  process.exit(1);
});
