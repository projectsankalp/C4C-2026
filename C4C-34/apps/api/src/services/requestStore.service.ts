/**
 * Buyer Requests + Seller Quotes store.
 *
 * In-memory for the hackathon demo. Schema mirrors what production-grade
 * Prisma models would look like (see schema.prisma additions later).
 *
 * Matching rules (intentionally explicit, not magical):
 *   1. seller.craftCategory matches request.category   (when category known)
 *   2. seller.district == request.location              (loose proximity)
 *   3. seller.isVerified == true
 *   4. seller.requestAlertsEnabled == true (default true)
 */
import { randomUUID } from "crypto";
import { userStore } from "./userStore.service";
import prisma from "../config/database";

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
  matchedSellerPhones: string[];
  createdAt: string;
  expiresAt: string;
}

export interface QuoteRecord {
  id: string;
  requestId: string;
  sellerPhone: string;
  sellerName: string;
  price: number;
  deliveryNote?: string;
  quoteNote?: string;
  status: "open" | "accepted" | "rejected" | "expired";
  createdAt: string;
}

const REQUEST_EXPIRY_HOURS = 48;

class RequestStore {
  private requests = new Map<string, BuyerRequestRecord>();
  private quotes = new Map<string, QuoteRecord>();

  async createRequest(
    input: Omit<
      BuyerRequestRecord,
      "id" | "status" | "matchedSellerPhones" | "createdAt" | "expiresAt"
    >,
  ): Promise<BuyerRequestRecord> {
    const id = `HK-REQ-${shortId()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + REQUEST_EXPIRY_HOURS * 60 * 60 * 1000);

    const matchedSellers = await this.matchSellers(input);
    const record: BuyerRequestRecord = {
      ...input,
      id,
      status: "open",
      matchedSellerPhones: matchedSellers.map((s) => s.phone),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    this.requests.set(id, record);
    return record;
  }

  async getRequest(id: string): Promise<BuyerRequestRecord | null> {
    return this.requests.get(id) ?? null;
  }

  async listByBuyer(buyerPhone: string): Promise<BuyerRequestRecord[]> {
    return Array.from(this.requests.values())
      .filter((r) => r.buyerPhone === buyerPhone)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * Open requests this seller is matched against.
   */
  async listForSeller(sellerPhone: string): Promise<BuyerRequestRecord[]> {
    return Array.from(this.requests.values())
      .filter((r) => r.status === "open" && r.matchedSellerPhones.includes(sellerPhone))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listOpen(): Promise<BuyerRequestRecord[]> {
    return Array.from(this.requests.values())
      .filter((r) => r.status === "open")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createQuote(input: Omit<QuoteRecord, "id" | "status" | "createdAt">): Promise<QuoteRecord> {
    const id = `HK-QUO-${shortId()}`;
    const record: QuoteRecord = {
      ...input,
      id,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.quotes.set(id, record);
    return record;
  }

  async listQuotes(requestId: string): Promise<QuoteRecord[]> {
    return Array.from(this.quotes.values())
      .filter((q) => q.requestId === requestId)
      .sort((a, b) => a.price - b.price);
  }

  async getQuote(id: string): Promise<QuoteRecord | null> {
    return this.quotes.get(id) ?? null;
  }

  async acceptQuote(quoteId: string): Promise<QuoteRecord | null> {
    const quote = this.quotes.get(quoteId);
    if (!quote) return null;
    quote.status = "accepted";
    // Mark the parent request as fulfilled and other quotes as rejected.
    const request = this.requests.get(quote.requestId);
    if (request) {
      request.status = "fulfilled";
      for (const q of this.quotes.values()) {
        if (q.requestId === quote.requestId && q.id !== quote.id && q.status === "open") {
          q.status = "rejected";
        }
      }
    }
    return quote;
  }

  async rejectQuote(quoteId: string): Promise<QuoteRecord | null> {
    const quote = this.quotes.get(quoteId);
    if (!quote) return null;
    quote.status = "rejected";
    return quote;
  }

  /**
   * Match sellers for a request by craft category + district + verification.
   * Falls back to any verified artisan if nothing matches strictly — this
   * keeps the demo from looking empty when category data is sparse.
   */
  private async matchSellers(input: {
    category?: string;
    location?: string;
  }): Promise<{ phone: string; name?: string }[]> {
    const profiles = await userStore.listSellers();

    const sellers: { phone: string; name?: string; craftCategory?: string; district?: string }[] =
      [];

    // Pull from profile store
    for (const p of profiles) {
      if (p.requestAlertsEnabled === false) continue;
      sellers.push({
        phone: p.phone,
        name: p.name,
        craftCategory: p.craftCategory,
        district: p.district,
      });
    }

    // Augment from canonical artisan table for seeded data.
    try {
      const artisans = await prisma.artisan.findMany({ where: { isVerified: true } });
      for (const a of artisans as any[]) {
        if (!sellers.some((s) => s.phone === a.phone)) {
          sellers.push({
            phone: a.phone,
            name: a.name,
            craftCategory: a.craftType,
            district: a.district,
          });
        }
      }
    } catch {
      /* ignore */
    }

    // Strict match: category + location overlap.
    const strict = sellers.filter((s) => {
      if (input.category && s.craftCategory) {
        const catMatch =
          s.craftCategory.toLowerCase() === input.category.toLowerCase() ||
          s.craftCategory.toLowerCase().includes(input.category.toLowerCase()) ||
          input.category.toLowerCase().includes(s.craftCategory.toLowerCase());
        if (!catMatch) return false;
      }
      if (input.location && s.district) {
        const locMatch =
          s.district.toLowerCase() === input.location.toLowerCase() ||
          s.district.toLowerCase().includes(input.location.toLowerCase());
        if (!locMatch) return false;
      }
      return true;
    });

    // Fall back to all verified sellers if strict produced nothing.
    const candidates = strict.length > 0 ? strict : sellers;
    return candidates.slice(0, 10);
  }
}

function shortId(): string {
  return randomUUID().slice(0, 8).toUpperCase();
}

export const requestStore = new RequestStore();
