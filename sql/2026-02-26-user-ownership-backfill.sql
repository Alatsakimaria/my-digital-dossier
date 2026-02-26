alter table public.jobs
add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

alter table public.projects
add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

alter table public.profile_settings
add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

update public.jobs j
set auth_user_id = u.auth_user_id
from public.app_users u
where j.username = u.username
  and j.auth_user_id is null;

update public.projects p
set auth_user_id = u.auth_user_id
from public.app_users u
where p.username = u.username
  and p.auth_user_id is null;

update public.profile_settings s
set auth_user_id = u.auth_user_id
from public.app_users u
where s.username = u.username
  and s.auth_user_id is null;

create index if not exists jobs_auth_user_id_idx on public.jobs(auth_user_id);
create index if not exists projects_auth_user_id_idx on public.projects(auth_user_id);
create index if not exists profile_settings_auth_user_id_idx on public.profile_settings(auth_user_id);

select pg_notify('pgrst', 'reload schema');
