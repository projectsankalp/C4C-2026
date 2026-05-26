/**
 * User profile store keyed by phone number.
 *
 * Holds the conversational profile (language, role, onboarding flag, etc.)
 * that the WhatsApp bot needs across sessions. Backed by an in-memory map
 * for the demo; in production this would live in a `user_profiles` table.
 *
 * We intentionally keep this separate from the `Artisan` model because:
 *   - Buyers / sakhis don't need an artisan row.
 *   - One phone can have multiple roles (seller + buyer).
 *   - First-contact lookups should never 500 on missing artisan rows.
 */

export interface UserProfile {
  phone: string;
  name?: string;
  language?: string;
  role?: "seller" | "buyer" | "sakhi";
  roles?: ("seller" | "buyer" | "sakhi")[];
  district?: string;
  city?: string;
  craftCategory?: string;
  shgName?: string;
  interests?: string[];
  groupsSupported?: string;
  onboardingComplete?: boolean;
  isVerified?: boolean;
  /** Whether seller wants to receive buyer-request alerts. */
  requestAlertsEnabled?: boolean;
  /** Whether this seller has completed the 7-day community cohort. */
  isCertified?: boolean;
  /** Promo code used to unlock the seller account. */
  promoCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

class UserStore {
  private store = new Map<string, UserProfile>();

  async get(phone: string): Promise<UserProfile | null> {
    return this.store.get(phone) ?? null;
  }

  async upsert(phone: string, patch: Partial<UserProfile>): Promise<UserProfile> {
    const existing = this.store.get(phone);
    const merged: UserProfile = {
      ...existing,
      ...patch,
      phone,
      // Merge roles array
      roles: this.mergeRoles(existing?.roles, patch.roles, patch.role),
      requestAlertsEnabled: patch.requestAlertsEnabled ?? existing?.requestAlertsEnabled ?? true,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(phone, merged);
    return merged;
  }

  async setRequestAlerts(phone: string, enabled: boolean): Promise<void> {
    const existing = this.store.get(phone);
    if (existing) {
      existing.requestAlertsEnabled = enabled;
      existing.updatedAt = new Date().toISOString();
    }
  }

  async list(): Promise<UserProfile[]> {
    return Array.from(this.store.values());
  }

  async listSellers(): Promise<UserProfile[]> {
    return Array.from(this.store.values()).filter(
      (u) => u.role === "seller" || (u.roles ?? []).includes("seller"),
    );
  }

  async listBuyers(): Promise<UserProfile[]> {
    return Array.from(this.store.values()).filter(
      (u) => u.role === "buyer" || (u.roles ?? []).includes("buyer"),
    );
  }

  private mergeRoles(
    existing: UserProfile["roles"],
    patchRoles: UserProfile["roles"],
    patchRole: UserProfile["role"],
  ): UserProfile["roles"] {
    const set = new Set<"seller" | "buyer" | "sakhi">(existing ?? []);
    (patchRoles ?? []).forEach((r) => set.add(r));
    if (patchRole) set.add(patchRole);
    return Array.from(set);
  }
}

export const userStore = new UserStore();
