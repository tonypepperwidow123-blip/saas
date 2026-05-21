import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// The service-role key must be sent as BOTH the 'apikey' header (done
// automatically by createClient) AND as 'Authorization: Bearer <key>'.
// Supabase Storage checks the Authorization header to determine the
// caller's role. Without it, Storage treats the request as anonymous
// and enforces RLS policies, causing "violates row level security policy"
// even though the service-role key is present.
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

