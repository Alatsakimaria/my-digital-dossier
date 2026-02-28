# QA Test Cases — My Digital Dossier

Status legend: PASS / FAIL / BLOCKED / NOT RUN

## Authentication

### TC-AUTH-001 Signup with valid data
- Priority: P0
- Preconditions: Username not already used
- Steps:
  1. Open /login?mode=signup
  2. Enter valid username, full name, password >= 6
  3. Submit
- Expected:
  - User is created
  - Session stored
  - Redirect to /dashboard
- Status: PASS

### TC-AUTH-002 Login with valid credentials
- Priority: P0
- Steps:
  1. Open /login
  2. Enter existing username/password
  3. Submit
- Expected:
  - Redirect to /dashboard
  - Correct user data shown
- Status: PASS

### TC-AUTH-003 Login with invalid credentials
- Priority: P0
- Steps:
  1. Open /login
  2. Enter wrong password
  3. Submit
- Expected:
  - Error message shown
  - No redirect
- Status: PASS

## Dashboard Profile

### TC-PROFILE-001 Edit profile fields
- Priority: P0
- Steps:
  1. Dashboard -> Edit Profile
  2. Update full name, role, tagline, links
  3. Save
- Expected:
  - Updated values persist after refresh
- Status: PASS

### TC-PROFILE-002 Public link generation and copy
- Priority: P0
- Steps:
  1. Dashboard Home
  2. Locate Public Portfolio Link section
  3. Click Copy Link
- Expected:
  - Clipboard contains /profile/{username} URL
  - Copied confirmation appears
- Status: PASS

## Projects

### TC-PROJ-001 Create manual project
- Priority: P0
- Steps:
  1. Open Projects tab
  2. Add required fields
  3. Save project
- Expected:
  - Project card appears in list
- Status: PASS

### TC-PROJ-002 Edit project details in modal
- Priority: P1
- Steps:
  1. Open project modal
  2. Click Edit
  3. Update description and tech stack
  4. Save
- Expected:
  - Changes persist after navigation/reload
- Status: PASS

### TC-PROJ-003 Pin/unpin project
- Priority: P1
- Steps:
  1. Click Pin on project card
  2. Verify featured ordering on home/public page
- Expected:
  - Pinned project prioritized
- Status: PASS

### TC-PROJ-004 GitHub import source decoupled from app username
- Priority: P1
- Steps:
  1. Set github_username in profile
  2. Open Projects tab
- Expected:
  - Imported repos come from configured GitHub account
- Status: PASS

## Jobs

### TC-JOBS-001 Add job with month/year dates
- Priority: P1
- Steps:
  1. Open Jobs tab
  2. Add title/company/start and optional end date
  3. Save
- Expected:
  - Job appears in list and dashboard highlights
- Status: PASS

## Vault

### TC-VAULT-001 Upload user-specific CV
- Priority: P1
- Steps:
  1. Open Vault tab
  2. Upload CV
- Expected:
  - Stored under cvs/{username}/...
  - Public page can download latest CV when available
- Status: PASS

### TC-VAULT-002 Upload user-specific grades
- Priority: P1
- Steps:
  1. Open Vault tab
  2. Upload grade file
- Expected:
  - Stored under grades/{username}/...
- Status: PASS

## Public Portfolio

### TC-PUBLIC-001 Public profile renders by username
- Priority: P0
- Steps:
  1. Open /profile/{username}
- Expected:
  - Profile details, projects, experience, skills shown clearly
- Status: PASS

### TC-PUBLIC-002 Public page for unknown user
- Priority: P1
- Steps:
  1. Open /profile/nonexistent-user
- Expected:
  - Page renders safely with empty-state messaging (no crash)
- Status: PASS
