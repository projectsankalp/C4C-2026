/**
 * Text-to-Speech service.
 *
 * Provider strategy (best → fallback):
 *
 *   1. **Sarvam AI Bulbul v3** (when SARVAM_API_KEY is set).
 *      Purpose-built for Indian languages — Hindi, Tamil, Kannada, Malayalam,
 *      English (Indian accent). Best pronunciation, native prosody.
 *
 *   2. **OpenAI gpt-4o-mini-tts** (when OPENAI_API_KEY is set).
 *      Newer multilingual TTS that respects an `instructions` field. We pin
 *      the language explicitly so it can't drift to English on Devanagari /
 *      Malayalam / Tamil text.
 *
 *   3. **OpenAI tts-1** (last resort).
 *      Older, less accurate on Indic languages but always available.
 *
 * Output is OGG/Opus (WhatsApp's native voice-note format) so the message
 * arrives as a real Push-To-Talk bubble, not a generic audio file.
 *
 * Failure mode: returns null. Caller falls back to text-only reply.
 */
import OpenAI from "openai";
import { config } from "../config";
import { log } from "../utils/logger";
import type { Language } from "../types";

let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI | null {
  if (!config.openaiApiKey) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  return openaiClient;
}

export interface TTSResult {
  buffer: Buffer;
  mimetype: string;
}

interface TTSInput {
  text: string;
  language: Language;
}

/**
 * Generate speech for the given text. Returns null if disabled, key missing,
 * text empty, text too long, or all providers fail.
 */
export async function synthesizeSpeech(input: TTSInput): Promise<TTSResult | null> {
  if (!config.ttsEnabled) return null;

  const cleaned = sanitizeForSpeech(input.text);
  if (!cleaned) return null;
  if (cleaned.length > config.ttsMaxChars) {
    log.debug("TTS_SKIP_TOO_LONG", { len: cleaned.length, cap: config.ttsMaxChars });
    return null;
  }

  // 1. Sarvam (best for Indian languages)
  if (config.sarvamApiKey) {
    const sarvam = await synthesizeWithSarvam(cleaned, input.language);
    if (sarvam) return sarvam;
  }

  // 2. OpenAI (gpt-4o-mini-tts with strict language instructions, then tts-1)
  if (config.openaiApiKey) {
    const openai = await synthesizeWithOpenAI(cleaned, input.language);
    if (openai) return openai;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Sarvam AI Bulbul v3
// ---------------------------------------------------------------------------

const SARVAM_LANGUAGE_CODE: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  ml: "ml-IN",
};

/**
 * Per-language voice picks. Sarvam ships male + female voices per lang;
 * we use a friendly female voice everywhere for warmth + consistency.
 * The "anushka" speaker is Bulbul v3's default for most languages.
 */
const SARVAM_SPEAKER: Record<Language, string> = {
  en: "anushka",
  hi: "anushka",
  kn: "anushka",
  ta: "anushka",
  ml: "anushka",
};

async function synthesizeWithSarvam(
  text: string,
  language: Language,
): Promise<TTSResult | null> {
  const started = Date.now();
  try {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": config.sarvamApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        target_language_code: SARVAM_LANGUAGE_CODE[language],
        speaker: SARVAM_SPEAKER[language],
        model: "bulbul:v3",
        // 22.05kHz is sufficient for voice notes and keeps the payload light.
        sample_rate: 22050,
        // Sarvam returns base64 WAV by default. We convert below.
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      log.warn("SARVAM_TTS_HTTP_ERROR", {
        status: response.status,
        bodyPreview: errText.slice(0, 200),
        lang: language,
      });
      return null;
    }

    const data = (await response.json()) as { audios?: string[] };
    const b64 = data?.audios?.[0];
    if (!b64) {
      log.warn("SARVAM_TTS_EMPTY_RESPONSE", { lang: language });
      return null;
    }

    const wavBuffer = Buffer.from(b64, "base64");
    log.info("SARVAM_TTS_SUCCESS", {
      lang: language,
      chars: text.length,
      bytes: wavBuffer.length,
      elapsedMs: Date.now() - started,
    });

    return { buffer: wavBuffer, mimetype: "audio/wav" };
  } catch (error: any) {
    log.warn("SARVAM_TTS_FAILED", { message: error?.message, lang: language });
    return null;
  }
}

// ---------------------------------------------------------------------------
// OpenAI gpt-4o-mini-tts (with strict language pinning) + tts-1 fallback
// ---------------------------------------------------------------------------

async function synthesizeWithOpenAI(
  text: string,
  language: Language,
): Promise<TTSResult | null> {
  const ai = getOpenAIClient();
  if (!ai) return null;

  // Try modern model first if configured
  if (config.ttsModel === "gpt-4o-mini-tts") {
    const result = await callOpenAITTS(ai, text, language, "gpt-4o-mini-tts", true);
    if (result) return result;
  }

  // Fallback to older model
  return callOpenAITTS(ai, text, language, "tts-1", false);
}

async function callOpenAITTS(
  ai: OpenAI,
  text: string,
  language: Language,
  model: string,
  useInstructions: boolean,
): Promise<TTSResult | null> {
  const started = Date.now();
  try {
    const params: any = {
      model,
      voice: config.ttsVoice as any,
      input: text,
      response_format: "opus",
    };

    // gpt-4o-mini-tts accepts an "instructions" field for language pinning.
    // tts-1 ignores it. We pass it always when supported because Indic-script
    // text otherwise gets read in a generic English accent or skipped.
    if (useInstructions) {
      params.instructions = openAIInstructions(language);
    }

    const response = await ai.audio.speech.create(params);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    log.info("OPENAI_TTS_SUCCESS", {
      model,
      lang: language,
      chars: text.length,
      bytes: buffer.length,
      elapsedMs: Date.now() - started,
    });

    return { buffer, mimetype: "audio/ogg; codecs=opus" };
  } catch (error: any) {
    log.warn("OPENAI_TTS_FAILED", { model, message: error?.message, lang: language });
    return null;
  }
}

function openAIInstructions(language: Language): string {
  switch (language) {
    case "hi":
      return "Speak ONLY in Hindi (हिन्दी). Use a warm, friendly North Indian accent at a natural conversational pace. The text is in Devanagari script — read it as Hindi, never as English transliteration. If brand names appear in Latin script (like 'HastKala'), pronounce them as Hindi speakers naturally would.";
    case "kn":
      return "Speak ONLY in Kannada (ಕನ್ನಡ). Use a warm, friendly Karnataka accent at a natural conversational pace. The text is in Kannada script — read it as Kannada, never as English transliteration. Pronounce brand names in Latin script naturally.";
    case "ta":
      return "Speak ONLY in Tamil (தமிழ்). Use a warm, friendly Tamil Nadu accent at a natural conversational pace. The text is in Tamil script — read it as Tamil, never as English transliteration. Pronounce brand names in Latin script naturally. Do NOT mix in Malayalam or any other language.";
    case "ml":
      return "Speak ONLY in Malayalam (മലയാളം). Use a warm, friendly Kerala accent at a natural conversational pace. The text is in Malayalam script — read it as Malayalam, never as English transliteration. Pronounce brand names in Latin script naturally. Do NOT mix in Tamil or any other language.";
    case "en":
    default:
      return "Speak in a warm, friendly Indian-English voice at a natural conversational pace.";
  }
}

// ---------------------------------------------------------------------------
// Pre-processing — clean text for spoken delivery
// ---------------------------------------------------------------------------

function sanitizeForSpeech(text: string): string {
  if (!text) return "";

  let out = text;

  // Drop emojis (covers most BMP + supplementary planes)
  out = out.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2700}-\u{27BF}\u{FE0F}]/gu,
    "",
  );

  // URLs → "link"
  out = out.replace(/https?:\/\/\S+/g, "link");

  // Markdown emphasis
  out = out.replace(/[*_`~]+/g, "");

  // Bullet points / arrows
  out = out.replace(/[—–•]/g, "-");

  // Collapse 3+ newlines (looks like spacing in WhatsApp) into a sentence pause
  out = out.replace(/\n{2,}/g, ". ");
  out = out.replace(/\n/g, ", ");

  // Multiple spaces
  out = out.replace(/\s{2,}/g, " ");

  return out.trim();
}
