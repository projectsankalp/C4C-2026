/**
 * Buyer Request flow — the differentiator.
 *
 * Steps:
 *   REQUEST_BRIEF         brief description (typed or voice)
 *   REQUEST_DELIVERY_DATE when do they need it
 *   REQUEST_LOCATION      where to deliver (defaults to buyer city)
 *   REQUEST_BUDGET        budget range or single number
 *   REQUEST_CONFIRM       preview + 1-confirm / 2-edit / 3-cancel
 */
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { mainMenuFor, transition, updateSession } from "../state";
import { isCancelCommand, isSkipCommand, parseMenuChoice } from "../../utils/text";
import { transcribeAudio } from "./transcribe";
import { createRequest } from "../../services/requestService";
import { log } from "../../utils/logger";

export async function handleRequestBrief(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelRequest(s);

  let brief = (msg.body || "").trim();
  if (msg.hasAudio && !brief) {
    const transcript = await transcribeAudio({
      audioBuffer: msg.audioBuffer,
      mimetype: msg.audioMimetype,
      language: s.language,
    });
    brief = transcript.text;
  }
  if (!brief || brief.length < 5) {
    return [{ text: m.requestStart(), state: "REQUEST_BRIEF" }];
  }

  // Extract a quantity hint upfront if present ("250 idli plates")
  const qty = parseLeadingQuantity(brief);

  updateSession(s.phone, {
    context: { request: { ...(s.context.request ?? {}), brief, quantity: qty } },
  });
  transition(s.phone, "REQUEST_DELIVERY_DATE");
  return [{ text: m.requestAskDate(), state: "REQUEST_DELIVERY_DATE" }];
}

export async function handleRequestDate(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelRequest(s);
  const deliveryDate = isSkipCommand(msg.body) ? undefined : (msg.body || "").trim();
  updateSession(s.phone, { context: { request: { ...(s.context.request ?? {}), deliveryDate } } });
  transition(s.phone, "REQUEST_LOCATION");
  // If we already know the buyer's district, pre-suggest it.
  const askLine = s.district
    ? `${m.requestAskLocation()}\n\n_Reply SKIP to use ${s.district}._`
    : m.requestAskLocation();
  return [{ text: askLine, state: "REQUEST_LOCATION" }];
}

export async function handleRequestLocation(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelRequest(s);
  const raw = (msg.body || "").trim();
  const location = isSkipCommand(raw) ? s.district : raw;
  updateSession(s.phone, { context: { request: { ...(s.context.request ?? {}), location } } });
  transition(s.phone, "REQUEST_BUDGET");
  return [{ text: m.requestAskBudget(), state: "REQUEST_BUDGET" }];
}

export async function handleRequestBudget(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelRequest(s);
  const { min, max } = parseBudget(msg.body);
  updateSession(s.phone, {
    context: { request: { ...(s.context.request ?? {}), budgetMin: min, budgetMax: max } },
  });
  return showRequestPreview(s);
}

async function showRequestPreview(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const r = s.context.request ?? {};
  transition(s.phone, "REQUEST_CONFIRM");
  return [
    {
      text: m.requestPreview({
        brief: r.brief ?? "",
        quantity: r.quantity,
        deliveryDate: r.deliveryDate,
        location: r.location,
        budgetMin: r.budgetMin,
        budgetMax: r.budgetMax,
        category: r.category,
      }),
      state: "REQUEST_CONFIRM",
    },
  ];
}

export async function handleRequestConfirm(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 3);
  if (!choice) return [{ text: m.invalidChoice(), state: "REQUEST_CONFIRM" }];

  switch (choice) {
    case 1: {
      const r = s.context.request ?? {};
      try {
        const created = await createRequest({
          buyerPhone: s.phone,
          brief: r.brief ?? "",
          category: r.category,
          quantity: r.quantity,
          budgetMin: r.budgetMin,
          budgetMax: r.budgetMax,
          deliveryDate: r.deliveryDate,
          location: r.location,
        });
        transition(s.phone, mainMenuFor(s.role));
        return [
          {
            text: created ? m.requestBroadcasted(created.id) : m.errorBackend(),
            state: "BUYER_MENU",
          },
        ];
      } catch (error: any) {
        log.error("REQUEST_CREATE_FAILED", { message: error?.message });
        return [{ text: m.errorBackend(), state: "REQUEST_CONFIRM" }];
      }
    }
    case 2:
      // Edit: jump back to brief
      transition(s.phone, "REQUEST_BRIEF");
      return [{ text: m.requestStart(), state: "REQUEST_BRIEF" }];
    case 3:
      return cancelRequest(s);
  }
  return [{ text: m.invalidChoice(), state: "REQUEST_CONFIRM" }];
}

function cancelRequest(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  updateSession(s.phone, { context: {} });
  transition(s.phone, mainMenuFor(s.role));
  return [{ text: m.addProductCancelled(), state: "BUYER_MENU" }];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLeadingQuantity(text: string): number | undefined {
  const m = text.match(/^\s*(\d{1,5})\s/);
  return m ? Number(m[1]) : undefined;
}

function parseBudget(text: string): { min?: number; max?: number } {
  if (!text) return {};
  const cleaned = text.replace(/[₹,]/g, "");
  // "3000 to 4000" or "3000-4000"
  const range = cleaned.match(/(\d{2,7})\s*(?:to|-|–)\s*(\d{2,7})/i);
  if (range) {
    return { min: Number(range[1]), max: Number(range[2]) };
  }
  // "around 3500"
  const single = cleaned.match(/(\d{2,7})/);
  if (single) {
    const n = Number(single[1]);
    return { min: n, max: n };
  }
  return {};
}
