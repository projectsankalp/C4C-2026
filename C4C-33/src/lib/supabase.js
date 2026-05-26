/**
 * HaathSe — Supabase JS Client Singleton
 *
 * A single shared Supabase client instance for the entire frontend.
 * Import `supabase` from this file wherever you need DB or real-time access.
 *
 * Env vars (prefix with VITE_ so Vite exposes them to the browser):
 *   VITE_SUPABASE_URL      — your project URL: https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY — your public anon key (safe for browser)
 *
 * When these are not set (local dev / demo), the client is created in
 * "safe fallback" mode — queries will fail gracefully and the app falls
 * back to mock data via the kriticamApi.js service layer.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Export a boolean so components can check config state
export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

// Create the client — works fine even with empty strings in demo mode
// (calls will fail, which triggers our mock fallback logic)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    db: {
      schema: 'public',
    },
  }
);

export default supabase;
