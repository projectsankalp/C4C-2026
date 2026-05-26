/**
 * Backend service: product draft creation.
 *
 * Speaks to Person 4's `POST /api/products/draft`. We pre-extract the slots
 * in the bot (extractService.ts) and pass them as `prefilled` so the backend
 * doesn't have to re-extract — and never has to default-fill missing fields.
 *
 * Always returns a usable ProductDraftResponse — falls back to a synthetic
 * draft when `useMockDraft=true`. Otherwise the error is surfaced to the
 * caller so the bot can ask the user to retry.
 */
import { api } from "./apiClient";
import { config } from "../config";
import { log } from "../utils/logger";
import { retry } from "../utils/retry";
import { extractPrice, extractQuantity } from "../utils/text";
import type { ApiEnvelope, ProductDraftRequest, ProductDraftResponse } from "../types";

export async function createProductDraft(
  input: ProductDraftRequest,
): Promise<ProductDraftResponse> {
  if (config.useMockDraft) {
    log.warn("PRODUCT_DRAFT_MOCK", { reason: "USE_MOCK_DRAFT=true" });
    return synthesizeDraft(input);
  }

  try {
    const response = await retry(
      () => api.post<ApiEnvelope<ProductDraftResponse>>("/api/products/draft", input),
      {
        attempts: 3,
        baseDelayMs: 300,
        onAttempt: (attempt, error: any) => {
          log.warn("PRODUCT_DRAFT_RETRY", { attempt, summary: error?.summary });
        },
      },
    );

    const envelope = response.data;
    const draft: ProductDraftResponse | undefined =
      (envelope as any).data ?? (envelope as unknown as ProductDraftResponse);

    if (!draft || !draft.id) {
      throw new Error("Backend returned an empty draft response");
    }

    log.info("PRODUCT_DRAFT_SUCCESS", {
      productId: draft.id,
      status: draft.status,
      price: draft.price,
    });

    return draft;
  } catch (error: any) {
    log.error("PRODUCT_DRAFT_FAILED", {
      summary: error?.summary,
      message: error?.message,
    });
    throw error;
  }
}

/**
 * Offline draft synthesizer. Used when `USE_MOCK_DRAFT=true` or when the
 * backend is unreachable AND we still want the demo to keep moving.
 *
 * IMPORTANT: this is offline-only. It still respects the "no fabrication"
 * rule for facts the user explicitly provided (price, quantity from `prefilled`).
 */
export function synthesizeDraft(input: ProductDraftRequest): ProductDraftResponse {
  const prefilled = input.prefilled ?? {};
  const price = prefilled.price ?? extractPrice(input.message) ?? 0;
  const quantity = prefilled.quantity ?? extractQuantity(input.message) ?? 1;
  const title = prefilled.title ?? deriveTitle(input.message);
  const category = prefilled.category ?? "Handmade Crafts";
  const description =
    prefilled.description ??
    `A handmade ${title.toLowerCase()} crafted by women artisans${
      input.district ? ` from ${input.district}` : ""
    }. Submitted via WhatsApp for Karigar Sakhi review.`;

  const id = `demo_${Date.now().toString(36)}`;
  return {
    id,
    title,
    description,
    price,
    quantity,
    category,
    status: "pending_approval",
    imageUrl: input.imageUrl,
    approvalUrl: `${config.vendorWebUrl}/products/${id}`,
    publicUrl: `${config.publicWebUrl}/products/${id}`,
    artisan: {
      id: `demo_artisan_${input.phone.slice(-4)}`,
      phone: input.phone,
      name: input.artisanName,
      district: input.district,
      isVerified: false,
    },
  };
}

function deriveTitle(message: string): string {
  const lower = (message || "").toLowerCase();
  if (lower.includes("lamp")) return "Handmade Coconut Shell Lamp";
  if (lower.includes("bag") || lower.includes("tote")) return "Handmade Artisan Bag";
  if (lower.includes("saree") || lower.includes("dupatta") || lower.includes("kurti"))
    return "Handcrafted Textile";
  if (lower.includes("basket")) return "Handwoven Basket";
  if (lower.includes("diya")) return "Terracotta Diya Set";
  if (lower.includes("jewel") || lower.includes("necklace") || lower.includes("earring")) {
    return "Handmade Beaded Jewellery";
  }
  return "Handmade Artisan Product";
}
