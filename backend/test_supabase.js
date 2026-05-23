import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
);

async function test() {
  try {
    console.log('Testing connection to Supabase with Service Role Key...');
    console.log('URL:', process.env.SUPABASE_URL);
    
    const { data, error } = await supabaseAdmin.from('profiles').select('id, name, email').limit(5);
    if (error) {
      console.error('Error fetching profiles:', error.message);
    } else {
      console.log('Successfully queried profiles using service role key!');
      console.log('Profiles:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

test();
