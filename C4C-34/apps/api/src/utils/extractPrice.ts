export function extractPrice(text: string): number | null {
  const patterns = [
    /₹\s?(\d+(?:,\d{3})*)/i,
    /rs\.?\s?(\d+(?:,\d{3})*)/i,
    /price\s?(\d+(?:,\d{3})*)/i,
    /(\d+(?:,\d{3})*)\s?rupees?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1].replace(/,/g, ""));
  }

  const generic = text.match(/\b(\d{2,5})\b/);
  return generic ? Number(generic[1]) : null;
}
