/**
 * Seller-side Quote flow.
 *
 *   REQUEST_LIST          → seller's own incoming requests (when they pick "Buyer Requests")
 *   QUOTE_VIEW_INCOMING   → detail of a single request, with "Send quote / Pass" options
 *   QUOTE_PRICE           → ₹ amount input
 *   QUOTE_DELIVERY        → delivery promise text
 *   QUOTE_NOTE            → optional note (or SKIP)
 *   QUOTE_CONFIRM         → preview, 1 send / 2 edit / 3 cancel
 *
 * Buyer-side QUOTE_BROWSE state shows incoming quotes for one request.
 */
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { mainMenuFor, transition, updateSession } from "../state";
import {
  isCancelCommand,
  isSkipCommand,
  parseInteger,
  parseMenuChoice,
  parsePriceReply,
} from "../../utils/text";
import {
  acceptQuote,
  getRequest,
  listOpenRequestsForSeller,
  listQuotes,
  rejectQuote,
  submitQuote,
} from "../../services/requestService";

// ---------------------------------------------------------------------------
// Seller side
// ---------------------------------------------------------------------------

export async function enterSellerRequestList(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const requests = await listOpenRequestsForSeller(s.phone);
  if (requests.length === 0) {
    transition(s.phone, mainMenuFor(s.role));
    return [{ text: m.requestEmpty(), state: "SELLER_MENU" }];
  }
  // We treat the first matched request as the active one for the demo.
  // For multiple, we'd add a list state — keeping it minimal for v1.
  const r = requests[0];
  updateSession(s.phone, {
    context: { quote: { requestId: r.id, requestBrief: r.brief } },
  });
  transition(s.phone, "QUOTE_VIEW_INCOMING");
  return [
    {
      text: m.quoteIncomingRequest({
        requestId: r.id,
        brief: r.brief,
        deliveryDate: r.deliveryDate,
        location: r.location,
        budgetMin: r.budgetMin,
        budgetMax: r.budgetMax,
      }),
      state: "QUOTE_VIEW_INCOMING",
    },
  ];
}

export async function handleQuoteViewIncoming(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 3);
  if (!choice) return [{ text: m.invalidChoice(), state: "QUOTE_VIEW_INCOMING" }];

  switch (choice) {
    case 1: // Send quote
      transition(s.phone, "QUOTE_PRICE");
      return [{ text: m.quoteAskPrice(), state: "QUOTE_PRICE" }];
    case 2: // Pass
      transition(s.phone, mainMenuFor(s.role));
      return [{ text: m.quoteCancelled(), state: "SELLER_MENU" }];
    case 3: // More details — reuse the request body
      return [{ text: m.notImplemented(), state: "QUOTE_VIEW_INCOMING" }];
  }
  return [{ text: m.invalidChoice(), state: "QUOTE_VIEW_INCOMING" }];
}

export async function handleQuotePrice(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelQuote(s);
  const price = parsePriceReply(msg.body) ?? parseInteger(msg.body);
  if (!price || price <= 0) {
    return [{ text: m.quoteAskPrice(), state: "QUOTE_PRICE" }];
  }
  updateSession(s.phone, {
    context: { quote: { ...(s.context.quote ?? {}), price } },
  });
  transition(s.phone, "QUOTE_DELIVERY");
  return [{ text: m.quoteAskDelivery(), state: "QUOTE_DELIVERY" }];
}

export async function handleQuoteDelivery(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelQuote(s);
  const deliveryNote = (msg.body || "").trim();
  if (!deliveryNote) {
    return [{ text: m.quoteAskDelivery(), state: "QUOTE_DELIVERY" }];
  }
  updateSession(s.phone, {
    context: { quote: { ...(s.context.quote ?? {}), deliveryNote } },
  });
  transition(s.phone, "QUOTE_NOTE");
  return [{ text: m.quoteAskNote(), state: "QUOTE_NOTE" }];
}

export async function handleQuoteNote(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelQuote(s);
  const note = isSkipCommand(msg.body) ? undefined : (msg.body || "").trim() || undefined;
  updateSession(s.phone, {
    context: { quote: { ...(s.context.quote ?? {}), quoteNote: note } },
  });
  transition(s.phone, "QUOTE_CONFIRM");
  const q = s.context.quote ?? {};
  return [
    {
      text: m.quotePreview({
        price: q.price ?? 0,
        deliveryNote: q.deliveryNote,
        quoteNote: note,
      }),
      state: "QUOTE_CONFIRM",
    },
  ];
}

export async function handleQuoteConfirm(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 3);
  if (!choice) return [{ text: m.invalidChoice(), state: "QUOTE_CONFIRM" }];

  switch (choice) {
    case 1: {
      const q = s.context.quote ?? {};
      const submitted = await submitQuote({
        requestId: q.requestId!,
        sellerPhone: s.phone,
        price: q.price!,
        deliveryNote: q.deliveryNote,
        quoteNote: q.quoteNote,
      });
      updateSession(s.phone, { context: {} });
      transition(s.phone, mainMenuFor(s.role));
      return [{ text: submitted ? m.quoteSubmitted() : m.errorBackend(), state: "SELLER_MENU" }];
    }
    case 2:
      transition(s.phone, "QUOTE_PRICE");
      return [{ text: m.quoteAskPrice(), state: "QUOTE_PRICE" }];
    case 3:
      return cancelQuote(s);
  }
  return [{ text: m.invalidChoice(), state: "QUOTE_CONFIRM" }];
}

function cancelQuote(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  updateSession(s.phone, { context: {} });
  transition(s.phone, mainMenuFor(s.role));
  return [{ text: m.quoteCancelled(), state: "SELLER_MENU" }];
}

// ---------------------------------------------------------------------------
// Buyer side: view incoming quotes for a specific request
// ---------------------------------------------------------------------------

export async function enterBuyerQuoteList(
  s: UserSession,
  requestId: string,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const [request, quotes] = await Promise.all([getRequest(requestId), listQuotes(requestId)]);

  if (!request) {
    transition(s.phone, mainMenuFor(s.role));
    return [{ text: m.errorGeneric(), state: "BUYER_MENU" }];
  }

  if (quotes.length === 0) {
    transition(s.phone, mainMenuFor(s.role));
    return [
      {
        text: `No quotes yet for: _${request.brief}_\n\nWe'll notify you here as they come in.`,
        state: "BUYER_MENU",
      },
    ];
  }

  const items = quotes.map((q, i) => ({
    id: q.id,
    sellerName: q.sellerName,
    price: q.price,
    deliveryNote: q.deliveryNote,
    index: i + 1,
  }));

  updateSession(s.phone, {
    context: {
      viewQuotes: {
        requestId,
        quotes: items.map(({ id, sellerName, price, deliveryNote }) => ({
          id,
          sellerName,
          price,
          deliveryNote,
        })),
      },
    },
  });
  transition(s.phone, "QUOTE_BROWSE");

  return [
    { text: m.quotesHeader(request.brief, quotes.length), state: "QUOTE_BROWSE" },
    { text: m.quotesList(items), state: "QUOTE_BROWSE" },
  ];
}

export async function handleQuoteBrowse(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const list = s.context.viewQuotes?.quotes ?? [];
  const choice = parseMenuChoice(msg.body, list.length);

  if (!choice) {
    // Maybe it's an action on a previously selected quote
    const selectedId = s.context.viewQuotes?.selectedQuoteId;
    if (selectedId) {
      const action = parseMenuChoice(msg.body, 3);
      if (action === 1) {
        const ok = await acceptQuote(selectedId);
        transition(s.phone, mainMenuFor(s.role));
        return [{ text: ok ? m.quoteAccepted() : m.errorBackend(), state: "BUYER_MENU" }];
      }
      if (action === 2) {
        const ok = await rejectQuote(selectedId);
        return [{ text: ok ? m.quoteRejected() : m.errorBackend(), state: "QUOTE_BROWSE" }];
      }
      if (action === 3) {
        updateSession(s.phone, {
          context: { viewQuotes: { ...(s.context.viewQuotes ?? {}), selectedQuoteId: undefined } },
        });
        return [
          {
            text: m.quotesList(list.map((q, i) => ({ ...q, index: i + 1 }))),
            state: "QUOTE_BROWSE",
          },
        ];
      }
    }
    return [{ text: m.invalidChoice(), state: "QUOTE_BROWSE" }];
  }

  const selected = list[choice - 1];
  updateSession(s.phone, {
    context: { viewQuotes: { ...(s.context.viewQuotes ?? {}), selectedQuoteId: selected.id } },
  });
  return [
    {
      text: m.quoteDetail({
        sellerName: selected.sellerName,
        price: selected.price,
        deliveryNote: selected.deliveryNote,
      }),
      state: "QUOTE_BROWSE",
    },
  ];
}
