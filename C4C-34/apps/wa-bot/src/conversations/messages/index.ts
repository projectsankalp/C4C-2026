/**
 * Message registry — pick the right language pack for a session.
 *
 * Languages with a hand-translated message pack:
 *   • English (en)
 *   • Hindi (hi)
 *   • Kannada (kn)
 *
 * Languages whose message text is generated at runtime by translationService
 * from the English pack:
 *   • Tamil (ta)
 *   • Malayalam (ml)
 *
 * For ta/ml, the engine pulls the English copy and runs every reply text
 * through the runtime translator before TTS + send. End users see and hear
 * Tamil/Malayalam transparently.
 *
 * Adding a new fully-translated language is a 3-step job:
 *   1. Create `<lang>.ts` next to en.ts implementing MessageRegistry.
 *   2. Add it to the LANG_PACKS map below.
 *   3. Remove the language code from translationService's
 *      NEEDS_RUNTIME_TRANSLATION set so the cache stops doing extra work.
 */
import { en } from "./en";
import { hi } from "./hi";
import { kn } from "./kn";
import type { LanguageMeta, MessageRegistry } from "./types";
import type { Language } from "../../types";

// ta / ml read English copy at the registry level. The conversation engine
// then runs the resulting text through translationService before sending.
const LANG_PACKS: Record<Language, MessageRegistry> = {
  en,
  hi,
  kn,
  ta: en,
  ml: en,
};

export const LANGUAGE_META: LanguageMeta[] = [
  { code: "en", englishName: "English", nativeName: "English", complete: true },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", complete: true },
  { code: "kn", englishName: "Kannada", nativeName: "ಕನ್ನಡ", complete: true },
  // Both Tamil and Malayalam are now fully usable via runtime translation.
  { code: "ta", englishName: "Tamil", nativeName: "தமிழ்", complete: true },
  { code: "ml", englishName: "Malayalam", nativeName: "മലയാളം", complete: true },
];

export function getMessages(language: Language | undefined): MessageRegistry {
  return LANG_PACKS[language ?? "en"] ?? en;
}

export function getLanguageMeta(language: Language): LanguageMeta {
  return LANGUAGE_META.find((m) => m.code === language) || LANGUAGE_META[0];
}

/**
 * Map a user's number-or-name reply to a Language code.
 * Returns null when the input doesn't match any language.
 *
 * Accepted forms:
 *   - Numeric "1".."5"
 *   - Full English name ("English", "Hindi", "Kannada", "Tamil", "Malayalam")
 *   - Full native name ("हिन्दी", "ಕನ್ನಡ", "தமிழ்", "മലയാളം")
 *
 * Intentionally NOT accepted (these used to silently switch language):
 *   - Bare 2-letter codes like "hi", "en", "ml" — too easily mistaken for
 *     greetings ("hi", "hello"). User must explicitly pick a number or name.
 */
export function parseLanguageChoice(input: string): Language | null {
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return null;

  // Strict numeric: only digits, optionally with a trailing period (e.g. "1.")
  if (/^[1-9]\.?$/.test(cleaned)) {
    const num = Number(cleaned.replace(".", ""));
    if (num >= 1 && num <= LANGUAGE_META.length) {
      return LANGUAGE_META[num - 1].code;
    }
  }

  // Full name match (English or native name). 2-letter codes deliberately
  // excluded — see jsdoc above.
  const found = LANGUAGE_META.find(
    (m) =>
      m.englishName.toLowerCase() === cleaned ||
      m.nativeName.toLowerCase() === cleaned,
  );
  return found?.code ?? null;
}

/** Used to prepend an English helper note when copy isn't translated yet. */
export function isCompleteLanguage(language: Language): boolean {
  return getLanguageMeta(language).complete;
}
