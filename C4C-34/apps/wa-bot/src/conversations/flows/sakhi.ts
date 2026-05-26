/**
 * Karigar Sakhi flows.
 *
 *   SAKHI_MENU             → 5 options + MORE
 *   SAKHI_PENDING_LIST     → list of products waiting approval
 *   SAKHI_PENDING_DETAIL   → review one product, Approve / Reject
 */
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { mainMenuFor, transition, updateSession } from "../state";
import { matchOption, parseMenuChoice } from "../../utils/text";
import { approveProduct, listPendingProducts, rejectProduct } from "../../services/sakhiService";

const SAKHI_MENU_ALIASES = [
  ["1", "pending", "pending products"],
  ["2", "new sellers"],
  ["3", "orders", "orders to support"],
  ["4", "buyer requests"],
  ["5", "earnings", "artisan earnings"],
  ["6", "more"],
];

const MORE_ALIASES = [
  ["1", "profile"],
  ["2", "language"],
  ["3", "help"],
];

export async function handleSakhiMenu(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 6) ?? matchOption(msg.body, SAKHI_MENU_ALIASES);
  if (!choice) return [{ text: m.invalidChoice(), state: "SAKHI_MENU" }];

  switch (choice) {
    case 1:
      return enterSakhiPending(s);
    case 2:
    case 3:
    case 4:
    case 5:
      return [{ text: m.notImplemented(), state: "SAKHI_MENU" }];
    case 6:
      transition(s.phone, "SAKHI_MENU_MORE");
      return [{ text: m.sakhiMenuMore(), state: "SAKHI_MENU_MORE" }];
  }
  return [{ text: m.invalidChoice(), state: "SAKHI_MENU" }];
}

export async function handleSakhiMenuMore(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 3) ?? matchOption(msg.body, MORE_ALIASES);
  if (!choice) return [{ text: m.invalidChoice(), state: "SAKHI_MENU_MORE" }];
  switch (choice) {
    case 1:
      return [{ text: m.notImplemented(), state: "SAKHI_MENU_MORE" }];
    case 2:
      updateSession(s.phone, { stateStack: [] });
      transition(s.phone, "AWAITING_LANGUAGE");
      return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
    case 3:
      return [{ text: m.help(), state: "SAKHI_MENU_MORE" }];
  }
  return [{ text: m.invalidChoice(), state: "SAKHI_MENU_MORE" }];
}

export async function enterSakhiPending(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const products = await listPendingProducts();
  if (products.length === 0) {
    return [{ text: m.sakhiPendingEmpty(), state: "SAKHI_MENU" }];
  }
  const list = products.slice(0, 10);
  updateSession(s.phone, {
    context: {
      manageProduct: {
        productList: list.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          quantity: p.quantity,
          status: "pending_approval",
        })),
      },
    },
  });
  transition(s.phone, "SAKHI_PENDING_LIST");

  const items = list.map((p, i) => ({
    index: i + 1,
    title: p.title,
    artisanName: p.artisan?.name ?? "—",
    district: p.artisan?.district ?? "—",
  }));
  return [{ text: m.sakhiPendingList(items), state: "SAKHI_PENDING_LIST" }];
}

export async function handleSakhiPendingList(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const list = s.context.manageProduct?.productList ?? [];
  const idx = parseMenuChoice(msg.body, list.length);
  if (!idx) return [{ text: m.invalidChoice(), state: "SAKHI_PENDING_LIST" }];

  const selected = list[idx - 1];
  // Re-fetch the full product (we only have the card here, not description)
  const products = await listPendingProducts();
  const full = products.find((p) => p.id === selected.id);
  if (!full) {
    return [{ text: m.errorGeneric(), state: "SAKHI_PENDING_LIST" }];
  }

  updateSession(s.phone, { context: { manageProduct: { productId: full.id, productList: list } } });
  transition(s.phone, "SAKHI_PENDING_DETAIL");
  return [
    {
      text: m.sakhiPendingDetail({
        title: full.title,
        description: full.description,
        price: full.price,
        quantity: full.quantity,
        artisanName: full.artisan?.name ?? "—",
        district: full.artisan?.district ?? "—",
      }),
      state: "SAKHI_PENDING_DETAIL",
    },
  ];
}

export async function handleSakhiPendingDetail(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 3);
  if (!choice) return [{ text: m.invalidChoice(), state: "SAKHI_PENDING_DETAIL" }];

  const productId = s.context.manageProduct?.productId;
  const list = s.context.manageProduct?.productList ?? [];
  if (!productId) {
    transition(s.phone, "SAKHI_PENDING_LIST");
    return [{ text: m.errorGeneric(), state: "SAKHI_PENDING_LIST" }];
  }
  const item = list.find((p) => p.id === productId);

  switch (choice) {
    case 1: {
      const ok = await approveProduct(productId, s.name || "Karigar Sakhi");
      transition(s.phone, "SAKHI_PENDING_LIST");
      return [
        {
          text: ok ? m.sakhiApproved(item?.title ?? "") : m.errorBackend(),
          state: "SAKHI_PENDING_LIST",
        },
        ...(await enterSakhiPending(s)),
      ];
    }
    case 2: {
      const ok = await rejectProduct(productId, "Needs revision", s.name || "Karigar Sakhi");
      transition(s.phone, "SAKHI_PENDING_LIST");
      return [
        {
          text: ok ? m.sakhiRejected(item?.title ?? "") : m.errorBackend(),
          state: "SAKHI_PENDING_LIST",
        },
        ...(await enterSakhiPending(s)),
      ];
    }
    case 3:
      transition(s.phone, "SAKHI_PENDING_LIST");
      return enterSakhiPending(s);
  }
  return [{ text: m.invalidChoice(), state: "SAKHI_PENDING_DETAIL" }];
}
