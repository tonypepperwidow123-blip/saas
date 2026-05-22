# 🚀 The Super Easy "Step-by-Step" Deployment Guide for PluginVault

Hello! This guide is written so that **anyone** (even a absolute beginner!) can deploy the PluginVault platform. 

Think of this like building a **Lego Castle**:
1. **Supabase (Database)**: This is our storage chest. It remembers who our users are and what licenses they bought.
2. **Render (Backend)**: This is the brain or engine. It does the hard calculations and runs our server.
3. **Vercel (Frontend)**: This is the beautiful castle walls and front door. It is the actual website that people visit and click on.
4. **WordPress (Client)**: This is the magic portal that talks to our castle to verify licenses!

---

## 🛠️ The Shopping List (Get These Free Accounts First)

Before starting, open these websites in your browser and sign up for a **free account**:
- [ ] **GitHub** → [github.com](https://github.com) (To store our code)
- [ ] **Supabase** → [supabase.com](https://supabase.com) (To store our database)
- [ ] **Render** → [render.com](https://render.com) (To run our backend server)
- [ ] **Vercel** → [vercel.com](https://vercel.com) (To host our frontend website)
- [ ] **Razorpay** → [razorpay.com](https://razorpay.com) (To accept payments - optional for now)
- [ ] **Resend** → [resend.com](https://resend.com) (To send emails - optional for now)

---

## ─── STAGE 1 ── Put Your Code on GitHub (Upload to the Cloud) ───

GitHub is like a Google Drive, but for code. We need to upload our files there first so Render and Vercel can read them.

### Step 1.1: Open your command center (Terminal)
1. Open **VS Code** on your computer.
2. At the top menu, click **Terminal** ➜ **New Terminal**.
3. A black box will open at the bottom. Make sure you are inside the `new saas` folder.

### Step 1.2: Type these magical commands
Copy each command below, paste it into that black terminal box, and press **Enter** on your keyboard. Do them one by one!

```bash
# 1. Start git tracking
git init

# 2. Name our main branch
git branch -M main
```

### Step 1.3: Connect to your GitHub repository
1. Go to [github.com](https://github.com) and log in.
2. Click the green **"New"** button in the top left to make a new folder (repository).
3. Name it `pluginvault-saas`, keep it public or private, and click the green **"Create repository"** button at the bottom.
4. You will see a page with a link. Copy that link! It looks like: `https://github.com/YOUR_USERNAME/YOUR_REPO.git`.
5. Now, run this command in your VS Code terminal (replace the URL with your copied link):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

*(If you get an error saying remote already exists, run this instead)*:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Step 1.4: Send your code to the cloud!
Copy these commands, paste them, and press **Enter**:

```bash
git add .
git commit -m "my first deployment commit"
git push -u origin main
```

> **🎉 You did it!** Open your GitHub page in your browser and refresh. You will see all your files online!

---

## ─── STAGE 2 ── Set Up Your Database (Supabase Storage Chest) ───

Now, let's set up the storage chest (database) where users, licenses, and orders will live.

### Step 2.1: Go to your Supabase project
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **New Project** ➜ select your organization.
3. Set these fields:
   - **Name**: `PluginVault DB`
   - **Database Password**: Click "Generate a password" and copy it to a notepad!
   - **Region**: Choose the one closest to you (e.g., Singapore or Mumbai).
   - **Pricing**: Choose **Free Tier**.
4. Click **Create new project** and wait 2 minutes for it to set up.

### Step 2.2: Open the SQL Editor (The Command Console)
1. On the left sidebar, click the **SQL Editor** icon (it looks like a small box with `SQL` written on it).
2. Click **New query** (the big card at the top).

### Step 2.3: Paste the Database Schema (Migration 1)
Copy this entire block of SQL code, paste it into the large black box in Supabase, and click the green **"Run"** button in the bottom right:

```sql
-- ============================================
-- PluginVault Database Schema
-- ============================================
create extension if not exists "uuid-ossp";

-- 1. Create Profiles (users table)
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

-- 2. Create Plugins (plugin listings table)
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

-- 3. Create Plugin Versions (ZIP uploads table)
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

-- 4. Create Licenses table
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

-- 5. Create Activations (sites using the license)
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

-- 6. Create Orders table
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

-- Create shortcuts (indexes) to make lookups fast
create index if not exists idx_plugins_developer_id on public.plugins(developer_id);
create index if not exists idx_plugins_status on public.plugins(status);
create index if not exists idx_plugins_slug on public.plugins(slug);
create index if not exists idx_licenses_customer_id on public.licenses(customer_id);
create index if not exists idx_licenses_plugin_id on public.licenses(plugin_id);
create index if not exists idx_licenses_key on public.licenses(license_key);
create index if not exists idx_activations_license on public.activations(license_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_payment_id on public.orders(razorpay_payment_id);

-- Auto-create profile when a user signs up!
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

-- Auto-update updated_at field when rows change
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

-- Disable RLS for now to make things super easy!
alter table public.profiles disable row level security;
alter table public.plugins disable row level security;
alter table public.plugin_versions disable row level security;
alter table public.licenses disable row level security;
alter table public.activations disable row level security;
alter table public.orders disable row level security;

select 'Migration 1 complete!' as status;
```

> **Expected Result**: You should see a table at the bottom saying: `Migration 1 complete!`.

### Step 2.4: Paste the WordPress Activation Columns (Migration 2)
Click **New query** again to start a clean page. Copy and paste this short code, and click the green **"Run"** button:

```sql
-- Add WordPress activation code columns
ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS activation_code text;

ALTER TABLE public.licenses
ADD COLUMN IF NOT EXISTS activation_code_used boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_licenses_activation_code
ON public.licenses(activation_code);

SELECT 'Migration 2 complete!' as status;
```

> **Expected Result**: You should see `Migration 2 complete!`.

---

## ─── STAGE 3 ── Deploy the Server (Render Backend) ───

The Backend is the brain of your website. Let's get it running in the cloud.

### Step 3.1: Copy your Supabase keys
In your Supabase dashboard:
1. Click the **Gear icon (Project Settings)** on the bottom-left sidebar.
2. Click **API**.
3. Copy these three strings to a notepad, you will need them in the next step:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon / public key** (Starts with `eyJ...`)
   - **service_role key** (Click "Reveal" to show - Starts with `eyJ...`)

### Step 3.2: Create a Web Service on Render
1. Go to [render.com](https://render.com) and log in.
2. Click the blue **"New +"** button in the top right, and choose **Web Service**.
3. Under "Connect a repository", click on your newly uploaded GitHub repository: `pluginvault-saas`.
4. Set these exact settings in the boxes:
   - **Name**: `pluginvault-backend`
   - **Root Directory**: `backend` *(Make sure this is lowercase and exactly "backend"!)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
5. **Do not click deploy yet!** Scroll down and look for the **Advanced** button or **Environment Variables** section.

### Step 3.3: Copy-Paste your Environment Variables
We need to give our backend server its credentials. Click **"Add Environment Variable"** and add these items key-by-key:

```env
# 1. Let the server know we are live
NODE_ENV=production

# 2. Tell the server what port to run on
PORT=10000

# 3. Paste your Supabase Project URL
SUPABASE_URL=https://gdsemspksiritbymymjo.supabase.co

# 4. Paste your Supabase anon/public key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzA4NzksImV4cCI6MjA5NDEwNjg3OX0.yJu6xoH5O_-lkija8rPl3a2QcYLE0PLM-wlg6DoMg1k

# 5. Paste your Supabase service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzMDg3OSwiZXhwIjoyMDk0MTA2ODc5fQ.9F2AR0pKCJpQTvKfN0CSX_7K_UNjzqt6R93ADi8XPT8

# 6. Safety lock for user logins (Leave this default)
JWT_SECRET=pluginvault-super-secret-jwt-key-that-is-at-least-64-characters-long-for-security-2024

# 7. Razorpay payment credentials (Use these test keys!)
RAZORPAY_KEY_ID=rzp_test_SrC0N8jdJdlmTO
RAZORPAY_KEY_SECRET=2IAR0Flm3oMTacQ5Rg6uxZOP

# 8. Temporary placeholders for website URLs (We will update these in Stage 5!)
CLIENT_URL=https://temp-url.vercel.app
BACKEND_URL=https://temp-url.onrender.com
```

### Step 3.4: Click Create Web Service!
1. Click the green **"Create Web Service"** button.
2. Wait 3-5 minutes. You will see a live console feed printing logs.
3. When it is done, you will see a message like: `PluginVault API running on port 10000`.
4. Look at the top left of the Render page. You will see a URL like `https://pluginvault-backend-xxxx.onrender.com`. **Copy this URL! This is your Backend URL.**

---

## ─── STAGE 4 ── Deploy the Website (Vercel Frontend) ───

The Frontend is the pretty face of your website. Let's put it on the web!

### Step 4.1: Import the project in Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** ➜ **Project**.
3. Find your GitHub repository `pluginvault-saas` and click **Import**.
4. Set these configuration settings:
   - **Framework Preset**: Choose `Vite` (It should auto-detect it!)
   - **Root Directory**: Click the **"Edit"** button, select the **`frontend`** folder, and click **Continue**.
   - Keep build command and output directory as default.

### Step 4.2: Add your Environment Variables
Scroll down to the **Environment Variables** section on Vercel. Add these variables one by one:

```env
# 1. Paste your backend URL that you copied in Stage 3 (Add "/api" at the end!)
# E.g., https://your-backend.onrender.com/api
VITE_API_URL=https://YOUR_RENDER_URL.onrender.com/api

# 2. Paste your Supabase Project URL
VITE_SUPABASE_URL=https://gdsemspksiritbymymjo.supabase.co

# 3. Paste your Supabase anon/public key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkc2Vtc3Brc2lyaXRieW15bWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzA4NzksImV4cCI6MjA5NDEwNjg3OX0.yJu6xoH5O_-lkija8rPl3a2QcYLE0PLM-wlg6DoMg1k

# 4. Paste your Razorpay Key ID
VITE_RAZORPAY_KEY_ID=rzp_test_SrC0N8jdJdlmTO
```

> ⚠️ **Crucial rule**: All frontend variables **must** start with `VITE_`, or the website won't be able to see them!

### Step 4.3: Click Deploy!
1. Click the blue **"Deploy"** button.
2. Wait 1 minute. You will see fireworks on the screen! 🎆
3. You will see a preview of your website. Click it to open it.
4. **Copy the website URL from your browser's address bar.** It looks like: `https://pluginvault-saas-xxxx.vercel.app`. **This is your Vercel URL (Client URL).**

---

## ─── STAGE 5 ── Connect the Brain and the Face ───

Right now, the Brain (Render) doesn't know where the Face (Vercel) is, and we used temporary placeholders in Stage 3. Let's swap them for the real URLs!

### Step 5.1: Update Render Environment variables
1. Go back to your [render.com](https://render.com) dashboard.
2. Click on your `pluginvault-backend` Web Service.
3. Click the **Environment** tab on the left sidebar.
4. Find `CLIENT_URL` and change its value to your **Vercel URL** (e.g. `https://pluginvault-saas-xxxx.vercel.app`). *Make sure there is no slash `/` at the end!*
5. Find `BACKEND_URL` and change its value to your **Render Backend URL** (e.g. `https://pluginvault-backend-xxxx.onrender.com`). *Make sure there is no slash `/` at the end!*
6. Click the blue **Save Changes** button.
7. Click the **Manual Deploy** button at the top right, and choose **Deploy latest commit** to restart the server with the new URLs.

### Step 5.2: Configure Supabase Redirects (Crucial for Login)
1. Go back to your [supabase.com](https://supabase.com) dashboard.
2. Click **Authentication** on the left sidebar (the key icon).
3. Click **URL Configuration** in the sub-menu.
4. Change **Site URL** to your **Vercel URL** (e.g., `https://pluginvault-saas-xxxx.vercel.app`).
5. In the **Redirect URLs** box below it, click **Add URL**, and paste:
   `https://pluginvault-saas-xxxx.vercel.app/**` (add `/**` to the end of your Vercel URL).
6. Click **Save** at the bottom!

---

## ─── STAGE 6 ── Create Your Admin Account (The King) ───

Now let's create the master administrator account so you can approve plugins and manage users!

### Step 6.1: Sign up on your new website
1. Open your Vercel URL in your browser.
2. Click **Sign Up** on the page.
3. Type in your details. For your email, use `admin@pluginvault.com` and set a password.
4. Click **Sign Up**. You are now a normal customer.

### Step 6.2: Promote your account to Admin in the database
1. Go back to your [supabase.com](https://supabase.com) dashboard.
2. Click **SQL Editor** on the left sidebar.
3. Click **New Query** ➜ paste this simple command ➜ click **Run**:

```sql
-- Make your user an Admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@pluginvault.com';
```

4. Go back to your website, click **Log Out**, and then log back in.
5. **BOOM!** You will see an **Admin Dashboard** tab. You are now the King of your SaaS!

---

## ─── STAGE 7 ── Connect WordPress to Your SaaS ───

Your SaaS platform validates license keys for WordPress plugins. Here is the magic code you put inside your WordPress plugin so it can talk to your website!

### Step 7.1: Setup the Core Information
Put this at the very top of your WordPress plugin file (replace the backend URL with your real Render URL):

```php
<?php
// 1. Tell WordPress where your SaaS server is
define( 'PLUGINVAULT_API',     'https://YOUR_RENDER_URL.onrender.com/api/wp' );

// 2. Set your unique plugin slug (MUST match the slug in your SaaS dashboard)
define( 'PLUGINVAULT_SLUG',    'my-super-plugin' );

// 3. Your current plugin version
define( 'YOUR_PLUGIN_VERSION', '1.0.0' );
```

### Step 7.2: Auto-Update Checker
Paste this function in your WordPress plugin. This checks your SaaS site and tells WordPress to show the "Update Available" button whenever you upload a new ZIP version to your dashboard!

```php
<?php
add_filter( 'pre_set_site_transient_update_plugins', 'pluginvault_check_update' );
function pluginvault_check_update( $transient ) {
    if ( empty( $transient->checked ) ) return $transient;

    // Get the license key stored in the WP database
    $license_key = get_option( 'your_plugin_license_key', '' );
    if ( empty( $license_key ) ) return $transient;

    // Ask our SaaS API if there is a new update
    $response = wp_remote_get( add_query_arg( [
        'license_key'     => $license_key,
        'plugin_slug'     => PLUGINVAULT_SLUG,
        'current_version' => $transient->checked[ plugin_basename( __FILE__ ) ] ?? YOUR_PLUGIN_VERSION,
    ], PLUGINVAULT_API . '/check-update' ) );

    if ( is_wp_error( $response ) ) return $transient;

    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    // If yes, tell WordPress where to download the new version ZIP!
    if ( ! empty( $body['data']['update_available'] ) ) {
        $transient->response[ plugin_basename( __FILE__ ) ] = (object) [
            'slug'        => PLUGINVAULT_SLUG,
            'new_version' => $body['data']['new_version'],
            'package'     => $body['data']['download_url'],
            'url'         => 'https://YOUR_VERCEL_URL.vercel.app',
        ];
    }

    return $transient;
}
```

### Step 7.3: License Key Activation Code
When a customer buys your plugin, they get a `license_key` and a `one-time activation_code` from their dashboard. They paste them into your plugin settings. Here is how your plugin sends them to the backend to activate the site:

```php
<?php
function pluginvault_activate_license( $license_key, $activation_code ) {
    // Send a message to our SaaS server to register this site
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

    // If successful, save the details in the WordPress database
    if ( ! empty( $body['success'] ) ) {
        update_option( 'your_plugin_license_key', $license_key );
        update_option( 'your_plugin_license_status', 'active' );
    }

    return $body; // Returns whether it succeeded or failed!
}
```

### Step 7.4: License Key Validation (With 12-hour Caching)
To make sure the customer doesn't slow down their site, we check if the license is valid once every 12 hours and remember the result.

```php
<?php
function pluginvault_is_licensed() {
    $license_key = get_option( 'your_plugin_license_key', '' );
    if ( empty( $license_key ) ) return false;

    // Check if we already checked recently (cache)
    $cached = get_transient( 'pluginvault_license_valid' );
    if ( $cached !== false ) return (bool) $cached;

    // Call SaaS server to check if license is active
    $response = wp_remote_get( add_query_arg( [
        'license_key' => $license_key,
        'site_url'    => home_url(),
        'plugin_slug' => PLUGINVAULT_SLUG,
    ], PLUGINVAULT_API . '/validate-license' ) );

    $body  = json_decode( wp_remote_retrieve_body( $response ), true );
    $valid = ! empty( $body['data']['is_valid'] );

    // Remember the result for 12 hours
    set_transient( 'pluginvault_license_valid', $valid, 12 * HOUR_IN_SECONDS );
    return $valid;
}

// 💡 How to use this inside your plugin:
// if ( ! pluginvault_is_licensed() ) {
//     echo "Please activate your license key to use premium features!";
//     return; // Block premium features
// }
```

---

## ─── STAGE 8 ── Common Errors & Super Simple Fixes ───

### 🔴 Problem 1: It says "Network Error" when I try to log in!
- **Why it happens**: Your website face (Vercel) cannot talk to your website brain (Render) because the URLs are mismatched or you forgot `/api` at the end of `VITE_API_URL`.
- **Easy Fix**: Go to Vercel dashboard ➜ Environment variables ➜ check if `VITE_API_URL` looks like `https://your-backend.onrender.com/api` (no slash `/` at the end, but must end in `/api`). Then redeploy.

### 🔴 Problem 2: When I refresh `/dashboard` or `/login` I get a blank screen!
- **Why it happens**: Vercel gets confused when you reload a sub-page.
- **Easy Fix**: Make sure you have a file named `vercel.json` inside your `frontend` folder with this exact text in it:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 🔴 Problem 3: I submitted a request but it takes 30-50 seconds to respond!
- **Why it happens**: Render is on the **Free Tier**. If no one visits your server for 15 minutes, it goes to sleep. The first request takes a bit to wake it up!
- **Easy Fix**: To keep it awake, go to [uptimerobot.com](https://uptimerobot.com) (free) and set up a monitor that pings your backend URL (`https://your-backend.onrender.com/api/health`) once every 10 minutes. This will keep your server awake 24/7!

---

🚀 **You are now a master builder! Follow Stage 1 to 6 and enjoy your live SaaS platform!**
