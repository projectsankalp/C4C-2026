/**
 * Order service — seller-side. Lists orders for a seller and lets them
 * accept/cancel from inside WhatsApp.
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";
import type { ApiEnvelope } from "../types";

export interface OrderListItem {
  id: string;
  productId: string;
  productTitle: string;
  amount: number;
  quantity: number;
  status: string;
  buyerName?: string;
  buyerCity?: string;
  buyerPhone?: string;
}

export async function listOrdersForArtisan(artisanId: string): Promise<OrderListItem[]> {
  try {
    const response = await api.get<ApiEnvelope<any>>(`/api/vendor/orders`, {
      params: { artisanId, limit: 20 },
    });
    const data = (response.data as any)?.data;
    const list = Array.isArray(data) ? data : (data?.orders ?? []);
    return list.map((o: any) => ({
      id: o.id,
      productId: o.productId,
      productTitle: o.product?.title ?? "Unknown product",
      amount: Number(o.totalAmount ?? 0),
      quantity: Number(o.quantity ?? 1),
      status: o.status ?? "new",
      buyerName: o.buyerName,
      buyerCity: tryExtractCity(o.buyerAddress),
      buyerPhone: o.buyerPhone,
    }));
  } catch (error: any) {
    log.warn("LIST_ORDERS_FAILED", { summary: error?.summary, artisanId });
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    await api.patch(`/api/vendor/orders/${orderId}/status`, { status });
    return true;
  } catch (error: any) {
    log.warn("UPDATE_ORDER_STATUS_FAILED", { summary: error?.summary, orderId });
    return false;
  }
}

function tryExtractCity(address: string | undefined): string | undefined {
  if (!address) return undefined;
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[0];
}
