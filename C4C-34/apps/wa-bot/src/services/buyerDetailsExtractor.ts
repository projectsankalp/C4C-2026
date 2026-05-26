/**
 * Buyer order details extractor.
 *
 * Pulls {name, address, phone} from a free-form natural-language message in
 * any of our supported languages, regardless of punctuation, ordering, or
 * voice-transcription artifacts.
 *
 * Two-stage strategy:
 *   1. Cheap deterministic extraction (regex on phone digits + heuristic
 *      splits). Catches the canonical "Name, Address, Phone" pattern.
 *   2. LLM extraction with a strict JSON schema. Catches voice transcripts
 *      that say "My name is X, my address is Y, phone Z" or sentence forms
 *      in any of en/hi/kn/ta/ml.
 *
 * The LLM call only runs when the cheap path didn't get all three fields,
 * so there's no extra latency on a well-formed text input.
 *
 * NEVER fabricates. Missing fields stay undefined; caller asks for them.
 */
import OpenAI from "openai";
import { config } from "../config";
import { log } from "../utils/logger";

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!config.openaiApiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
}

export interface BuyerDetails {
  name?: string;
  address?: string;
  phone?: string;
}

const PHONE_RE = /(?:(?:\+?91)?[\s-]?)?[6-9]\d{9}/g;

function normalizePhone(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91") && /^91[6-9]/.test(digits)) return digits;
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(1);
  return undefined;
}

/**
 * Cheap regex-only extraction. Returns whatever we can confidently identify.
 * Comma-delimited input "Name, Address, Phone" is the easy case; we also try
 * to peel off a phone if present and split the rest on commas / "and" / period.
 */
function extractWithRegex(text: string): BuyerDetails {
  const facts: BuyerDetails = {};
  const phoneMatch = text.match(PHONE_RE);
  if (phoneMatch && phoneMatch.length > 0) {
    const normalized = normalizePhone(phoneMatch[0]);
    if (normalized) facts.phone = normalized;
  }

  // Strip phone from text so the rest is name+address.
  let rest = text;
  if (phoneMatch) {
    for (const p of phoneMatch) rest = rest.replace(p, " ");
  }
  rest = rest.replace(/\s{2,}/g, " ").trim();

  // Try comma split first
  const commaParts = rest.split(",").map((p) => p.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    facts.name = commaParts[0];
    facts.address = commaParts.slice(1).join(", ");
    return facts;
  }

  // Fallback: Newline split
  const lineParts = rest.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (lineParts.length >= 2) {
    facts.name = lineParts[0];
    facts.address = lineParts.slice(1).join(", ");
    return facts;
  }

  // Last resort: leave name/address for the LLM to pull out.
  return facts;
}

/**
 * LLM extraction using GPT with strict JSON output. Falls back gracefully
 * if no API key is available or the model returns malformed JSON.
 */
async function extractWithLLM(text: string): Promise<BuyerDetails | null> {
  const client = getOpenAI();
  if (!client) return null;

  const systemPrompt = [
    "Extract buyer order details from the user's message.",
    "The message can be in English, Hindi, Kannada, Tamil, or Malayalam,",
    "in any script (Latin / Devanagari / Kannada / Tamil / Malayalam).",
    "Voice transcripts may use periods instead of commas.",
    "",
    "Return STRICT JSON with these keys:",
    '  "name":    person name as a single string, or null if absent',
    '  "address": full delivery address as a single string, or null if absent',
    '  "phone":   10-digit Indian mobile (starts 6-9) or 12-digit "91XXXXXXXXXX", or null',
    "",
    "RULES:",
    "- NEVER fabricate. If a field is unclear, return null.",
    '- "phone" must be only the 10/12 digits. Strip "+", spaces, dashes.',
    '- "address" should preserve all useful tokens (street, locality, city,',
    "  pincode) in their original script. Do not translate.",
    '- "name" is just the human name, not titles or salutations.',
    "Output JSON only. No prose, no markdown, no code fences.",
  ].join("\n");

  try {
    const response = await client.chat.completions.create({
      // gpt-4o-mini: deterministic, no reasoning leakage. We need clean JSON.
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 400,
    });
    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const out: BuyerDetails = {};
    if (typeof parsed.name === "string" && parsed.name.trim()) out.name = parsed.name.trim();
    if (typeof parsed.address === "string" && parsed.address.trim())
      out.address = parsed.address.trim();
    if (typeof parsed.phone === "string") {
      const normalized = normalizePhone(parsed.phone);
      if (normalized) out.phone = normalized;
    }
    return out;
  } catch (error: any) {
    log.warn("BUYER_DETAILS_LLM_FAILED", { message: error?.message });
    return null;
  }
}

/**
 * Main entry. Combines regex + LLM extraction. Returns whatever it can.
 * Caller checks which fields are present and asks the user for what's missing.
 */
export async function extractBuyerDetails(text: string): Promise<BuyerDetails> {
  if (!text || text.trim().length < 3) return {};

  const regex = extractWithRegex(text);
  // If regex got all three, no need to call the LLM.
  if (regex.name && regex.address && regex.phone) {
    log.info("BUYER_DETAILS_VIA_REGEX", {
      hasName: true,
      hasAddress: true,
      hasPhone: true,
    });
    return regex;
  }

  const llm = await extractWithLLM(text);
  if (!llm) {
    return regex;
  }

  // Merge: prefer regex hits (they're literal) for phone and name; merge address
  // text-conservatively (prefer the longer one).
  const merged: BuyerDetails = {
    name: regex.name || llm.name,
    address:
      regex.address && llm.address
        ? regex.address.length >= llm.address.length
          ? regex.address
          : llm.address
        : regex.address || llm.address,
    phone: regex.phone || llm.phone,
  };
  log.info("BUYER_DETAILS_EXTRACTED", {
    hasName: Boolean(merged.name),
    hasAddress: Boolean(merged.address),
    hasPhone: Boolean(merged.phone),
    via: regex.name && regex.phone ? "regex+llm" : "llm",
  });
  return merged;
}
