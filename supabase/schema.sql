-- ============================================================
-- ATS Resume Optimizer — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- -------------------------
-- PROFILES TABLE
-- -------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','starter','pro','elite','byok')),
  country text not null default 'IN',
  currency text not null default 'INR' check (currency in ('INR','USD')),
  optimizations_used_this_month integer not null default 0,
  optimizations_reset_date date not null default date_trunc('month', now())::date,
  starter_optimizations_used integer not null default 0,
  starter_purchased_at timestamptz,
  starter_expires_at timestamptz,
  razorpay_customer_id text,
  razorpay_subscription_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

-- -------------------------
-- BYOK KEYS TABLE
-- -------------------------
create table if not exists public.byok_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  provider text not null check (provider in ('anthropic','openrouter','gemini','groq')),
  encrypted_api_key text not null,
  selected_model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------
-- RESUME ANALYSES TABLE
-- -------------------------
create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_resume_text text not null,
  job_description text not null,
  mode text not null check (mode in ('fresher','experienced','mba')),
  pages integer not null default 1,
  platform text not null,
  provider_used text not null,
  model_used text not null,
  ats_score integer not null default 0,
  keyword_match_score integer not null default 0,
  format_score integer not null default 0,
  missing_keywords text[] default '{}',
  found_keywords text[] default '{}',
  format_issues text[] default '{}',
  suggestions jsonb default '[]',
  platform_specific_tips text[] default '{}',
  optimized_resume_text text not null default '',
  cold_email_subject text,
  cold_email_body text,
  linkedin_connection_message text,
  linkedin_followup_message text,
  cover_letter text,
  created_at timestamptz not null default now()
);

-- -------------------------
-- INDEXES
-- -------------------------
create index if not exists idx_resume_analyses_user_created
  on resume_analyses(user_id, created_at desc);

create index if not exists idx_byok_keys_user
  on byok_keys(user_id);

-- -------------------------
-- DELETED ACCOUNTS BLOCKLIST
-- Keeps email after account deletion to prevent free-tier abuse via re-registration.
-- Legitimate interest basis under GDPR (fraud/abuse prevention).
-- -------------------------
create table if not exists public.deleted_accounts (
  email text primary key,
  deleted_at timestamptz not null default now()
);

-- No RLS needed — only service_role touches this table
grant all on public.deleted_accounts to service_role;

-- -------------------------
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- -------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  was_deleted boolean;
begin
  select exists(
    select 1 from public.deleted_accounts where email = new.email
  ) into was_deleted;

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    plan,
    country,
    currency,
    optimizations_used_this_month,
    optimizations_reset_date
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'free',
    coalesce(new.raw_user_meta_data->>'country', 'IN'),
    'INR',
    case when was_deleted then 2 else 0 end,
    date_trunc('month', now())::date
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------
-- ROW LEVEL SECURITY
-- -------------------------

-- profiles
alter table profiles enable row level security;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- byok_keys
alter table byok_keys enable row level security;

drop policy if exists "Users can manage own BYOK key" on byok_keys;
create policy "Users can manage own BYOK key"
  on byok_keys for all
  using (auth.uid() = user_id);

-- resume_analyses
alter table resume_analyses enable row level security;

drop policy if exists "Users can view own analyses" on resume_analyses;
create policy "Users can view own analyses"
  on resume_analyses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own analyses" on resume_analyses;
create policy "Users can insert own analyses"
  on resume_analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own analyses" on resume_analyses;
create policy "Users can update own analyses"
  on resume_analyses for update
  using (auth.uid() = user_id);

-- -------------------------
-- GRANT SERVICE ROLE ACCESS (for API routes using supabaseAdmin)
-- -------------------------
grant all on public.profiles to service_role;
grant all on public.byok_keys to service_role;
grant all on public.resume_analyses to service_role;
