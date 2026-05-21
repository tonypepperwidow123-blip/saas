-- ============================================
-- PluginVault Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- PROFILES: One row per authenticated user
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  email         text unique not null,
  role          text not null default 'customer' check (role in ('customer', 'developer', 'admin')),
  business_name text,
  avatar_url    text,
  is_active           boolean not null default true,
  subscription_plan   text not null default 'free' check (subscription_plan in ('free', 'pro', 'business')),
  subscription_status text not null default 'active',
  subscription_expiry timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- PLUGINS: Plugin listings (pending admin approval)
create table if not exists public.plugins (
  id              uuid primary key default uuid_generate_v4(),
  developer_id    uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  slug            text unique not null,
  description     text,
  short_desc      text,
  category        text,
  tags            text[],
  current_version text,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  rejection_note  text,
  price           numeric(10,2) not null default 0.00 check (price >= 0),
  thumbnail_url   text,
  download_count  integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- PLUGIN VERSIONS: Each uploaded ZIP is a version row
create table if not exists public.plugin_versions (
  id         uuid primary key default uuid_generate_v4(),
  plugin_id  uuid not null references public.plugins(id) on delete cascade,
  version    text not null,
  zip_path   text not null,
  changelog  text,
  is_latest  boolean not null default false,
  created_at timestamptz not null default now(),
  unique(plugin_id, version)
);

-- LICENSES: Issued after a successful purchase
create table if not exists public.licenses (
  id               uuid primary key default uuid_generate_v4(),
  plugin_id        uuid not null references public.plugins(id) on delete restrict,
  customer_id      uuid not null references public.profiles(id) on delete restrict,
  license_key      text unique not null,
  status           text not null default 'active' check (status in ('active', 'suspended', 'expired', 'revoked')),
  activation_limit integer not null default 1 check (activation_limit > 0),
  expiry_date      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ACTIVATIONS: One row per WordPress site using a license
create table if not exists public.activations (
  id             uuid primary key default uuid_generate_v4(),
  license_id     uuid not null references public.licenses(id) on delete cascade,
  site_url       text not null,
  plugin_version text,
  is_active      boolean not null default true,
  activated_at   timestamptz not null default now(),
  deactivated_at timestamptz,
  unique(license_id, site_url)
);

-- ORDERS: Payment record per purchase
create table if not exists public.orders (
  id                   uuid primary key default uuid_generate_v4(),
  customer_id          uuid not null references public.profiles(id) on delete restrict,
  plugin_id            uuid not null references public.plugins(id) on delete restrict,
  license_id           uuid references public.licenses(id),
  amount               numeric(10,2) not null,
  currency             text not null default 'INR',
  payment_status       text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id    text,
  razorpay_payment_id  text,
  razorpay_signature   text,
  created_at           timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_plugins_developer_id on public.plugins(developer_id);
create index if not exists idx_plugins_status       on public.plugins(status);
create index if not exists idx_plugins_slug         on public.plugins(slug);
create index if not exists idx_licenses_customer_id on public.licenses(customer_id);
create index if not exists idx_licenses_plugin_id   on public.licenses(plugin_id);
create index if not exists idx_licenses_key         on public.licenses(license_key);
create index if not exists idx_activations_license  on public.activations(license_id);
create index if not exists idx_orders_customer      on public.orders(customer_id);
create index if not exists idx_orders_payment_id    on public.orders(razorpay_payment_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto-creating profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_plugins_updated_at on public.plugins;
create trigger update_plugins_updated_at
  before update on public.plugins
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_licenses_updated_at on public.licenses;
create trigger update_licenses_updated_at
  before update on public.licenses
  for each row execute procedure public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- Note: Service role bypasses RLS, so these are backup protection
-- ============================================

alter table public.profiles         enable row level security;
alter table public.plugins          enable row level security;
alter table public.plugin_versions  enable row level security;
alter table public.licenses         enable row level security;
alter table public.activations      enable row level security;
alter table public.orders           enable row level security;

-- Profiles: Anyone authenticated can read, insert their own
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Plugins: Public can view approved
drop policy if exists "Public can view approved plugins" on public.plugins;
create policy "Public can view approved plugins" on public.plugins
  for select using (status = 'approved' or auth.uid() = developer_id);

drop policy if exists "Developers can manage own plugins" on public.plugins;
create policy "Developers can manage own plugins" on public.plugins
  for all using (auth.uid() = developer_id);

-- Plugin Versions: Same as plugins
drop policy if exists "Anyone can view plugin versions" on public.plugin_versions;
create policy "Anyone can view plugin versions" on public.plugin_versions
  for select using (
    exists (select 1 from public.plugins where plugins.id = plugin_id and (status = 'approved' or developer_id = auth.uid()))
  );

drop policy if exists "Developers can manage plugin versions" on public.plugin_versions;
create policy "Developers can manage plugin versions" on public.plugin_versions
  for all using (
    exists (select 1 from public.plugins where plugins.id = plugin_id and developer_id = auth.uid())
  );

-- Licenses: Customers see theirs, developers see theirs
drop policy if exists "Users can view own licenses" on public.licenses;
create policy "Users can view own licenses" on public.licenses
  for select using (auth.uid() = customer_id);

drop policy if exists "Developers can view plugin licenses" on public.licenses;
create policy "Developers can view plugin licenses" on public.licenses
  for select using (
    exists (select 1 from public.plugins where plugins.id = licenses.plugin_id and developer_id = auth.uid())
  );

-- Activations: Same as licenses
drop policy if exists "Users can view own activations" on public.activations;
create policy "Users can view own activations" on public.activations
  for select using (
    exists (select 1 from public.licenses where licenses.id = activations.license_id and customer_id = auth.uid())
  );

-- Orders: Customers see theirs
drop policy if exists "Customers can view own orders" on public.orders;
create policy "Customers can view own orders" on public.orders
  for select using (auth.uid() = customer_id);

drop policy if exists "Customers can create orders" on public.orders;
create policy "Customers can create orders" on public.orders
  for insert with check (auth.uid() = customer_id);

-- ============================================
-- STORAGE POLICIES (for the 'plugins' bucket)
-- Run these AFTER creating the bucket in the Supabase dashboard.
-- The service role key bypasses RLS at the DB level, but Supabase Storage
-- has its own RLS layer that must be explicitly configured.
-- ============================================

-- Allow authenticated users (service role) to upload plugin ZIPs
drop policy if exists "Authenticated users can upload plugins" on storage.objects;
create policy "Authenticated users can upload plugins"
  on storage.objects for insert
  with check (bucket_id = 'plugins');

-- Allow anyone to read/download plugin files (needed for signed URL generation)
drop policy if exists "Anyone can read plugin files" on storage.objects;
create policy "Anyone can read plugin files"
  on storage.objects for select
  using (bucket_id = 'plugins');

-- Allow authenticated users to update plugin files (upsert)
drop policy if exists "Authenticated users can update plugins" on storage.objects;
create policy "Authenticated users can update plugins"
  on storage.objects for update
  using (bucket_id = 'plugins');

-- Allow authenticated users to delete plugin files
drop policy if exists "Authenticated users can delete plugins" on storage.objects;
create policy "Authenticated users can delete plugins"
  on storage.objects for delete
  using (bucket_id = 'plugins');

-- ============================================
-- COMPLETED
-- ============================================

-- Verify tables were created
select 'Database setup complete!' as status;
select table_name from information_schema.tables where table_schema = 'public';