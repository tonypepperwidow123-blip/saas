-- ============================================
-- Fix RLS Policies for PluginVault Admin
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.plugins enable row level security;
alter table public.plugin_versions enable row level security;
alter table public.licenses enable row level security;
alter table public.activations enable row level security;
alter table public.orders enable row level security;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Everyone can read profiles (for display purposes)
drop policy if exists "Allow read profiles" on public.profiles;
create policy "Allow read profiles" on public.profiles for select using (true);

-- Anyone can insert their own profile (trigger creates it)
drop policy if exists "Allow insert own profile" on public.profiles;
create policy "Allow insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Users can update their own profile
drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update own profile" on public.profiles for update using (auth.uid() = id);

-- Admin can do everything (service role bypasses RLS, but for extra safety)
drop policy if exists "Admin full access profiles" on public.profiles;
create policy "Admin full access profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- PLUGINS POLICIES
-- ============================================

-- Public can view approved plugins
drop policy if exists "View approved plugins" on public.plugins;
create policy "View approved plugins" on public.plugins for select using (status = 'approved' or auth.uid() = developer_id);

-- Developers can manage their own plugins
drop policy if exists "Manage own plugins" on public.plugins;
create policy "Manage own plugins" on public.plugins for all using (auth.uid() = developer_id);

-- Admin can manage all plugins
drop policy if exists "Admin manage all plugins" on public.plugins;
create policy "Admin manage all plugins" on public.plugins for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- PLUGIN VERSIONS POLICIES
-- ============================================

-- View plugin versions (approved plugins or own)
drop policy if exists "View plugin versions" on public.plugin_versions;
create policy "View plugin versions" on public.plugin_versions for select using (
  exists (select 1 from public.plugins where plugins.id = plugin_id and (status = 'approved' or developer_id = auth.uid()))
);

-- Developers can manage their plugin versions
drop policy if exists "Manage own plugin versions" on public.plugin_versions;
create policy "Manage own plugin versions" on public.plugin_versions for all using (
  exists (select 1 from public.plugins where plugins.id = plugin_id and developer_id = auth.uid())
);

-- Admin can manage all plugin versions
drop policy if exists "Admin manage all plugin versions" on public.plugin_versions;
create policy "Admin manage all plugin versions" on public.plugin_versions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- LICENSES POLICIES
-- ============================================

-- Customers can view their own licenses
drop policy if exists "View own licenses" on public.licenses;
create policy "View own licenses" on public.licenses for select using (auth.uid() = customer_id);

-- Developers can view licenses for their plugins
drop policy if exists "Developers view plugin licenses" on public.licenses;
create policy "Developers view plugin licenses" on public.licenses for select using (
  exists (select 1 from public.plugins where plugins.id = licenses.plugin_id and developer_id = auth.uid())
);

-- Admin can view all licenses
drop policy if exists "Admin view all licenses" on public.licenses;
create policy "Admin view all licenses" on public.licenses for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- ACTIVATIONS POLICIES
-- ============================================

-- Customers can view their activations
drop policy if exists "View own activations" on public.activations;
create policy "View own activations" on public.activations for select using (
  exists (select 1 from public.licenses where licenses.id = activations.license_id and customer_id = auth.uid())
);

-- Admin can view all activations
drop policy if exists "Admin view all activations" on public.activations;
create policy "Admin view all activations" on public.activations for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Customers can view their own orders
drop policy if exists "View own orders" on public.orders;
create policy "View own orders" on public.orders for select using (auth.uid() = customer_id);

-- Developers can view orders for their plugins
drop policy if exists "Developers view plugin orders" on public.orders;
create policy "Developers view plugin orders" on public.orders for select using (
  exists (select 1 from public.plugins where plugins.id = orders.plugin_id and developer_id = auth.uid())
);

-- Admin can view all orders
drop policy if exists "Admin view all orders" on public.orders;
create policy "Admin view all orders" on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Customers can create orders
drop policy if exists "Create orders" on public.orders;
create policy "Create orders" on public.orders for insert with check (auth.uid() = customer_id);

-- ============================================
-- FUNCTION TO DELETE USER (for admin)
-- ============================================

create or replace function public.delete_user_by_id(target_user_id uuid)
returns void as $$
begin
  -- Only admins can delete users
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  -- Delete user's activations
  delete from public.activations where license_id in (select id from public.licenses where customer_id = target_user_id);

  -- Delete user's licenses
  delete from public.licenses where customer_id = target_user_id;

  -- Delete user's orders
  delete from public.orders where customer_id = target_user_id;

  -- Delete user's plugins and related data
  delete from public.plugin_versions where plugin_id in (select id from public.plugins where developer_id = target_user_id);
  delete from public.plugins where developer_id = target_user_id;

  -- Delete profile
  delete from public.profiles where id = target_user_id;

  -- Delete auth user
  delete from auth.users where id = target_user_id;
end;
$$ language plpgsql security definer;

-- ============================================
-- Verify setup
-- ============================================

select 'RLS policies updated successfully!' as status;
select table_name, count(*) as policy_count from information_schema.policies where table_schema = 'public' group by table_name;