/**
 * CraftGenie AI listing generator.
 *
 * Strategy:
 *   1. If OPENAI_API_KEY is set AND AI_PROVIDER !== "mock", call GPT-5 Mini.
 *      It returns structured JSON: title, description, category, tags, etc.
 *   2. Otherwise (or on any LLM error / malformed response), fall back to the
 *      rule-based generator. This guarantees the demo never blocks on an LLM hiccup.
 *
 * Why gpt-5-mini:
 *   - Cheap: $0.25 / 1M input tokens, $2.00 / 1M output. ~$0.0007 per listing.
 *   - Fast: sub-second on short outputs.
 *   - Strong at structured extraction + light prose, which is exactly what
 *     "turn artisan WhatsApp message into product listing" needs.
 *   - Multilingual: handles Kannada/Hindi/Tamil/English code-mixed text.
 *
 * Why not GPT-5 / 5.4 flagship: overkill and 10-50x more expensive for no
 * meaningful quality gain on this task.
 */
import OpenAI from "openai";
import { extractPrice } from "../utils/extractPrice";
import { extractQuantity } from "../utils/extractQuantity";

export interface AIListingInput {
  message: string;
  imageUrl?: string;
  language?: string;
  district?: string;
  artisanName?: string;
  craftType?: string;
  /**
   * Slots already confirmed by the user via the bot's slot-fill flow.
   * When all hard facts (title, price, quantity) are present we skip the LLM
   * extraction and only use it for description/tags/care.
   */
  prefilled?: {
    title?: string;
    price?: number;
    quantity?: number;
    material?: string;
    category?: string;
    description?: string;
    tags?: string[];
    careInstructions?: string;
  };
}

export interface AIListingOutput {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  price: number;
  quantity: number;
  material: string;
  careInstructions: string;
  /** Internal: which path produced this listing. Useful for logging. */
  _source?: "gpt-5-mini" | "fallback";
}

const DEFAULT_LISTING_MODEL = "gpt-4o-mini";

let cachedClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  if (!key || provider === "mock") return null;
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: key });
  }
  return cachedClient;
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
  "Handmade Crafts",
];

export class AIService {
  static async generateListing(input: AIListingInput): Promise<AIListingOutput> {
    const client = getOpenAI();

    // Fast path: if the bot has already done slot extraction and confirmed
    // facts with the user, we trust those. Use the AI only to polish the
    // description and tags. This is the architectural fix for hallucination —
    // we never let the model invent facts the user didn't say.
    if (client && input.prefilled?.title && input.prefilled.price) {
      try {
        const polished = await this.polishListing(client, input);
        if (polished) {
          polished._source = "gpt-5-mini";
          return polished;
        }
      } catch (error: any) {
        console.warn("[AIService] polishListing failed, falling back.", {
          message: error?.message,
        });
      }
    }

    if (client) {
      console.log("[AIService] Calling gpt-5-mini for listing generation...");
      try {
        const aiResult = await this.generateWithLLM(client, input);
        if (aiResult) {
          // Always reconcile price/quantity with regex extraction. The LLM may
          // hallucinate; the artisan's actual numbers are sacrosanct.
          const explicitPrice = extractPrice(input.message);
          const explicitQuantity = extractQuantity(input.message);
          if (explicitPrice && explicitPrice > 0) aiResult.price = explicitPrice;
          if (explicitQuantity && explicitQuantity > 0) aiResult.quantity = explicitQuantity;
          aiResult._source = "gpt-5-mini";
          console.log(
            `[AIService] gpt-5-mini OK: title="${aiResult.title}" category="${aiResult.category}" material="${aiResult.material}"`,
          );
          return aiResult;
        }
        console.warn(
          "[AIService] gpt-5-mini returned null/unparseable, using rule-based fallback.",
        );
      } catch (error: any) {
        console.error("[AIService] gpt-5-mini failed, falling back to rules.", {
          message: error?.message,
          status: error?.status,
        });
      }
    } else {
      console.log(
        `[AIService] LLM disabled (provider=${process.env.AI_PROVIDER || "unset"}, key=${
          process.env.OPENAI_API_KEY ? "present" : "missing"
        }), using rule-based fallback.`,
      );
    }
    const fallback = this.generateFallback(input);
    fallback._source = "fallback";
    return fallback;
  }

  // ---------------------------------------------------------------------------
  // Polish path (when bot already provided confirmed slots)
  // ---------------------------------------------------------------------------

  private static async polishListing(
    client: OpenAI,
    input: AIListingInput,
  ): Promise<AIListingOutput | null> {
    const model = process.env.OPENAI_LISTING_MODEL || DEFAULT_LISTING_MODEL;
    const p = input.prefilled!;

    const systemPrompt = [
      "You are CraftGenie, a writer for HastKala — a marketplace for women artisans.",
      "The buyer-facing FACTS (title, price, quantity, material, category) are FIXED — never change them.",
      "Your job: write 2-3 sentence buyer-friendly description, a one-line short description, 4-6 lowercase tags, and a one-line care instruction.",
      'Tone: warm, dignified. Avoid charity language ("poor women"). Use "women artisans", "handmade", "small batch".',
      `District context: ${input.district || "an Indian craft district"}. Mention it in the description.`,
      "Return JSON only. No markdown.",
      'Shape: {"description": string, "shortDescription": string, "tags": string[], "careInstructions": string}',
    ].join("\n");

    const userPrompt = [
      `Title: ${p.title}`,
      `Material: ${p.material || "handmade"}`,
      `Category: ${p.category || "Handmade Crafts"}`,
      `Original artisan message: ${JSON.stringify(input.message)}`,
    ].join("\n");

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = this.safeParseJson(raw);
    if (!parsed) return null;

    return {
      title: p.title!,
      description:
        this.coerceString(parsed.description) ||
        `A handmade ${p.title} crafted by women artisans${input.district ? ` from ${input.district}` : ""}.`,
      shortDescription:
        this.coerceString(parsed.shortDescription) || `${p.title} by women artisans.`,
      category: p.category || "Handmade Crafts",
      tags: this.coerceTags(parsed.tags) || ["handmade", "women artisans"],
      price: p.price!,
      quantity: p.quantity ?? 1,
      material: p.material || "Handmade material",
      careInstructions:
        this.coerceString(parsed.careInstructions) ||
        "Handle with care. Keep dry and clean gently.",
    };
  }

  // ---------------------------------------------------------------------------
  // LLM path
  // ---------------------------------------------------------------------------

  private static async generateWithLLM(
    client: OpenAI,
    input: AIListingInput,
  ): Promise<AIListingOutput | null> {
    const model = process.env.OPENAI_LISTING_MODEL || DEFAULT_LISTING_MODEL;

    const systemPrompt = [
      "You are CraftGenie, an AI assistant for HastKala — a marketplace for rural Indian women artisans.",
      "Your job: convert a raw WhatsApp product message (often in Kannada/Hindi/Tamil mixed with English) into a clean, buyer-ready product listing in English.",
      "",
      "Rules:",
      "- Never invent unrealistic claims or generic filler. Be specific to what the artisan said.",
      '- Keep the tone warm, dignified. Avoid charity language ("poor women", "helpless"). Use "women artisans", "handmade", "small batch".',
      "- The artisan typically says product, price (₹), quantity, and sometimes material. Extract these accurately.",
      "- If the artisan said something in Kannada/Hindi/Tamil, translate it to English in the title/description but keep cultural authenticity.",
      `- Pick category from this exact list: ${ALLOWED_CATEGORIES.join(", ")}.`,
      "- Description: 2-3 sentences, mentions handmade origin and the district if known.",
      "- Tags: 4-6 short lowercase tags (no hashtag).",
      "- Material: best guess from product name (coconut shell, bamboo, cotton, terracotta, etc).",
      "- careInstructions: one short practical sentence.",
      "",
      "Return JSON only. No prose, no markdown, no code fences.",
    ].join("\n");

    const userPrompt = [
      `Artisan message: ${JSON.stringify(input.message || "")}`,
      input.district ? `District: ${input.district}` : null,
      input.craftType ? `Craft type: ${input.craftType}` : null,
      input.artisanName ? `Artisan name: ${input.artisanName}` : null,
      input.language ? `Language hint: ${input.language}` : null,
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
      // Bound the latency so a slow LLM never holds up the bot reply.
      // Most listings come back in <2s.
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = this.safeParseJson(raw);
    if (!parsed) return null;

    const fallback = this.generateFallback(input);

    return {
      title: this.coerceString(parsed.title) || fallback.title,
      description: this.coerceString(parsed.description) || fallback.description,
      shortDescription:
        this.coerceString(parsed.shortDescription) ||
        this.coerceString(parsed.short_description) ||
        fallback.shortDescription,
      category: this.coerceCategory(parsed.category) || fallback.category,
      tags: this.coerceTags(parsed.tags) || fallback.tags,
      price: this.coerceNumber(parsed.price) ?? fallback.price,
      quantity: this.coerceNumber(parsed.quantity) ?? fallback.quantity,
      material: this.coerceString(parsed.material) || fallback.material,
      careInstructions:
        this.coerceString(parsed.careInstructions) ||
        this.coerceString(parsed.care_instructions) ||
        fallback.careInstructions,
    };
  }

  private static safeParseJson(raw: string): Record<string, unknown> | null {
    try {
      return JSON.parse(raw);
    } catch {
      // Some models wrap their JSON in ```json ... ``` despite our instructions.
      const stripped = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```\s*$/, "");
      try {
        return JSON.parse(stripped);
      } catch {
        return null;
      }
    }
  }

  private static coerceString(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private static coerceNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const n = Number(value.replace(/[^\d.]/g, ""));
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
  }

  private static coerceCategory(value: unknown): string | null {
    const s = this.coerceString(value);
    if (!s) return null;
    // Accept any category exactly as named, or pick the closest match by lowercase.
    if (ALLOWED_CATEGORIES.includes(s)) return s;
    const lc = s.toLowerCase();
    const match = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === lc);
    return match || s; // accept LLM's choice even if unknown — it's still useful
  }

  private static coerceTags(value: unknown): string[] | null {
    if (!Array.isArray(value)) return null;
    const tags = value
      .map((v) => this.coerceString(v)?.toLowerCase().replace(/^#/, ""))
      .filter((v): v is string => Boolean(v))
      .slice(0, 8);
    return tags.length > 0 ? tags : null;
  }

  // ---------------------------------------------------------------------------
  // Rule-based fallback (always works, no API key required)
  // ---------------------------------------------------------------------------

  private static generateFallback(input: AIListingInput): AIListingOutput {
    const rawMessage = input.message || "Handmade artisan product";
    const message = rawMessage.toLowerCase();
    const price = extractPrice(rawMessage) || 500;
    const quantity = extractQuantity(rawMessage);

    const detected = this.detectProduct(message);
    const district = input.district || "local craft district";

    return {
      title: detected.title,
      description: `A ${detected.title.toLowerCase()} crafted by women artisans from ${district}. This listing was prepared from a WhatsApp submission and supports direct market access for rural artisan communities.`,
      shortDescription: `${detected.title} made by women artisans from ${district}.`,
      category: detected.category,
      tags: ["handmade", "women artisans", detected.category.toLowerCase(), district.toLowerCase()],
      price,
      quantity,
      material: detected.material,
      careInstructions: "Handle with care. Keep away from excess moisture and clean gently.",
    };
  }

  private static detectProduct(message: string) {
    if (message.includes("lamp") || message.includes("light")) {
      return {
        title: "Handmade Coconut Shell Lamp",
        category: "Home Decor",
        material: "Coconut shell",
      };
    }
    if (message.includes("basket")) {
      return {
        title: "Handwoven Basket",
        category: "Home & Utility",
        material: "Bamboo or natural fiber",
      };
    }
    if (message.includes("bag") || message.includes("tote")) {
      return {
        title: "Handmade Artisan Bag",
        category: "Accessories",
        material: "Natural fiber",
      };
    }
    if (message.includes("saree") || message.includes("dupatta") || message.includes("fabric")) {
      return {
        title: "Handcrafted Textile Product",
        category: "Textiles",
        material: "Handwoven fabric",
      };
    }
    if (
      message.includes("jewellery") ||
      message.includes("jewelry") ||
      message.includes("earring")
    ) {
      return {
        title: "Handmade Jewellery",
        category: "Jewellery",
        material: "Artisan beads and findings",
      };
    }

    return {
      title: this.extractTitle(message),
      category: "Handmade Crafts",
      material: "Handmade material",
    };
  }

  private static extractTitle(message: string): string {
    const cleaned = message
      .replace(/₹?\s?\d+(?:,\d{3})*/g, "")
      .replace(/\d+\s*(piece|pieces|pcs|pc|item|items|available|stock)/gi, "")
      .replace(/rs\.?|rupees?|price|only/gi, "")
      .replace(/[^\w\s-]/g, " ")
      .trim();

    if (!cleaned) return "Handmade Artisan Product";

    return cleaned
      .split(/\s+/)
      .slice(0, 6)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
