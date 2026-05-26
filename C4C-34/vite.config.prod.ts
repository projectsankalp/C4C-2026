// Production Node target build.
// Disables the Cloudflare Workers plugin so the build emits a Node bundle at
// dist/server/server.js that we can wrap with scripts/web-server.mjs.
//
// API URLs: source code uses src/lib/api-base.ts which reads
// import.meta.env.VITE_API_URL ?? "". Without the env var set, API_BASE === ""
// and every `${API_BASE}/api/...` becomes a relative URL. nginx then proxies
// /api/* to the API service regardless of the public hostname (cyberkunju.com,
// www, the bare IP, etc).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
