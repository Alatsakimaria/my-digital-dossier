alter table public.profile_settings
add column if not exists github_username text;

select pg_notify('pgrst', 'reload schema');
