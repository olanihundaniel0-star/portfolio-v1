create extension if not exists pgcrypto;

create table if not exists public.wall_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 1 and char_length(name) <= 40),
  text text not null check (char_length(text) >= 1 and char_length(text) <= 280),
  sig text check (sig is null or char_length(sig) <= 150000),
  created_at timestamptz not null default now()
);

create index if not exists wall_messages_created_at_idx
  on public.wall_messages (created_at desc);

-- The wall is read/written through the serverless API (service-role key),
-- so browsers get no direct access.
alter table public.wall_messages enable row level security;
