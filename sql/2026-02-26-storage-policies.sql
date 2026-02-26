-- Ensure dossier-files bucket exists and is public for portfolio assets
insert into storage.buckets (id, name, public)
values ('dossier-files', 'dossier-files', true)
on conflict (id) do update set public = excluded.public;

-- Read access (needed for public project/gallery image URLs)
drop policy if exists "Public read dossier files" on storage.objects;
create policy "Public read dossier files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'dossier-files');

-- Upload access for signed-in users
drop policy if exists "Authenticated insert dossier files" on storage.objects;
create policy "Authenticated insert dossier files"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'dossier-files');

-- Update/overwrite access for signed-in users
drop policy if exists "Authenticated update dossier files" on storage.objects;
create policy "Authenticated update dossier files"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'dossier-files')
with check (bucket_id = 'dossier-files');

-- Delete access for signed-in users
drop policy if exists "Authenticated delete dossier files" on storage.objects;
create policy "Authenticated delete dossier files"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'dossier-files');

select pg_notify('pgrst', 'reload schema');
