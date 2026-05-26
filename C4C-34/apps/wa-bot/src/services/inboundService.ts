/**
 * Logs an inbound message to the backend for audit/replay.
 * Non-critical: failure here must NOT break the conversation.
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";

export interface LogInboundInput {
  fromPhone: string;
  messageType: "text" | "image" | "audio" | "document" | "system";
  body?: string;
  mediaUrl?: string;
  waMessageId?: string;
}

export async function logInbound(input: LogInboundInput): Promise<void> {
  try {
    await api.post("/api/whatsapp/inbound", input);
  } catch (error: any) {
    // Swallow — this is best-effort.
    log.debug("INBOUND_LOG_SKIPPED", {
      summary: error?.summary,
      message: error?.message,
    });
  }
}
