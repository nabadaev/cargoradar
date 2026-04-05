-- Zone score history for sparkline
-- Run in: Supabase dashboard → SQL Editor → New query
CREATE TABLE IF NOT EXISTS public.zone_score_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     uuid REFERENCES public.zones(id) ON DELETE CASCADE,
  risk_score  numeric(3,1),
  recorded_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS zone_score_history_zone_id_idx ON public.zone_score_history(zone_id, recorded_at DESC);
