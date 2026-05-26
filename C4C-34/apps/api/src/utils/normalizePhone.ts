export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;

  return digits.replace(/^0/, "");
}
