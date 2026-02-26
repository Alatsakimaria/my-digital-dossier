create extension if not exists pgcrypto;

create table if not exists public.local_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  full_name text,
  password text not null,
  created_at timestamptz not null default now()
);

create index if not exists local_users_username_idx
  on public.local_users(username);

alter table public.local_users enable row level security;

drop policy if exists "Allow public read local_users" on public.local_users;
create policy "Allow public read local_users"
on public.local_users
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert local_users" on public.local_users;
create policy "Allow public insert local_users"
on public.local_users
for insert
to anon, authenticated
with check (true);

select pg_notify('pgrst', 'reload schema');
