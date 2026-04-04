-- CargoRadar database schema
-- Run this in: Supabase dashboard → SQL Editor → New query

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- zones: hot zones and trade lanes
create table if not exists public.zones (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text check (type in ('hotzone', 'tradelane')),
  coordinates jsonb,
  risk_score  numeric(3,1) check (risk_score between 1.0 and 10.0),
  risk_level  text check (risk_level in ('low', 'medium', 'high', 'critical')),
  description text,
  updated_at  timestamptz default now()
);

-- news_items: AI-processed news per zone
create table if not exists public.news_items (
  id           uuid primary key default gen_random_uuid(),
  zone_id      uuid references public.zones(id) on delete cascade,
  headline     text not null,
  source_url   text,
  source_name  text,
  published_at timestamptz default now(),
  raw_content  text,
  ai_summary   text,
  ai_impact    text,
  ai_severity  integer check (ai_severity between 1 and 10),
  created_at   timestamptz default now()
);

-- users: profile data (Supabase Auth provides auth.users)
create table if not exists public.users (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  company_name   text,
  role           text check (role in ('forwarder', 'importer', 'supply_chain', 'other')),
  alert_frequency text check (alert_frequency in ('instant', 'daily', 'weekly')),
  created_at     timestamptz default now()
);

-- user_subscriptions: which zones a user follows
create table if not exists public.user_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete cascade,
  zone_id    uuid references public.zones(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, zone_id)
);

-- waitlist: pre-launch email capture
create table if not exists public.waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  company_name text,
  role         text,
  created_at   timestamptz default now()
);

-- Row-level security
alter table public.waitlist           enable row level security;
alter table public.zones              enable row level security;
alter table public.news_items         enable row level security;
alter table public.users              enable row level security;
alter table public.user_subscriptions enable row level security;

-- Public read for zones and news (no login required)
create policy "zones public read"
  on public.zones for select using (true);

create policy "news_items public read"
  on public.news_items for select using (true);

-- Waitlist: anyone can insert (anon role), no one can read via API
create policy "waitlist insert"
  on public.waitlist for insert with check (true);

-- Users: can only see/edit own row
create policy "users own row"
  on public.users for all using (auth.uid() = id);

-- Subscriptions: own rows only
create policy "subscriptions own rows"
  on public.user_subscriptions for all using (
    auth.uid() = user_id
  );
