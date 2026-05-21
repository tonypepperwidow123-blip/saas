-- ============================================
-- Seed Admin User for PluginVault
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the admin user in auth.users
-- Replace with your actual user ID after signing up, OR run this first to create the user

-- Option A: Insert directly (replace email/password with your own)
-- Note: This uses Supabase Auth Admin API through the service role key

-- First, create a new user. After signing up through the app, update their role to admin:

-- Option B: Run this after you sign up as admin@pluginvault.com:
-- Update the profile role to admin:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@pluginvault.com';

-- Option C: If you want to set a specific user as admin, replace the ID:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';

-- ============================================
-- To get your user ID:
-- 1. Sign up through the app with your admin email
-- 2. Go to Supabase Dashboard > Table Editor > profiles
-- 3. Find your row and copy the id
-- 4. Run: UPDATE public.profiles SET role = 'admin' WHERE id = 'your-uuid';
-- ============================================

select 'Admin seed ready! Sign up first, then update your profile role to admin.' as status;