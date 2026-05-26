/**
 * HastKala Q&A assistant.
 *
 * Answers user questions about the platform — community, certification,
 * how to sell/buy, fees, payments, languages, contact, etc. — in the user's
 * preferred language.
 *
 * Grounded in a fixed knowledge base so the AI never invents policies or
 * features that don't exist.
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

const KNOWLEDGE_BASE = `
HastKala is a WhatsApp-first marketplace for women artisans across rural India.

SELLERS (artisans):
- Sell handmade products directly to buyers — no middlemen.
- To start: pick "Seller" in the bot menu, then join the HastKala 7-day Seller Community on WhatsApp.
- The community is FREE. Link is shared by the bot.
- During the 7-day cohort: learn how to take photos, write descriptions, package, deliver, build trust.
- After completing the cohort, the community team automatically issues a digital Seller Certificate.
- The certificate arrives on WhatsApp as a PDF/document. The seller account unlocks immediately.
- Once unlocked: add products via WhatsApp (photo + voice/text), receive orders, send quotes for bulk requests, manage stock, track earnings.
- Karigar Sakhis (community coordinators) help with packaging, pickup, and any issues.
- HastKala does NOT charge sellers a listing fee. A small commission is taken only on completed sales.

BUYERS:
- Browse handmade products from women artisans across India.
- No certification needed for buyers — just pick "Buyer" and start browsing.
- Place a bulk/custom order request: bot sends it to matched verified sellers, you receive quotes, pick the best one.
- Pay through the platform — money is held until the product is delivered.

KARIGAR SAKHI (coordinators):
- Field representatives who support artisans on the ground.
- Approve product listings before they go live, verify new sellers, help with deliveries.
- Sign up via the bot's "Karigar Sakhi" role.

LANGUAGES:
- All five Indian languages are fully supported: English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), Malayalam (മലയാളം).
- The bot replies with both text and voice in the user's chosen language.
- Type *LANGUAGE* anytime to switch.

VOICE NOTES:
- Yes, voice notes work in all five languages — the bot transcribes them automatically using AI.
- Speak in your own language; the bot understands.

PRIVACY:
- Phone number stays private.
- Name, district, and product details may be shown publicly to buyers.
- Type STOP anytime to opt out.

DEMO/TESTING:
- Currently in demo mode with a small allowlist of test phone numbers.
- Production will use the official WhatsApp Business Cloud API with opt-in templates.

COMMANDS:
- MENU — main menu
- BACK — one step back
- LANGUAGE — change language
- HELP — show commands
- HUMAN — talk to a Karigar Sakhi
- RESET — clear session and start fresh
- PROFILE — view your saved profile
`;

export async function answerQuestion(
  question: string,
  language: Language,
): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  const langName = languageName(language);

  const systemPrompt = `You are the HastKala WhatsApp assistant. A user just asked a question about the platform.

KNOWLEDGE BASE (the ONLY source of truth):
${KNOWLEDGE_BASE}

RULES:
1. Answer ONLY using the knowledge base above. If something isn't covered, say so honestly and suggest typing HUMAN to reach a real person.
2. Reply in ${langName}. Match the user's language script.
3. Keep replies SHORT (3-6 lines max). WhatsApp users skim.
4. Use simple words. Avoid jargon.
5. Use *bold* for key terms (WhatsApp markdown).
6. End with a small nudge like: _"Reply MENU to return to the main menu."_ or _"Reply HUMAN to talk to a Karigar Sakhi."_
7. Never make up policies, prices, deadlines, or rules not in the knowledge base.
8. Use a warm, dignified tone. No charity language.

Reply with ONLY the answer text. No JSON, no markdown headers.`;

  try {
    const response = await ai.chat.completions.create({
      // gpt-4o-mini for Q&A: fast, no reasoning text leak.
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    return text;
  } catch (error: any) {
    log.warn("QA_FAILED", { message: error?.message });
    return null;
  }
}

function languageName(lang: Language): string {
  switch (lang) {
    case "en":
      return "English";
    case "hi":
      return "Hindi (हिन्दी)";
    case "kn":
      return "Kannada (ಕನ್ನಡ)";
    case "ta":
      return "Tamil (தமிழ்)";
    case "ml":
      return "Malayalam (മലയാളം)";
    default:
      return "English";
  }
}
