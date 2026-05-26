/**
 * Community cohort service.
 *
 * Used by seller onboarding to register a freshly-onboarded seller as a
 * `community_members` row in the backend. The row is created uncertified
 * (isCertified=false, stage="learn") so the admin dashboard's Members tab
 * shows it as pending. Once the admin clicks "Approve & Certify" in /admin,
 * the backend issues the certificate AND pings this bot's /certify endpoint
 * to send the unlock WhatsApp message — closing the loop.
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";
import type { ApiEnvelope, Language } from "../types";

export interface CohortJoinInput {
  phone: string;
  name: string;
  district?: string;
  craftCategory?: string;
  language?: Language;
}

export interface CommunityMemberRecord {
  id: string;
  name: string;
  phone?: string | null;
  location?: string | null;
  skills?: string | null;
  language: string;
  stage: string;
  points: number;
  isCertified: boolean;
  certifiedAt?: string | null;
  createdAt: string;
}

/**
 * Best-effort: create or return an existing community-member row for this
 * seller. Idempotent — backend returns the existing record if phone is
 * already registered. Never throws; logs and returns null on failure so a
 * backend hiccup doesn't trap the user mid-onboarding.
 */
export async function joinCohort(input: CohortJoinInput): Promise<CommunityMemberRecord | null> {
  try {
    const response = await api.post<ApiEnvelope<CommunityMemberRecord>>("/api/community/join", {
      name: input.name,
      phone: input.phone,
      location: input.district,
      skills: input.craftCategory,
      language: input.language,
    });
    const data = (response.data as any)?.data ?? response.data;
    return (data as CommunityMemberRecord) ?? null;
  } catch (error: any) {
    log.warn("COMMUNITY_JOIN_FAILED", {
      summary: error?.summary,
      message: error?.message,
    });
    return null;
  }
}
