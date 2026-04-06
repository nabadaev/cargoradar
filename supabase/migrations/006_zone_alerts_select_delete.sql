-- Add SELECT and DELETE policies to zone_alerts.
-- Without these, RLS blocks all reads (subscriptions don't persist across
-- page loads) and all deletes (unsubscribe silently fails).
-- Run in: Supabase dashboard → SQL Editor → New query

CREATE POLICY "zone_alerts select" ON public.zone_alerts
  FOR SELECT USING (true);

CREATE POLICY "zone_alerts delete" ON public.zone_alerts
  FOR DELETE USING (true);
