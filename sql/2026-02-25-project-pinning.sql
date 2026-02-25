alter table public.projects
add column if not exists is_pinned boolean not null default false;

update public.projects
set is_pinned = false
where is_pinned is null;

create index if not exists projects_username_pinned_created_idx
  on public.projects (username, is_pinned desc, created_at desc);

select pg_notify('pgrst', 'reload schema');
