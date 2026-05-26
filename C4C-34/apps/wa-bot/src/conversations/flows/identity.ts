/**
 * First-time identity flow:
 *   GREETING → AWAITING_LANGUAGE → AWAITING_ROLE
 *
 *   Seller path:  → SELLER_COMMUNITY_JOIN (certification gate)
 *   Buyer path:   → TUTORIAL → BUYER_ONBOARD_*
 *   Sakhi path:   → TUTORIAL → SAKHI_ONBOARD_*
 *
 * Returning users skip everything except a personalized welcome + main menu.
 */
import { config } from "../../config";
import type { IncomingMessage, OutgoingReply, UserSession, Role } from "../../types";
import { getMessages, parseLanguageChoice } from "../messages";
import { mainMenuFor, transition, updateSession } from "../state";
import { parseMenuChoice } from "../../utils/text";
import { saveProfile } from "../../services/userService";

export async function handleGreeting(
  session: UserSession,
  message: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages("en"); // Greeting is always shown bilingually first
  transition(session.phone, "AWAITING_LANGUAGE");

  // Always show the greeting on first contact. We used to auto-forward the
  // body to handleAwaitingLanguage when non-empty — but that turned a friendly
  // "hi" into a Hindi language pick (because parseLanguageChoice matched the
  // language code "hi"). Better: always greet, let the user pick a number.
  void message;
  return [{ text: m.greeting(), state: "AWAITING_LANGUAGE" }];
}

export async function handleAwaitingLanguage(
  session: UserSession,
  message: IncomingMessage,
): Promise<OutgoingReply[]> {
  const lang = parseLanguageChoice(message.body);
  if (!lang) {
    const m = getMessages(session.language);
    return [{ text: m.languageInvalid(), state: "AWAITING_LANGUAGE" }];
  }

  const updated = updateSession(session.phone, { language: lang });
  const m = getMessages(updated.language);

  transition(session.phone, "AWAITING_REPLY_MODE", { language: lang });

  // Persist language to backend best-effort.
  saveProfile(session.phone, { language: lang }).catch(() => undefined);

  const langLabel = labelForLang(lang);
  // Single combined bubble: confirmation + reply-mode menu. Earlier the
  // engine emitted three separate replies (confirmed, instructions,
  // replyModeAsk), which on WhatsApp shows up as three back-to-back bubbles
  // plus three voice notes in "both" mode — overwhelming. The instructions
  // legend lives behind the HELP keyword and the menu, so we drop it from
  // the language transition.
  const combined = `${m.languageConfirmed(langLabel)}\n\n${m.replyModeAsk()}`;
  return [{ text: combined, state: "AWAITING_REPLY_MODE" }];
}

export async function handleAwaitingReplyMode(
  session: UserSession,
  message: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(session.language);
  const choice = parseMenuChoice(message.body, 3);

  let mode: "text" | "voice" | "both" | null = null;
  if (choice === 1) mode = "text";
  else if (choice === 2) mode = "voice";
  else if (choice === 3) mode = "both";

  if (!mode) {
    return [{ text: m.replyModeAsk(), state: "AWAITING_REPLY_MODE" }];
  }

  updateSession(session.phone, { replyMode: mode });
  // Best-effort persist to backend so returning users keep their choice.
  saveProfile(session.phone, { replyMode: mode } as any).catch(() => undefined);
  transition(session.phone, "AWAITING_ROLE");
  return [{ text: m.roleAsk(), state: "AWAITING_ROLE" }];
}

export async function handleAwaitingRole(
  session: UserSession,
  message: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(session.language);
  const choice = parseMenuChoice(message.body, 2);

  let role: Role | null = null;
  if (choice === 1) role = "seller";
  else if (choice === 2) role = "buyer";

  if (!role) {
    return [{ text: m.roleInvalid(), state: "AWAITING_ROLE" }];
  }

  const next = updateSession(session.phone, {
    role,
    roles: session.roles.includes(role) ? session.roles : [...session.roles, role],
    consentGiven: true,
  });

  saveProfile(session.phone, { role, language: next.language }).catch(() => undefined);

  // -----------------------------------------------------------------------
  // SELLER path: collect name + address + contact BEFORE community link.
  // After they earn their certificate, they skip the long onboarding flow.
  // -----------------------------------------------------------------------
  if (role === "seller") {
    // If they're already certified (e.g. returning user who was certified
    // externally and their session was hydrated), drop straight into the
    // seller menu — we already have their name/address from the pre-check.
    if (next.isCertified) {
      transition(session.phone, "SELLER_MENU");
      return [
        { text: m.roleConfirmed(role), state: "SELLER_MENU" },
        { text: m.sellerMenu(next.name || ""), state: "SELLER_MENU" },
      ];
    }

    transition(session.phone, "SELLER_PRECHECK_NAME");
    return [
      { text: m.roleConfirmed(role), state: "SELLER_PRECHECK_NAME" },
      { text: m.sellerPrecheckName(), state: "SELLER_PRECHECK_NAME" },
    ];
  }

  // -----------------------------------------------------------------------
  // BUYER / SAKHI path: normal tutorial → onboarding
  // -----------------------------------------------------------------------
  transition(session.phone, "TUTORIAL");

  return [
    { text: m.roleConfirmed(role), state: "TUTORIAL" },
    { text: m.tutorial(config.tutorialVideoUrl), state: "TUTORIAL" },
    { text: m.tutorialPostText(role), state: "TUTORIAL" },
  ];
}

export async function handleTutorial(
  session: UserSession,
  message: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(session.language);
  const body = (message.body || "").trim();
  const choice = parseMenuChoice(body, 2);

  // Log so we can debug production: we've had reports of "2" at TUTORIAL
  // unexpectedly bouncing the user to GREETING. If that ever happens again,
  // this log proves we DID receive the input here and what we did with it.
  const { log } = await import("../../utils/logger");
  log.info("HANDLE_TUTORIAL", {
    phone: session.phone,
    role: session.role,
    body: body.slice(0, 30),
    choice,
  });

  // Choice 2 → replay the tutorial video. We re-show both the video and the
  // post-text so the user has the same screen they had before, plus an
  // explicit hint about what to do next.
  if (choice === 2) {
    return [
      { text: m.tutorial(config.tutorialVideoUrl), state: "TUTORIAL" },
      { text: m.tutorialPostText(session.role), state: "TUTORIAL" },
    ];
  }

  // Choice 1 (or any non-2 input including empty) → continue to onboarding.
  // We accept anything that's not "2" as "continue" because the tutorial is
  // optional — we don't want to trap users who typed garbage.
  const next = onboardEntryFor(session.role);
  transition(session.phone, next);
  return [{ text: firstOnboardPrompt(session.role!, session.language), state: next }];
}

function onboardEntryFor(role: Role | undefined): UserSession["state"] {
  switch (role) {
    case "seller":
      return "SELLER_ONBOARD_NAME";
    case "buyer":
      return "BUYER_ONBOARD_NAME";
    case "sakhi":
      return "SAKHI_ONBOARD_NAME";
    default:
      return "GREETING";
  }
}

function firstOnboardPrompt(role: Role, language: UserSession["language"]): string {
  const m = getMessages(language);
  switch (role) {
    case "seller":
      return m.sellerAskName();
    case "buyer":
      return m.buyerAskName();
    case "sakhi":
      return m.sakhiAskName();
  }
}

function labelForLang(code: string): string {
  switch (code) {
    case "en":
      return "English";
    case "hi":
      return "हिन्दी";
    case "kn":
      return "ಕನ್ನಡ";
    case "ta":
      return "தமிழ்";
    case "ml":
      return "മലയാളം";
    default:
      return code;
  }
}

/**
 * Returning user: skip the whole identity flow, jump to the right menu.
 * Called from the engine's pre-state branch when session.onboardingComplete=true.
 */
export function handleReturningUser(session: UserSession): OutgoingReply[] {
  const m = getMessages(session.language);

  // Seller who is NOT certified yet — send them back to the gate
  if (session.role === "seller" && !session.isCertified) {
    transition(session.phone, "SELLER_COMMUNITY_WAITING");
    return [
      { text: m.welcomeBack(session.name), state: "SELLER_COMMUNITY_WAITING" },
      { text: m.sellerCommunityWaiting(), state: "SELLER_COMMUNITY_WAITING" },
    ];
  }

  // If user has multiple roles, ask which menu they want.
  if (session.roles.length > 1) {
    transition(session.phone, "AWAITING_ROLE");
    return [
      { text: m.welcomeBack(session.name), state: "AWAITING_ROLE" },
      { text: m.whichRole(), state: "AWAITING_ROLE" },
    ];
  }

  const target = mainMenuFor(session.role);
  transition(session.phone, target);

  const menuText =
    session.role === "seller"
      ? m.sellerMenu(session.name || "")
      : session.role === "buyer"
        ? m.buyerMenu(session.name || "")
        : m.sakhiMenu(session.name || "");

  return [
    { text: m.welcomeBack(session.name), state: target },
    { text: menuText, state: target },
  ];
}
