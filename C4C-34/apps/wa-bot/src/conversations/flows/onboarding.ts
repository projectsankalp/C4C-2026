/**
 * Onboarding flows for each role.
 *
 * One question per turn. We persist each answer to the session immediately so
 * BACK works mid-flow. When the last question is answered we mark
 * `onboardingComplete` and drop into the role's main menu.
 */
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { markOnboarded, transition, updateSession } from "../state";
import { isSkipCommand, parseMenuChoice } from "../../utils/text";
import { saveProfile } from "../../services/userService";
import { joinCohort } from "../../services/communityService";
import { config } from "../../config";

// ---------------------------------------------------------------------------
// Seller onboarding
// ---------------------------------------------------------------------------

const CRAFT_LABELS = [
  "Handicrafts",
  "Textiles / Tailoring",
  "Jewellery",
  "Food Products",
  "Home Decor",
  "Other",
];

export async function handleSellerOnboardName(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const name = (msg.body || "").trim();
  if (!isPlausibleName(name)) {
    return [{ text: m.sellerAskName(), state: "SELLER_ONBOARD_NAME" }];
  }
  updateSession(s.phone, { name });
  transition(s.phone, "SELLER_ONBOARD_DISTRICT");
  return [{ text: m.sellerAskDistrict(), state: "SELLER_ONBOARD_DISTRICT" }];
}

export async function handleSellerOnboardDistrict(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const district = (msg.body || "").trim();
  if (district.length < 2) {
    return [{ text: m.sellerAskDistrict(), state: "SELLER_ONBOARD_DISTRICT" }];
  }
  updateSession(s.phone, { district });
  transition(s.phone, "SELLER_ONBOARD_CRAFT");
  return [{ text: m.sellerAskCraft(), state: "SELLER_ONBOARD_CRAFT" }];
}

export async function handleSellerOnboardCraft(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, CRAFT_LABELS.length);
  if (!choice) {
    return [{ text: m.invalidChoice(), state: "SELLER_ONBOARD_CRAFT" }];
  }
  const craftCategory = CRAFT_LABELS[choice - 1];
  updateSession(s.phone, { craftCategory });

  // No more SHG / Sakhi-help questions — sellers are already certified by the
  // time they reach onboarding, so we finish here and drop into the menu.
  return finalizeSellerOnboarding({ ...s, craftCategory } as UserSession);
}

// Stubs kept for the engine's switch — they should never be reached now,
// but if they are (older sessions still parked in those states), they
// short-circuit straight to the menu.
export async function handleSellerOnboardShgAsk(
  s: UserSession,
  _msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  return finalizeSellerOnboarding(s);
}

export async function handleSellerOnboardShgName(
  s: UserSession,
  _msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  return finalizeSellerOnboarding(s);
}

export async function handleSellerOnboardSakhiHelp(
  s: UserSession,
  _msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  return finalizeSellerOnboarding(s);
}

function finalizeSellerOnboarding(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  const fresh = markOnboarded(s.phone, {});
  // Sellers also get buyer role by default so they can browse/request as buyers.
  const roles = Array.from(new Set([...fresh.roles, "seller" as const, "buyer" as const]));

  // Persist the user profile (NOT certified yet — gated on cohort completion).
  saveProfile(s.phone, {
    name: fresh.name,
    district: fresh.district,
    craftCategory: fresh.craftCategory,
    shgName: fresh.shgName,
    role: "seller",
    roles,
    language: fresh.language,
    onboardingComplete: true,
    isCertified: false,
  } as any).catch(() => undefined);

  // Register them in the community-cohort table so the admin /admin Members
  // tab shows a pending entry. Best-effort — never blocks onboarding.
  joinCohort({
    phone: s.phone,
    name: fresh.name || "Seller",
    district: fresh.district,
    craftCategory: fresh.craftCategory,
    language: fresh.language,
  }).catch(() => undefined);

  // Mirror roles into the in-memory session, but isCertified stays false until
  // the admin clicks "Approve & Certify" in /admin (which then triggers the
  // bot's /certify endpoint to unlock the menu via handleCertificationUnlock).
  updateSession(s.phone, { roles, isCertified: false });

  // Park them in SELLER_COMMUNITY_WAITING so any incoming message before
  // certification gets the polite "your community rep will reach out" reply.
  transition(s.phone, "SELLER_COMMUNITY_WAITING");

  return [
    { text: m.sellerOnboardComplete(fresh.name || ""), state: "SELLER_COMMUNITY_WAITING" },
    { text: m.sellerCommunityJoin(config.sellerCommunityLink), state: "SELLER_COMMUNITY_WAITING" },
  ];
}

// ---------------------------------------------------------------------------
// Buyer onboarding
// ---------------------------------------------------------------------------

const BUYER_INTERESTS = [
  "Home Decor",
  "Clothing / Textiles",
  "Jewellery",
  "Food Products",
  "Gifts",
  "All",
];

export async function handleBuyerOnboardName(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const name = (msg.body || "").trim();
  if (!isPlausibleName(name)) {
    return [{ text: m.buyerAskName(), state: "BUYER_ONBOARD_NAME" }];
  }
  updateSession(s.phone, { name });
  transition(s.phone, "BUYER_ONBOARD_LOCATION");
  return [{ text: m.buyerAskLocation(), state: "BUYER_ONBOARD_LOCATION" }];
}

export async function handleBuyerOnboardLocation(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const city = (msg.body || "").trim();
  if (city.length < 2) {
    return [{ text: m.buyerAskLocation(), state: "BUYER_ONBOARD_LOCATION" }];
  }
  updateSession(s.phone, { district: city });
  transition(s.phone, "BUYER_ONBOARD_INTERESTS");
  return [{ text: m.buyerAskInterests(), state: "BUYER_ONBOARD_INTERESTS" }];
}

export async function handleBuyerOnboardInterests(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, BUYER_INTERESTS.length);
  if (!choice) {
    return [{ text: m.invalidChoice(), state: "BUYER_ONBOARD_INTERESTS" }];
  }
  const interest = BUYER_INTERESTS[choice - 1];
  const interests = interest === "All" ? BUYER_INTERESTS.slice(0, 5) : [interest];
  updateSession(s.phone, { interests });

  return finalizeBuyerOnboarding(s);
}

function finalizeBuyerOnboarding(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  const fresh = markOnboarded(s.phone, {});
  saveProfile(s.phone, {
    name: fresh.name,
    city: fresh.district,
    district: fresh.district,
    interests: fresh.interests,
    role: "buyer",
    roles: fresh.roles,
    language: fresh.language,
    onboardingComplete: true,
  }).catch(() => undefined);

  transition(s.phone, "BUYER_MENU");

  return [
    { text: m.buyerOnboardComplete(fresh.name || ""), state: "BUYER_MENU" },
    { text: m.buyerMenu(fresh.name || ""), state: "BUYER_MENU" },
  ];
}

// ---------------------------------------------------------------------------
// Sakhi onboarding
// ---------------------------------------------------------------------------

export async function handleSakhiOnboardName(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const name = (msg.body || "").trim();
  if (!isPlausibleName(name)) {
    return [{ text: m.sakhiAskName(), state: "SAKHI_ONBOARD_NAME" }];
  }
  updateSession(s.phone, { name });
  transition(s.phone, "SAKHI_ONBOARD_DISTRICT");
  return [{ text: m.sakhiAskDistrict(), state: "SAKHI_ONBOARD_DISTRICT" }];
}

export async function handleSakhiOnboardDistrict(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const district = (msg.body || "").trim();
  if (district.length < 2) {
    return [{ text: m.sakhiAskDistrict(), state: "SAKHI_ONBOARD_DISTRICT" }];
  }
  updateSession(s.phone, { district });
  transition(s.phone, "SAKHI_ONBOARD_GROUPS");
  return [{ text: m.sakhiAskGroups(), state: "SAKHI_ONBOARD_GROUPS" }];
}

export async function handleSakhiOnboardGroups(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const groupsSupported = isSkipCommand(msg.body) ? undefined : (msg.body || "").trim();

  const fresh = markOnboarded(s.phone, {});
  saveProfile(s.phone, {
    name: fresh.name,
    district: fresh.district,
    role: "sakhi",
    roles: fresh.roles,
    language: fresh.language,
    onboardingComplete: true,
    groupsSupported,
  }).catch(() => undefined);

  transition(s.phone, "SAKHI_MENU");

  return [
    { text: m.sakhiOnboardComplete(fresh.name || ""), state: "SAKHI_MENU" },
    { text: m.sakhiMenu(fresh.name || ""), state: "SAKHI_MENU" },
  ];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPlausibleName(name: string): boolean {
  if (!name) return false;
  if (name.length < 2 || name.length > 60) return false;
  // Reject pure-digit replies (likely a misclick on a number prompt)
  if (/^\d+$/.test(name)) return false;
  return true;
}
