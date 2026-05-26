/**
 * User profile service.
 *
 * Reads/writes the canonical user record on the backend, keyed by phone.
 * The session in `state.ts` is a hot cache; this service keeps it durable
 * across bot restarts and across multiple devices.
 *
 * Endpoints (added to backend in Batch 9):
 *   GET    /api/users/by-phone/:phone
 *   PATCH  /api/users/by-phone/:phone
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";
import type { ApiEnvelope, Language, Role } from "../types";

export interface UserProfileRecord {
  phone: string;
  name?: string;
  language?: Language;
  role?: Role;
  roles?: Role[];
  district?: string;
  city?: string;
  craftCategory?: string;
  shgName?: string;
  interests?: string[];
  onboardingComplete?: boolean;
  isVerified?: boolean;
  // Sakhi-specific
  groupsSupported?: string;
}

export async function loadProfile(phone: string): Promise<UserProfileRecord | null> {
  try {
    const response = await api.get<ApiEnvelope<UserProfileRecord>>(`/api/users/by-phone/${phone}`);
    const data = (response.data as any)?.data ?? response.data;
    return data ?? null;
  } catch (error: any) {
    // 404 is expected for first-time users — not an error.
    if (error?.response?.status === 404) return null;
    log.warn("PROFILE_LOAD_FAILED", { summary: error?.summary, message: error?.message });
    return null;
  }
}

export async function saveProfile(
  phone: string,
  patch: Partial<UserProfileRecord>,
): Promise<UserProfileRecord | null> {
  try {
    const response = await api.patch<ApiEnvelope<UserProfileRecord>>(
      `/api/users/by-phone/${phone}`,
      patch,
    );
    const data = (response.data as any)?.data ?? response.data;
    return data ?? null;
  } catch (error: any) {
    log.warn("PROFILE_SAVE_FAILED", {
      summary: error?.summary,
      message: error?.message,
    });
    return null;
  }
}
