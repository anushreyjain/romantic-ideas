-- ── HeartPrint — Supabase Setup ─────────────────────
-- Run this entire file in:
--   Supabase Dashboard → SQL Editor → New query → Paste → Run
-- ────────────────────────────────────────────────────────────

-- 1. Memories table
create table if not exists memories (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  date         text not null,          -- stored as "YYYY-MM-DD"
  location_name text not null,
  mappls_pin   text,                   -- Mappls / MapmyIndia 6-char place identifier
  eloc         text,                   -- legacy/alternate Mappls eLoc field, nullable
  longitude    float8 not null,
  latitude     float8 not null,
  story        text not null default '',
  image_url    text,                   -- public URL from Storage, nullable
  created_at   timestamptz not null default now()
);

-- 2. Row Level Security — allow everything (private app, single anon key)
alter table memories enable row level security;

drop policy if exists "Allow all operations" on memories;
create policy "Allow all operations" on memories
  for all using (true) with check (true);

-- 3. Storage bucket for memory photos
insert into storage.buckets (id, name, public)
values ('memory-images', 'memory-images', true)
on conflict (id) do nothing;

-- Allow anyone with the anon key to upload and read images
drop policy if exists "Public read" on storage.objects;
create policy "Public read" on storage.objects
  for select using (bucket_id = 'memory-images');

drop policy if exists "Anon upload" on storage.objects;
create policy "Anon upload" on storage.objects
  for insert with check (bucket_id = 'memory-images');

drop policy if exists "Anon delete" on storage.objects;
create policy "Anon delete" on storage.objects
  for delete using (bucket_id = 'memory-images');

-- Done! ✓
