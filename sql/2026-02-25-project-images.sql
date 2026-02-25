-- Project gallery persistence (project_images) + permissive policies for MVP

create extension if not exists pgcrypto;

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_images_project_id_created_at
  on public.project_images (project_id, created_at desc);

alter table public.project_images enable row level security;

-- MVP policies (adjust to stricter auth model later)
drop policy if exists "project_images_select_all" on public.project_images;
create policy "project_images_select_all"
  on public.project_images
  for select
  using (true);

drop policy if exists "project_images_insert_all" on public.project_images;
create policy "project_images_insert_all"
  on public.project_images
  for insert
  with check (true);

drop policy if exists "project_images_update_all" on public.project_images;
create policy "project_images_update_all"
  on public.project_images
  for update
  using (true)
  with check (true);

drop policy if exists "project_images_delete_all" on public.project_images;
create policy "project_images_delete_all"
  on public.project_images
  for delete
  using (true);

-- Optional: ensure projects table can be updated if RLS is enabled
alter table public.projects enable row level security;

drop policy if exists "projects_select_all" on public.projects;
create policy "projects_select_all"
  on public.projects
  for select
  using (true);

drop policy if exists "projects_insert_all" on public.projects;
create policy "projects_insert_all"
  on public.projects
  for insert
  with check (true);

drop policy if exists "projects_update_all" on public.projects;
create policy "projects_update_all"
  on public.projects
  for update
  using (true)
  with check (true);

drop policy if exists "projects_delete_all" on public.projects;
create policy "projects_delete_all"
  on public.projects
  for delete
  using (true);
