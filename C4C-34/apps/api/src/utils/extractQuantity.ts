export function extractQuantity(text: string): number {
  const patterns = [
    /(\d+)\s?(pieces|piece|pcs|pc|items|item)/i,
    /(\d+)\s?(available|stock)/i,
    /quantity\s?:?\s?(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }

  return 1;
}
