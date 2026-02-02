---
description: "Task list for Phase II full-stack todo implementation"
---

# Tasks: Phase II — Full-Stack, Multi-User Todo Web Application

**Input**: Design documents from `specs/002-phase-ii-fullstack/`
**Prerequisites**: @specs/002-phase-ii-fullstack/plan.md, @specs/002-phase-ii-fullstack/spec.md

**Tests**: Not included (not explicitly requested in specs).

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per `.specify/memory/constitution.md` Repository Structure.

- [X] T001 Create Phase II monorepo folders `frontend/` and `backend/`
- [X] T002 Initialize backend UV project in `backend/` (pyproject.toml, src package layout)
- [X] T003 Initialize Next.js 16 (App Router + TypeScript + Tailwind) project in `frontend/`
- [X] T004 [P] Create `backend/.env.example` with required keys (DATABASE_URL, BETTER_AUTH_SECRET, ALLOWED_ORIGINS)
- [X] T005 [P] Create `frontend/.env.example` with required keys (NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)
- [X] T006 [P] Create `backend/CLAUDE.md` and `frontend/CLAUDE.md` aligned with `.specify/memory/constitution.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story work.

- [X] T007 Create backend configuration loader in `backend/src/config.py` (env vars + validation)
- [X] T008 Create backend DB engine/session utilities in `backend/src/db.py` using SQLModel + DATABASE_URL
- [X] T009 Create Task SQLModel model in `backend/src/models/task.py` per @specs/002-phase-ii-fullstack/database/schema.md
- [X] T010 Create Task Pydantic/SQLModel schemas in `backend/src/schemas/task.py` (create/update/response)
- [X] T011 Implement JWT verify dependency in `backend/src/auth/jwt.py` using PyJWT + BETTER_AUTH_SECRET
- [X] T012 Implement FastAPI dependency enforcing `{user_id}` matches JWT identity in `backend/src/auth/user_scope.py`
- [X] T013 Implement consistent error response helpers in `backend/src/api/errors.py` using constitution error format
- [X] T014 [P] Configure CORS middleware in `backend/src/main.py` using ALLOWED_ORIGINS
- [X] T015 Create backend app + router structure in `backend/src/main.py` and `backend/src/api/__init__.py`
- [X] T016 Create frontend auth lib placeholder in `frontend/src/lib/auth.ts` (Better Auth instance stub)
- [X] T017 Create frontend API client wrapper in `frontend/src/lib/api.ts` (base URL + auth header injection placeholder)
- [X] T018 Create base UI shell in `frontend/src/app/layout.tsx` and `frontend/src/components/AppShell.tsx`

**Checkpoint**: Foundation ready — backend can authenticate requests and frontend has app skeleton.

---

## Phase 3: User Story 1 — Sign up / Sign in (Priority: P1)

**Goal**: Users can sign up and sign in via Better Auth and reach protected pages.

**Independent Test**: From a clean browser session, sign up, land on `/tasks`, sign out, verify `/tasks` redirects to sign-in.

- [X] T019 [P] [US1] Configure Better Auth instance in `frontend/src/lib/auth.ts` (trustedOrigins, BETTER_AUTH_URL, BETTER_AUTH_SECRET)
- [X] T020 [US1] Add Better Auth route handler in `frontend/src/app/api/auth/[...all]/route.ts`
- [X] T021 [P] [US1] Implement SignUp page + form in `frontend/src/app/sign-up/page.tsx` and `frontend/src/components/SignUpForm.tsx`
- [X] T022 [P] [US1] Implement SignIn page + form in `frontend/src/app/sign-in/page.tsx` and `frontend/src/components/SignInForm.tsx`
- [X] T023 [P] [US1] Implement SignOut button in `frontend/src/components/SignOutButton.tsx`
- [X] T024 [US1] Implement AuthGuard behavior (middleware or server-side check) in `frontend/middleware.ts` to protect `/tasks` routes
- [X] T025 [US1] Wire AppShell navigation auth states in `frontend/src/components/AppShell.tsx`

---

## Phase 4: User Story 2 — Create a task (Priority: P1)

**Goal**: Authenticated users can create tasks (persisted) and see them appear.

**Independent Test**: Create a task from `/tasks` UI; refresh; task persists.

- [X] T026 [P] [US2] Implement backend create-task service in `backend/src/services/tasks.py`
- [X] T027 [US2] Implement POST `/api/{user_id}/tasks` route in `backend/src/api/tasks.py`
- [X] T028 [P] [US2] Implement TaskEditor (create mode) in `frontend/src/components/TaskEditor.tsx`
- [X] T029 [US2] Implement create-task call in `frontend/src/lib/api.ts` (POST) including JWT attachment
- [X] T030 [US2] Render create UI on `frontend/src/app/tasks/page.tsx`

---

## Phase 5: User Story 3 — View my tasks (Priority: P1)

**Goal**: Authenticated users can view their own task list.

**Independent Test**: With multiple users, each user sees only their own tasks.

- [X] T031 [P] [US3] Implement backend list-tasks service in `backend/src/services/tasks.py` (owner filter + ordering)
- [X] T032 [US3] Implement GET `/api/{user_id}/tasks` route in `backend/src/api/tasks.py` (pagination max 100)
- [X] T033 [US3] Implement list-tasks call in `frontend/src/lib/api.ts` (GET) including JWT attachment
- [X] T034 [P] [US3] Implement TaskList + TaskListItem in `frontend/src/components/TaskList.tsx` and `frontend/src/components/TaskListItem.tsx`
- [X] T035 [US3] Render tasks list + empty/loading/error states on `frontend/src/app/tasks/page.tsx`

---

## Phase 6: User Story 4 — View a single task (Priority: P2)

**Goal**: Authenticated users can open a single task detail.

**Independent Test**: Open `/tasks/{id}` for an owned task and view details; try a non-owned id and get not-found.

- [X] T036 [P] [US4] Implement backend get-task service in `backend/src/services/tasks.py` (id + owner filter)
- [X] T037 [US4] Implement GET `/api/{user_id}/tasks/{id}` route in `backend/src/api/tasks.py`
- [X] T038 [US4] Implement get-task call in `frontend/src/lib/api.ts` (GET by id)
- [X] T039 [US4] Implement task detail page in `frontend/src/app/tasks/[id]/page.tsx` and `frontend/src/components/TaskDetail.tsx`

---

## Phase 7: User Story 5 — Update a task (Priority: P2)

**Goal**: Authenticated users can update title/description.

**Independent Test**: Edit task, refresh, confirm persisted and visible in list/detail.

- [X] T040 [P] [US5] Implement backend update-task service in `backend/src/services/tasks.py` (no ownership changes)
- [X] T041 [US5] Implement PUT `/api/{user_id}/tasks/{id}` route in `backend/src/api/tasks.py`
- [X] T042 [US5] Implement update-task call in `frontend/src/lib/api.ts` (PUT)
- [X] T043 [US5] Extend TaskEditor for edit mode in `frontend/src/components/TaskEditor.tsx`
- [X] T044 [US5] Wire edit flow in `frontend/src/app/tasks/[id]/page.tsx`

---

## Phase 8: User Story 6 — Toggle completion (Priority: P2)

**Goal**: Users can toggle task completion.

**Independent Test**: Toggle completion in list; refresh; state persists.

- [X] T045 [P] [US6] Implement backend toggle-complete service in `backend/src/services/tasks.py`
- [X] T046 [US6] Implement PATCH `/api/{user_id}/tasks/{id}/complete` route in `backend/src/api/tasks.py`
- [X] T047 [US6] Implement toggle-complete call in `frontend/src/lib/api.ts` (PATCH)
- [X] T048 [US6] Wire toggle UI in `frontend/src/components/TaskListItem.tsx`

---

## Phase 9: User Story 7 — Delete a task (Priority: P3)

**Goal**: Users can delete tasks.

**Independent Test**: Delete a task; it disappears; direct fetch returns 404.

- [X] T049 [P] [US7] Implement backend delete-task service in `backend/src/services/tasks.py`
- [X] T050 [US7] Implement DELETE `/api/{user_id}/tasks/{id}` route in `backend/src/api/tasks.py`
- [X] T051 [US7] Implement delete-task call in `frontend/src/lib/api.ts` (DELETE)
- [X] T052 [US7] Wire delete UI in `frontend/src/components/TaskListItem.tsx` (confirm + refresh list)

---

## Phase 10: Polish & Cross-Cutting Concerns

- [X] T053 [P] Align API error response parsing in `frontend/src/lib/api.ts` with constitution error format
- [X] T054 Add user-friendly ErrorBanner in `frontend/src/components/ErrorBanner.tsx` and use across pages
- [X] T055 Add loading UI component in `frontend/src/components/LoadingState.tsx` and use across pages
- [X] T056 Add backend logging for auth failures and forbidden access in `backend/src/auth/jwt.py` and `backend/src/main.py`
- [X] T057 Update `README.md` with run instructions and environment setup

---

## Dependencies & Execution Order

- Setup (Phase 1) blocks everything else.
- Foundational (Phase 2) blocks all user stories.
- User stories proceed in priority order:
  - P1: US1 → US2 → US3
  - P2: US4 → US5 → US6
  - P3: US7

## Parallel Opportunities

- Phase 1: T004–T006 can run in parallel.
- Phase 2: T014, T016–T018 can run in parallel with other foundational tasks (different files).
- Within each user story: tasks marked [P] can be executed in parallel.

## MVP Scope Suggestion

- MVP: US1 + US2 + US3 (auth + create + list).
