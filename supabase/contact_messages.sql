create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 100),
  email text not null check (char_length(email) <= 320),
  subject text not null check (char_length(subject) <= 150),
  message text not null check (char_length(message) <= 5000),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
