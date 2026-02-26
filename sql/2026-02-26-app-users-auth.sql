create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_users_auth_user_id_idx
  on public.app_users(auth_user_id);

create index if not exists app_users_username_idx
  on public.app_users(username);

create or replace function public.set_app_users_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at
before update on public.app_users
for each row
execute function public.set_app_users_updated_at();

alter table public.app_users enable row level security;

drop policy if exists "Allow public read app_users" on public.app_users;
create policy "Allow public read app_users"
on public.app_users
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert app_users" on public.app_users;
create policy "Allow public insert app_users"
on public.app_users
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public update app_users" on public.app_users;
create policy "Allow public update app_users"
on public.app_users
for update
to anon, authenticated
using (true)
with check (true);

select pg_notify('pgrst', 'reload schema');
