This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase setup for Jobs tab

Run this SQL in your Supabase SQL editor so the Jobs tab can store and fetch records:

```sql
create extension if not exists pgcrypto;

create table if not exists public.jobs (
	id uuid primary key default gen_random_uuid(),
	username text not null,
	title text not null,
	company text not null,
	start_date date not null,
	end_date date,
	description text,
	created_at timestamptz not null default now()
);

create index if not exists jobs_username_idx on public.jobs(username);
create index if not exists jobs_start_date_idx on public.jobs(start_date desc);

alter table public.jobs enable row level security;

drop policy if exists "Allow public read jobs" on public.jobs;
create policy "Allow public read jobs"
on public.jobs
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert jobs" on public.jobs;
create policy "Allow public insert jobs"
on public.jobs
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public delete jobs" on public.jobs;
create policy "Allow public delete jobs"
on public.jobs
for delete
to anon, authenticated
using (true);

-- Storage policies (required for delete button in Vault)
drop policy if exists "Public read dossier files" on storage.objects;
create policy "Public read dossier files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'dossier-files');

drop policy if exists "Public insert dossier files" on storage.objects;
create policy "Public insert dossier files"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'dossier-files');

drop policy if exists "Public delete dossier files" on storage.objects;
create policy "Public delete dossier files"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'dossier-files');
```
