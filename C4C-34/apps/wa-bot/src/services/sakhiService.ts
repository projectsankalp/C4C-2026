/**
 * Karigar Sakhi service — list pending products and approve/reject from WhatsApp.
 * Backed by the existing /api/vendor/* endpoints.
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";
import type { ApiEnvelope } from "../types";

export interface PendingProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  artisan: { id: string; name?: string; district?: string; phone?: string };
}

export async function listPendingProducts(): Promise<PendingProduct[]> {
  try {
    const response = await api.get<ApiEnvelope<PendingProduct[]>>("/api/vendor/products/pending");
    const data = (response.data as any)?.data;
    if (Array.isArray(data)) return data;
    return [];
  } catch (error: any) {
    log.warn("LIST_PENDING_FAILED", { summary: error?.summary });
    return [];
  }
}

export async function approveProduct(productId: string, reviewerName?: string): Promise<boolean> {
  try {
    await api.patch(`/api/vendor/products/${productId}/approve`, { reviewerName });
    return true;
  } catch (error: any) {
    log.warn("APPROVE_FAILED", { summary: error?.summary, productId });
    return false;
  }
}

export async function rejectProduct(
  productId: string,
  reason?: string,
  reviewerName?: string,
): Promise<boolean> {
  try {
    await api.patch(`/api/vendor/products/${productId}/reject`, {
      reason: reason || "Needs revision",
      reviewerName,
    });
    return true;
  } catch (error: any) {
    log.warn("REJECT_FAILED", { summary: error?.summary, productId });
    return false;
  }
}
