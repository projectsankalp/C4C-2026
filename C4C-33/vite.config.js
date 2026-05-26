import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ── Dev server settings ──────────────────────────────────────────────────
  server: {
    port: 5173,
    // Proxy /api/* to the FastAPI backend during development.
    // This means the frontend can call /api/upload directly in dev mode
    // without CORS issues, even without setting VITE_API_URL.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ── Build settings ────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,
  },

  // ── Env variables: expose all VITE_* vars to the browser ─────────────────
  // (Vite does this automatically — this comment is for clarity)
  // VITE_API_URL          → FastAPI backend URL
  // VITE_SUPABASE_URL     → Supabase project URL
  // VITE_SUPABASE_ANON_KEY → Supabase anon key (safe for browser)
})
