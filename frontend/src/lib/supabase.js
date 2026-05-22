import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// flowType: 'pkce'       — Use PKCE (default in v2). Supabase exchanges
//   the ?code= param automatically. No #access_token hash in the URL,
//   so the "issued over 120s ago, URL could be stale" warning is gone.
// detectSessionInUrl: true — Required so Supabase picks up the ?code=
//   callback param on the redirect page.
// autoRefreshToken: true  — Keeps the JWT refreshed silently.
// persistSession: true    — Saves session in localStorage between page loads.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});