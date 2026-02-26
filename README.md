# My Digital Dossier

Portfolio web app built with Next.js + Supabase.

## Features

- Login first flow (`/` redirects to `/login`)
- Dashboard route (`/dashboard`) with portfolio overview
- Editable profile hero (name, title, tagline, links)
- Jobs tab (create/delete work experience)
- Projects tab (create/edit/delete, image galleries, pin best projects)
- Vault tab (file storage in Supabase bucket)

## Current Routing

- [app/page.tsx](app/page.tsx) → redirects to `/login`
- [app/login/page.tsx](app/login/page.tsx) → username/full-name/password auth page
- [app/dashboard/page.tsx](app/dashboard/page.tsx) → main app dashboard

## Auth Model (Current)

For testing, auth is implemented with a `local_users` table and browser local session storage.

- Signup uses: `username`, `full_name`, `password`
- Login uses: `username`, `password`
- Logged-in user is stored in `localStorage` as `dossier_local_user`

Note: this is a testing setup and is **not production secure** (plain password storage).

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Storage)

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run app

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Supabase Setup

Run these SQL files in Supabase SQL Editor.

### Required (current app)

- [sql/2026-02-25-project-images.sql](sql/2026-02-25-project-images.sql)
- [sql/2026-02-25-profile-settings.sql](sql/2026-02-25-profile-settings.sql)
- [sql/2026-02-25-project-pinning.sql](sql/2026-02-25-project-pinning.sql)
- [sql/2026-02-26-storage-policies.sql](sql/2026-02-26-storage-policies.sql)
- [sql/2026-02-26-local-users.sql](sql/2026-02-26-local-users.sql)

### Optional / legacy experiments

- [sql/2026-02-26-app-users-auth.sql](sql/2026-02-26-app-users-auth.sql)
- [sql/2026-02-26-user-ownership-backfill.sql](sql/2026-02-26-user-ownership-backfill.sql)

## Storage

Bucket required: `dossier-files`

Ensure policies allow read/insert/update/delete as defined in:
- [sql/2026-02-26-storage-policies.sql](sql/2026-02-26-storage-policies.sql)

## Scripts

- `npm run dev` → development server
- `npm run build` → production build
- `npm run start` → production server
- `npm run lint` → ESLint

## Next Step

Replace testing auth with secure Supabase Auth (or custom backend auth), hash passwords, and enforce strict per-user RLS.
