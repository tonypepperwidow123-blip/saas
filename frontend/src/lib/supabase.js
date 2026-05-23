import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Simple Supabase client — no explicit flowType so Supabase uses its
 * internal default. This avoids the "401 on grant_type=pkce" error
 * caused by a double-exchange race condition when flowType is forced.
 *
 * autoRefreshToken: true  — JWT is refreshed silently in the background
 * persistSession:   true  — Session survives page refreshes via localStorage
 * detectSessionInUrl: true — Picks up the ?code= callback param after Google OAuth
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});