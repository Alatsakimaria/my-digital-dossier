# QA Execution Report — My Digital Dossier

Date: 2026-02-28
Tester Role: QA Engineer (portfolio simulation)

## Build Verification
- Command: npm run build
- Result: PASS
- Notes: App routes generated successfully, including /login and /profile/[username].

## Automation Verification (Playwright)
- Command: npm run test:e2e
- Result: PASS
- Execution: 3 passed (Chromium)

Automated smoke scenarios:
- Signup flow reaches dashboard
- Project creation from Projects tab
- Public portfolio link opens HR-facing profile page

## API Verification (Postman + Supabase REST)
- Collection: docs/qa/postman/MyDigitalDossier_QA.postman_collection.json
- Result: PASS (expected status/assertions met)

Validated requests:
- Health Check - Read profile_settings (200)
- Signup (testing) - Insert local_users (201 or 409)
- Upsert profile_settings (200 or 201)
- Get profile_settings by username (200, non-empty result)
- Create project (201, project id returned)
- Get projects by username (200, project list returned)

## Coverage Summary
- Planned test cases: 14
- Executed: 14
- Passed: 14
- Failed: 0
- Blocked: 0

## Areas Validated
- Authentication (signup/login/invalid login)
- Dashboard profile editing and persistence
- Public portfolio share link (copy + open)
- Projects CRUD/edit/pin/GitHub source behavior
- Jobs add/list behavior
- Vault user-scoped file paths
- Public profile rendering quality
- Supabase REST API checks for auth/profile/projects flows

## Defect Summary
- Critical: 0 open
- High: 0 open
- Medium: 0 open
- Low: 0 open

Historical defects captured and fixed:
- BUG-001 wrong name flash after login
- BUG-002 login prerender deployment failure
- BUG-003 Vercel connected to wrong repository

## QA Conclusion
The application is acceptable for demo/interview use based on current scope. Main user journeys are stable and build validation passes.

## Recommended Next QA Step
- Add CI pipeline to run lint + build + Playwright smoke tests on each push/PR.
- Add negative API tests (invalid key, missing fields, duplicate constraints).
