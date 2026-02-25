create extension if not exists pgcrypto;

create table if not exists public.profile_settings (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  full_name text,
  role_title text,
  tagline text,
  location text,
  email text,
  linkedin_url text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_settings_username_idx
  on public.profile_settings(username);

create or replace function public.set_profile_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profile_settings_updated_at on public.profile_settings;
create trigger trg_profile_settings_updated_at
before update on public.profile_settings
for each row
execute function public.set_profile_settings_updated_at();

alter table public.profile_settings enable row level security;

drop policy if exists "Allow public read profile_settings" on public.profile_settings;
create policy "Allow public read profile_settings"
on public.profile_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert profile_settings" on public.profile_settings;
create policy "Allow public insert profile_settings"
on public.profile_settings
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public update profile_settings" on public.profile_settings;
create policy "Allow public update profile_settings"
on public.profile_settings
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow public delete profile_settings" on public.profile_settings;
create policy "Allow public delete profile_settings"
on public.profile_settings
for delete
to anon, authenticated
using (true);

select pg_notify('pgrst', 'reload schema');
