/**
 * Buyer Requests + Seller Quotes — the differentiator feature.
 *
 * Backend endpoints (added in Batch 9):
 *   POST   /api/requests
 *   GET    /api/requests
 *   GET    /api/requests/:id
 *   POST   /api/requests/:id/quotes
 *   GET    /api/requests/:id/quotes
 *   POST   /api/quotes/:id/accept
 *   POST   /api/quotes/:id/reject
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";
import type { ApiEnvelope } from "../types";

export interface BuyerRequestRecord {
  id: string;
  buyerPhone: string;
  buyerName?: string;
  brief: string;
  category?: string;
  quantity?: number;
  budgetMin?: number;
  budgetMax?: number;
  deliveryDate?: string;
  location?: string;
  status: "open" | "matched" | "fulfilled" | "cancelled" | "expired";
  matchedSellers?: number;
  quoteCount?: number;
  createdAt?: string;
}

export interface QuoteRecord {
  id: string;
  requestId: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  price: number;
  deliveryNote?: string;
  quoteNote?: string;
  status: "open" | "accepted" | "rejected" | "expired";
}

export async function createRequest(input: {
  buyerPhone: string;
  brief: string;
  category?: string;
  quantity?: number;
  budgetMin?: number;
  budgetMax?: number;
  deliveryDate?: string;
  location?: string;
}): Promise<BuyerRequestRecord | null> {
  try {
    const response = await api.post<ApiEnvelope<BuyerRequestRecord>>("/api/requests", input);
    return (response.data as any)?.data ?? null;
  } catch (error: any) {
    log.warn("CREATE_REQUEST_FAILED", { summary: error?.summary });
    return null;
  }
}

export async function listRequestsByBuyer(buyerPhone: string): Promise<BuyerRequestRecord[]> {
  try {
    const response = await api.get<ApiEnvelope<BuyerRequestRecord[]>>(`/api/requests`, {
      params: { buyerPhone, limit: 20 },
    });
    const data = (response.data as any)?.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    log.warn("LIST_REQUESTS_FAILED", { summary: error?.summary });
    return [];
  }
}

export async function getRequest(requestId: string): Promise<BuyerRequestRecord | null> {
  try {
    const response = await api.get<ApiEnvelope<BuyerRequestRecord>>(`/api/requests/${requestId}`);
    return (response.data as any)?.data ?? null;
  } catch (error: any) {
    log.warn("GET_REQUEST_FAILED", { summary: error?.summary });
    return null;
  }
}

export async function listOpenRequestsForSeller(
  sellerPhone: string,
): Promise<BuyerRequestRecord[]> {
  try {
    const response = await api.get<ApiEnvelope<BuyerRequestRecord[]>>(`/api/requests`, {
      params: { matchSellerPhone: sellerPhone, status: "open", limit: 10 },
    });
    const data = (response.data as any)?.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    log.warn("LIST_OPEN_REQUESTS_FAILED", { summary: error?.summary });
    return [];
  }
}

export async function submitQuote(input: {
  requestId: string;
  sellerPhone: string;
  price: number;
  deliveryNote?: string;
  quoteNote?: string;
}): Promise<QuoteRecord | null> {
  try {
    const response = await api.post<ApiEnvelope<QuoteRecord>>(
      `/api/requests/${input.requestId}/quotes`,
      {
        sellerPhone: input.sellerPhone,
        price: input.price,
        deliveryNote: input.deliveryNote,
        quoteNote: input.quoteNote,
      },
    );
    return (response.data as any)?.data ?? null;
  } catch (error: any) {
    log.warn("SUBMIT_QUOTE_FAILED", { summary: error?.summary });
    return null;
  }
}

export async function listQuotes(requestId: string): Promise<QuoteRecord[]> {
  try {
    const response = await api.get<ApiEnvelope<QuoteRecord[]>>(`/api/requests/${requestId}/quotes`);
    const data = (response.data as any)?.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    log.warn("LIST_QUOTES_FAILED", { summary: error?.summary });
    return [];
  }
}

export async function acceptQuote(quoteId: string): Promise<boolean> {
  try {
    await api.post(`/api/quotes/${quoteId}/accept`);
    return true;
  } catch (error: any) {
    log.warn("ACCEPT_QUOTE_FAILED", { summary: error?.summary, quoteId });
    return false;
  }
}

export async function rejectQuote(quoteId: string): Promise<boolean> {
  try {
    await api.post(`/api/quotes/${quoteId}/reject`);
    return true;
  } catch (error: any) {
    log.warn("REJECT_QUOTE_FAILED", { summary: error?.summary, quoteId });
    return false;
  }
}
