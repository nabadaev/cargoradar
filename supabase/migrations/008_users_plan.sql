-- Migration 008: Create users table with plan column + auto-populate on signup
-- Run in: Supabase dashboard → SQL Editor → New query

-- ── Users table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text NOT NULL,
  company_name text,
  role         text CHECK (role IN ('forwarder', 'importer', 'supply_chain', 'other')),
  alert_frequency text DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  plan         text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  stripe_customer_id text,
  created_at   timestamptz DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own row (email, company_name, role, alert_frequency)
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Service role can do anything (for server-side writes)
CREATE POLICY "service_all"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');

-- ── Trigger: auto-create users row on auth.users insert ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
