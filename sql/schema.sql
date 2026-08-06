-- Run this in Supabase SQL Editor FIRST. Takes 2 minutes.

create extension if not exists "uuid-ossp";

create table complaints (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('pothole','garbage','drain','streetlight')),
  description text,
  latitude float8 not null,
  longitude float8 not null,
  image_url text,
  status text default 'pending' check (status in ('pending','in_progress','resolved')),
  department text,
  is_duplicate_of uuid references complaints(id),
  reporter_name text,
  created_at timestamptz default now()
);

-- Public read (for dashboard), public insert (for citizen form), no auth needed for MVP speed.
alter table complaints enable row level security;

create policy "public read" on complaints
  for select using (true);

create policy "public insert" on complaints
  for insert with check (true);

create policy "public update" on complaints
  for update using (true);

-- Storage bucket for complaint photos & policies
insert into storage.buckets (id, name, public)
values ('complaint-images', 'complaint-images', true)
on conflict (id) do nothing;

create policy "public storage upload" on storage.objects
  for insert with check (bucket_id = 'complaint-images');

create policy "public storage read" on storage.objects
  for select using (bucket_id = 'complaint-images');


-- Duplicate detection: rule-based, run as a query when a new complaint comes in.
-- Same category + within ~150m + within 48 hours = likely duplicate.
-- (150m ≈ 0.00135 degrees lat/lng at most latitudes, close enough for demo)
create or replace function find_duplicates(
  p_category text,
  p_lat float8,
  p_lng float8,
  p_created_at timestamptz default now()
) returns setof complaints as $$
  select * from complaints
  where category = p_category
    and abs(latitude - p_lat) < 0.0015
    and abs(longitude - p_lng) < 0.0015
    and created_at between p_created_at - interval '48 hours' and p_created_at
  order by created_at desc;
$$ language sql stable;
