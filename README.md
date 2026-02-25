# My Digital Dossier

A portfolio web app built with Next.js + Supabase.

It includes:
- Portfolio Home (editable profile hero)
- Projects tab (manual projects, gallery uploads, pin/unpin best projects)
- Jobs tab (work experience CRUD)
- Vault tab (file storage in Supabase bucket)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Storage)

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start dev server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Database Setup (Supabase)

Run the SQL migrations in Supabase SQL Editor.

Required files:
- [sql/2026-02-25-project-images.sql](sql/2026-02-25-project-images.sql)
- [sql/2026-02-25-profile-settings.sql](sql/2026-02-25-profile-settings.sql)
- [sql/2026-02-25-project-pinning.sql](sql/2026-02-25-project-pinning.sql)

These add:
- `project_images` table for project gallery photos
- `profile_settings` table for editable home profile content
- `projects.is_pinned` column for best-project pinning

Also ensure your existing `jobs` and `projects` tables + policies are already created in Supabase.

## Storage Setup

Create a Supabase Storage bucket named `dossier-files`.

Make sure storage policies allow:
- read
- insert
- delete

for `anon` and `authenticated` roles (current MVP setup).

## Important Current Behavior

- Authentication is intentionally not implemented yet.
- The app currently uses a fixed username in [app/page.tsx](app/page.tsx) for MVP (`Alatsakimaria`).
- Data is stored per `username`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Next Planned Step

Add login/auth and move ownership from `username` to authenticated `user_id` with stricter RLS policies.
