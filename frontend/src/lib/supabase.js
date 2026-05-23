import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase client for the frontend.
 *
 * We do NOT set flowType explicitly so Supabase uses whatever auth flow
 * the project dashboard is configured for (PKCE or implicit).
 *
 * detectSessionInUrl: true — handles BOTH ?code= (PKCE) and #access_token= (implicit)
 * autoRefreshToken:  true — silently refreshes JWTs in background
 * persistSession:    true — keeps session in localStorage across page reloads
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});