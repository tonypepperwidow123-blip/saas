// Seed script to create developer user
// Run this in browser console or create an API endpoint

const SUPABASE_URL = 'https://gdsemspksiritbymymjo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzA4NzksImV4cCI6MjA5NDEwNjg3OX0.yJu6xoH5O_-lkija8rPl3a2QcYLE0PLM-wlg6DoMg1k';

async function seedDeveloper() {
  // Developer credentials
  const developer = {
    email: 'developer@pluginvault.com',
    password: 'Developer123!',
    name: 'Demo Developer',
    business_name: 'PluginVault Studios'
  };

  try {
    // Create auth user
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: developer.email,
        password: developer.password,
        email_confirm: true,
        user_metadata: {
          name: developer.name,
          role: 'developer',
          business_name: developer.business_name
        }
      })
    });

    const authData = await authResponse.json();
    console.log('Auth response:', authData);

    if (authData.id) {
      // Create profile
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: authData.id,
          name: developer.name,
          email: developer.email,
          role: 'developer',
          business_name: developer.business_name
        })
      });

      console.log('Profile created!');
      console.log('\n=== DEVELOPER CREDENTIALS ===');
      console.log('Email:', developer.email);
      console.log('Password:', developer.password);
      console.log('==============================\n');
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
}

// Run the seed
seedDeveloper();