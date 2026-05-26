/**
 * Text parsing helpers.
 *
 * The engine uses these to:
 *   - normalize incoming WhatsApp text consistently
 *   - detect universal commands (MENU, BACK, HELP, etc.) regardless of language
 *   - parse numbered menu choices
 *   - extract price/quantity hints before we even ask the AI
 *
 * Universal commands are recognized in English, Hindi, and Kannada so users
 * can always escape a flow no matter what language they're chatting in.
 */

export function normalizeText(input: string | undefined | null): string {
  return (input || "").trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Greeting / start triggers
// ---------------------------------------------------------------------------

const START_TRIGGERS = new Set([
  // English
  "hi",
  "hello",
  "hey",
  "namaste",
  "start",
  "begin",
  "hi!",
  "hello!",
  // Hindi
  "नमस्ते",
  "नमस्कार",
  "हेलो",
  "हाय",
  // Kannada
  "ನಮಸ್ಕಾರ",
  "ನಮಸ್ತೆ",
  "ಹಲೋ",
  // Tamil
  "வணக்கம்",
  "ஹலோ",
  // Malayalam
  "നമസ്കാരം",
  "ഹലോ",
]);

export function isStartCommand(text: string): boolean {
  const t = normalizeText(text);
  if (!t) return false;
  if (START_TRIGGERS.has(t)) return true;
  // Phrase forms
  return /^(hi|hello|hey)[\s,!.]*/.test(t) || t === "namaste";
}

// ---------------------------------------------------------------------------
// Universal commands (work in any state, any language)
// ---------------------------------------------------------------------------

export function isResetCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "reset",
    "restart",
    "start over",
    "start again",
    "start from scratch",
    "fresh start",
    "new start",
    "new user",
    "clear session",
    "रीसेट",
    "फिर शुरू",
    "नई शुरुआत",
    "शुरू से",
    "ರೀಸೆಟ್",
    "ಪುನಃ ಪ್ರಾರಂಭ",
    "ಹೊಸದಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
  ].includes(t);
}

export function isCancelCommand(text: string): boolean {
  const t = normalizeText(text);
  return ["cancel", "stop", "रद्द", "बंद", "ರದ್ದು", "ನಿಲ್ಲಿಸಿ"].includes(t);
}

export function isMenuCommand(text: string): boolean {
  const t = normalizeText(text);
  return ["menu", "main menu", "मेनू", "मुख्य मेनू", "ಮೆನು", "ಮುಖ್ಯ ಮೆನು", "தீன்", "மெனு"].includes(
    t,
  );
}

export function isBackCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "back",
    "go back",
    "previous",
    "go to previous",
    "back to previous",
    "पीछे",
    "वापस",
    "पिछला",
    "ಹಿಂದೆ",
    "ಹಿಂದಿರುಗಿ",
    "ಮುಂಚಿನ",
    // Malayalam / Tamil
    "പിന്നോട്ട്",
    "മുമ്പത്തെ",
    "முந்தைய",
  ].includes(t);
}

/**
 * "Undo" — same effect as BACK but using natural language phrasing.
 * Matches: undo, change previous (message), redo previous, etc.
 */
export function isUndoCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "undo",
    "change previous",
    "change previous message",
    "edit previous",
    "edit previous message",
    "redo",
    "redo previous",
    "reverse",
    "रद्द करो",
    "वापस लो",
    "पिछला बदलो",
    "ಪೂರ್ವ ಬದಲಿಸಿ",
    "ಹಿಂದಿನ ಬದಲಿಸಿ",
    "മാറ്റുക",
  ].includes(t);
}

/**
 * Parse a "change language to X" / "use X" / "speak X" command in any
 * language. Returns a language code if matched, null otherwise.
 *
 * Supported targets: en, hi, kn, ta, ml.
 *
 * Matching rules (strict — used to be substring-based and over-fired):
 *
 *   1. EXPLICIT-TRIGGER MATCH:
 *        Text contains a trigger phrase ("change language to", "speak in",
 *        "ಭಾಷೆ ಬದಲಿಸಿ", etc.) AND a language alias as a whole word.
 *        e.g. "change to malayalam" → ml
 *             "speak in hindi" → hi
 *
 *   2. WHOLE-MESSAGE MATCH:
 *        The entire trimmed message is a language name (1-2 words max).
 *        e.g. "Malayalam" → ml, "हिन्दी" → hi
 *        We require the full text to equal an alias to avoid matching
 *        cities like "Bengaluru" (used to match "eng") or place names
 *        like "Tamil Nadu" (used to match "tamil").
 *
 * Anything else returns null. Cities, names, and free-text answers no
 * longer accidentally trigger language switches.
 */
export function parseChangeLanguageCommand(
  text: string,
): "en" | "hi" | "kn" | "ta" | "ml" | null {
  const t = normalizeText(text);
  if (!t) return null;

  // Map of language aliases → code. Only FULL language names — no partial
  // forms like "eng" or "kannad" that used to over-match.
  const langAliases: Array<[string, "en" | "hi" | "kn" | "ta" | "ml"]> = [
    // English
    ["english", "en"], ["इंग्लिश", "en"], ["अंग्रेजी", "en"],
    ["ಇಂಗ್ಲಿಷ್", "en"], ["ஆங்கிலம்", "en"], ["ഇംഗ്ലീഷ്", "en"],
    // Hindi
    ["hindi", "hi"], ["हिन्दी", "hi"], ["हिंदी", "hi"], ["हिन्दि", "hi"],
    ["ಹಿಂದಿ", "hi"],
    // Kannada
    ["kannada", "kn"], ["ಕನ್ನಡ", "kn"], ["कन्नड़", "kn"], ["കന്നഡ", "kn"],
    // Tamil
    ["tamil", "ta"], ["தமிழ்", "ta"], ["तमिल", "ta"], ["ತಮಿಳು", "ta"], ["തമിഴ്", "ta"],
    // Malayalam
    ["malayalam", "ml"], ["മലയാളം", "ml"],
    ["मलयालम", "ml"], ["ಮಲಯಾಳಂ", "ml"], ["மலையாளம்", "ml"],
  ];

  // Triggers that announce a language switch intent. We only do
  // substring-style matching when one of these explicitly appears.
  const triggers = [
    "change language to",
    "switch language to",
    "set language to",
    "switch to",
    "change to",
    "language to",
    "speak in",
    "talk in",
    "reply in",
    "use",
    "speak",
    "भाषा बदलो", "भाषा बदलें", "में बात", "में बोलो", "में जवाब",
    "ಭಾಷೆ ಬದಲಿಸಿ", "ಭಾಷೆಯನ್ನು ಬದಲಿಸಿ",
    "ഭാഷ മാറ്റുക", "மொழி மாற்று",
  ];

  const hasTrigger = triggers.some((trig) => t.includes(trig));

  // Helper: alias as a whole-word in the text.
  function aliasInText(alias: string): boolean {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u");
    return re.test(t);
  }

  // 1. Explicit trigger match: trigger phrase + language alias as whole word.
  if (hasTrigger) {
    for (const [alias, code] of langAliases) {
      if (aliasInText(alias)) return code;
    }
  }

  // 2. Whole-message match: the entire trimmed text equals an alias.
  for (const [alias, code] of langAliases) {
    if (alias === t) return code;
  }

  return null;
}

export function isHelpCommand(text: string): boolean {
  const t = normalizeText(text);
  return ["help", "?", "मदद", "ಸಹಾಯ"].includes(t);
}

export function isLanguageCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "language",
    "change language",
    "lang",
    "भाषा",
    "भाषा बदलें",
    "ಭಾಷೆ",
    "ಭಾಷೆ ಬದಲಿಸಿ",
  ].includes(t);
}

/**
 * "VOICE" / "MODE" — re-pick how replies are delivered (text/voice/both).
 */
export function isVoicePrefCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "voice",
    "voice mode",
    "reply mode",
    "mode",
    "change voice",
    "change voice mode",
    "change mode",
    "change reply",
    "audio mode",
    "आवाज़",
    "वॉइस",
    "वॉइस मोड",
    "मोड",
    "ಧ್ವನಿ",
    "ಧ್ವನಿ ಮೋಡ್",
    "ಮೋಡ್",
    "வாய்ஸ்",
    "ശബ്ദം",
    "മോഡ്",
  ].includes(t);
}

export function isHumanCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "human",
    "support",
    "agent",
    "sakhi",
    "मदद चाहिए",
    "सहायक",
    "इंसान",
    "ಸಹಾಯಕ",
    "ಮನುಷ್ಯ",
  ].includes(t);
}

export function isStatusCommand(text: string): boolean {
  return normalizeText(text) === "status";
}

export function isProfileCommand(text: string): boolean {
  const t = normalizeText(text);
  return ["profile", "my profile", "प्रोफ़ाइल", "ಪ್ರೊಫೈಲ್"].includes(t);
}

export function isStopRequestsCommand(text: string): boolean {
  const t = normalizeText(text);
  return ["stop requests", "stop alerts", "mute requests"].includes(t);
}

/**
 * EXIT / QUIT — gracefully leave the conversation.
 *
 * Different from RESET (which clears the whole session): EXIT keeps the
 * user's profile, language, role, etc. intact. Saying HI / HELLO / NAMASTE
 * later brings them straight back to their main menu.
 *
 * Recognized in English, Hindi, Kannada, Tamil, Malayalam.
 */
export function isExitCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    // English
    "exit", "quit", "bye", "goodbye", "good bye", "see you", "see ya",
    "later", "talk later", "ttyl", "tata", "good night", "gn",
    // Hindi
    "अलविदा", "नमस्कार", "बाद में बात", "बंद करो", "बंद",
    // Kannada
    "ವಿದಾಯ", "ಬಿಡಿ", "ನಂತರ ಮಾತನಾಡೋಣ", "ಬಂದ್ ಮಾಡಿ", "ಬಂದ್",
    // Tamil
    "வெளியேறு", "பிறகு பேசுவோம்", "தாதா", "வணக்கம்",
    // Malayalam
    "പുറത്തുകടക്കുക", "പിന്നീട് സംസാരിക്കാം", "നമസ്കാരം",
  ].includes(t);
}

/**
 * "BUYER" — switch active role to buyer.
 * Matches keywords in English, Hindi, Kannada plus common phrasings.
 */
export function isBuyerSwitchCommand(text: string): boolean {
  const t = normalizeText(text);
  const exact = [
    "buyer",
    "shop",
    "shopping",
    "buy",
    "buy mode",
    "buyer mode",
    "switch to buyer",
    "change to buyer",
    "go shopping",
    "i want to buy",
    "खरीदार",
    "खरीदार बनो",
    "खरीदार मोड",
    "ಖರೀದಿದಾರ",
    "ಖರೀದಿಸಲು",
    "வாங்க",
    "വാങ്ങാൻ",
  ];
  return exact.includes(t);
}

/**
 * "SELLER" — switch back to seller mode.
 */
export function isSellerSwitchCommand(text: string): boolean {
  const t = normalizeText(text);
  const exact = [
    "seller",
    "sell",
    "sell mode",
    "seller mode",
    "switch to seller",
    "change to seller",
    "go back to seller",
    "i want to sell",
    "विक्रेता",
    "विक्रेता बनो",
    "बेचना",
    "ಮಾರಾಟಗಾರ",
    "ಮಾರಲು",
    "விற்க",
    "വിൽക്കാൻ",
  ];
  return exact.includes(t);
}

export function isDoneCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "0", "done", "finished", "ok", "okay", "that's it", "bas", "ho gaya",
    // Hindi
    "हो गया", "बस", "ठीक है", "पूरा हो गया", "हो गई",
    // Kannada
    "ಮುಗಿದಿದೆ", "ಆಯ್ತು", "ಸಾಕು", "ಮುಗಿಯಿತು",
    // Tamil
    "முடிந்தது", "போதும்",
    // Malayalam
    "കഴിഞ്ഞു", "മതി",
  ].includes(t);
}

export function isSkipCommand(text: string): boolean {
  const t = normalizeText(text);
  return [
    "skip", "no", "nahi", "no thanks",
    // Hindi
    "स्किप", "नहीं", "नहीं चाहिए", "छोड़ दो",
    // Kannada
    "ಬಿಟ್ಟುಬಿಡಿ", "ಇಲ್ಲ", "ಬೇಡ",
  ].includes(t);
}

// ---------------------------------------------------------------------------
// Menu choice parsing
// ---------------------------------------------------------------------------

/**
 * Parse a numbered menu choice. Returns the integer if the input is a single
 * digit/number within `[1, max]`, else null.
 */
export function parseMenuChoice(text: string, max: number): number | null {
  const cleaned = normalizeText(text);
  if (!cleaned) return null;
  const match = cleaned.match(/^([1-9]\d?)$/);
  if (!match) return null;
  const n = Number(match[1]);
  return n >= 1 && n <= max ? n : null;
}

/**
 * Match a free-text reply against a list of option words/aliases.
 * Returns the 1-based index, or null if no alias matched.
 *
 * Matching rules (in priority order):
 *   1. For NUMERIC aliases: the user text must equal the digit exactly
 *      (after trimming). "-1" / "11" / "1." / "1abc" are all rejected.
 *      Reason: substring matching here was the source of subtle bugs.
 *   2. For TEXT aliases: exact match OR word-boundary match — the alias
 *      appears as a complete word/phrase in the user text, surrounded by
 *      start/end or whitespace/punctuation.
 *
 * We deliberately do NOT use plain substring (.includes), because that
 * caused subtle bugs ("1" matched "-1", "11", "21").
 *
 * @example
 *   matchOption("add product", [["add", "add product", "new"], ["my products"]])
 *   //=> 1
 *   matchOption("11", [["1", "add"], ["2", "list"]])
 *   //=> null  (used to wrongly return 1)
 */
export function matchOption(text: string, aliases: string[][]): number | null {
  const t = normalizeText(text);
  if (!t) return null;
  for (let i = 0; i < aliases.length; i++) {
    for (const raw of aliases[i]) {
      const alias = raw.toLowerCase();
      // Pure-digit alias: only an exact whole-string digit match counts.
      // This is the primary fix — without it, "-1" matched "1".
      if (/^\d+$/.test(alias)) {
        if (alias === t) return i + 1;
        continue;
      }
      // Text alias: exact match always wins.
      if (alias === t) return i + 1;
      // Otherwise require word-boundary match. We escape regex specials in
      // alias to keep this safe with multi-word aliases like "add product".
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u");
      if (re.test(t)) return i + 1;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Yes / No
// ---------------------------------------------------------------------------

export function isYes(text: string): boolean {
  const t = normalizeText(text);
  return [
    "1",
    "yes",
    "y",
    "ok",
    "okay",
    "haan",
    "ha",
    "हाँ",
    "हां",
    "जी हां",
    "ಹೌದು",
    "ಸರಿ",
  ].includes(t);
}

export function isNo(text: string): boolean {
  const t = normalizeText(text);
  return ["2", "no", "n", "nope", "nahi", "नहीं", "ना", "ಇಲ್ಲ", "ಬೇಡ"].includes(t);
}

// ---------------------------------------------------------------------------
// Slot extraction
// ---------------------------------------------------------------------------

export function extractPrice(text: string): number | null {
  if (!text) return null;
  const patterns: RegExp[] = [
    /₹\s?(\d{2,6})/i,
    /rs\.?\s?(\d{2,6})/i,
    /rupees?\s?(\d{2,6})/i,
    /(\d{2,6})\s?rupees?/i,
    /(\d{2,6})\s?inr/i,
    /(\d{2,6})\s?₹/i,
    // Hindi "रुपये"
    /(\d{2,6})\s?रुपये?/i,
    // Generic standalone (last resort)
    /\b(\d{2,5})\b/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

export function extractQuantity(text: string): number | null {
  if (!text) return null;
  const patterns: RegExp[] = [
    /(\d+)\s*(pieces|piece|pcs|pc|units|unit|nos|no\.?|items|item)/i,
    /quantity\s*[:-]?\s*(\d+)/i,
    /qty\s*[:-]?\s*(\d+)/i,
    /(\d+)\s*available/i,
    /(\d+)\s*in\s*stock/i,
    // Hindi
    /(\d+)\s*(पीस|टुकड़े|टुकड़ा)/i,
    // Kannada
    /(\d+)\s*(ತುಂಡು|ತುಂಡುಗಳು)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

/**
 * Parse a bare integer reply (used for stock updates, quantity prompts).
 */
export function parseInteger(text: string): number | null {
  const t = normalizeText(text);
  const m = t.match(/^(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Parse a price reply: "600", "₹600", "rs 600", "600 rupees".
 */
export function parsePriceReply(text: string): number | null {
  return extractPrice(text);
}

// ---------------------------------------------------------------------------
// Language hint detection (used as a fallback when user hasn't picked one)
// ---------------------------------------------------------------------------

export function detectLanguageHint(text: string): "en" | "hi" | "kn" | "ta" | "ml" {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  return "en";
}
