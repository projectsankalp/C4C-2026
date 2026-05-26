import type { Order } from "./types";

const KEY = "hastkala_orders_v1";

export function saveOrder(order: Order) {
  if (typeof window === "undefined") return;
  const all = getOrders();
  all.push(order);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function updateOrder(id: string, updates: Partial<Order>) {
  if (typeof window === "undefined") return;
  const all = getOrders().map((order) => (order.id === id ? { ...order, ...updates } : order));
  localStorage.setItem(KEY, JSON.stringify(all));
}
