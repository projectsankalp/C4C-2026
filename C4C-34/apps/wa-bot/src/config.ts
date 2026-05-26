/**
 * Centralized configuration for the BolKeBecho WhatsApp bot.
 * All env access funnels through here so the rest of the codebase stays clean.
 *
 * .env loading order:
 *   1. Workspace root .env  (so a single OPENAI_API_KEY can serve every app)
 *   2. apps/wa-bot/.env     (bot-specific overrides, but only for non-empty values)
 *
 * The bot-specific load uses an explicit override loop (not `dotenv.config`)
 * so an empty placeholder in the bot .env (e.g. `OPENAI_API_KEY=`) does NOT
 * wipe out a real value from the workspace root.
 */
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const APP_ROOT = path.resolve(__dirname, "..");
const WORKSPACE_ROOT = path.resolve(APP_ROOT, "..", "..");

// 1. Load workspace-level .env first.
dotenv.config({ path: path.resolve(WORKSPACE_ROOT, ".env") });

// 2. Load bot-specific .env. Skip empty placeholders.
const botEnvPath = path.resolve(APP_ROOT, ".env");
if (fs.existsSync(botEnvPath)) {
  const parsed = dotenv.parse(fs.readFileSync(botEnvPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== "") {
      process.env[key] = value;
    }
  }
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

function num(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function list(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  botName: process.env.BOT_NAME || "HastKala BolKeBecho",
  sessionId: process.env.SESSION_ID || "HASTKALA_DEMO",

  // Integration URLs
  backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
  publicWebUrl: process.env.PUBLIC_WEB_URL || "http://localhost:3000",
  vendorWebUrl: process.env.VENDOR_WEB_URL || "http://localhost:3001",
  botPhone: process.env.BOT_PHONE || "919876543210",

  // Internal HTTP server (where backend can POST order alerts to us)
  port: num(process.env.PORT, 5001),
  botSecret: process.env.WHATSAPP_BOT_SECRET || "wa-demo-secret",

  // Simulator backup server
  simulatorPort: num(process.env.SIMULATOR_PORT, 5002),

  // Mock backend
  mockBackendPort: num(process.env.MOCK_BACKEND_PORT, 4000),

  // Demo safety
  demoMode: bool(process.env.DEMO_MODE, true),
  allowedTestNumbers: list(process.env.ALLOWED_TEST_NUMBERS),

  // Behavior toggles
  headless: bool(process.env.HEADLESS, true),
  useMockDraft: bool(process.env.USE_MOCK_DRAFT, false),

  // Tutorial video. Placeholder URL — replace when actual video is ready.
  tutorialVideoUrl: process.env.TUTORIAL_VIDEO_URL || "https://hastkala.example.com/tutorial.mp4",

  // WhatsApp community link for the 7-day seller cohort + certification.
  sellerCommunityLink:
    process.env.SELLER_COMMUNITY_LINK || "https://chat.whatsapp.com/JuHsolulmmEJyB7dOV1Eq1",

  // Default certificate PDF URL sent to sellers on certification.
  // Replace with a real hosted PDF. If empty, a text-based certificate is sent instead.
  defaultCertificatePdfUrl: process.env.CERTIFICATE_PDF_URL || "",

  // OpenAI (Whisper transcription + GPT-5-mini for AI extraction)
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiTranscriptionModel: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-transcribe",
  openaiExtractionModel: process.env.OPENAI_EXTRACTION_MODEL || "gpt-5-mini",

  // Sarvam AI (purpose-built TTS + translation for Indian languages).
  // When set, TTS uses Sarvam Bulbul v3 (best quality for hi/kn/ta/ml/en-IN).
  // Falls back to OpenAI when this is empty.
  sarvamApiKey: process.env.SARVAM_API_KEY || "",

  // Text-to-Speech: every bot reply gets a voice note alongside the text.
  // Disable by setting BOT_TTS_ENABLED=false.
  ttsEnabled: bool(process.env.BOT_TTS_ENABLED, true),
  // Default to gpt-4o-mini-tts (Indic-friendly with explicit language
  // instructions). Use tts-1 only as final fallback.
  ttsModel: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
  ttsVoice: process.env.OPENAI_TTS_VOICE || "nova",
  /** Reply text longer than this is too long to read aloud — skip TTS. */
  ttsMaxChars: num(process.env.BOT_TTS_MAX_CHARS, 600),

  /**
   * Audio model used for INDIC LANGUAGES (Hindi, Tamil, Kannada, Malayalam).
   * This is OpenAI's GPT-4o audio brain on Chat Completions — it understands
   * the language and speaks with native accents, unlike tts-1 which reads
   * characters phonetically. The model translates AND voices in one call.
   *
   * Override with OPENAI_AUDIO_MODEL if needed. The default below uses
   * `gpt-4o-audio-preview` which is GA on OpenAI; the older
   * `gpt-4o-mini-audio-preview` was renamed and is no longer available.
   */
  audioModel: process.env.OPENAI_AUDIO_MODEL || "gpt-4o-audio-preview",
  audioVoice: process.env.OPENAI_AUDIO_VOICE || "shimmer",
} as const;

export type AppConfig = typeof config;
