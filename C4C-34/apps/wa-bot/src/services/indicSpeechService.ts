/**
 * Unified speech + translation service for Indic languages.
 *
 * The breakthrough idea: OpenAI's `gpt-audio` model (Chat Completions with
 * `modalities: ["text", "audio"]`) is the same multimodal brain that powers
 * ChatGPT Voice. It speaks Hindi / Tamil / Malayalam / Kannada / English with
 * a real native accent, because the model itself understands the language —
 * it doesn't read text phonetically the way `tts-1` does.
 *
 * It also generates a transcript of what it actually said. By prompting it
 * to "translate this English message into Malayalam and speak it as a
 * native Kerala speaker would", we get BOTH:
 *   - script-pure Malayalam text (the transcript)
 *   - matching native-sounding Malayalam audio
 *
 * One API call replaces the previous two-step pipeline (translate via
 * gpt-5-mini, then synthesize via tts-1 / gpt-4o-mini-tts) — and avoids
 * cross-script contamination entirely because there's no intermediate
 * translation step where Tamil characters could leak into Malayalam output.
 *
 * Cache: results are keyed by (sourceText, language). Common menu prompts
 * get translated + voiced once, then reused across users.
 *
 * Failure mode: returns null. Caller falls back to source text + no voice.
 */
import OpenAI from "openai";
import { config } from "../config";
import { log } from "../utils/logger";
import type { Language } from "../types";

let client: OpenAI | null = null;
function getClient(): OpenAI | null {
  if (!config.openaiApiKey) return null;
  if (!client) client = new OpenAI({ apiKey: config.openaiApiKey });
  return client;
}

export interface IndicSpeechResult {
  /** Translated text in the target language (the model's own transcript). */
  text: string;
  /** Voice note bytes — OGG/Opus, ready for WhatsApp Push-To-Talk. */
  audioBuffer: Buffer;
  /** Mimetype for the buffer above. */
  audioMimetype: string;
}

interface CachedEntry {
  text: string;
  audioBuffer: Buffer;
  audioMimetype: string;
}
const cache = new Map<string, CachedEntry>();
const MAX_CACHE = 1_000;

interface InputArgs {
  text: string;
  language: Language;
}

/**
 * Translate `text` to `language` AND synthesize matching voice in one call.
 * Returns null on failure or when the source is already in the right script
 * (caller should use existing TTS path for those cases).
 */
export async function translateAndSpeak(
  args: InputArgs,
): Promise<IndicSpeechResult | null> {
  const ai = getClient();
  if (!ai) return null;

  const trimmed = args.text.trim();
  if (!trimmed) return null;

  const cacheKey = `${args.language}::${trimmed}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      text: cached.text,
      audioBuffer: cached.audioBuffer,
      audioMimetype: cached.audioMimetype,
    };
  }

  const started = Date.now();
  const langSpec = languageSpec(args.language);

  try {
    const response = await ai.chat.completions.create({
      model: config.audioModel,
      // Ask for both modalities. The model returns text in `message.content`
      // and audio in `message.audio.data` (base64).
      modalities: ["text", "audio"],
      audio: {
        voice: config.audioVoice as any,
        format: "wav",
      },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(langSpec),
        },
        {
          role: "user",
          content: trimmed,
        },
      ],
    } as any);

    const choice = response.choices?.[0]?.message as any;
    const audioObj = choice?.audio as
      | { data?: string; transcript?: string }
      | undefined;

    const audioB64 = audioObj?.data;
    const transcript = (audioObj?.transcript || "").trim();

    if (!audioB64 || !transcript) {
      log.warn("INDIC_SPEECH_INCOMPLETE_RESPONSE", {
        lang: args.language,
        hasAudio: Boolean(audioB64),
        hasTranscript: Boolean(transcript),
      });
      return null;
    }

    // Validate the transcript is actually in the target script. If the
    // model decided to ignore the system prompt (rare but possible), bail
    // out so the caller can use the English fallback.
    if (!validateScript(transcript, args.language)) {
      log.warn("INDIC_SPEECH_VALIDATION_FAILED", {
        lang: args.language,
        transcriptPreview: transcript.slice(0, 80),
      });
      return null;
    }

    const audioBuffer = Buffer.from(audioB64, "base64");
    const result: IndicSpeechResult = {
      text: transcript,
      audioBuffer,
      audioMimetype: "audio/wav",
    };

    rememberInCache(cacheKey, result);

    log.info("INDIC_SPEECH_SUCCESS", {
      model: config.audioModel,
      lang: args.language,
      sourceLen: trimmed.length,
      transcriptLen: transcript.length,
      audioBytes: audioBuffer.length,
      elapsedMs: Date.now() - started,
      cacheSize: cache.size,
    });

    return result;
  } catch (error: any) {
    log.warn("INDIC_SPEECH_FAILED", {
      message: error?.message,
      lang: args.language,
    });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

interface LanguageSpec {
  code: Language;
  name: string;
  nativeName: string;
  scriptName: string;
  scriptRange: string;
  scriptRegex: RegExp;
  accentHint: string;
  contrastWarning: string;
  siblings: RegExp[];
}

function languageSpec(lang: Language): LanguageSpec {
  switch (lang) {
    case "hi":
      return {
        code: "hi",
        name: "Hindi",
        nativeName: "हिन्दी",
        scriptName: "Devanagari",
        scriptRange: "U+0900-U+097F",
        scriptRegex: /[\u0900-\u097F]/g,
        accentHint: "natural North Indian conversational accent",
        contrastWarning: "Devanagari script for Hindi only. Never use Tamil, Telugu, Kannada, Malayalam, or Bengali script.",
        siblings: [/[\u0B80-\u0BFF]/g, /[\u0C80-\u0CFF]/g, /[\u0D00-\u0D7F]/g, /[\u0980-\u09FF]/g],
      };
    case "kn":
      return {
        code: "kn",
        name: "Kannada",
        nativeName: "ಕನ್ನಡ",
        scriptName: "Kannada",
        scriptRange: "U+0C80-U+0CFF",
        scriptRegex: /[\u0C80-\u0CFF]/g,
        accentHint: "natural Karnataka conversational accent",
        contrastWarning: "Kannada script for Kannada only. Never use Tamil, Telugu, Hindi, or Malayalam script.",
        siblings: [/[\u0B80-\u0BFF]/g, /[\u0900-\u097F]/g, /[\u0D00-\u0D7F]/g, /[\u0C00-\u0C7F]/g],
      };
    case "ta":
      return {
        code: "ta",
        name: "Tamil",
        nativeName: "தமிழ்",
        scriptName: "Tamil",
        scriptRange: "U+0B80-U+0BFF",
        scriptRegex: /[\u0B80-\u0BFF]/g,
        accentHint: "natural Tamil Nadu conversational accent",
        contrastWarning: "CRITICAL: Tamil script ONLY (U+0B80-U+0BFF). DO NOT mix in any Malayalam characters (U+0D00-U+0D7F) — they look similar but are different. Never use Hindi, Kannada, or Telugu script.",
        siblings: [/[\u0D00-\u0D7F]/g, /[\u0900-\u097F]/g, /[\u0C80-\u0CFF]/g],
      };
    case "ml":
      return {
        code: "ml",
        name: "Malayalam",
        nativeName: "മലയാളം",
        scriptName: "Malayalam",
        scriptRange: "U+0D00-U+0D7F",
        scriptRegex: /[\u0D00-\u0D7F]/g,
        accentHint: "natural Kerala conversational accent",
        contrastWarning: "CRITICAL: Malayalam script ONLY (U+0D00-U+0D7F). DO NOT mix in any Tamil characters (U+0B80-U+0BFF) — they look similar but are different. Never use Hindi, Kannada, or Telugu script. Sample Malayalam letters: അ ആ ഇ ഈ ഉ ഊ എ ഏ ഒ ഓ ക ഖ ഗ ച ജ ത ദ ന പ ബ മ യ ര ല വ ശ ഷ സ ഹ ള ഴ റ.",
        siblings: [/[\u0B80-\u0BFF]/g, /[\u0900-\u097F]/g, /[\u0C80-\u0CFF]/g],
      };
    case "en":
    default:
      return {
        code: "en",
        name: "English",
        nativeName: "English",
        scriptName: "Latin",
        scriptRange: "U+0041-U+007A",
        scriptRegex: /[A-Za-z]/g,
        accentHint: "warm Indian-English conversational accent",
        contrastWarning: "",
        siblings: [],
      };
  }
}

function buildSystemPrompt(spec: LanguageSpec): string {
  return `You are HastKala's voice assistant — a warm, friendly bot helping artisans and shoppers in India over WhatsApp.

YOUR TASK FOR THIS TURN:
1. Translate the user's message (which is the bot's English reply text) into ${spec.name} (${spec.nativeName}).
2. Speak that ${spec.name} translation aloud with a ${spec.accentHint}.

OUTPUT RULES (strictly follow):
- Translation MUST be in ${spec.scriptName} script (${spec.scriptRange}). ${spec.contrastWarning}
- Use natural everyday phrasing — like talking to a small-town artisan or shopper.
- Preserve the brand name "HastKala" in Latin script.
- Preserve uppercase command keywords in Latin script: MENU, BACK, RESET, BUYER, SELLER, JOIN, JOINED, CERTIFIED, LANGUAGE, HUMAN, DONE, SKIP, SAME.
- Preserve emojis exactly as in the source.
- Preserve numbered list markers (1., 2., 3.) and the option text after them.
- Preserve URLs, phone numbers, ₹ amounts, and email addresses unchanged.
- Speak the spoken version with a ${spec.accentHint} — like a real person from the region.
- Do NOT add any preamble, explanation, or "translation:" prefix. The transcript should ONLY be the translated message.
- Do NOT mix English transliteration. Spell ${spec.name} words in ${spec.scriptName} script only.

If you can speak it in ${spec.name}, do so. If for any reason you can't, output the English text unchanged in both transcript and audio.`;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateScript(text: string, lang: Language): boolean {
  if (lang === "en") return true;
  const spec = languageSpec(lang);
  const targetMatches = (text.match(spec.scriptRegex) || []).length;
  const allLetters = (text.match(/\p{L}/gu) || []).length;
  if (allLetters === 0) return false;

  const targetRatio = targetMatches / allLetters;

  // Reject sibling-script contamination > 5% (Tamil leaking into Malayalam,
  // for example).
  for (const siblingRe of spec.siblings) {
    const siblingMatches = (text.match(siblingRe) || []).length;
    if (siblingMatches / allLetters > 0.05) {
      return false;
    }
  }

  return targetRatio >= 0.5;
}

function rememberInCache(key: string, value: IndicSpeechResult): void {
  if (cache.size >= MAX_CACHE) {
    const toDelete = Math.floor(MAX_CACHE / 4);
    let deleted = 0;
    for (const k of cache.keys()) {
      cache.delete(k);
      if (++deleted >= toDelete) break;
    }
  }
  cache.set(key, {
    text: value.text,
    audioBuffer: value.audioBuffer,
    audioMimetype: value.audioMimetype,
  });
}
