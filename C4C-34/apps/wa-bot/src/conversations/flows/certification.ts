/**
 * Seller Certification / Community Gate flow.
 *
 * NEW pre-check flow:
 *
 *   AWAITING_ROLE → seller →
 *
 *   1. SELLER_PRECHECK_NAME    → ask full name
 *   2. SELLER_PRECHECK_ADDRESS → ask full address
 *   3. SELLER_PRECHECK_CONTACT → ask contact number (or SAME for WhatsApp number)
 *   4. SELLER_COMMUNITY_JOIN   → send community link + "rep will contact you"
 *   5. SELLER_COMMUNITY_WAITING → wait for cert
 *   6. AUTO-UNLOCK on POST /certify (called by community team)
 *        → cert PDF + congrats + drop into seller menu (no more onboarding —
 *          we already have name/address/contact)
 *
 * Locked menu path:
 *   Non-certified sellers who reach SELLER_MENU get SELLER_LOCKED_MENU
 *   which lets them browse as buyers while waiting.
 */
import { config } from "../../config";
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { getSession, transition, updateSession, markOnboarded } from "../state";
import { saveProfile } from "../../services/userService";
import { joinCohort } from "../../services/communityService";
import { normalizeText } from "../../utils/text";

// ---------------------------------------------------------------------------
// State: SELLER_PRECHECK_NAME — collect full name before sending community link
// ---------------------------------------------------------------------------

export async function handleSellerPrecheckName(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const name = (msg.body || "").trim();

  if (!isPlausibleName(name)) {
    return [{ text: m.sellerPrecheckName(), state: "SELLER_PRECHECK_NAME" }];
  }

  updateSession(s.phone, { name });
  transition(s.phone, "SELLER_PRECHECK_ADDRESS");
  return [{ text: m.sellerPrecheckAddress(), state: "SELLER_PRECHECK_ADDRESS" }];
}

// ---------------------------------------------------------------------------
// State: SELLER_PRECHECK_ADDRESS — collect full postal address
// ---------------------------------------------------------------------------

export async function handleSellerPrecheckAddress(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const address = (msg.body || "").trim();

  if (address.length < 8) {
    return [{ text: m.sellerPrecheckAddress(), state: "SELLER_PRECHECK_ADDRESS" }];
  }

  // Try to extract a district hint from the address (last 2-3 comma-separated parts)
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const district = parts.length >= 2 ? parts[parts.length - 2] : undefined;

  updateSession(s.phone, { address, district });
  transition(s.phone, "SELLER_PRECHECK_CONTACT");
  return [{ text: m.sellerPrecheckContact(s.phone), state: "SELLER_PRECHECK_CONTACT" }];
}

// ---------------------------------------------------------------------------
// State: SELLER_PRECHECK_CONTACT — collect/confirm contact number
// ---------------------------------------------------------------------------

export async function handleSellerPrecheckContact(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const text = (msg.body || "").trim();

  let contactNumber: string;
  if (normalizeText(text) === "same" || text === "0" || text === "") {
    contactNumber = s.phone;
  } else {
    // Extract digits only — allow user to type "+91 9876543210" etc.
    const digits = text.replace(/\D/g, "");
    if (digits.length < 10) {
      return [{ text: m.sellerPrecheckContact(s.phone), state: "SELLER_PRECHECK_CONTACT" }];
    }
    contactNumber = digits;
  }

  updateSession(s.phone, { contactNumber });

  // Persist all collected fields to backend so the community rep / Sakhi
  // dashboard can see the lead immediately.
  saveProfile(s.phone, {
    name: s.name,
    address: s.address,
    contactNumber,
    district: s.district,
    role: "seller",
    roles: s.roles.includes("seller") ? s.roles : [...s.roles, "seller"],
  } as any).catch(() => undefined);

  // Also create a `community_members` row so the seller appears in the
  // /admin Members tab as pending. Without this the admin has nothing to
  // approve. Best-effort — never blocks the user mid-flow.
  joinCohort({
    phone: s.phone,
    name: s.name || "Seller",
    district: s.district,
    craftCategory: s.craftCategory,
    language: s.language,
  }).catch(() => undefined);

  transition(s.phone, "SELLER_COMMUNITY_JOIN");

  return [
    {
      text: m.sellerCommunityJoin(config.sellerCommunityLink),
      state: "SELLER_COMMUNITY_JOIN",
    },
  ];
}

// ---------------------------------------------------------------------------
// State: SELLER_COMMUNITY_JOIN — link sent, waiting for cert
// (no JOINED command anymore — rep contacts them directly)
// ---------------------------------------------------------------------------

export async function handleSellerCommunityJoin(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const text = normalizeText(msg.body);

  // Already certified (e.g. returning user hydrated from backend)
  if (s.isCertified) {
    return startSellerOnboarding(s);
  }

  // BROWSE / SEARCH → let them shop while waiting
  if (text === "browse") {
    transition(s.phone, "BROWSE_CATEGORIES");
    return [{ text: m.browseAskCategory(), state: "BROWSE_CATEGORIES" }];
  }
  if (text === "search") {
    transition(s.phone, "SEARCH_PROMPT");
    return [{ text: m.searchPrompt(), state: "SEARCH_PROMPT" }];
  }

  // JOIN → re-send link
  if (text === "join") {
    return [
      {
        text: m.sellerCommunityJoin(config.sellerCommunityLink),
        state: "SELLER_COMMUNITY_JOIN",
      },
    ];
  }

  // Anything else → keep them in waiting mode, remind them what to do
  transition(s.phone, "SELLER_COMMUNITY_WAITING");
  return [{ text: m.sellerCommunityAlreadyJoined(), state: "SELLER_COMMUNITY_WAITING" }];
}

// ---------------------------------------------------------------------------
// State: SELLER_COMMUNITY_WAITING — waiting for the community team to certify
// ---------------------------------------------------------------------------

export async function handleSellerCommunityWaiting(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const text = normalizeText(msg.body);

  if (s.isCertified) {
    return startSellerOnboarding(s);
  }

  if (text === "join") {
    return [
      {
        text: m.sellerCommunityJoin(config.sellerCommunityLink),
        state: "SELLER_COMMUNITY_WAITING",
      },
    ];
  }

  if (text === "browse") {
    transition(s.phone, "BROWSE_CATEGORIES");
    return [{ text: m.browseAskCategory(), state: "BROWSE_CATEGORIES" }];
  }
  if (text === "search") {
    transition(s.phone, "SEARCH_PROMPT");
    return [{ text: m.searchPrompt(), state: "SEARCH_PROMPT" }];
  }

  // Switch to buyer mode
  if (text === "3" || text === "buyer" || text === "buyer mode") {
    const roles: import("../../types").Role[] = s.roles.includes("buyer") ? s.roles : [...s.roles, "buyer"];
    updateSession(s.phone, { role: "buyer", roles });
    transition(s.phone, "BUYER_MENU");
    const banner = s.language === "hi"
      ? `🛍️ *आप अब खरीदार मोड में हैं।*\n\n_विक्रेता मोड पर वापस जाने के लिए *SELLER* लिखें।_`
      : s.language === "kn"
        ? `🛍️ *ನೀವು ಈಗ ಖರೀದಿದಾರ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ.*\n\n_ಮಾರಾಟಗಾರ ಮೋಡ್‌ಗೆ ಮರಳಲು *SELLER* ಬರೆಯಿರಿ._`
        : `🛍️ *You're now in Buyer mode.*\n\n_Reply *SELLER* anytime to switch back._`;
    return [
      { text: banner, state: "BUYER_MENU" },
      { text: m.buyerMenu(s.name || ""), state: "BUYER_MENU" },
    ];
  }

  return [{ text: m.sellerCommunityWaiting(), state: "SELLER_COMMUNITY_WAITING" }];
}

// ---------------------------------------------------------------------------
// State: SELLER_LOCKED_MENU — non-certified seller hit the seller menu
// ---------------------------------------------------------------------------

export async function handleSellerLockedMenu(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const text = normalizeText(msg.body);

  if (s.isCertified) {
    return startSellerOnboarding(s);
  }

  if (text === "join") {
    transition(s.phone, "SELLER_COMMUNITY_JOIN");
    return [
      {
        text: m.sellerCommunityJoin(config.sellerCommunityLink),
        state: "SELLER_COMMUNITY_JOIN",
      },
    ];
  }

  if (text === "browse") {
    transition(s.phone, "BROWSE_CATEGORIES");
    return [{ text: m.browseAskCategory(), state: "BROWSE_CATEGORIES" }];
  }

  if (text === "search") {
    transition(s.phone, "SEARCH_PROMPT");
    return [{ text: m.searchPrompt(), state: "SEARCH_PROMPT" }];
  }

  return [{ text: m.sellerLockedMenu(), state: "SELLER_LOCKED_MENU" }];
}

// ---------------------------------------------------------------------------
// Auto-unlock: called by internalServer when backend certifies a seller
// ---------------------------------------------------------------------------

export interface UnlockMessage {
  text: string;
  mediaUrl?: string;
  mediaType?: "document" | "image";
  mediaCaption?: string;
}

/**
 * Called by internalServer.ts when POST /certify is received.
 *
 * Because we already collected name/address/contact in the pre-check, we go
 * straight to a polished welcome + cert PDF + seller menu. No more
 * SELLER_ONBOARD_* questions on this path.
 */
export function handleCertificationUnlock(phone: string, certPdfUrl?: string): UnlockMessage[] {
  const session = getSession(phone);
  const m = getMessages(session.language);
  const name = session.name || "";

  // Mark certified + onboarded (we have everything we need from pre-check)
  updateSession(phone, { isCertified: true });
  markOnboarded(phone, {});

  // Persist to backend
  saveProfile(phone, {
    isCertified: true,
    onboardingComplete: true,
    role: "seller",
    roles: session.roles.includes("seller") ? session.roles : [...session.roles, "seller"],
    name: session.name,
    address: session.address,
    contactNumber: session.contactNumber,
    district: session.district,
  } as any).catch(() => undefined);

  const messages: UnlockMessage[] = [];

  // 1. Congrats + unlock
  messages.push({ text: m.sellerCertUnlocked(name) });

  // 2. Certificate (PDF or text fallback)
  const pdfUrl = certPdfUrl || config.defaultCertificatePdfUrl;
  if (pdfUrl) {
    messages.push({
      text: m.sellerCertPdfCaption(name),
      mediaUrl: pdfUrl,
      mediaType: "document",
      mediaCaption: `HastKala Seller Certificate — ${name || phone}`,
    });
  } else {
    messages.push({ text: m.sellerCertTextFallback(name) });
  }

  // 3. Drop them into the seller menu — they're fully onboarded now
  transition(phone, "SELLER_MENU");
  messages.push({ text: m.sellerMenu(name) });

  return messages;
}

// ---------------------------------------------------------------------------
// Helper: resume seller onboarding after certification (returning users)
// ---------------------------------------------------------------------------

export function startSellerOnboarding(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  const name = s.name || "";

  transition(s.phone, "SELLER_MENU");
  return [
    { text: m.sellerCertUnlocked(name), state: "SELLER_MENU" },
    { text: m.sellerMenu(name), state: "SELLER_MENU" },
  ];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPlausibleName(name: string): boolean {
  if (!name) return false;
  if (name.length < 2 || name.length > 80) return false;
  if (/^\d+$/.test(name)) return false;
  return true;
}
