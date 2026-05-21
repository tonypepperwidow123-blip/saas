-- ============================================
-- DISABLE RLS TEMPORARILY FOR DEBUGGING
-- Run this in Supabase SQL Editor
-- This removes all RLS so everything works for now
-- ============================================

-- Disable RLS on all tables (allow full access for now)
alter table public.profiles disable row level security;
alter table public.plugins disable row level security;
alter table public.plugin_versions disable row level security;
alter table public.licenses disable row level security;
alter table public.activations disable row level security;
alter table public.orders disable row level security;

-- Drop all policies
drop policy if exists "Allow read profiles" on public.profiles;
drop policy if exists "Allow insert own profile" on public.profiles;
drop policy if exists "Allow update own profile" on public.profiles;
drop policy if exists "Admin full access profiles" on public.profiles;
drop policy if exists "View approved plugins" on public.plugins;
drop policy if exists "Manage own plugins" on public.plugins;
drop policy if exists "Admin manage all plugins" on public.plugins;
drop policy if exists "View plugin versions" on public.plugin_versions;
drop policy if exists "Manage own plugin versions" on public.plugin_versions;
drop policy if exists "Admin manage all plugin versions" on public.plugin_versions;
drop policy if exists "View own licenses" on public.licenses;
drop policy if exists "Developers view plugin licenses" on public.licenses;
drop policy if exists "Admin view all licenses" on public.licenses;
drop policy if exists "View own activations" on public.activations;
drop policy if exists "Admin view all activations" on public.activations;
drop policy if exists "View own orders" on public.orders;
drop policy if exists "Developers view plugin orders" on public.orders;
drop policy if exists "Admin view all orders" on public.orders;
drop policy if exists "Create orders" on public.orders;

select 'RLS disabled - full access enabled for debugging' as status;