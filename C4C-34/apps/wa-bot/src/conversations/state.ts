/**
 * In-memory session store keyed by normalized phone number.
 *
 * The session is the single source of truth for "where is this user in the
 * conversation right now, what scratchpad data have they accumulated."
 *
 * Two layers of memory:
 *   - Session (volatile, this file): identity decisions + flow scratchpads.
 *     Cleared on bot restart unless persisted by Person 4 backend.
 *   - Profile (durable, backend): name, district, role, language. Restored
 *     on next contact via getOrLoadSession().
 */
import { ConversationState, Language, Role, UserSession } from "../types";
import { normalizePhone } from "../utils/phone";

const STALE_AFTER_MS = 1000 * 60 * 60 * 12; // 12 hours
const STATE_STACK_MAX = 10;
const sessions = new Map<string, UserSession>();

function freshSession(phone: string): UserSession {
  return {
    phone,
    language: "en",
    roles: [],
    onboardingComplete: false,
    state: "GREETING",
    stateStack: [],
    context: {},
    unparseableCount: 0,
    consentGiven: false,
    lastMessageAt: Date.now(),
  };
}

export function getSession(rawPhone: string): UserSession {
  const phone = normalizePhone(rawPhone);
  const existing = sessions.get(phone);

  if (existing) {
    if (Date.now() - existing.lastMessageAt > STALE_AFTER_MS) {
      // Stale: keep identity, clear in-flight context so we don't haunt them
      // with yesterday's half-finished listing.
      const renewed: UserSession = {
        ...existing,
        state: existing.onboardingComplete ? mainMenuFor(existing.role) : "GREETING",
        stateStack: [],
        context: {},
        unparseableCount: 0,
        lastMessageAt: Date.now(),
      };
      sessions.set(phone, renewed);
      return renewed;
    }
    return existing;
  }

  const created = freshSession(phone);
  sessions.set(phone, created);
  return created;
}

/**
 * Update arbitrary session fields. We intentionally do NOT push the previous
 * state onto the stack here — call `transition()` for that.
 */
export function updateSession(rawPhone: string, patch: Partial<UserSession>): UserSession {
  const phone = normalizePhone(rawPhone);
  const current = getSession(phone);
  const next: UserSession = {
    ...current,
    ...patch,
    phone,
    // Always merge context shallowly so callers don't have to.
    context: { ...current.context, ...(patch.context ?? {}) },
    lastMessageAt: Date.now(),
  };
  sessions.set(phone, next);
  return next;
}

/**
 * Move to a new state and remember the previous one so BACK can pop.
 * Resets unparseableCount because we're in a new state now.
 */
export function transition(
  rawPhone: string,
  to: ConversationState,
  patch: Partial<UserSession> = {},
): UserSession {
  const phone = normalizePhone(rawPhone);
  const current = getSession(phone);

  const stack = [...current.stateStack, current.state].slice(-STATE_STACK_MAX);

  const next: UserSession = {
    ...current,
    ...patch,
    phone,
    state: to,
    stateStack: stack,
    context: { ...current.context, ...(patch.context ?? {}) },
    unparseableCount: 0,
    lastMessageAt: Date.now(),
  };
  sessions.set(phone, next);
  return next;
}

/**
 * Pop one level off the stack. Returns the new state, or null if stack empty.
 */
export function popState(rawPhone: string): UserSession | null {
  const phone = normalizePhone(rawPhone);
  const current = getSession(phone);
  if (current.stateStack.length === 0) return null;

  const stack = [...current.stateStack];
  const previous = stack.pop()!;
  const next: UserSession = {
    ...current,
    state: previous,
    stateStack: stack,
    unparseableCount: 0,
    lastMessageAt: Date.now(),
  };
  sessions.set(phone, next);
  return next;
}

export function setLanguage(rawPhone: string, language: Language): UserSession {
  return updateSession(rawPhone, { language });
}

export function setRole(rawPhone: string, role: Role): UserSession {
  const current = getSession(rawPhone);
  const roles = current.roles.includes(role) ? current.roles : [...current.roles, role];
  return updateSession(rawPhone, { role, roles });
}

export function markOnboarded(rawPhone: string, profile: Partial<UserSession>): UserSession {
  return updateSession(rawPhone, { ...profile, onboardingComplete: true });
}

export function incrementUnparseable(rawPhone: string): UserSession {
  const current = getSession(rawPhone);
  return updateSession(rawPhone, { unparseableCount: current.unparseableCount + 1 });
}

export function resetUnparseable(rawPhone: string): UserSession {
  return updateSession(rawPhone, { unparseableCount: 0 });
}

export function clearContext(rawPhone: string): UserSession {
  return updateSession(rawPhone, { context: {} } as Partial<UserSession>);
}

export function resetSession(rawPhone: string): UserSession {
  const phone = normalizePhone(rawPhone);
  const fresh = freshSession(phone);
  sessions.set(phone, fresh);
  return fresh;
}

export function listSessions(): UserSession[] {
  return Array.from(sessions.values());
}

export function clearAllSessions(): number {
  const count = sessions.size;
  sessions.clear();
  return count;
}

/** Decide the right main-menu state for a given role. */
export function mainMenuFor(role: Role | undefined): ConversationState {
  switch (role) {
    case "seller":
      return "SELLER_MENU";
    case "buyer":
      return "BUYER_MENU";
    case "sakhi":
      return "SAKHI_MENU";
    default:
      return "GREETING";
  }
}
