/**
 * Local fact extraction.
 *
 * Lives in the bot (not the backend) for two reasons:
 *   1. We want to know what's missing BEFORE making a backend round-trip,
 *      so the bot can ask follow-up questions.
 *   2. Fail-safe: even with no AI key, regex extraction tells us what we have.
 *
 * Strict rule: NEVER fabricate. Anything we didn't see in the message is null.
 *
 * The backend's CraftGenie still does the polished description + tags, but
 * only AFTER the user confirms these extracted facts. That separation is the
 * key architectural change vs. the old "one-shot generation" model that
 * caused the hallucinations.
 */
import OpenAI from "openai";
import { config } from "../config";
import { log } from "../utils/logger";
import { extractPrice, extractQuantity } from "../utils/text";
import type { ExtractedFacts, Language } from "../types";

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!config.openaiApiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
}

const ALLOWED_CATEGORIES = [
  "Home Decor",
  "Textiles",
  "Jewellery",
  "Bags & Accessories",
  "Kitchen & Dining",
  "Eco-friendly Crafts",
  "Festive Items",
  "Pottery",
  "Toys",
  "Food Products",
  "Handmade Crafts",
];

interface ExtractInput {
  message: string;
  language?: Language;
  district?: string;
  craftType?: string;
}

export async function extractFacts(input: ExtractInput): Promise<ExtractedFacts> {
  const regexFacts = extractWithRegex(input.message);

  // Try AI for richer extraction (title, material, category) if we have a key.
  const client = getOpenAI();
  if (!client) {
    return regexFacts;
  }

  try {
    const aiFacts = await extractWithLLM(client, input);
    // Merge: regex price/qty are sacrosanct (the artisan literally said them).
    return {
      title: aiFacts.title ?? regexFacts.title,
      price: regexFacts.price ?? aiFacts.price,
      quantity: regexFacts.quantity ?? aiFacts.quantity,
      material: aiFacts.material ?? regexFacts.material,
      category: aiFacts.category ?? regexFacts.category,
      confidence: {
        title: aiFacts.confidence.title,
        price: regexFacts.price !== null ? 1 : aiFacts.confidence.price,
        quantity: regexFacts.quantity !== null ? 1 : aiFacts.confidence.quantity,
        material: aiFacts.confidence.material,
        category: aiFacts.confidence.category,
      },
    };
  } catch (error: any) {
    log.warn("EXTRACT_AI_FAILED_FALLING_BACK_TO_REGEX", { message: error?.message });
    return regexFacts;
  }
}

// ---------------------------------------------------------------------------
// Regex-only extraction (always works)
// ---------------------------------------------------------------------------

function extractWithRegex(message: string): ExtractedFacts {
  const price = extractPrice(message);
  const quantity = extractQuantity(message);
  const title = guessTitleFromKeywords(message);
  const material = guessMaterialFromKeywords(message);
  const category = title.category;

  return {
    title: title.title,
    price,
    quantity,
    material,
    category,
    confidence: {
      title: title.title ? 0.6 : 0,
      price: price !== null ? 1 : 0,
      quantity: quantity !== null ? 1 : 0,
      material: material ? 0.5 : 0,
      category: category ? 0.5 : 0,
    },
  };
}

interface KeywordMatch {
  title: string | null;
  category: string | null;
}

function guessTitleFromKeywords(message: string): KeywordMatch {
  const lower = message.toLowerCase();

  const map: Array<{ kws: string[]; title: string; category: string }> = [
    {
      kws: ["lamp", "deepa", "ದೀಪ", "दीपा", "diya"],
      title: "Coconut Shell Lamp",
      category: "Home Decor",
    },
    { kws: ["basket", "ಬುಟ್ಟಿ"], title: "Handwoven Basket", category: "Home Decor" },
    {
      kws: ["bag", "tote", "purse", "ಚೀಲ", "बैग"],
      title: "Handmade Bag",
      category: "Bags & Accessories",
    },
    {
      kws: ["saree", "dupatta", "kurti", "ಸೀರೆ", "साड़ी"],
      title: "Handwoven Textile",
      category: "Textiles",
    },
    {
      kws: ["necklace", "earring", "jewel", "जेवर", "ಆಭರಣ"],
      title: "Handmade Jewellery",
      category: "Jewellery",
    },
    {
      kws: ["pot", "pottery", "terracotta", "ಮಣ್ಣಿನ"],
      title: "Terracotta Pottery",
      category: "Pottery",
    },
    {
      kws: ["idli", "idly", "snack", "sweets", "laddu", "ladoo"],
      title: "Handmade Food Item",
      category: "Food Products",
    },
    { kws: ["wall hanging", "decor"], title: "Handmade Wall Hanging", category: "Home Decor" },
  ];

  for (const entry of map) {
    if (entry.kws.some((k) => lower.includes(k))) {
      return { title: entry.title, category: entry.category };
    }
  }
  return { title: null, category: null };
}

function guessMaterialFromKeywords(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("coconut shell")) return "Coconut shell";
  if (lower.includes("bamboo")) return "Bamboo";
  if (lower.includes("jute")) return "Jute";
  if (lower.includes("cotton")) return "Cotton";
  if (lower.includes("silk")) return "Silk";
  if (lower.includes("clay") || lower.includes("terracotta")) return "Terracotta clay";
  if (lower.includes("brass")) return "Brass";
  if (lower.includes("wood") || lower.includes("wooden")) return "Wood";
  return null;
}

// ---------------------------------------------------------------------------
// LLM extraction (gpt-5-mini, structured JSON, NO fabrication)
// ---------------------------------------------------------------------------

async function extractWithLLM(client: OpenAI, input: ExtractInput): Promise<ExtractedFacts> {
  const model = config.openaiExtractionModel;

  const systemPrompt = [
    "You are an extraction-only assistant for HastKala, a marketplace for women artisans.",
    "Your ONLY job is to extract product facts from the artisan's WhatsApp message.",
    "",
    "STRICT RULES:",
    "1. If the artisan did NOT mention a fact, return null. NEVER invent values.",
    "2. Do NOT default to common values (e.g. price=500, quantity=1). Null means 'ask the user'.",
    "3. Translate title to English; keep cultural terms (e.g. 'Kasuti embroidery dupatta').",
    `4. Category MUST be one of: ${ALLOWED_CATEGORIES.join(", ")}. Use null if unsure.`,
    "5. Return JSON ONLY. No prose, no markdown.",
    "",
    "Return shape:",
    `{"title": string|null, "price": number|null, "quantity": number|null, "material": string|null, "category": string|null, "confidence": {"title": 0-1, "price": 0-1, "quantity": 0-1, "material": 0-1, "category": 0-1}}`,
  ].join("\n");

  const userPrompt = [
    `Artisan message: ${JSON.stringify(input.message)}`,
    input.district ? `District: ${input.district}` : null,
    input.craftType ? `Craft type: ${input.craftType}` : null,
    input.language ? `Language: ${input.language}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");

  const parsed = safeParseJson(raw);
  if (!parsed) throw new Error("Unparseable AI response");

  return {
    title: coerceString(parsed.title),
    price: coerceNumber(parsed.price),
    quantity: coerceNumber(parsed.quantity),
    material: coerceString(parsed.material),
    category: coerceCategory(parsed.category),
    confidence: {
      title: coerceConfidence(parsed.confidence?.title),
      price: coerceConfidence(parsed.confidence?.price),
      quantity: coerceConfidence(parsed.confidence?.quantity),
      material: coerceConfidence(parsed.confidence?.material),
      category: coerceConfidence(parsed.confidence?.category),
    },
  };
}

// ---------------------------------------------------------------------------
// Coercion helpers
// ---------------------------------------------------------------------------

function safeParseJson(raw: string): any {
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

function coerceString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 && trimmed.toLowerCase() !== "null" ? trimmed : null;
}

function coerceNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function coerceCategory(v: unknown): string | null {
  const s = coerceString(v);
  if (!s) return null;
  if (ALLOWED_CATEGORIES.includes(s)) return s;
  const match = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === s.toLowerCase());
  return match ?? s;
}

function coerceConfidence(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * Decide which fields are still missing after extraction.
 * Returned in priority order so the engine asks for them in the right sequence.
 */
export function missingFields(facts: ExtractedFacts): Array<"title" | "price" | "quantity"> {
  const missing: Array<"title" | "price" | "quantity"> = [];
  if (facts.title === null || facts.confidence.title < 0.4) missing.push("title");
  if (facts.price === null) missing.push("price");
  if (facts.quantity === null) missing.push("quantity");
  return missing;
}
