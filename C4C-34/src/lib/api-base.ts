/**
 * Resolves the API base URL.
 *
 * - At build time, if VITE_API_URL is set (and non-empty) it's used as-is.
 * - Otherwise we return "" so all `${API_BASE}/api/...` calls become relative
 *   URLs. Same-origin nginx routes /api/* to the API service. This works
 *   regardless of whether the user lands on cyberkunju.com, www.cyberkunju.com,
 *   the bare IP, or even localhost during dev (vite dev proxies).
 *
 * In dev (vite dev), the dev server should proxy /api to localhost:5000 via
 * vite.config server.proxy if you want absolute zero localhost references in
 * code.
 */
const RAW = (import.meta.env.VITE_API_URL ?? "") as string;
export const API_BASE: string = RAW.replace(/\/+$/, "");
