/**
 * Backend service: find or create an artisan by phone.
 * The backend's POST /api/products/draft already does find-or-create internally,
 * but exposing this helper lets us pre-warm an artisan record if we ever need to.
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";
import type { ApiEnvelope, Language } from "../types";

export interface FindOrCreateArtisanRequest {
  phone: string;
  name?: string;
  district?: string;
  language?: Language;
  craftType?: string;
}

export interface ArtisanRecord {
  id: string;
  phone: string;
  name?: string;
  district?: string;
  isVerified: boolean;
}

export async function findOrCreateArtisan(
  input: FindOrCreateArtisanRequest,
): Promise<ArtisanRecord | null> {
  try {
    const response = await api.post<ApiEnvelope<ArtisanRecord>>(
      "/api/artisans/find-or-create",
      input,
    );
    const data = (response.data as any).data ?? (response.data as unknown as ArtisanRecord);
    return data ?? null;
  } catch (error: any) {
    log.warn("ARTISAN_FIND_OR_CREATE_FAILED", {
      summary: error?.summary,
      message: error?.message,
    });
    return null;
  }
}
