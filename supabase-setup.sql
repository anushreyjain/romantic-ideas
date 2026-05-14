-- ── HeartPrint — Supabase Setup ─────────────────────
-- Run this entire file in:
--   Supabase Dashboard → SQL Editor → New query → Paste → Run
-- ────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- 1. Couples table
create table if not exists couples (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,
  access_key_hash text not null unique,
  created_at      timestamptz not null default now()
);

-- 2. Memories table
create table if not exists memories (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid references couples(id) on delete cascade,
  title         text not null,
  date          text not null,          -- stored as "YYYY-MM-DD"
  location_name text not null,
  mappls_pin   text,                   -- Mappls / MapmyIndia 6-char place identifier
  eloc         text,                   -- legacy/alternate Mappls eLoc field, nullable
  longitude    float8 not null,
  latitude     float8 not null,
  story        text not null default '',
  image_url    text,                   -- public URL from Storage, nullable
  created_at   timestamptz not null default now()
);

alter table memories
  add column if not exists couple_id uuid references couples(id) on delete cascade;

create index if not exists memories_couple_id_date_idx
  on memories(couple_id, date desc);

-- Existing rows from before couple auth will have no couple_id and will not be
-- visible in the app. After creating your first couple, backfill them:
-- update memories set couple_id = '<couple-id>' where couple_id is null;
-- alter table memories alter column couple_id set not null;

-- 3. Row Level Security — deny direct anonymous table access.
-- The Next.js API uses SUPABASE_SERVICE_ROLE_KEY server-side and scopes every
-- query by the signed couple session cookie.
alter table memories enable row level security;

drop policy if exists "Allow all operations" on memories;

-- 4. Storage bucket for memory photos
insert into storage.buckets (id, name, public)
values ('memory-images', 'memory-images', true)
on conflict (id) do nothing;

-- Images are uploaded through the server API under <couple-id>/<file>.
-- Public read keeps saved image URLs renderable in the browser.
drop policy if exists "Public read" on storage.objects;
create policy "Public read" on storage.objects
  for select using (bucket_id = 'memory-images');

drop policy if exists "Anon upload" on storage.objects;
drop policy if exists "Anon delete" on storage.objects;

-- Done! ✓
