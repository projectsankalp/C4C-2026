/**
 * WhatsApp gives us chat IDs like "919876543210@c.us".
 * Backend wants international digits like "919876543210".
 * We normalize aggressively so duplicates don't collide.
 */

export function stripWhatsAppSuffix(input: string): string {
  return input.replace(/@c\.us$/i, "").replace(/@s\.whatsapp\.net$/i, "");
}

export function normalizePhone(input: string | undefined | null): string {
  if (!input) return "";
  return stripWhatsAppSuffix(input).replace(/\D/g, "");
}

/** Convert a raw 10-digit Indian number into international form, leave others as-is. */
export function toIndianInternational(input: string): string {
  const digits = normalizePhone(input);
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export function isAllowed(phone: string, allowList: string[], demoMode: boolean): boolean {
  if (!demoMode) return true;
  if (allowList.length === 0) return true;
  const normalized = normalizePhone(phone);
  return allowList.some((entry) => {
    const allowed = normalizePhone(entry);
    return normalized === allowed || normalized.endsWith(allowed) || allowed.endsWith(normalized);
  });
}
