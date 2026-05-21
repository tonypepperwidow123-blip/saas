import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedAdmin() {
  console.log('Creating admin user...');

  const adminEmail = 'admin@pluginvault.com';
  const adminPassword = 'Admin@123456';
  const adminName = 'Admin';

  try {
    // Check if admin already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', adminEmail)
      .single();

    if (existing) {
      // Update to admin if not already
      if (existing.role !== 'admin') {
        await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', existing.id);
        console.log('Updated existing user to admin');
      } else {
        console.log('Admin user already exists with admin role');
      }
      return;
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: adminName,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Auth error:', authError.message);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User ID:', authUser.id);
    console.log('\nPlease update the profile role manually if needed:');
    console.log(`UPDATE public.profiles SET role = 'admin' WHERE id = '${authUser.id}';`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

seedAdmin();