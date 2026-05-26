export function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const hm = height / 100;
  return Math.round((weight / (hm * hm)) * 10) / 10;
}
