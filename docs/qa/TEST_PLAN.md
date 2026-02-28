# QA Test Plan — My Digital Dossier

## Objective
Validate core quality of My Digital Dossier for portfolio users and external HR viewers.

## Scope
In scope:
- Public welcome page
- Login / Signup flow
- Dashboard home/profile editing
- Jobs management
- Projects management (manual + GitHub import + pinning)
- Vault file flows (CV, grades)
- Public profile page sharing (/profile/[username])

Out of scope:
- Advanced performance profiling
- Penetration testing
- Cross-browser matrix beyond core smoke

## Test Types
- Functional testing
- UI/UX validation
- Regression testing
- Negative testing (invalid/missing data)
- Basic deployment validation

## Test Environment
- App stack: Next.js + Supabase
- Execution context: Local build and runtime checks
- Deployment target: Vercel

## Entry Criteria
- Latest code on main branch
- Supabase env vars configured
- Required SQL migrations applied

## Exit Criteria
- Critical user flows pass
- No blocking defects in auth, profile sharing, projects, or public page rendering
- Production build succeeds

## Priority Areas
P0:
- User can sign up/login
- User data isolation by username
- Public portfolio link opens and displays correct user data

P1:
- Project edit/pin/gallery behavior
- GitHub import via configured GitHub username
- CV link availability on public page

P2:
- UX polish and micro-copy consistency

## Risks
- Current local auth model uses plain password storage (testing-only risk)
- Misconfigured Vercel environment variables can break build/prerender
- Open RLS policies may expose write paths if publicly deployed without tightening
