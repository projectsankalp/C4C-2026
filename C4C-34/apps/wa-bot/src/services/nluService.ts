/**
 * Natural Language Understanding (NLU) service.
 *
 * Maps free-form user input — text or transcribed voice, in any language — to:
 *   - select: a numbered option in the current state
 *   - navigate: a universal command (MENU, BACK, RESET, etc.)
 *   - ask_question: a question about HastKala (route to QA service)
 *   - command: a single-word command (DONE, SKIP, JOIN, etc.)
 *   - unknown: nothing matched
 *
 * Used as a fallback after cheap parsers (number, exact alias) fail. Keeps
 * latency low because we skip the LLM entirely for trivial inputs ("1", "2").
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

// In-memory cache for NLU results. Keyed by (language, stateContext, text).
// Entries expire after 60 seconds.
const nluCache = new Map<string, { ts: number; result: NLUResult }>();
const NLU_CACHE_MAX = 500;

export interface NLUOption {
  /** 1-based menu index */
  index: number;
  label: string;
  aliases?: string[];
}

export interface NLUResult {
  action: "select" | "navigate" | "ask_question" | "command" | "unknown";
  /** When action="select": 1-based option index */
  optionIndex?: number;
  /** When action="navigate" or "command": canonical command keyword */
  navTarget?: NavTarget;
  /** When action="ask_question": the user's underlying question */
  question?: string;
  /** Confidence 0-1 */
  confidence: number;
}

export type NavTarget =
  | "MENU"
  | "BACK"
  | "RESET"
  | "HUMAN"
  | "LANGUAGE"
  | "PROFILE"
  | "HELP"
  | "DONE"
  | "SKIP"
  | "JOIN"
  | "JOINED"
  | "CERTIFIED"
  | "BROWSE"
  | "SEARCH"
  | "STOP"
  | "CANCEL"
  | "BUYER"
  | "SELLER";

interface NLUInput {
  text: string;
  options?: NLUOption[];
  language?: Language;
  /** Brief description of what the user is currently doing. */
  stateContext?: string;
  /** Whether to route question-style messages to Q&A. Default true. */
  allowQA?: boolean;
}

const NAV_TARGETS: NavTarget[] = [
  "MENU",
  "BACK",
  "RESET",
  "HUMAN",
  "LANGUAGE",
  "PROFILE",
  "HELP",
  "DONE",
  "SKIP",
  "JOIN",
  "JOINED",
  "CERTIFIED",
  "BROWSE",
  "SEARCH",
  "STOP",
  "CANCEL",
  "BUYER",
  "SELLER",
];

export async function classifyIntent(input: NLUInput): Promise<NLUResult> {
  const ai = getClient();
  if (!ai) {
    return { action: "unknown", confidence: 0 };
  }

  // Cache: identical input + state context returns the same result for 60s.
  // Significantly cuts API cost when a user repeatedly mistypes or when many
  // users converge on common phrases like "menu" / "back" / "go home".
  const cacheKey = `${input.language || "en"}::${input.stateContext || ""}::${input.text}`;
  const cached = nluCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 60_000) {
    return cached.result;
  }

  const allowQA = input.allowQA !== false;

  const optionsBlock = input.options?.length
    ? input.options
        .map(
          (o) =>
            `${o.index}. ${o.label}${
              o.aliases?.length ? ` (also matches: ${o.aliases.join(", ")})` : ""
            }`,
        )
        .join("\n")
    : "(no specific numbered options at this step)";

  const systemPrompt = `You are an intent classifier for the HastKala WhatsApp bot.

CURRENT STEP: ${input.stateContext || "unknown"}

OPTIONS at this step:
${optionsBlock}

NAVIGATION COMMANDS the user might want:
${NAV_TARGETS.join(", ")}

The user can write/speak in ANY language: English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Malayalam (മലയാളം), or mixed Hinglish/etc.

Return JSON ONLY with this shape:
{
  "action": "select" | "navigate" | "ask_question" | "command" | "unknown",
  "optionIndex": <1-based number when action=select, else null>,
  "navTarget": <one of ${NAV_TARGETS.join("|")} when action=navigate or command, else null>,
  "question": <the user's question text when action=ask_question, else null>,
  "confidence": <0..1, how sure you are>
}

CLASSIFICATION RULES:
- "select" — user is picking one of the listed options. Examples:
    "1" → optionIndex 1
    "english" / "I want english" / "ഇംഗ്ലീഷ്" → English option
    "मुझे hindi चाहिए" / "हिंदी" → Hindi option
    "I am a seller" → Seller option
    "yes, connect me" → Yes option
- "navigate" — user wants to go somewhere or do a meta-action. Examples:
    "go back" / "वापस" / "ಹಿಂದೆ" → BACK
    "main menu" / "menu pe jao" → MENU
    "change language" / "भाषा बदलो" → LANGUAGE
    "talk to human" / "help me real person" → HUMAN
    "reset" / "start over" → RESET
    "switch to buyer" / "I want to buy" / "खरीदार बनो" / "shop mode" → BUYER
    "switch to seller" / "I want to sell" / "विक्रेता बनो" / "back to selling" → SELLER
- "command" — single explicit command. Examples:
    "done" / "finished" / "हो गया" → DONE
    "skip" / "नहीं" → SKIP
    "joined" / "I joined" / "i'm in the community" → JOINED
    "certified" / "I got certificate" → CERTIFIED
    "browse" / "show products" → BROWSE
    "search" → SEARCH
- "ask_question" — user is asking ABOUT the platform, not selecting/navigating. ${
    allowQA
      ? `Examples:
    "what is HastKala?" / "ye kya hai" / "HastKala എന്താണ്"
    "what is community?" / "how does cohort work?"
    "tell me about certificate" / "is this free?"`
      : `(In this state, treat questions as 'unknown' — only options/navigation matter.)`
  }
- "unknown" — none of the above; user typed gibberish or something off-topic.

CONFIDENCE GUIDE:
- 0.9+ exact match (the user clearly meant this)
- 0.75-0.9 strong inference (clear meaning, just paraphrased)
- 0.5-0.75 reasonable guess
- < 0.5 not sure — prefer "unknown"

Return ONLY the JSON object. No prose, no markdown, no code fences.`;

  try {
    const response = await ai.chat.completions.create({
      // gpt-4o-mini for NLU: deterministic structured output, no reasoning
      // tokens to leak. Latency ~400ms vs ~5s for gpt-5-mini.
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.text },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 200,
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) return { action: "unknown", confidence: 0 };

    const parsed = safeParse(raw);
    if (!parsed) return { action: "unknown", confidence: 0 };

    const result: NLUResult = {
      action: validAction(parsed.action),
      optionIndex: typeof parsed.optionIndex === "number" ? parsed.optionIndex : undefined,
      navTarget: validNav(parsed.navTarget),
      question: typeof parsed.question === "string" ? parsed.question : undefined,
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.5,
    };

    // Write through to cache so repeated identical inputs skip the API.
    if (nluCache.size >= NLU_CACHE_MAX) {
      // Cheap eviction: drop the first 100 entries (≈ oldest).
      let dropped = 0;
      for (const k of nluCache.keys()) {
        nluCache.delete(k);
        if (++dropped >= 100) break;
      }
    }
    nluCache.set(cacheKey, { ts: Date.now(), result });

    return result;
  } catch (error: any) {
    log.warn("NLU_FAILED", { message: error?.message });
    return { action: "unknown", confidence: 0 };
  }
}

function safeParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    const stripped = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```\s*$/, "");
    try {
      return JSON.parse(stripped);
    } catch {
      return null;
    }
  }
}

function validAction(a: unknown): NLUResult["action"] {
  if (typeof a !== "string") return "unknown";
  const ok = ["select", "navigate", "ask_question", "command", "unknown"];
  return (ok.includes(a) ? a : "unknown") as NLUResult["action"];
}

function validNav(n: unknown): NavTarget | undefined {
  if (typeof n !== "string") return undefined;
  const upper = n.toUpperCase();
  return NAV_TARGETS.includes(upper as NavTarget) ? (upper as NavTarget) : undefined;
}
