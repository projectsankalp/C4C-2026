/**
 * Runtime translation service for languages whose message packs are not yet
 * fully translated (currently Tamil and Malayalam).
 *
 * Strategy:
 *   - Languages with a hand-translated pack (en, hi, kn) skip this entirely.
 *   - For ta/ml, every outbound reply text passes through a translation
 *     step BEFORE WhatsApp send AND before TTS synthesis. This guarantees:
 *         * the text bubble is in the user's chosen language
 *         * the voice note matches the text (since TTS reads translated text)
 *   - Sarvam AI translate (purpose-built for Indian languages) is preferred
 *     when SARVAM_API_KEY is set. Falls back to OpenAI gpt-5-mini.
 *   - Output is validated: it must contain >= 50% characters in the target
 *     script (rejects English passthrough or cross-script contamination like
 *     Tamil leaking into Malayalam output). On validation failure we retry
 *     once with a stronger prompt; second failure returns source.
 *   - Results cached in-memory keyed by (sourceText, targetLang).
 *
 * The translator is instructed to PRESERVE WhatsApp markdown, emojis, menu
 * numbers, URLs, brand names, and command keywords (MENU, BACK, BUYER, etc.)
 * since the engine uses them for option parsing.
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

/**
 * Languages whose message packs are NOT yet hand-translated. These get
 * runtime translation. Add or remove codes as packs are completed.
 */
const NEEDS_RUNTIME_TRANSLATION = new Set<Language>(["ta", "ml"]);

/** In-memory translation cache. Keyed by `${lang}::${text}`. */
const cache = new Map<string, string>();

/** Soft cap so we don't grow the cache forever in long-running supervisor. */
const MAX_CACHE = 4_000;

interface TranslateOptions {
  /**
   * Target language code. If not in NEEDS_RUNTIME_TRANSLATION, the original
   * text is returned untouched.
   */
  targetLanguage: Language;
}

/**
 * Translate `text` to the user's language IF needed. Returns the original
 * text when no translation is required (already in target language) or when
 * translation fails.
 *
 * Optimised: short-circuits on no-op and uses an in-memory cache.
 */
export async function translateForUser(
  text: string,
  opts: TranslateOptions,
): Promise<string> {
  const trimmed = (text || "").trim();
  if (!trimmed) return text;
  if (!NEEDS_RUNTIME_TRANSLATION.has(opts.targetLanguage)) return text;

  const cacheKey = `${opts.targetLanguage}::${trimmed}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Already in the target script? Skip the API call.
  if (alreadyInScript(trimmed, opts.targetLanguage, 0.3)) {
    rememberInCache(cacheKey, trimmed);
    return trimmed;
  }

  // 1. Try Sarvam (Indian-language-native). It does cleaner script-pure output.
  if (config.sarvamApiKey) {
    const sarvam = await translateWithSarvam(trimmed, opts.targetLanguage);
    if (sarvam && validateScript(sarvam, opts.targetLanguage)) {
      rememberInCache(cacheKey, sarvam);
      return sarvam;
    }
  }

  // 2. Fall back to OpenAI with strict script validation + one retry.
  const ai = getClient();
  if (!ai) return trimmed;

  const first = await translateWithOpenAI(ai, trimmed, opts.targetLanguage, 1);
  if (first && validateScript(first, opts.targetLanguage)) {
    rememberInCache(cacheKey, first);
    return first;
  }

  // Retry once with a sharper prompt that explicitly calls out the failure
  log.warn("TRANSLATE_RETRY_AFTER_SCRIPT_FAILURE", {
    lang: opts.targetLanguage,
    firstAttemptPreview: (first || "").slice(0, 80),
  });
  const second = await translateWithOpenAI(ai, trimmed, opts.targetLanguage, 2);
  if (second && validateScript(second, opts.targetLanguage)) {
    rememberInCache(cacheKey, second);
    return second;
  }

  log.warn("TRANSLATE_GAVE_UP_USING_SOURCE", { lang: opts.targetLanguage });
  return trimmed;
}

// ---------------------------------------------------------------------------
// OpenAI translation
// ---------------------------------------------------------------------------

async function translateWithOpenAI(
  ai: OpenAI,
  text: string,
  language: Language,
  attempt: number,
): Promise<string | null> {
  const langSpec = languageSpec(language);
  const started = Date.now();

  const reinforcement =
    attempt === 1
      ? ""
      : `

CRITICAL: A previous attempt produced text in the WRONG script (mixed languages or English). DO NOT make that mistake. Every word of the translated content must be in ${langSpec.name} using ${langSpec.scriptName} script ONLY. ${langSpec.contrastWarning}`;

  try {
    // Use gpt-4o-mini for translation: deterministic, cheap, no reasoning
    // tokens that leak into output (which is what gpt-5-mini was doing —
    // dumping "WAIT need translate. Must be Malayalam natural." into the
    // user-visible text).
    const response = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a silent translator. Output ONLY the final translated text. Never include English commentary, instructions, your reasoning, the word "translation:", or any meta-text.

TARGET LANGUAGE: ${langSpec.name}
TARGET SCRIPT: ${langSpec.scriptName} (${langSpec.scriptRange})

RULES:
1. Translate every word of the user's text into natural, conversational ${langSpec.name}.
2. Use ONLY ${langSpec.scriptName} script. NEVER mix in any other script (Arabic, Devanagari, Latin, Tamil, etc.) for ${langSpec.name} words.
3. PRESERVE these EXACTLY as in the source — do not translate them, do not transliterate them:
   - Emojis (✅ 🎉 📦 🛒 👤 📍 📞 etc.)
   - WhatsApp markdown markers (*bold*, _italic_)
   - Numbered list markers like "1.", "2.", "3."
   - URLs and email addresses
   - Brand name "HastKala" (keep in Latin)
   - Command keywords in Latin uppercase: MENU, BACK, RESET, BUYER, SELLER, JOIN, JOINED, CERTIFIED, LANGUAGE, HUMAN, DONE, SKIP, PROFILE, EXIT, HI
   - Currency symbol ₹ and numeric digits
   - Phone numbers
4. Use everyday natural phrasing — speak like a local shopkeeper, not a textbook.
5. Output is the translation only. No greeting, no preamble, no explanation. NO English in your output unless it appears verbatim in the source.${reinforcement}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    let out = response.choices?.[0]?.message?.content?.trim() || null;
    if (out) out = stripModelMetaCommentary(out);
    log.info("OPENAI_TRANSLATE_DONE", {
      lang: language,
      attempt,
      sourceLen: text.length,
      outLen: out?.length || 0,
      elapsedMs: Date.now() - started,
    });
    return out;
  } catch (error: any) {
    log.warn("OPENAI_TRANSLATE_FAILED", {
      message: error?.message,
      lang: language,
      attempt,
    });
    return null;
  }
}

/**
 * Some models occasionally bleed their reasoning into the output, e.g.:
 *   "<-- WAIT need translate. Must be Malayalam natural."
 *   "(I'll translate this carefully)"
 *   "Translation: ..."
 * Strip such inline meta-commentary aggressively. We only run this on the
 * full output (not per line) and we never modify lines that look like normal
 * translated content.
 */
function stripModelMetaCommentary(text: string): string {
  let out = text;
  // Remove leading "Translation:" / "Translated:" prefixes.
  out = out.replace(/^\s*(translation|translated)\s*:\s*/i, "");
  // Remove HTML-comment-style notes the model sometimes leaves: "<!-- ... -->"
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  // Remove parenthetical English-only meta notes that contain trigger words.
  // Only strip when the parenthetical is mostly Latin and contains a trigger.
  out = out.replace(
    /\(([^()]{0,200}?)\)/g,
    (match: string, inner: string) => {
      const triggers = /(?:WAIT|TODO|need translate|natural|translation|note:|please|i('|)ll|i (will|cannot|am)|let me)/i;
      const latinRatio = (inner.match(/[a-zA-Z]/g) || []).length / Math.max(1, inner.length);
      if (triggers.test(inner) && latinRatio > 0.5) return "";
      return match;
    },
  );
  // Remove arrow-comment patterns: "<-- something in english -->"
  out = out.replace(/<--[\s\S]*?-->/g, "");
  out = out.replace(/<-{1,3}[^\n]*?(?:WAIT|need translate|natural|TODO)[^\n]*$/gim, "");
  // Collapse triple+ blank lines back to double.
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  return out;
}

// ---------------------------------------------------------------------------
// Sarvam AI translation (preferred for Indian languages)
// ---------------------------------------------------------------------------

const SARVAM_LANGUAGE_CODE: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  ml: "ml-IN",
};

async function translateWithSarvam(
  text: string,
  language: Language,
): Promise<string | null> {
  const started = Date.now();
  try {
    const response = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "api-subscription-key": config.sarvamApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        source_language_code: "auto",
        target_language_code: SARVAM_LANGUAGE_CODE[language],
        speaker_gender: "Female",
        mode: "formal",
        model: "mayura:v1",
        enable_preprocessing: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      log.warn("SARVAM_TRANSLATE_HTTP_ERROR", {
        status: response.status,
        bodyPreview: body.slice(0, 160),
        lang: language,
      });
      return null;
    }

    const data = (await response.json()) as { translated_text?: string };
    const translated = data?.translated_text?.trim();
    if (!translated) return null;

    log.info("SARVAM_TRANSLATE_SUCCESS", {
      lang: language,
      sourceLen: text.length,
      outLen: translated.length,
      elapsedMs: Date.now() - started,
    });
    return translated;
  } catch (error: any) {
    log.warn("SARVAM_TRANSLATE_FAILED", { message: error?.message, lang: language });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Script validation
// ---------------------------------------------------------------------------

interface LanguageSpec {
  name: string;
  scriptName: string;
  scriptRange: string;
  scriptRegex: RegExp;
  contrastWarning: string;
}

function languageSpec(lang: Language): LanguageSpec {
  switch (lang) {
    case "hi":
      return {
        name: "Hindi",
        scriptName: "Devanagari",
        scriptRange: "Unicode U+0900-U+097F",
        scriptRegex: /[\u0900-\u097F]/g,
        contrastWarning: "Devanagari is for Hindi only. Do not use Tamil, Kannada, Malayalam, or Bengali script.",
      };
    case "kn":
      return {
        name: "Kannada",
        scriptName: "Kannada",
        scriptRange: "Unicode U+0C80-U+0CFF",
        scriptRegex: /[\u0C80-\u0CFF]/g,
        contrastWarning: "Kannada script is for Kannada only. Do not use Tamil, Telugu, Hindi, or Malayalam.",
      };
    case "ta":
      return {
        name: "Tamil",
        scriptName: "Tamil",
        scriptRange: "Unicode U+0B80-U+0BFF",
        scriptRegex: /[\u0B80-\u0BFF]/g,
        contrastWarning: "Tamil script is for Tamil only. CRITICAL: do NOT mix Malayalam (മ ന ര ക) characters into Tamil output — Tamil and Malayalam look similar but use different Unicode blocks.",
      };
    case "ml":
      return {
        name: "Malayalam",
        scriptName: "Malayalam",
        scriptRange: "Unicode U+0D00-U+0D7F",
        scriptRegex: /[\u0D00-\u0D7F]/g,
        contrastWarning: "Malayalam script is for Malayalam only. CRITICAL: do NOT mix Tamil (த ம ர க) characters into Malayalam output — they are different Unicode blocks. Use Malayalam letters like മലയാളം, അ, ഇ, ഉ, ക, ച, ത, ന, പ, യ, ര, ല, വ, ശ, ഷ, സ.",
      };
    case "en":
    default:
      return {
        name: "English",
        scriptName: "Latin",
        scriptRange: "Unicode A-Z a-z",
        scriptRegex: /[A-Za-z]/g,
        contrastWarning: "",
      };
  }
}

/**
 * Reject translations whose Indic-script ratio is too low (e.g. mostly
 * English) AND those that are contaminated with another Indic script
 * (e.g. Tamil characters in a Malayalam translation).
 */
function validateScript(text: string, lang: Language): boolean {
  if (lang === "en") return true; // we don't translate to English here
  const spec = languageSpec(lang);
  const targetMatches = (text.match(spec.scriptRegex) || []).length;
  const allLetters = (text.match(/\p{L}/gu) || []).length;
  if (allLetters === 0) return false; // no letters at all

  const targetRatio = targetMatches / allLetters;

  // Detect contamination from sibling Indic scripts. If we're producing
  // Malayalam, any Tamil/Kannada/Hindi letters are bad. Tolerance: 5%.
  const sibling = siblingScripts(lang);
  for (const siblingRe of sibling) {
    const siblingMatches = (text.match(siblingRe) || []).length;
    if (allLetters > 0 && siblingMatches / allLetters > 0.05) {
      log.warn("TRANSLATE_VALIDATION_FAILED_CROSS_SCRIPT", {
        lang,
        siblingMatches,
        allLetters,
        textPreview: text.slice(0, 80),
      });
      return false;
    }
  }

  // Require at least 50% target script (rest can be Latin: numbers, brand,
  // command keywords, URLs).
  const ok = targetRatio >= 0.5;
  if (!ok) {
    log.warn("TRANSLATE_VALIDATION_FAILED_LOW_RATIO", {
      lang,
      targetRatio,
      textPreview: text.slice(0, 80),
    });
  }
  return ok;
}

function siblingScripts(lang: Language): RegExp[] {
  switch (lang) {
    case "hi":
      return [/[\u0B80-\u0BFF]/g, /[\u0C80-\u0CFF]/g, /[\u0D00-\u0D7F]/g];
    case "kn":
      return [/[\u0900-\u097F]/g, /[\u0B80-\u0BFF]/g, /[\u0D00-\u0D7F]/g];
    case "ta":
      // Tamil's biggest contamination risk is Malayalam (visually similar)
      return [/[\u0D00-\u0D7F]/g, /[\u0900-\u097F]/g, /[\u0C80-\u0CFF]/g];
    case "ml":
      // Malayalam's biggest contamination risk is Tamil (visually similar)
      return [/[\u0B80-\u0BFF]/g, /[\u0900-\u097F]/g, /[\u0C80-\u0CFF]/g];
    case "en":
    default:
      return [];
  }
}

/** True if `text` already uses the target script enough to skip API call. */
function alreadyInScript(text: string, lang: Language, threshold: number): boolean {
  const spec = languageSpec(lang);
  const matches = text.match(spec.scriptRegex);
  if (!matches) return false;
  const letters = (text.match(/\p{L}/gu) || []).length;
  if (letters === 0) return false;
  return matches.length / letters >= threshold;
}

function rememberInCache(key: string, value: string): void {
  if (cache.size >= MAX_CACHE) {
    const toDelete = Math.floor(MAX_CACHE / 4);
    let deleted = 0;
    for (const k of cache.keys()) {
      cache.delete(k);
      if (++deleted >= toDelete) break;
    }
  }
  cache.set(key, value);
}
