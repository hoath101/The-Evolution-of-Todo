# Phase II Implementation Plan — Full-Stack, Multi-User Todo Web Application

**Branch**: `001-phase-ii-fullstack-webapp` | **Date**: 2026-01-08 | **Spec refs**: @specs/002-phase-ii-fullstack/*

## 1. Plan Overview

1.1 Scope confirmation
- This plan covers **Phase II only** per `.specify/memory/constitution.md` Principle II.
- Phase I console app and Phase I specs remain untouched.

1.2 High-level execution strategy
- Build the system in dependency order:
  1) Database schema + SQLModel models (backend foundation)
  2) FastAPI app skeleton + JWT verification + consistent errors
  3) Task CRUD endpoints in the exact API contract order
  4) Better Auth integration in Next.js (JWT issuance + auth UI)
  5) Next.js App Router UI + protected routes
  6) Frontend↔Backend integration (JWT attachment, loading/error UX)
  7) Documentation + manual validation checks

(Frontend skill context: `nextjs-16`) (Auth skill context: `betterauth`) (Backend skill context: `fastapi`)

---

## 2. Monorepo & Spec-Kit Alignment

2.1 Validate required Phase II structure
- Ensure Phase II directories exist exactly as required by `.specify/memory/constitution.md` “Repository Structure (MANDATORY)”.
- Confirm these root paths exist (or are created during implementation steps, not during planning):
  - `phase-2/frontend/`
  - `phase-2/backend/`
  - `phase-2/specs/002-phase-ii-fullstack/`
  - `phase-2/history/`

2.2 Confirm authoritative spec references
- Treat these specs as the source of truth:
  - @specs/002-phase-ii-fullstack/overview.md
  - @specs/002-phase-ii-fullstack/architecture.md
  - @specs/002-phase-ii-fullstack/features/task-crud.md
  - @specs/002-phase-ii-fullstack/features/authentication.md
  - @specs/002-phase-ii-fullstack/api/rest-endpoints.md
  - @specs/002-phase-ii-fullstack/database/schema.md
  - @specs/002-phase-ii-fullstack/ui/components.md

2.3 Phase I isolation
- Enforce “no reuse of Phase I code in Phase II runtime paths” (constitution Principle II).
- Phase II implementation stands alone under `phase-2/frontend` and `phase-2/backend`.

---

## 3. Database Layer (SQLModel + Neon)

(Skill context: `fastapi`)

3.1 Apply @specs/002-phase-ii-fullstack/database/schema.md
- Create a `tasks` table representation in SQLModel with:
  - `id` (UUID primary key)
  - `owner_user_id` (string/UUID, not null)
  - `title` (not null)
  - `description` (nullable)
  - `completed` (bool default false)
  - `created_at`, `updated_at` (timezone-aware timestamps)
- Add index support for `(owner_user_id, created_at DESC)`.

3.2 Ownership constraints (data access rules)
- Treat ownership enforcement as a **query invariant**:
  - Any query for tasks MUST filter on `owner_user_id == jwt_user_id`.

3.3 Connection and environment assumptions
- Backend reads `DATABASE_URL` from environment (Neon Postgres) per constitution “Technical Constraints”.
- Use SQLModel + SQLAlchemy engine creation compatible with Postgres.
- Plan for connection pooling constraints (constitution “Performance Requirements”: max 10 connections).

3.4 Migration assumptions
- Specs state “migrations exist, tooling out of scope”.
- Plan assumes a minimal migration mechanism exists to create table + indexes before running the API.

---

## 4. Backend API Foundation (FastAPI)

(Skill context: `fastapi`)

4.1 App initialization and routing structure
- Create FastAPI application with:
  - App factory or module-level app (consistent with repo conventions)
  - Routers organized by domain (e.g., `api/tasks.py`)
- Implement routing to match @specs/002-phase-ii-fullstack/api/rest-endpoints.md.

4.2 JWT verification (stateless)
- Implement a FastAPI dependency (preferred in FastAPI patterns) that:
  - Reads `Authorization` header
  - Validates `Bearer <jwt>` format
  - Verifies signature using shared `BETTER_AUTH_SECRET` from env
  - Validates expiry (`exp`)
  - Extracts a stable `user_id` claim (as defined conceptually in @specs/002-phase-ii-fullstack/features/authentication.md)

4.3 User identity extraction and enforcement
- Implement a second dependency (or a helper used by endpoints) that:
  - Compares extracted JWT `user_id` with `{user_id}` from the path
  - If mismatch: return `403 Forbidden`

4.4 Error handling strategy (contract + consistency)
- Adopt one consistent JSON error shape across the backend.
- Note: constitution requires:
  ```json
  {"error":"string","detail":"string (optional)"}
  ```
  while @specs/002-phase-ii-fullstack/api/rest-endpoints.md currently defines:
  ```json
  {"error":{"message":"string","details":"string | null"}}
  ```
- Plan decision: **choose one shape and apply everywhere** before implementation starts (backend + frontend error handling). Prefer constitution’s locked API error format to avoid governance violation.

4.5 CORS and security basics
- Configure CORS using `ALLOWED_ORIGINS` env (constitution “Technical Constraints”).
- Log failed auth and forbidden access attempts (constitution “Maintainability”).

---

## 5. REST Endpoint Implementation Order

Reference: @specs/002-phase-ii-fullstack/api/rest-endpoints.md

(Skill context: `fastapi`)

5.1 Implement endpoints in dependency-aware order
1) `GET /api/{user_id}/tasks`
   - List tasks owned by JWT user
   - Apply pagination per constitution performance constraints (max 100 items/page) even if the spec doesn’t yet describe query params; document chosen query params in backend contract artifacts.

2) `POST /api/{user_id}/tasks`
   - Validate title/description constraints from @specs/002-phase-ii-fullstack/features/task-crud.md
   - Set `owner_user_id` from JWT identity (never from client input)

3) `GET /api/{user_id}/tasks/{id}`
   - Fetch by id + owner constraint
   - Return 404 if not found in user scope

4) `PUT /api/{user_id}/tasks/{id}`
   - Validate constraints
   - Update allowed fields only
   - Do not allow ownership changes

5) `DELETE /api/{user_id}/tasks/{id}`
   - Delete if exists in user scope; else 404

6) `PATCH /api/{user_id}/tasks/{id}/complete`
   - Toggle completed state per API spec

5.2 Response consistency
- Align success response bodies with API spec schemas (`{tasks: [...]}` and `{task: ...}`) and status codes.
- Enforce consistent timestamps (ISO-8601) across responses.

---

## 6. Authentication Flow (Frontend-Driven)

Reference: @specs/002-phase-ii-fullstack/features/authentication.md

(Skill context: `betterauth`)

6.1 Better Auth setup in Next.js
- Create Better Auth instance (commonly in `frontend/src/lib/auth.ts`) and configure:
  - `trustedOrigins` to include dev/prod origins
  - `baseURL` / `BETTER_AUTH_URL` for callback correctness
  - shared `BETTER_AUTH_SECRET` (env)

6.2 Next.js route handler wiring
- Add Next.js App Router handler (per Better Auth skill pattern):
  - `app/api/auth/[...all]/route.ts` exporting `GET` and `POST` via `toNextJsHandler(auth.handler)`

6.3 JWT issuance + expiry assumptions
- Frontend must be able to obtain a JWT for API requests.
- Backend treats JWT as the only auth proof (no sessions).

6.4 Secure storage and usage of tokens
- Use Better Auth’s recommended session/token handling.
- Avoid manually storing long-lived tokens in `localStorage` unless Better Auth requires it; prefer httpOnly cookies if Better Auth supports it.
- Regardless of storage, the frontend must be able to attach `Authorization: Bearer <jwt>` to FastAPI requests.

6.5 Frontend → Backend trust model
- Backend trusts only:
  - JWT signature + expiry
  - JWT user identity
- Backend does not call Better Auth or share session state.

---

## 7. Frontend Application Architecture (Next.js)

Reference: @specs/002-phase-ii-fullstack/ui/components.md

(Skill context: `nextjs-16`)

7.1 App Router structure
- Organize routes under `frontend/src/app/`:
  - Public routes:
    - `/sign-in`
    - `/sign-up`
  - Protected routes:
    - `/tasks` (list + create)
    - `/tasks/[id]` (detail/edit)

7.2 Server vs client component strategy
- Default to Server Components for pages/layouts.
- Use Client Components for interactive elements:
  - TaskEditor form (create/update)
  - buttons for toggle complete / delete
  - SignInForm / SignUpForm

7.3 Protected route behavior
- Implement route protection consistent with Next.js 16:
  - Prefer middleware gating or server-side session check (Better Auth pattern) to redirect signed-out users.
  - Ensure signed-in users are redirected away from sign-in/sign-up.

7.4 UI components mapping
- Implement conceptual components from @specs/002-phase-ii-fullstack/ui/components.md:
  - AppShell
  - AuthGuard
  - SignUpForm, SignInForm, SignOutButton
  - TaskList, TaskListItem
  - TaskEditor, TaskDetail
  - LoadingState, ErrorBanner

7.5 API client responsibilities
- Centralize API calls to FastAPI in `frontend/src/lib/api.ts` (or similar):
  - Automatically attach JWT
  - Standardize error parsing
  - Provide typed request/response helpers

---

## 8. Frontend–Backend Integration

(Skill context: `nextjs-16` + `fastapi`)

8.1 API request flow with JWT
- Derive `user_id` from the authenticated user/session in the frontend.
- Construct API URLs using that `user_id` to satisfy the locked contract:
  - `/api/{user_id}/tasks...`
- Attach `Authorization: Bearer <jwt>` for every request.

8.2 Loading and error state handling
- Use Next.js loading UI (`loading.tsx`) for route-level loading where appropriate.
- Within client components, show LoadingState during mutations.
- Render ErrorBanner for API errors.

8.3 User-scoped data rendering
- On task list page:
  - fetch only the signed-in user’s tasks
  - show empty state when list is empty
- On task detail page:
  - fetch task by id in user scope
  - handle 404 by showing a user-friendly not-found state

---

## 9. Documentation Artifacts

9.1 Root README.md updates
- Document how to run frontend + backend in development.
- Document required environment variables (frontend + backend) per constitution.

9.2 CLAUDE.md alignment
- Ensure `phase-2/CLAUDE.md` remains the top-level Phase II instructions.
- Add/align:
  - `phase-2/frontend/CLAUDE.md` with Next.js constraints and conventions.
  - `phase-2/backend/CLAUDE.md` with FastAPI/SQLModel constraints and conventions.

---

## 10. Validation & Phase Completion Checks

10.1 Manual verification steps
- Run backend and verify endpoints respond as expected.
- Run frontend and verify navigation and rendering.

10.2 Auth enforcement validation
- With no token: all API endpoints return 401.
- With invalid/expired token: return 401.

10.3 User isolation verification
- Sign in as User A, create tasks.
- Sign in as User B, verify User B cannot see User A’s tasks.
- Attempt URL tampering:
  - call `/api/{userB}/tasks` with User A’s token → 403.

10.4 Phase I remains untouched
- Confirm no changes to Phase I code or specs.

---

📋 Architectural decision detected: error response shape conflict between constitution (locked API error format) and @specs/api/rest-endpoints.md — Document reasoning and tradeoffs? Run `/sp.adr api-error-response-shape`.
