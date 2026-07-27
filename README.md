# Water Supply Construction Monitoring Dashboard — Backend

Authentication module implemented per `auth-system-design.md` and the overall
`backend-architecture.md`. Business-module CRUD (construction progress,
financial, EHS, risk/delay, resources) will be added in subsequent phases —
this phase covers login, refresh, logout, password reset, session
management, and RBAC scaffolding end-to-end.

## What's implemented

**Authentication**
- JWT access tokens (15 min) + opaque refresh tokens (7 days, httpOnly cookie)
- Refresh token rotation with reuse detection
- bcrypt password hashing, account lockout after repeated failed logins
- Password reset (forgot/reset) and authenticated password change,
  both invalidate all existing sessions
- Session listing/revocation (self-service + admin-forced)
- RBAC: 7 roles seeded (admin, project_manager, site_engineer,
  planning_engineer, finance, client, read_only_user), permission
  middleware backed by `role_permissions`, plus project-scope middleware
- Centralized error handling with the standard `{ success, error }` envelope
- Winston logging (file + console), audit log writes on login/logout/password events
- Rate limiting on login, refresh, and forgot-password endpoints

**Construction Progress** (Work Packages + Progress Entries)
- Full CRUD: GET (list + single), POST, PUT, PATCH, DELETE for both resources
- Business rules enforced in the service layer:
  - Work package weightage total capped at 100% per project
  - Work package dates must fall within the parent project's window
  - Only Planning Engineer/PM/Admin can edit planning fields via PATCH
  - Deleting a work package with progress history is blocked (409) —
    use PATCH/soft-delete semantics instead
  - One progress entry per work package per day (DB-enforced, mapped to 409)
  - Progress % cannot decrease unless the actor is PM/Admin
  - Site Engineers can only edit their own entries within a 24h window
  - Reported dates more than 30 days outside the planned window are
    rejected unless overridden by an Admin (`?force=true`)
- Project-scope middleware resolves the parent project from a
  work-package or progress-entry id so RBAC applies even on
  `/work-packages/:id`-style routes, not just project-nested ones
- Swagger/OpenAPI docs served live at `/api-docs`, combining every
  module's `*.openapi.yaml` file under `src/docs/`

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (currently wired up but not yet load-bearing for auth — reserved
  for rate-limit store / permission cache backing in a later pass)

## Setup (local, without Docker)

```bash
cp .env.example .env
# edit .env — set JWT_ACCESS_SECRET to a real random string, and DATABASE_URL
# to point at your local Postgres

npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Server starts on `http://localhost:4000`. Health check: `GET /health`.

## Setup (Docker Compose)

```bash
cp .env.example .env
# edit .env as above

docker compose up --build
# in a separate terminal, once containers are up:
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run prisma:seed
```

## Bootstrap admin login

After seeding, log in with the credentials from `.env`
(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) — **change this password
immediately** via `POST /api/v1/auth/password/change` after first login.

## Endpoints implemented

**Auth** — see `auth-system-design.md` §10 for the full table:
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/password/forgot
POST   /api/v1/auth/password/reset
POST   /api/v1/auth/password/change
GET    /api/v1/auth/me
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:id
DELETE /api/v1/auth/sessions
DELETE /api/v1/auth/users/:id/sessions   (Admin only)
```

**Construction Progress:**
```
GET    /api/v1/projects/:projectId/work-packages
POST   /api/v1/projects/:projectId/work-packages
GET    /api/v1/work-packages/:id
PUT    /api/v1/work-packages/:id
PATCH  /api/v1/work-packages/:id
DELETE /api/v1/work-packages/:id                       (Admin/PM only)
GET    /api/v1/work-packages/:workPackageId/progress-entries
POST   /api/v1/work-packages/:workPackageId/progress-entries
GET    /api/v1/progress-entries/:id
PUT    /api/v1/progress-entries/:id
PATCH  /api/v1/progress-entries/:id
DELETE /api/v1/progress-entries/:id                    (Admin/PM only)
```

Full request/response schemas and examples: run the server and visit
`/api-docs`.

## Known gaps / next steps

- `password/forgot` currently logs the raw reset token to the console
  instead of emailing it (no SMTP provider configured yet) — swap in a
  real mailer (e.g., Nodemailer + SES/SendGrid) before production use.
- Rate limiting uses in-memory storage — fine for a single instance;
  swap to a Redis-backed store (`rate-limit-redis`) before scaling to
  multiple API instances, so limits are shared across processes.
- `progress_entries.attachment_ids` is validated only for shape (array of
  UUIDs) — it does not yet check those IDs exist in an `attachments`
  table, since the file-upload module hasn't been built yet. Add that
  existence check once attachments land.
- The "latest_progress_pct" field on the work package list endpoint is
  computed with one extra query per row (N+1) — fine at current scale;
  revisit with a single aggregated query (e.g., `DISTINCT ON`) if a
  project's work-package count grows large.
- No automated tests yet.
- Remaining business modules (financial, EHS, risk/delay, resources) are
  not yet part of this Prisma schema — they'll be added module-by-module,
  matching the earlier SQL schema design.
