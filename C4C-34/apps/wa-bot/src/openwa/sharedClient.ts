/**
 * Module-level holder for the active WhatsApp client.
 *
 * The internal HTTP server boots BEFORE the WhatsApp client finishes logging in,
 * so the order-alert endpoint cannot capture the client at construction time.
 * Instead it reads from this shared accessor on every request.
 *
 * If the client is null, the order-alert endpoint logs the message and
 * returns success-with-not-delivered so the backend doesn't fail an order.
 */
import type { Client } from "whatsapp-web.js";

let active: Client | null = null;

export function setWhatsAppClient(client: Client | null): void {
  active = client;
}

export function getWhatsAppClient(): Client | null {
  return active;
}
