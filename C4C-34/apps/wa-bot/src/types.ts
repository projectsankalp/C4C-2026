/**
 * Shared types for the WhatsApp bot.
 *
 * The session model is wide on purpose: every conversation flow we support
 * (identity, onboarding, role menus, product listing, orders, requests, quotes)
 * stores its working state inside the same `UserSession` so we never lose
 * context across messages, and so a single `state.ts` can manage the whole
 * universe of conversations keyed by phone number.
 *
 * Naming convention:
 *   - Top-level state machine values are SCREAMING_SNAKE_CASE.
 *   - Flow context bags use camelCase keys.
 *   - Anything user-visible lives in `messages/<lang>.ts`, never here.
 */

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export type Language = "en" | "hi" | "kn" | "ta" | "ml";

/** Roles a user can have on HastKala. A single user can be both buyer + seller. */
export type Role = "seller" | "buyer" | "sakhi";

// ---------------------------------------------------------------------------
// Conversation state machine
// ---------------------------------------------------------------------------

/**
 * Every distinct screen the bot can show. We keep the list flat (not nested)
 * so the engine's state-handler dispatch is a single switch statement and
 * BACK can pop a stack without recursion gymnastics.
 */
export type ConversationState =
  // ----- Identity flow -----
  | "GREETING"
  | "AWAITING_LANGUAGE"
  | "AWAITING_REPLY_MODE"
  | "AWAITING_ROLE"
  | "TUTORIAL"
  // ----- Seller community / certification gate -----
  | "SELLER_PRECHECK_NAME" // collect name before community link
  | "SELLER_PRECHECK_ADDRESS" // collect address
  | "SELLER_PRECHECK_CONTACT" // collect/confirm contact number
  | "SELLER_COMMUNITY_JOIN" // shown after pre-check: send community link
  | "SELLER_COMMUNITY_WAITING" // waiting for cohort completion; unlocked by backend
  | "SELLER_LOCKED_MENU" // locked menu shown until certified
  // ----- Seller onboarding (post-certification) -----
  | "SELLER_ONBOARD_NAME"
  | "SELLER_ONBOARD_DISTRICT"
  | "SELLER_ONBOARD_CRAFT"
  | "SELLER_ONBOARD_SHG_ASK"
  | "SELLER_ONBOARD_SHG_NAME"
  | "SELLER_ONBOARD_SAKHI_HELP"
  | "SELLER_ONBOARD_DONE"
  // ----- Buyer onboarding -----
  | "BUYER_ONBOARD_NAME"
  | "BUYER_ONBOARD_LOCATION"
  | "BUYER_ONBOARD_INTERESTS"
  | "BUYER_ONBOARD_DONE"
  // ----- Sakhi onboarding -----
  | "SAKHI_ONBOARD_NAME"
  | "SAKHI_ONBOARD_DISTRICT"
  | "SAKHI_ONBOARD_GROUPS"
  | "SAKHI_ONBOARD_DONE"
  // ----- Main menus -----
  | "SELLER_MENU"
  | "SELLER_MENU_MORE"
  | "BUYER_MENU"
  | "BUYER_MENU_MORE"
  | "SAKHI_MENU"
  | "SAKHI_MENU_MORE"
  // ----- Add product (seller) -----
  | "ADD_PRODUCT_PHOTOS"
  | "ADD_PRODUCT_DETAILS"
  | "ADD_PRODUCT_CONFIRM"
  | "ADD_PRODUCT_EDIT_PRICE"
  | "ADD_PRODUCT_EDIT_QUANTITY"
  | "ADD_PRODUCT_EDIT_TITLE"
  | "ADD_PRODUCT_EDIT_DESCRIPTION"
  // ----- My products / orders (seller) -----
  | "MY_PRODUCTS_LIST"
  | "MY_PRODUCTS_MANAGE"
  | "MY_PRODUCTS_EDIT_PRICE"
  | "MY_PRODUCTS_EDIT_STOCK"
  | "MY_PRODUCTS_EDIT_TITLE"
  | "MY_PRODUCTS_EDIT_DESC"
  | "ORDERS_LIST"
  | "ORDERS_MANAGE"
  // ----- Buyer browsing -----
  | "BROWSE_CATEGORIES"
  | "BROWSE_RESULTS"
  | "BROWSE_PRODUCT_DETAIL"
  | "BUYER_PURCHASE_DETAILS"
  | "BUYER_PURCHASE_CONFIRM"
  | "TRENDING_LIST"
  | "SEARCH_PROMPT"
  | "SEARCH_RESULTS"
  // ----- Buyer requests / seller quotes -----
  | "REQUEST_BRIEF"
  | "REQUEST_DELIVERY_DATE"
  | "REQUEST_LOCATION"
  | "REQUEST_BUDGET"
  | "REQUEST_CONFIRM"
  | "REQUEST_LIST"
  | "QUOTE_VIEW_INCOMING"
  | "QUOTE_PRICE"
  | "QUOTE_DELIVERY"
  | "QUOTE_NOTE"
  | "QUOTE_CONFIRM"
  | "QUOTE_BROWSE"
  // ----- Sakhi flows -----
  | "SAKHI_PENDING_LIST"
  | "SAKHI_PENDING_DETAIL"
  | "SAKHI_VERIFY_SELLER_LIST"
  // ----- Generic -----
  | "ERROR";

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * Per-flow scratchpads. Each flow stuffs only its own fields here so the
 * shared session stays clean. When a flow exits cleanly (CONFIRM / CANCEL)
 * we delete its slice.
 */
export interface SessionContext {
  // Add product flow
  addProduct?: {
    photos: string[];
    rawDetails?: string;
    extracted?: ExtractedFacts;
    title?: string;
    price?: number | null;
    quantity?: number | null;
    material?: string | null;
    category?: string | null;
    description?: string | null;
    shortDescription?: string | null;
    tags?: string[];
    careInstructions?: string | null;
  };

  // Manage existing product flow
  manageProduct?: {
    productId?: string;
    productList?: Array<{
      id: string;
      title: string;
      price: number;
      quantity: number;
      status: string;
    }>;
  };

  // Orders flow (seller side)
  orders?: {
    orderList?: Array<{
      id: string;
      productTitle: string;
      status: string;
      amount: number;
      buyerCity?: string;
    }>;
    selectedOrderId?: string;
  };

  // Browse / search flow (buyer side)
  browse?: {
    category?: string;
    results?: Array<{
      id: string;
      title: string;
      price: number;
      artisanName?: string;
      district?: string;
    }>;
    selectedProductId?: string;
  };

  // Buyer request flow
  request?: {
    brief?: string;
    deliveryDate?: string;
    location?: string;
    budgetMin?: number;
    budgetMax?: number;
    category?: string;
    quantity?: number;
    requestId?: string;
  };

  // Seller quote flow
  quote?: {
    requestId?: string;
    requestBrief?: string;
    price?: number;
    deliveryNote?: string;
    quoteNote?: string;
    quoteId?: string;
  };

  // View incoming quotes (buyer side)
  viewQuotes?: {
    requestId?: string;
    quotes?: Array<{ id: string; sellerName: string; price: number; deliveryNote?: string }>;
    selectedQuoteId?: string;
  };

  // Voice transcription confirmation pending
  voiceConfirm?: {
    text: string;
    state: string;
  };

  // Buyer purchase flow
  purchase?: {
    productId?: string;
    productTitle?: string;
    productPrice?: number;
    sellerPhone?: string;
    sellerName?: string;
    buyerName?: string;
    buyerAddress?: string;
    buyerPhone?: string;
  };
}

export interface UserSession {
  /** Phone number, normalized digits only (e.g. "919876543210"). */
  phone: string;

  // ----- Identity (set during first-time setup) -----
  language: Language;
  /**
   * How replies should be delivered.
   *   "text"   — only WhatsApp text bubbles
   *   "voice"  — voice notes (text bubble still arrives as fallback)
   *   "both"   — both (default)
   */
  voicePreference?: "text" | "voice" | "both";
  role?: Role;
  /** Preferred reply format: text only, voice only, or both. */
  replyMode?: "text" | "voice" | "both";
  /** All roles this user has, so we can offer "Switch role". */
  roles: Role[];
  onboardingComplete: boolean;

  // ----- Lightweight profile cache (canonical copy lives in backend DB) -----
  name?: string;
  district?: string;
  craftCategory?: string;
  shgName?: string;
  interests?: string[];

  /** Full postal address (collected pre-community). */
  address?: string;
  /** Contact number (defaults to phone, but seller can give a different one). */
  contactNumber?: string;

  // ----- Certification gate (sellers only) -----
  /** Whether this seller has completed the 7-day community cohort and holds a certificate. */
  isCertified?: boolean;

  // ----- Conversation -----
  state: ConversationState;
  /** History stack so BACK can pop one level. Capped at 10 entries. */
  stateStack: ConversationState[];
  /** Per-flow scratchpad. */
  context: SessionContext;

  // ----- Operational -----
  /** How many times in a row we couldn't parse the user's reply in this state. */
  unparseableCount: number;
  /** Whether they've seen the consent line. */
  consentGiven: boolean;
  /** Last-touched epoch ms, for stale-session cleanup. */
  lastMessageAt: number;
  /** Recent message history for AI context (max 20). */
  messageHistory?: Array<{ role: "user" | "bot"; text: string; ts: number }>;
  /**
   * User typed EXIT / QUIT / BYE. We keep their profile + language but go
   * silent until they greet again (HI / HELLO / NAMASTE). Cleared on the
   * next start trigger.
   */
  exited?: boolean;
}

// ---------------------------------------------------------------------------
// AI: extract-only facts (NO fabrication)
// ---------------------------------------------------------------------------

/**
 * What the AI returns from a raw artisan message + photo. Every field is
 * nullable. Null means "the artisan didn't say this — ASK them, don't guess."
 */
export interface ExtractedFacts {
  title: string | null;
  price: number | null;
  quantity: number | null;
  material: string | null;
  category: string | null;
  /** Per-field confidence 0-1. We prompt for any field below 0.5. */
  confidence: {
    title: number;
    price: number;
    quantity: number;
    material: number;
    category: number;
  };
}

/** Output of the second AI call, run AFTER the user confirms facts. */
export interface PolishedListing {
  description: string;
  shortDescription: string;
  tags: string[];
  careInstructions: string;
}

// ---------------------------------------------------------------------------
// Incoming + outgoing messages (transport-agnostic)
// ---------------------------------------------------------------------------

export interface IncomingMessage {
  phone: string;
  body: string;
  hasImage: boolean;
  hasAudio: boolean;
  imageUrl?: string;
  imageBuffer?: Buffer;
  imageMimetype?: string;
  audioBuffer?: Buffer;
  audioMimetype?: string;
  source: "whatsapp" | "simulator";
}

export interface OutgoingReply {
  text: string;
  state: ConversationState;
  /** Optional media to attach (video tutorial, product image preview, etc.). */
  media?: {
    url: string;
    type: "image" | "video" | "document";
    caption?: string;
  };
  /**
   * Optional TTS voice note generated alongside the text. Set by the engine
   * after dispatch (so individual flow handlers don't need to think about it).
   */
  voice?: {
    buffer: Buffer;
    mimetype: string;
  };
  /**
   * In-flight voice synthesis. The engine sets this to a fire-and-forget
   * Promise so the handler can send the text bubble FIRST (fast) and then
   * await the voice in a second pass without blocking the user.
   */
  voicePromise?: Promise<{ buffer: Buffer; mimetype: string } | null>;
  /** Useful for tests / simulator UI. */
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Order alerts (called by Person 4 backend → bot)
// ---------------------------------------------------------------------------

export interface OrderAlertPayload {
  to: string;
  productTitle: string;
  quantity: number;
  amount: number;
  buyerCity?: string;
  buyerName?: string;
  orderId?: string;
}

// ---------------------------------------------------------------------------
// Backend response envelope
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { message: string; code?: string };
}

// ---------------------------------------------------------------------------
// Product / order types we surface to the user via WhatsApp
// ---------------------------------------------------------------------------

export interface ProductDraftRequest {
  phone: string;
  artisanName?: string;
  message: string;
  imageUrl?: string;
  district?: string;
  language?: Language;
  craftType?: string;
  source: "whatsapp" | "simulator";
  /** Pre-extracted slots, sent to backend so it doesn't re-extract. */
  prefilled?: {
    title?: string;
    price?: number;
    quantity?: number;
    material?: string;
    category?: string;
    description?: string;
    tags?: string[];
    careInstructions?: string;
  };
}

export interface ProductDraftResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  status: "pending_approval" | "approved" | "rejected" | "draft" | "sold_out";
  category?: string;
  imageUrl?: string;
  approvalUrl?: string;
  publicUrl?: string;
  artisan?: {
    id: string;
    name?: string;
    phone?: string;
    district?: string;
    isVerified?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Simulator types (for the browser fallback)
// ---------------------------------------------------------------------------

export interface SimulatorReply {
  reply: string;
  state: ConversationState;
}
