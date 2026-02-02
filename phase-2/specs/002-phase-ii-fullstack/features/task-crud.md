# Feature Spec — Task CRUD (User-Scoped)

## Summary
Authenticated users can create, view, update, delete, and mark completion state for their own todo tasks via a web UI backed by a REST API.

All task operations are **strictly user-scoped**.

## Definitions
- **Task**: A todo item owned by exactly one user.
- **Owner / ownership**: The authenticated user whose `user_id` matches the task’s `owner_user_id`.

## User stories (all are user-scoped)

### US-001 — Create a task (Create)
As an authenticated user, I want to create a new task so that I can track what I need to do.

**Acceptance criteria**:
- Creating a task requires authentication.
- The created task is owned by the authenticated user.
- The created task appears in the user’s task list after creation.

### US-002 — View my tasks (Read — list)
As an authenticated user, I want to view a list of my tasks so that I can manage my work.

**Acceptance criteria**:
- Listing tasks requires authentication.
- The list contains only tasks owned by the authenticated user.
- Tasks are returned in a consistent order.

### US-003 — View a single task (Read — detail)
As an authenticated user, I want to view a single task by ID so that I can review its details.

**Acceptance criteria**:
- Reading a single task requires authentication.
- A user can only access tasks they own.

### US-004 — Update a task (Update)
As an authenticated user, I want to update a task’s title and/or description so that it stays accurate.

**Acceptance criteria**:
- Updating a task requires authentication.
- Only the owner may update the task.
- Validation rules apply (see below).

### US-005 — Delete a task (Delete)
As an authenticated user, I want to delete a task so that I can remove tasks I no longer need.

**Acceptance criteria**:
- Deleting a task requires authentication.
- Only the owner may delete the task.
- After deletion, the task no longer appears in the user’s list.

### US-006 — Mark complete/incomplete (Completion toggle)
As an authenticated user, I want to mark tasks complete (and optionally undo completion) so that I can track progress.

**Acceptance criteria**:
- Marking completion requires authentication.
- Only the owner may change completion state.
- The completion state is persisted.

## Ownership rules (non-negotiable)
- Every task has an `owner_user_id`.
- The backend must enforce that the authenticated JWT user identity equals:
  1) the `{user_id}` segment in the URL, and
  2) the task’s `owner_user_id` for item-level operations.

## Validation rules
The backend is authoritative for validation.

### Title
- Required
- Trim leading/trailing whitespace
- Min length: 1 character after trimming
- Max length: 120 characters

### Description
- Optional
- If provided, trim leading/trailing whitespace
- Max length: 2000 characters

### Completion state
- Boolean
- Default: `false` for new tasks

## Authentication failure behavior
For any endpoint in this feature:

- If the `Authorization` header is missing: reject.
- If the JWT is invalid or expired: reject.
- If JWT user identity does not match `{user_id}` in the path: reject.

Expected error responses (status codes and body shape) are defined in `api/rest-endpoints.md`.

## Operation-specific acceptance criteria (API-aligned)

### Create
- On success, returns the created task including its server-generated ID.
- The created task’s `owner_user_id` is derived from the JWT identity, not user input.

### List
- Returns only tasks owned by the authenticated user.
- Must not leak existence of other users’ tasks via data or metadata.

### Read single
- If task does not exist (in the user’s scope): return not found.

### Update
- Updating must not allow changing ownership.
- Updating must not allow setting fields outside the allowed set.

### Delete
- Deleting must be idempotent from the user perspective:
  - If the task does not exist in the user scope, return not found.

### Mark complete
- Uses a dedicated endpoint (`PATCH .../complete`) to set completion state.
- Behavior (whether it toggles or sets) is defined in API spec.

## Edge cases
- Creating a task with an empty/whitespace-only title is rejected.
- Updating a task to an empty/whitespace-only title is rejected.
- Description longer than max limit is rejected.
- Attempting to access another user’s tasks via URL tampering is rejected.
- Attempting to update/delete a task that does not exist in the user scope returns not found.
