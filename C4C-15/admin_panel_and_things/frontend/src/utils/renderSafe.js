export function renderSafe(value, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") {
    return value.name || value.label || value.title || value.id || fallback;
  }
  return String(value);
}
