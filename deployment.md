# PluginVault — Full Deployment Guide

> **Stack**: React + Vite → **Vercel** · Express API → **Render** · **Supabase** DB · **Razorpay** · **Resend** · **WordPress Plugin API**

---

## Table of Contents

| # | Stage |
|---|---|
| 0 | [Gather Credentials](#stage-0--gather-credentials) |
| 1 | [Push to GitHub](#stage-1--push-to-github) |
| 2 | [Supabase — Database Setup](#stage-2--supabase--database-setup) |
| 3 | [Render — Deploy Backend](#stage-3--render--deploy-backend) |
| 4 | [Vercel — Deploy Frontend](#stage-4--vercel--deploy-frontend) |
| 5 | [Connect Everything](#stage-5--connect-everything) |
| 6 | [Create Admin Account](#stage-6--create-admin-account) |
| 7 | [WordPress Plugin API](#stage-7--wordpress-plugin-api) |
| 8 | [Final Checklist](#stage-8--final-checklist) |
| 9 | [Common Errors & Fixes](#stage-9--common-errors--fixes) |

---

## Stage 0 — Gather Credentials

Before deploying, collect all of these. You will paste them later.

**Supabase** → [supabase.com](https://supabase.com) → Project Settings → API

```
SUPABASE_URL           = https://gdsemspksiritbymymjo.supabase.co
SUPABASE_ANON_KEY      = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzA4NzksImV4cCI6MjA5NDEwNjg3OX0.yJu6xoH5O_-lkija8rPl3a2QcYLE0PLM-wlg6DoMg1k
SUPABASE_SERVICE_ROLE  = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzMDg3OSwiZXhwIjoyMDk0MTA2ODc5fQ.9F2AR0pKCJpQTvKfN0CSX_7K_UNjzqt6R93ADi8XPT8
```

**Razorpay** → [razorpay.com](https://razorpay.com) → Settings → API Keys

```
RAZORPAY_KEY_ID     = rzp_test_SrC0N8jdJdlmTO
RAZORPAY_KEY_SECRET = 2IAR0Flm3oMTacQ5Rg6uxZOP
```

> Use `rzp_live_*` keys when switching to production payments.

**Resend** → [resend.com](https://resend.com) → API Keys → Create

```
RESEND_API_KEY = re_YOUR_KEY_HERE
```

**JWT Secret** — generate once and save it:

```bash
openssl rand -base64 64
```

```
JWT_SECRET = paste-the-output-from-above-here
```

> Already set to a working default — only rotate this in production for security.

```
JWT_SECRET = pluginvault-super-secret-jwt-key-that-is-at-least-64-characters-long-for-security-2024
```

---

## Stage 1 — Push to GitHub

Open a terminal inside the **`new saas`** root folder and run these in order:

### Initialize (first time only)

```bash
git init
git branch -M main
```

### Add remote

> Replace `YOUR_USERNAME` and `YOUR_REPO` with your real GitHub values.

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

If remote already exists:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Stage, commit, push

```bash
git add .
git commit -m "initial deployment commit"
git push -u origin main
```

> ✅ `.env` files are excluded by `.gitignore` — your secrets are safe.

---

## Stage 2 — Supabase — Database Setup

Go to **Supabase dashboard → SQL Editor → New query**.

### Migration 1 — Full Schema

Copy the entire block, paste into SQL Editor, click **Run**.

```sql
-- ============================================
-- PluginVault Complete Database Schema
-- ============================================

create extension if not exists "uuid-ossp";

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

create index if not exists idx_plugins_developer_id on public.plugins(developer_id);
create index if not exists idx_plugins_status on public.plugins(status);
create index if not exists idx_plugins_slug on public.plugins(slug);
create index if not exists idx_licenses_customer_id on public.licenses(customer_id);
create index if not exists idx_licenses_plugin_id on public.licenses(plugin_id);
create index if not exists idx_licenses_key on public.licenses(license_key);
create index if not exists idx_activations_license on public.activations(license_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_payment_id on public.orders(razorpay_payment_id);

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

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

alter table public.profiles disable row level security;
alter table public.plugins disable row level security;
alter table public.plugin_versions disable row level security;
alter table public.licenses disable row level security;
alter table public.activations disable row level security;
alter table public.orders disable row level security;

select 'Migration 1 complete!' as status;
```

> ✅ Expected result: `Migration 1 complete!`

---

### Migration 2 — Activation Code Columns

**New query → paste → Run**

```sql
ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS activation_code text;

ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS activation_code_used boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_licenses_activation_code
ON public.licenses(activation_code);

SELECT 'Migration 2 complete!' as status;
```

> ✅ Expected result: `Migration 2 complete!`

---

## Stage 3 — Render — Deploy Backend

### 3A — Create the Web Service

1. Go to **dashboard.render.com** → **New + → Web Service**
2. Connect your GitHub repo
3. Set the following:

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

> ⚠️ **Do not click Create yet.** Add the environment variables below first.

---

### 3B — Render Environment Variables

In Render → **Environment tab** → add each key-value pair below.

> Copy this entire block. Add them one by one in the Render UI.

```env
NODE_ENV=production
PORT=10000

SUPABASE_URL=https://gdsemspksiritbymymjo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzA4NzksImV4cCI6MjA5NDEwNjg3OX0.yJu6xoH5O_-lkija8rPl3a2QcYLE0PLM-wlg6DoMg1k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzMDg3OSwiZXhwIjoyMDk0MTA2ODc5fQ.9F2AR0pKCJpQTvKfN0CSX_7K_UNjzqt6R93ADi8XPT8

JWT_SECRET=pluginvault-super-secret-jwt-key-that-is-at-least-64-characters-long-for-security-2024

RAZORPAY_KEY_ID=rzp_test_SrC0N8jdJdlmTO
RAZORPAY_KEY_SECRET=2IAR0Flm3oMTacQ5Rg6uxZOP

RESEND_API_KEY=re_YOUR_KEY_HERE

CLIENT_URL=https://YOUR_VERCEL_URL.vercel.app
BACKEND_URL=https://YOUR_RENDER_NAME.onrender.com
```

> ⚠️ Leave `CLIENT_URL` and `BACKEND_URL` as placeholders for now. Fill them in after Stage 5.

> 🔐 `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` must only ever live on Render — never in the frontend.

---

### 3C — Click "Create Web Service"

Wait for the deploy log to show:

```
PluginVault API running on port 10000
```

### 3D — Verify the backend is live

Open this URL in your browser (replace with your real Render URL):

```
https://YOUR_RENDER_NAME.onrender.com/api/health
```

Expected response:

```json
{ "success": true, "message": "PluginVault API is running", "timestamp": "..." }
```

> ✅ Backend is live. Copy your Render URL — you need it next.

---

## Stage 4 — Vercel — Deploy Frontend

### 4A — Import the Project

1. Go to **vercel.com/new** → import your GitHub repo
2. Set **Root Directory** → click Edit → type `frontend` → Continue
3. Framework auto-detects as **Vite** — leave all other defaults

### 4B — Vercel Environment Variables

In Vercel → **Environment Variables section** → add each line below:

```env
VITE_API_URL=https://YOUR_RENDER_NAME.onrender.com/api
VITE_SUPABASE_URL=https://gdsemspksiritbymymjo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzA4NzksImV4cCI6MjA5NDEwNjg3OX0.yJu6xoH5O_-lkija8rPl3a2QcYLE0PLM-wlg6DoMg1k
VITE_RAZORPAY_KEY_ID=rzp_test_SrC0N8jdJdlmTO
```

> Replace `VITE_API_URL` with your actual Render URL from Stage 3.

> ⚠️ All Vite env vars **must** start with `VITE_` or the browser will not see them.

### 4C — Click Deploy

Build takes ~1 minute. Your URL will look like:

```
https://pluginvault-abc123.vercel.app
```

> ✅ Open it in the browser — if the login page loads, the frontend is live. Copy this URL.

---

## Stage 5 — Connect Everything

### 5A — Update Render with real URLs

Render → your service → **Environment** tab → update these two values:

```env
CLIENT_URL=https://pluginvault-abc123.vercel.app
BACKEND_URL=https://YOUR_RENDER_NAME.onrender.com
```

Then: **Save Changes → Manual Deploy → Deploy latest commit**

---

### 5B — Configure Supabase Auth Redirects

Supabase → **Authentication → URL Configuration**

**Site URL** (paste your Vercel URL):

```
https://pluginvault-abc123.vercel.app
```

**Redirect URLs** (add this entry):

```
https://pluginvault-abc123.vercel.app/**
```

Click **Save**.

---

## Stage 6 — Create Admin Account

### 6A — Sign up through the app

1. Open your Vercel URL → click **Sign Up**
2. Register with your email (e.g. `admin@pluginvault.com`)

### 6B — Promote to admin via SQL

Supabase → **SQL Editor → New query** → paste → **Run**:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@pluginvault.com';
```

> ✅ Expected: `1 row affected`. Log out and back in — you now have admin access.

---

## Stage 7 — WordPress Plugin API

### API Endpoints Reference

All WordPress integration happens through these public endpoints on your Render backend:

```
GET  /api/wp/check-update      — check if a new version is available
GET  /api/wp/download          — download latest ZIP (token-protected, 5-min link)
POST /api/wp/activate          — activate a license on a WordPress site
POST /api/wp/deactivate        — deactivate a license from a site
GET  /api/wp/validate-license  — validate license key status
```

---

### How the License Activation Flow Works

```
Customer buys plugin
        ↓
Dashboard generates: license_key + activation_code (one-time use)
        ↓
Customer pastes both into your WP plugin's Settings page
        ↓
PHP calls POST /api/wp/activate → code is verified and consumed
        ↓
From then on, GET /api/wp/validate-license keeps the site authorized
        ↓
GET /api/wp/check-update runs on every WP admin visit
        ↓
If new version exists → GET /api/wp/download delivers the ZIP
```

---

### PHP — Constants (top of your plugin file)

```php
<?php
define( 'PLUGINVAULT_API',     'https://YOUR_RENDER_NAME.onrender.com/api/wp' );
define( 'PLUGINVAULT_SLUG',    'your-plugin-slug' );  // must match slug in dashboard
define( 'YOUR_PLUGIN_VERSION', '1.0.0' );
```

---

### PHP — Auto Update Checker

```php
<?php
add_filter( 'pre_set_site_transient_update_plugins', 'pluginvault_check_update' );
function pluginvault_check_update( $transient ) {
    if ( empty( $transient->checked ) ) return $transient;

    $license_key = get_option( 'your_plugin_license_key', '' );
    if ( empty( $license_key ) ) return $transient;

    $response = wp_remote_get( add_query_arg( [
        'license_key'     => $license_key,
        'plugin_slug'     => PLUGINVAULT_SLUG,
        'current_version' => $transient->checked[ plugin_basename( __FILE__ ) ] ?? YOUR_PLUGIN_VERSION,
    ], PLUGINVAULT_API . '/check-update' ) );

    if ( is_wp_error( $response ) ) return $transient;

    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( ! empty( $body['data']['update_available'] ) ) {
        $transient->response[ plugin_basename( __FILE__ ) ] = (object) [
            'slug'        => PLUGINVAULT_SLUG,
            'new_version' => $body['data']['new_version'],
            'package'     => $body['data']['download_url'],
            'url'         => 'https://pluginvault-abc123.vercel.app',
        ];
    }

    return $transient;
}
```

---

### PHP — Activate License

```php
<?php
function pluginvault_activate_license( $license_key, $activation_code ) {
    $response = wp_remote_post( PLUGINVAULT_API . '/activate', [
        'headers' => [ 'Content-Type' => 'application/json' ],
        'body'    => wp_json_encode( [
            'license_key'     => $license_key,
            'activation_code' => $activation_code,
            'site_url'        => home_url(),
            'plugin_slug'     => PLUGINVAULT_SLUG,
            'plugin_version'  => YOUR_PLUGIN_VERSION,
        ] ),
    ] );

    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( ! empty( $body['success'] ) ) {
        update_option( 'your_plugin_license_key', $license_key );
        update_option( 'your_plugin_license_status', 'active' );
    }

    return $body;
}
```

---

### PHP — Deactivate License

```php
<?php
function pluginvault_deactivate_license( $license_key ) {
    $response = wp_remote_post( PLUGINVAULT_API . '/deactivate', [
        'headers' => [ 'Content-Type' => 'application/json' ],
        'body'    => wp_json_encode( [
            'license_key' => $license_key,
            'site_url'    => home_url(),
        ] ),
    ] );

    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( ! empty( $body['success'] ) ) {
        delete_option( 'your_plugin_license_key' );
        delete_option( 'your_plugin_license_status' );
    }

    return $body;
}
```

---

### PHP — Validate License (with caching)

```php
<?php
function pluginvault_is_licensed() {
    $license_key = get_option( 'your_plugin_license_key', '' );
    if ( empty( $license_key ) ) return false;

    // Cache result 12 hours to avoid repeated API calls
    $cached = get_transient( 'pluginvault_license_valid' );
    if ( $cached !== false ) return (bool) $cached;

    $response = wp_remote_get( add_query_arg( [
        'license_key' => $license_key,
        'site_url'    => home_url(),
        'plugin_slug' => PLUGINVAULT_SLUG,
    ], PLUGINVAULT_API . '/validate-license' ) );

    $body  = json_decode( wp_remote_retrieve_body( $response ), true );
    $valid = ! empty( $body['data']['is_valid'] );

    set_transient( 'pluginvault_license_valid', $valid, 12 * HOUR_IN_SECONDS );
    return $valid;
}

// Usage anywhere in your plugin:
// if ( ! pluginvault_is_licensed() ) {
//     // Show "Please activate your license" notice
//     // Block premium features
// }
```

---

## Stage 8 — Final Checklist

- [ ] Code pushed to GitHub (no `.env` files included)
- [ ] Migration 1 run in Supabase SQL Editor → `Migration 1 complete!`
- [ ] Migration 2 run in Supabase SQL Editor → `Migration 2 complete!`
- [ ] Backend deployed on Render — health check returns `{ "success": true }`
- [ ] Frontend deployed on Vercel — login page loads in browser
- [ ] `CLIENT_URL` on Render updated to real Vercel URL → redeployed
- [ ] `BACKEND_URL` on Render updated to real Render URL → redeployed
- [ ] Supabase Site URL set → Redirect URL added → Saved
- [ ] Admin account signed up through app → SQL update run → `1 row affected`
- [ ] WordPress PHP integration tested with a real license key + activation code

---

## Stage 9 — Common Errors & Fixes

### API calls fail with "Network Error"

**Cause**: URL mismatch between frontend and backend.

Check:
- `VITE_API_URL` on Vercel ends with `/api` and matches your Render URL exactly
- `CLIENT_URL` on Render matches your Vercel origin exactly (no trailing slash)
- Redeploy both services after any env var change

---

### Blank page on refresh (`/dashboard`, `/login`, etc.)

**Cause**: React Router routes being requested from the server.

**Fix**: Already handled by `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Make sure this file is committed to GitHub and not deleted.

---

### Render is slow — first request takes 30–60 seconds

**Cause**: Free tier services sleep after 15 minutes of inactivity.

**Fix**: Use [UptimeRobot](https://uptimerobot.com) (free) to ping every 10 minutes:

```
https://YOUR_RENDER_NAME.onrender.com/api/health
```

---

### Emails not sending

**Cause**: `RESEND_API_KEY` is blank on Render.

**Fix**: Get a free key at resend.com → add to Render env → Manual Deploy.

---

### WordPress "Invalid activation code"

**Cause**: Activation codes are one-time use only.

**Fix**: Reset it in Supabase SQL Editor:

```sql
UPDATE public.licenses
SET activation_code_used = false
WHERE license_key = 'THE_LICENSE_KEY_HERE';
```

---

### `VITE_` env vars not picked up on frontend

**Cause**: Variable name doesn't start with `VITE_`, or Vercel wasn't redeployed after adding it.

**Fix**: Confirm prefix is `VITE_`, then trigger a manual redeploy on Vercel.

---

### Supabase auth redirect not working after login

**Cause**: Redirect URL not registered in Supabase.

**Fix**: Re-do Stage 5B — add your Vercel URL to Supabase → Authentication → Redirect URLs.
