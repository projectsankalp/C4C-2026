/**
 * Add Product flow.
 *
 * States:
 *   ADD_PRODUCT_PHOTOS      → user sends 1-3 photos, then DONE (or caption shortcut)
 *   ADD_PRODUCT_DETAILS     → user types/voices product details
 *                              (we extract slots; ask for any missing)
 *   ADD_PRODUCT_CONFIRM     → preview shown, user confirms or edits a field
 *   ADD_PRODUCT_EDIT_*      → field-edit micro-states
 *
 * Critical rules:
 *   - We NEVER fabricate slots. Missing → ask the user.
 *   - Caption-with-photo short-circuits to DETAILS in one turn.
 *   - Backend draft creation happens ONLY at CONFIRM time, with all slots locked in.
 */
import type { ExtractedFacts, IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { clearContext, mainMenuFor, transition, updateSession } from "../state";
import {
  isDoneCommand,
  isCancelCommand,
  parseInteger,
  parsePriceReply,
  parseMenuChoice,
} from "../../utils/text";
import { extractFacts, missingFields } from "../../services/extractService";
import { transcribeAudio } from "./transcribe";
import { createProductDraft } from "../../services/productService";
import { log } from "../../utils/logger";

const MAX_PHOTOS = 3;

// ---------------------------------------------------------------------------
// State: ADD_PRODUCT_PHOTOS
// ---------------------------------------------------------------------------

export async function handleAddProductPhotos(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const ap = s.context.addProduct ?? { photos: [] };

  if (isCancelCommand(msg.body)) {
    return cancelAddProduct(s);
  }

  // ---- Image arrived ----
  if (msg.hasImage && msg.imageUrl) {
    const photos = [...ap.photos, msg.imageUrl];
    const trimmed = photos.slice(0, MAX_PHOTOS);

    // Caption-with-photo: short-circuit to extraction.
    if (msg.body && msg.body.trim().length >= 5) {
      const extracted = await extractFacts({
        message: msg.body,
        language: s.language,
        district: s.district,
        craftType: s.craftCategory,
      });
      updateSession(s.phone, {
        context: {
          addProduct: {
            ...ap,
            photos: trimmed,
            rawDetails: msg.body,
            extracted,
            title: extracted.title ?? undefined,
            price: extracted.price ?? undefined,
            quantity: extracted.quantity ?? undefined,
            material: extracted.material ?? undefined,
            category: extracted.category ?? undefined,
          },
        },
      });
      return askForMissingOrConfirm(s);
    }

    updateSession(s.phone, { context: { addProduct: { ...ap, photos: trimmed } } });
    if (trimmed.length >= MAX_PHOTOS) {
      return [{ text: m.addProductMaxPhotos(), state: "ADD_PRODUCT_PHOTOS" }];
    }
    return [
      { text: m.addProductPhotoReceived(trimmed.length, MAX_PHOTOS), state: "ADD_PRODUCT_PHOTOS" },
    ];
  }

  // ---- DONE → move to details ----
  if (isDoneCommand(msg.body)) {
    if (ap.photos.length === 0) {
      return [{ text: m.addProductPhotosNeedFirst(), state: "ADD_PRODUCT_PHOTOS" }];
    }
    transition(s.phone, "ADD_PRODUCT_DETAILS");
    return [{ text: m.addProductAskDetails(), state: "ADD_PRODUCT_DETAILS" }];
  }

  // ---- Anything else → remind to send photo first ----
  return [{ text: m.addProductPhotosNeedFirst(), state: "ADD_PRODUCT_PHOTOS" }];
}

// ---------------------------------------------------------------------------
// State: ADD_PRODUCT_DETAILS (text or voice)
// ---------------------------------------------------------------------------

export async function handleAddProductDetails(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelAddProduct(s);

  const ap = s.context.addProduct ?? { photos: [] };

  let detailsText = (msg.body || "").trim();

  // Voice path
  if (msg.hasAudio && !detailsText) {
    const transcript = await transcribeAudio({
      audioBuffer: msg.audioBuffer,
      mimetype: msg.audioMimetype,
      language: s.language,
      contextHint: ap.rawDetails,
    });
    detailsText = transcript.text;
    log.info("ADD_PRODUCT_VOICE_TRANSCRIBED", {
      source: transcript.source,
      lang: transcript.language,
      len: detailsText.length,
    });
  }

  if (!detailsText) {
    return [
      {
        text: "Please send the product details as text or a voice note.",
        state: "ADD_PRODUCT_DETAILS",
      },
    ];
  }

  // Pre-creation acknowledgment
  const replies: OutgoingReply[] = [{ text: m.addProductCreating(), state: "ADD_PRODUCT_DETAILS" }];

  const extracted = await extractFacts({
    message: detailsText,
    language: s.language,
    district: s.district,
    craftType: s.craftCategory,
  });

  updateSession(s.phone, {
    context: {
      addProduct: {
        ...ap,
        rawDetails: detailsText,
        extracted,
        title: extracted.title ?? ap.title,
        price: extracted.price ?? ap.price,
        quantity: extracted.quantity ?? ap.quantity,
        material: extracted.material ?? ap.material,
        category: extracted.category ?? ap.category,
      },
    },
  });

  return [...replies, ...(await askForMissingOrConfirm(getCurrentSession(s)))];
}

// ---------------------------------------------------------------------------
// Slot prompting (ask for missing fields one at a time, then preview)
// ---------------------------------------------------------------------------

async function askForMissingOrConfirm(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const ap = s.context.addProduct ?? { photos: [] };

  const facts: ExtractedFacts = {
    title: ap.title ?? null,
    price: ap.price ?? null,
    quantity: ap.quantity ?? null,
    material: ap.material ?? null,
    category: ap.category ?? null,
    confidence: ap.extracted?.confidence ?? {
      title: ap.title ? 0.7 : 0,
      price: ap.price !== undefined && ap.price !== null ? 1 : 0,
      quantity: ap.quantity !== undefined && ap.quantity !== null ? 1 : 0,
      material: 0.5,
      category: 0.5,
    },
  };

  const missing = missingFields(facts);

  if (missing.includes("title")) {
    transition(s.phone, "ADD_PRODUCT_EDIT_TITLE", {
      context: { addProduct: { ...ap, _slotPrompt: "title" } as any },
    });
    return [{ text: m.addProductMissingTitle(), state: "ADD_PRODUCT_EDIT_TITLE" }];
  }
  if (missing.includes("price")) {
    transition(s.phone, "ADD_PRODUCT_EDIT_PRICE", {
      context: { addProduct: { ...ap, _slotPrompt: "price" } as any },
    });
    return [{ text: m.addProductMissingPrice(), state: "ADD_PRODUCT_EDIT_PRICE" }];
  }
  if (missing.includes("quantity")) {
    transition(s.phone, "ADD_PRODUCT_EDIT_QUANTITY", {
      context: { addProduct: { ...ap, _slotPrompt: "quantity" } as any },
    });
    return [{ text: m.addProductMissingQuantity(), state: "ADD_PRODUCT_EDIT_QUANTITY" }];
  }

  // All three core slots present → show preview
  transition(s.phone, "ADD_PRODUCT_CONFIRM");
  return [
    {
      text: m.addProductDraftPreview({
        title: ap.title!,
        price: ap.price!,
        quantity: ap.quantity!,
        material: ap.material ?? undefined,
        category: ap.category ?? undefined,
        description: ap.description ?? undefined,
        photos: ap.photos.length,
      }),
      state: "ADD_PRODUCT_CONFIRM",
    },
  ];
}

// ---------------------------------------------------------------------------
// Edit-field states (price, quantity, title, description)
//
// These serve dual purpose:
//   1. Asked DURING the slot-fill flow (when a slot was missing).
//   2. Asked from the CONFIRM screen if the user picks "Edit ...".
// ---------------------------------------------------------------------------

export async function handleAddProductEditPrice(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelAddProduct(s);
  const price = parsePriceReply(msg.body);
  if (!price) {
    return [{ text: m.addProductAskNewPrice(), state: "ADD_PRODUCT_EDIT_PRICE" }];
  }
  const ap = s.context.addProduct ?? { photos: [] };
  updateSession(s.phone, { context: { addProduct: { ...ap, price } } });

  // From slot-fill flow: continue to next missing slot or preview.
  // From CONFIRM edit flow: jump back to confirm.
  return continueAfterSlotEdit(getCurrentSession(s), m.addProductPriceUpdated(price));
}

export async function handleAddProductEditQuantity(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelAddProduct(s);
  const qty = parseInteger(msg.body);
  if (qty === null || qty === 0) {
    return [{ text: m.addProductAskNewQuantity(), state: "ADD_PRODUCT_EDIT_QUANTITY" }];
  }
  const ap = s.context.addProduct ?? { photos: [] };
  updateSession(s.phone, { context: { addProduct: { ...ap, quantity: qty } } });
  return continueAfterSlotEdit(getCurrentSession(s), m.addProductQuantityUpdated(qty));
}

export async function handleAddProductEditTitle(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelAddProduct(s);
  const title = (msg.body || "").trim();
  if (title.length < 2 || title.length > 100) {
    return [{ text: m.addProductAskNewTitle(), state: "ADD_PRODUCT_EDIT_TITLE" }];
  }
  const ap = s.context.addProduct ?? { photos: [] };
  updateSession(s.phone, { context: { addProduct: { ...ap, title } } });
  return continueAfterSlotEdit(getCurrentSession(s), m.addProductTitleUpdated(title));
}

export async function handleAddProductEditDescription(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelAddProduct(s);
  const description = (msg.body || "").trim();
  if (description.length < 10) {
    return [{ text: m.addProductAskNewDescription(), state: "ADD_PRODUCT_EDIT_DESCRIPTION" }];
  }
  const ap = s.context.addProduct ?? { photos: [] };
  updateSession(s.phone, { context: { addProduct: { ...ap, description } } });
  return [
    { text: m.addProductDescriptionUpdated(), state: "ADD_PRODUCT_CONFIRM" },
    ...(await jumpBackToConfirm(getCurrentSession(s))),
  ];
}

/**
 * After a slot edit:
 *   - If we were in slot-fill flow (came here from a missing-slot prompt),
 *     check if more slots are missing or proceed to preview.
 *   - If we were in confirm-edit flow, return to preview.
 */
async function continueAfterSlotEdit(s: UserSession, ackText: string): Promise<OutgoingReply[]> {
  const ap = s.context.addProduct ?? { photos: [] };
  const wasSlotPrompt = (ap as any)._slotPrompt;

  if (wasSlotPrompt) {
    // Clear the marker
    updateSession(s.phone, { context: { addProduct: { ...ap, _slotPrompt: undefined } as any } });
    return [
      { text: ackText, state: "ADD_PRODUCT_DETAILS" },
      ...(await askForMissingOrConfirm(getCurrentSession(s))),
    ];
  }

  return [{ text: ackText, state: "ADD_PRODUCT_CONFIRM" }, ...(await jumpBackToConfirm(s))];
}

async function jumpBackToConfirm(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const ap = s.context.addProduct ?? { photos: [] };
  transition(s.phone, "ADD_PRODUCT_CONFIRM");
  return [
    {
      text: m.addProductDraftPreview({
        title: ap.title || "Untitled",
        price: ap.price || 0,
        quantity: ap.quantity || 1,
        material: ap.material ?? undefined,
        category: ap.category ?? undefined,
        description: ap.description ?? undefined,
        photos: ap.photos.length,
      }),
      state: "ADD_PRODUCT_CONFIRM",
    },
  ];
}

// ---------------------------------------------------------------------------
// State: ADD_PRODUCT_CONFIRM
// ---------------------------------------------------------------------------

export async function handleAddProductConfirm(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  if (isCancelCommand(msg.body)) return cancelAddProduct(s);

  const choice = parseMenuChoice(msg.body, 6);
  if (!choice) {
    return [{ text: m.invalidChoice(), state: "ADD_PRODUCT_CONFIRM" }];
  }

  switch (choice) {
    case 1:
      return submitDraft(s);
    case 2:
      transition(s.phone, "ADD_PRODUCT_EDIT_PRICE");
      return [{ text: m.addProductAskNewPrice(), state: "ADD_PRODUCT_EDIT_PRICE" }];
    case 3:
      transition(s.phone, "ADD_PRODUCT_EDIT_QUANTITY");
      return [{ text: m.addProductAskNewQuantity(), state: "ADD_PRODUCT_EDIT_QUANTITY" }];
    case 4:
      transition(s.phone, "ADD_PRODUCT_EDIT_TITLE");
      return [{ text: m.addProductAskNewTitle(), state: "ADD_PRODUCT_EDIT_TITLE" }];
    case 5:
      transition(s.phone, "ADD_PRODUCT_EDIT_DESCRIPTION");
      return [{ text: m.addProductAskNewDescription(), state: "ADD_PRODUCT_EDIT_DESCRIPTION" }];
    case 6:
      return cancelAddProduct(s);
  }

  return [{ text: m.invalidChoice(), state: "ADD_PRODUCT_CONFIRM" }];
}

async function submitDraft(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const ap = s.context.addProduct ?? { photos: [] };

  if (!ap.title || !ap.price || !ap.quantity) {
    // Defensive: shouldn't happen because we gate on slot-fill, but handle it.
    return askForMissingOrConfirm(s);
  }

  // Build the message we send to the backend. We include both the original
  // raw text (for AI polishing of description/tags) AND prefilled slots so
  // the backend doesn't re-fabricate.
  const message = ap.rawDetails ?? `${ap.title}, ₹${ap.price}, ${ap.quantity} pieces`;

  try {
    const draft = await createProductDraft({
      phone: s.phone,
      message,
      imageUrl: ap.photos[0],
      district: s.district,
      language: s.language,
      craftType: s.craftCategory,
      artisanName: s.name,
      source: "whatsapp",
      prefilled: {
        title: ap.title,
        price: ap.price,
        quantity: ap.quantity,
        material: ap.material ?? undefined,
        category: ap.category ?? undefined,
        description: ap.description ?? undefined,
      },
    });

    // Clear the flow scratchpad and drop into seller menu.
    clearContext(s.phone);
    transition(s.phone, mainMenuFor(s.role));

    return [{ text: m.addProductSubmitted(draft.approvalUrl), state: "SELLER_MENU" }];
  } catch (error: any) {
    log.error("ADD_PRODUCT_SUBMIT_FAILED", { message: error?.message });
    return [{ text: m.errorBackend(), state: "ADD_PRODUCT_CONFIRM" }];
  }
}

function cancelAddProduct(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  clearContext(s.phone);
  transition(s.phone, mainMenuFor(s.role));
  return [{ text: m.addProductCancelled(), state: "SELLER_MENU" }];
}

/**
 * Helper: get the latest session from the store. Call sites mutate state
 * mid-handler, so we re-read before passing to the next step.
 */
function getCurrentSession(s: UserSession): UserSession {
  // Lazy import to avoid circular dep
  const { getSession } = require("../state");
  return getSession(s.phone);
}
