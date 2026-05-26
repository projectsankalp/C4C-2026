/**
 * Seller orders flow.
 *   ORDERS_LIST    → show recent orders
 *   ORDERS_MANAGE  → after picking an order, show 3 actions
 */
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { mainMenuFor, transition, updateSession } from "../state";
import { parseMenuChoice } from "../../utils/text";
import { listOrdersForArtisan, updateOrderStatus } from "../../services/orderService";
import { loadProfile } from "../../services/userService";

export async function enterOrdersList(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const profile = await loadProfile(s.phone);
  const artisanId = (profile as any)?.artisanId ?? (profile as any)?.id;
  if (!artisanId) {
    transition(s.phone, mainMenuFor(s.role));
    return [{ text: m.ordersEmpty(), state: "SELLER_MENU" }];
  }

  const orders = await listOrdersForArtisan(artisanId);
  if (orders.length === 0) {
    transition(s.phone, mainMenuFor(s.role));
    return [{ text: m.ordersEmpty(), state: "SELLER_MENU" }];
  }

  const orderList = orders.slice(0, 10).map((o) => ({
    id: o.id,
    productTitle: o.productTitle,
    status: o.status,
    amount: o.amount,
    buyerCity: o.buyerCity,
  }));
  updateSession(s.phone, { context: { orders: { orderList } } });
  return [{ text: m.ordersList(orderList), state: "ORDERS_LIST" }];
}

export async function handleOrdersList(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const list = s.context.orders?.orderList ?? [];
  const idx = parseMenuChoice(msg.body, list.length);
  if (!idx) return [{ text: m.invalidChoice(), state: "ORDERS_LIST" }];
  const order = list[idx - 1];
  updateSession(s.phone, { context: { orders: { orderList: list, selectedOrderId: order.id } } });
  transition(s.phone, "ORDERS_MANAGE");
  return [
    {
      text: m.orderDetail({
        id: order.id,
        productTitle: order.productTitle,
        quantity: 1, // We don't have quantity in the cached card; backend has it.
        amount: order.amount,
        buyerCity: order.buyerCity,
        status: order.status,
      }),
      state: "ORDERS_MANAGE",
    },
  ];
}

export async function handleOrdersManage(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 3);
  if (!choice) return [{ text: m.invalidChoice(), state: "ORDERS_MANAGE" }];
  const orderId = s.context.orders?.selectedOrderId;
  if (!orderId) {
    transition(s.phone, "ORDERS_LIST");
    return [{ text: m.errorGeneric(), state: "ORDERS_LIST" }];
  }

  switch (choice) {
    case 1: {
      const ok = await updateOrderStatus(orderId, "confirmed");
      transition(s.phone, "ORDERS_LIST");
      return [{ text: ok ? m.orderAccepted() : m.errorBackend(), state: "ORDERS_LIST" }];
    }
    case 2: {
      const ok = await updateOrderStatus(orderId, "cancelled");
      transition(s.phone, "ORDERS_LIST");
      return [{ text: ok ? m.orderUnavailable() : m.errorBackend(), state: "ORDERS_LIST" }];
    }
    case 3:
      return [{ text: m.humanEscalated(), state: "ORDERS_MANAGE" }];
  }
  return [{ text: m.invalidChoice(), state: "ORDERS_MANAGE" }];
}
