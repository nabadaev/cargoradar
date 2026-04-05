-- Phase 4 migration: add CMRS and structured impact columns to news_items
-- Run in: Supabase dashboard → SQL Editor → New query

alter table public.news_items
  add column if not exists event_category    text,
  add column if not exists event_type        text check (event_type in ('ACT', 'THREAT', 'SIGNAL', 'OPS')),
  add column if not exists proximity_score   numeric(3,2) check (proximity_score between 0 and 1),
  add column if not exists credibility_score numeric(3,2) check (credibility_score between 0 and 1),
  add column if not exists cmrs_score        numeric(3,1) check (cmrs_score between 1.0 and 10.0),
  add column if not exists impact_zone       text,
  add column if not exists impact_region     text,
  add column if not exists impact_lane       text;
