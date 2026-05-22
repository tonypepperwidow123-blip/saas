import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// supabaseAdmin — service role key, bypasses RLS, used for:
//   - reading/writing profiles, plugins, licenses, etc.
//   - validating user JWTs via getUser(token)
//   - creating users via auth.admin.createUser()
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  },
});

// supabaseClient — anon key, used ONLY for:
//   - signInWithPassword() (requires anon key, NOT service role)
// The service role client cannot perform user-facing auth operations.
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
