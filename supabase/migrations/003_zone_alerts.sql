-- Zone-specific alert subscriptions
-- Run in: Supabase dashboard → SQL Editor → New query
CREATE TABLE IF NOT EXISTS public.zone_alerts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  zone_name  text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, zone_name)
);
ALTER TABLE public.zone_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zone_alerts insert" ON public.zone_alerts FOR INSERT WITH CHECK (true);
