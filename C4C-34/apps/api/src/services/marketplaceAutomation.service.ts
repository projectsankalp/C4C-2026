import { BuyerRequestRecord, requestStore } from "./requestStore.service";
import { userStore, UserProfile } from "./userStore.service";
import { WhatsAppService } from "./whatsapp.service";

const MAX_AUTOMATION_RECIPIENTS = 10;

export interface ProductAlertInput {
  id: string;
  title: string;
  category?: string | null;
  district?: string | null;
  price?: number | null;
  artisan?: {
    phone?: string | null;
    name?: string | null;
  } | null;
}

export class MarketplaceAutomationService {
  static async notifySellersForBuyerRequest(request: BuyerRequestRecord): Promise<void> {
    const message = formatSellerRequestAlert(request);
    request.matchedSellerPhones.slice(0, MAX_AUTOMATION_RECIPIENTS).forEach((sellerPhone) => {
      WhatsAppService.sendBroadcastMessage(sellerPhone, message).catch(() => undefined);
    });
  }

  static async notifyBuyersForNewProduct(product: ProductAlertInput): Promise<string[]> {
    const buyerPhones = await this.matchBuyersForProduct(product);
    if (buyerPhones.length === 0) return [];

    const message = formatBuyerProductAlert(product);
    buyerPhones.forEach((buyerPhone) => {
      WhatsAppService.sendBroadcastMessage(buyerPhone, message).catch(() => undefined);
    });
    return buyerPhones;
  }

  static async matchBuyersForProduct(product: ProductAlertInput): Promise<string[]> {
    const buyers = await userStore.listBuyers();
    const scored = new Map<string, number>();
    const sellerPhone = product.artisan?.phone;

    for (const buyer of buyers) {
      if (buyer.phone === sellerPhone) continue;
      const score = scoreBuyerProfile(product, buyer);
      if (score > 0) scored.set(buyer.phone, Math.max(scored.get(buyer.phone) ?? 0, score));
    }

    const openRequests = await requestStore.listOpen();
    for (const request of openRequests) {
      if (request.buyerPhone === sellerPhone) continue;
      const score = scoreBuyerRequest(product, request);
      if (score > 0) {
        scored.set(request.buyerPhone, Math.max(scored.get(request.buyerPhone) ?? 0, score + 2));
      }
    }

    return Array.from(scored.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([phone]) => phone)
      .slice(0, MAX_AUTOMATION_RECIPIENTS);
  }
}

function scoreBuyerProfile(product: ProductAlertInput, buyer: UserProfile): number {
  let score = 0;
  if (hasCategoryOverlap(product.category, buyer.interests)) score += 3;
  if (sameLooseLocation(product.district, buyer.district ?? buyer.city)) score += 1;
  return score;
}

function scoreBuyerRequest(product: ProductAlertInput, request: BuyerRequestRecord): number {
  let score = 0;
  if (sameLooseCategory(product.category, request.category)) score += 3;
  if (!request.category && includesAny(product.title, request.brief)) score += 2;
  if (sameLooseLocation(product.district, request.location)) score += 1;
  return score;
}

function hasCategoryOverlap(category?: string | null, interests?: string[]): boolean {
  if (!category || !interests?.length) return false;
  return interests.some((interest) => sameLooseCategory(category, interest) || interest === "All");
}

function sameLooseCategory(left?: string | null, right?: string | null): boolean {
  if (!left || !right) return false;
  const a = normalize(left);
  const b = normalize(right);
  return a === b || a.includes(b) || b.includes(a);
}

function sameLooseLocation(left?: string | null, right?: string | null): boolean {
  if (!left || !right) return false;
  const a = normalize(left);
  const b = normalize(right);
  return a === b || a.includes(b) || b.includes(a);
}

function includesAny(text?: string | null, query?: string | null): boolean {
  if (!text || !query) return false;
  const normalizedText = normalize(text);
  return normalize(query)
    .split(/\s+/)
    .filter((word) => word.length >= 4)
    .some((word) => normalizedText.includes(word));
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function formatSellerRequestAlert(request: BuyerRequestRecord): string {
  const lines = [`New buyer request near you`, ``];
  lines.push(`Request ${request.id}`);
  lines.push(`Item: ${request.brief}`);
  if (request.deliveryDate) lines.push(`Needed by: ${request.deliveryDate}`);
  if (request.location) lines.push(`Location: ${request.location}`);
  if (request.budgetMin && request.budgetMax) {
    lines.push(`Budget: Rs ${request.budgetMin} - Rs ${request.budgetMax}`);
  }
  lines.push("");
  lines.push("Reply BUYER REQUESTS in your bot menu to view and quote.");
  lines.push("Reply STOP REQUESTS to opt out of these alerts.");
  return lines.join("\n");
}

function formatBuyerProductAlert(product: ProductAlertInput): string {
  const lines = [`New product matched your interest`, ``];
  lines.push(product.title);
  if (product.category) lines.push(`Category: ${product.category}`);
  if (product.district) lines.push(`Location: ${product.district}`);
  if (product.price) lines.push(`Price: Rs ${product.price}`);
  if (product.artisan?.name) lines.push(`Seller: ${product.artisan.name}`);
  lines.push("");
  lines.push(`View: ${process.env.CLIENT_PUBLIC_WEB_URL || "http://localhost:3000"}/products/${product.id}`);
  lines.push("Reply MENU to buy or request something similar.");
  return lines.join("\n");
}
