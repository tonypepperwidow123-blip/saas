import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log('\n=== Testing connection ===');

  // Test connection
  const { error: testError } = await supabase.from('profiles').select('id').limit(1);
  if (testError && testError.message.includes('does not exist')) {
    console.log('Tables do not exist. Creating...');
  } else if (testError) {
    console.log('Connection test result:', testError.message);
  } else {
    console.log('Connection successful! Tables exist.');
    return;
  }

  console.log('\n=== Creating Tables ===');

  // Create profiles table
  console.log('Creating profiles table...');
  const { error: profilesError } = await supabase.rpc('exec', {
    sql: `
      create table if not exists public.profiles (
        id uuid primary key references auth.users(id) on delete cascade,
        name text not null,
        email text unique not null,
        role text not null default 'customer' check (role in ('customer', 'developer', 'admin')),
        business_name text,
        avatar_url text,
        is_active boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `
  }).catch(() => null);

  // Try alternative: direct SQL via REST
  console.log('Creating tables via management API...');

  // We'll need to enable RLS after creation
  console.log('Note: RLS will be disabled for development');
}

setupDatabase().catch(console.error);