-- ============================================
-- PluginVault Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- PROFILES
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

-- PLUGINS
create table if not exists public.plugins (
  id uuid primary key default uuid_generate_v4(),
  developer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  short_desc text,
  category text,
  tags text[],
  current_version text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  rejection_note text,
  price numeric(10,2) not null default 0 check (price >= 0),
  thumbnail_url text,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PLUGIN VERSIONS
create table if not exists public.plugin_versions (
  id uuid primary key default uuid_generate_v4(),
  plugin_id uuid not null references public.plugins(id) on delete cascade,
  version text not null,
  zip_path text not null,
  changelog text,
  is_latest boolean not null default false,
  created_at timestamptz not null default now(),
  unique(plugin_id, version)
);

-- LICENSES
create table if not exists public.licenses (
  id uuid primary key default uuid_generate_v4(),
  plugin_id uuid not null references public.plugins(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  license_key text unique not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'expired', 'revoked')),
  activation_limit integer not null default 1 check (activation_limit > 0),
  expiry_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ACTIVATIONS
create table if not exists public.activations (
  id uuid primary key default uuid_generate_v4(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  site_url text not null,
  plugin_version text,
  is_active boolean not null default true,
  activated_at timestamptz not null default now(),
  deactivated_at timestamptz,
  unique(license_id, site_url)
);

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  plugin_id uuid not null references public.plugins(id) on delete restrict,
  license_id uuid references public.licenses(id),
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_plugins_developer_id on public.plugins(developer_id);
create index if not exists idx_plugins_status on public.plugins(status);
create index if not exists idx_plugins_slug on public.plugins(slug);
create index if not exists idx_licenses_customer_id on public.licenses(customer_id);
create index if not exists idx_licenses_plugin_id on public.licenses(plugin_id);
create index if not exists idx_licenses_key on public.licenses(license_key);
create index if not exists idx_activations_license on public.activations(license_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_payment_id on public.orders(razorpay_payment_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add update triggers
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists update_plugins_updated_at on public.plugins;
create trigger update_plugins_updated_at before update on public.plugins
  for each row execute function public.update_plugins_updated_at();

drop trigger if exists update_licenses_updated_at on public.licenses;
create trigger update_licenses_updated_at before update on public.licenses
  for each row execute function public.update_licenses_updated_at();

-- ============================================
-- DISABLE RLS FOR DEVELOPMENT
-- ============================================

alter table public.profiles disable row level security;
alter table public.plugins disable row level security;
alter table public.plugin_versions disable row level security;
alter table public.licenses disable row level security;
alter table public.activations disable row level security;
alter table public.orders disable row level security;

-- ============================================
-- SEED ADMIN USER
-- ============================================

-- Admin user will be created via the app
-- Use: admin@pluginvault.com / Admin@123456

select 'Database setup complete!' as status;