-- Migration 007: Add user_id column to zone_alerts for linking auth users to their subscriptions
-- Run in: Supabase dashboard → SQL Editor → New query

ALTER TABLE public.zone_alerts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS zone_alerts_user_id_idx ON public.zone_alerts(user_id);
