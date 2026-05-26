/**
 * Smart AI assistant with memory + product recommendations.
 * Uses GPT-5-mini (cheapest) with conversation history stuffed into context.
 * No embeddings, no vector DB — just smart prompting to stay under budget.
 */
import OpenAI from "openai";
import { config } from "../config";
import { log } from "../utils/logger";
import { api } from "./apiClient";
import type { Language, UserSession } from "../types";

let client: OpenAI | null = null;
function getClient(): OpenAI | null {
  if (!config.openaiApiKey) return null;
  if (!client) client = new OpenAI({ apiKey: config.openaiApiKey });
  return client;
}

/**
 * Generate a smart, contextual response using the user's profile + history.
 * Called when the message doesn't match any menu/command and NLU can't classify it.
 */
export async function smartAssist(
  session: UserSession,
  userMessage: string,
): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  // Build context from session
  const profile = [
    session.name ? `Name: ${session.name}` : null,
    session.role ? `Role: ${session.role}` : null,
    session.district ? `District: ${session.district}` : null,
    session.craftCategory ? `Craft: ${session.craftCategory}` : null,
    session.isCertified ? "Certified seller" : null,
  ].filter(Boolean).join(", ");

  // Recent conversation (last 10 messages to save tokens)
  const history = (session.messageHistory || []).slice(-10)
    .map(m => `${m.role === "user" ? "User" : "Bot"}: ${m.text.slice(0, 100)}`)
    .join("\n");

  // Fetch available products for recommendations (cached, cheap)
  let productContext = "";
  try {
    const res = await api.get<any>("/api/products", { params: { limit: 10 } });
    const products = res.data?.data?.products || [];
    if (products.length > 0) {
      productContext = "\nAVAILABLE PRODUCTS:\n" + products.map((p: any) =>
        `- ${p.title} (₹${p.price}, ${p.category || "General"}, by ${p.artisan?.name || "artisan"} in ${p.artisan?.district || "unknown"})`
      ).join("\n");
    }
  } catch {}

  const langName = session.language === "hi" ? "Hindi" : session.language === "kn" ? "Kannada" : "English";

  const systemPrompt = `You are HastKala's smart WhatsApp assistant. You help artisans sell and buyers find handmade products.

USER PROFILE: ${profile || "New user"}

RECENT CONVERSATION:
${history || "(first message)"}
${productContext}

RULES:
1. Reply in ${langName}. Keep it SHORT (3-5 lines). WhatsApp format.
2. If user wants to buy something → recommend matching products from the list above.
3. If seller asks business advice → give practical tips (pricing, photos, packaging).
4. If unclear → ask a clarifying question.
5. Always end with a helpful nudge: suggest MENU, BROWSE, or a specific action.
6. Use *bold* for key info. Be warm but concise.
7. NEVER make up products that aren't in the list. If nothing matches, say so.
8. Remember context from the conversation history above.`;

  try {
    const response = await ai.chat.completions.create({
      // gpt-4o-mini: deterministic output without reasoning leakage. The
      // smartAssist response goes straight to the user, so any "thinking out
      // loud" tokens are visible bugs.
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 300,
    });

    return response.choices?.[0]?.message?.content?.trim() || null;
  } catch (error: any) {
    log.warn("SMART_ASSIST_FAILED", { message: error?.message });
    return null;
  }
}
