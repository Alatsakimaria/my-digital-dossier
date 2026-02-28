# QA Bug Reports — Sample Real Defects

## BUG-001 Wrong name flash after login
- Severity: Medium
- Priority: High
- Area: Dashboard Home
- Status: Fixed

### Summary
After login, dashboard briefly displayed "Maria Alatsaki" for ~1 second before switching to the actual user name.

### Steps to Reproduce
1. Log in as any user different from "Maria Alatsaki".
2. Observe the hero name immediately after dashboard loads.

### Expected
Only the active user's name should appear.

### Actual
A hardcoded fallback name appeared briefly.

### Root Cause
Hardcoded fallback string in dashboard hero title.

### Fix
Replaced fallback with runtime user identity (profile full name or username).

---

## BUG-002 Login prerender failure on deployment
- Severity: Critical
- Priority: High
- Area: Build / Deployment
- Status: Fixed

### Summary
Vercel build failed prerendering /login due to client hook and module evaluation patterns.

### Symptoms
- Prerender error on /login
- Build exited with status 1

### Root Cause
Build path sensitivity around login page behavior and dependency evaluation.

### Fix
- Removed problematic query hook pattern
- Switched to safe client-side query parsing
- Deferred Supabase helper import to submit-time dynamic import

### Verification
Local production build succeeds and login route is generated.

---

## BUG-003 Incorrect Vercel repo connection
- Severity: High
- Priority: High
- Area: CI/CD
- Status: Resolved (configuration)

### Summary
Vercel deployment was building a different repo/older commit than local project.

### Impact
Fixes present in local main were missing in deployment.

### Resolution
Reconnect Vercel project to the correct GitHub repository and redeploy latest commit.
