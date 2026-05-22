import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// detectSessionInUrl: true  — MUST be true so Supabase reads the
//   #access_token=... hash that Google OAuth appends on redirect.
// autoRefreshToken: true    — keeps the session alive automatically.
// persistSession: true      — saves session in localStorage so page
//   refreshes don't force re-login.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});