# Feature Specification: Phase II — Full-Stack, Multi-User Todo Web Application

**Feature Branch**: `001-phase-ii-fullstack-webapp`
**Created**: 2026-01-08
**Status**: Draft

## Spec set (authoritative)
This feature spec is split across multiple documents. This `spec.md` is the index and contains the prioritized user stories used for task generation.

- Overview: @specs/002-phase-ii-fullstack/overview.md
- Architecture: @specs/002-phase-ii-fullstack/architecture.md
- Authentication: @specs/002-phase-ii-fullstack/features/authentication.md
- Task CRUD: @specs/002-phase-ii-fullstack/features/task-crud.md
- REST API: @specs/002-phase-ii-fullstack/api/rest-endpoints.md
- Database: @specs/002-phase-ii-fullstack/database/schema.md
- UI components: @specs/002-phase-ii-fullstack/ui/components.md

## User Scenarios & Testing (mandatory)

### User Story 1 — Sign up / Sign in (Priority: P1)
A signed-out user can create an account and sign in so they can access the app.

**Why this priority**: Without authentication, nothing in the multi-user app can be accessed safely.

**Independent Test**: Create a new account, sign in, reach an authenticated-only page.

**Acceptance Scenarios**:
1. **Given** a signed-out user, **When** they sign up, **Then** they become authenticated and are redirected to tasks.
2. **Given** a signed-out user, **When** they sign in, **Then** they become authenticated and are redirected to tasks.

---

### User Story 2 — Create a task (Priority: P1)
As an authenticated user, I can create a task so that I can track what I need to do.

**Why this priority**: Creating tasks is core MVP functionality once authenticated.

**Independent Test**: Create a task and observe it in the task list.

**Acceptance Scenarios**:
1. **Given** an authenticated user, **When** they create a task, **Then** the task is created and appears in their list.

---

### User Story 3 — View my tasks (Priority: P1)
As an authenticated user, I can view my task list so that I can manage my work.

**Why this priority**: Listing tasks is required to manage tasks after creation.

**Independent Test**: View task list and confirm only your tasks appear.

**Acceptance Scenarios**:
1. **Given** an authenticated user with tasks, **When** they open the tasks page, **Then** they see only their tasks.

---

### User Story 4 — View a single task (Priority: P2)
As an authenticated user, I can view a single task so that I can review its details.

**Why this priority**: Needed for edit flows and detailed viewing.

**Independent Test**: Navigate to a task detail page and confirm it loads.

**Acceptance Scenarios**:
1. **Given** an authenticated user, **When** they open a task detail, **Then** they see task title/description/completion state.

---

### User Story 5 — Update a task (Priority: P2)
As an authenticated user, I can update a task so it stays accurate.

**Why this priority**: Common workflow after creation.

**Independent Test**: Update title/description and confirm changes persist.

**Acceptance Scenarios**:
1. **Given** an existing task, **When** the user edits it, **Then** the updated values are shown in list and detail.

---

### User Story 6 — Toggle completion (Priority: P2)
As an authenticated user, I can mark tasks complete/incomplete to track progress.

**Why this priority**: Core task lifecycle action.

**Independent Test**: Toggle completion in the list and confirm persisted.

**Acceptance Scenarios**:
1. **Given** a task, **When** the user toggles completion, **Then** completion state updates and persists.

---

### User Story 7 — Delete a task (Priority: P3)
As an authenticated user, I can delete a task to remove tasks I no longer need.

**Why this priority**: Important but can come after create/view/update.

**Independent Test**: Delete a task and confirm it disappears.

**Acceptance Scenarios**:
1. **Given** a task, **When** the user deletes it, **Then** it no longer appears in the list and cannot be fetched.

---

### Edge Cases
- Unauthorized access is rejected (401) and does not leak data.
- `{user_id}` URL tampering is rejected (403) and does not leak data.
- Non-existent tasks in user scope return 404.
- Validation rules from @specs/002-phase-ii-fullstack/features/task-crud.md are enforced.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: Frontend MUST implement sign-up, sign-in, and sign-out flows per @specs/002-phase-ii-fullstack/features/authentication.md.
- **FR-002**: Backend MUST verify JWT on every request and enforce `{user_id}` == JWT user identity.
- **FR-003**: Backend MUST implement the locked REST contract in @specs/002-phase-ii-fullstack/api/rest-endpoints.md.
- **FR-004**: System MUST enforce task ownership for all reads/writes per @specs/002-phase-ii-fullstack/features/task-crud.md.
- **FR-005**: Tasks MUST persist in Neon Postgres per @specs/002-phase-ii-fullstack/database/schema.md.

### Key Entities
- **User**: An authenticated identity managed by Better Auth (external to backend).
- **Task**: Backend-owned entity with `owner_user_id`, title, optional description, completed, timestamps.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: Authenticated users can create a task and see it listed immediately.
- **SC-002**: A user cannot read/modify tasks owned by another user (verified by URL tampering tests).
- **SC-003**: Tasks persist across browser refreshes and backend restarts.
