-- Authenticated user zone subscriptions
-- Run in: Supabase dashboard → SQL Editor → New query
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_name      text NOT NULL,
  alert_frequency text NOT NULL DEFAULT 'instant',
  created_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, zone_name)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_subscriptions select own" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions insert own" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions delete own" ON public.user_subscriptions
  FOR DELETE USING (auth.uid() = user_id);
