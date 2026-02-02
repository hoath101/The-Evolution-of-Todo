# REST API — Task Endpoints

## Base URL conventions
- All task endpoints are under `/api/{user_id}/tasks`.
- `{user_id}` is the authenticated user identifier.

## Authentication requirements
All endpoints in this document require:
- `Authorization: Bearer <jwt>` header

### User identity constraint (non-negotiable)
- The backend MUST reject requests where JWT user identity does not equal `{user_id}` in the path.

## Common schemas

### Task (response)
```json
{
  "id": "string",
  "user_id": "string",
  "title": "string",
  "description": "string | null",
  "completed": false,
  "created_at": "string (ISO-8601)",
  "updated_at": "string (ISO-8601)"
}
```

### TaskCreateRequest
```json
{
  "title": "string",
  "description": "string | null"
}
```

### TaskUpdateRequest
```json
{
  "title": "string",
  "description": "string | null"
}
```

### Error response (all errors)
All error responses use a consistent shape:
```json
{
  "error": {
    "message": "string",
    "details": "string | null"
  }
}
```

## Status codes (general)
- `200 OK` — successful read/update
- `201 Created` — successful create
- `204 No Content` — successful delete
- `400 Bad Request` — validation errors
- `401 Unauthorized` — missing/invalid/expired token
- `403 Forbidden` — authenticated but not allowed (e.g., `{user_id}` mismatch)
- `404 Not Found` — resource not found in user scope

## Endpoints

### GET /api/{user_id}/tasks
List tasks for the authenticated user.

**Auth**: required.

**Behavior**:
- Verify JWT.
- Enforce JWT identity == `{user_id}`.
- Return only tasks owned by that user.

**Response 200**:
```json
{
  "tasks": [<Task>]
}
```

**Errors**:
- 401 if missing/invalid/expired token.
- 403 if `{user_id}` mismatch.

---

### POST /api/{user_id}/tasks
Create a new task for the authenticated user.

**Auth**: required.

**Request body**: `TaskCreateRequest`

**Behavior**:
- Verify JWT.
- Enforce JWT identity == `{user_id}`.
- Validate fields per `features/task-crud.md`.
- Create task owned by the authenticated user.

**Response 201**:
```json
{
  "task": <Task>
}
```

**Errors**:
- 400 for validation failures.
- 401 if missing/invalid/expired token.
- 403 if `{user_id}` mismatch.

---

### GET /api/{user_id}/tasks/{id}
Fetch a single task by ID.

**Auth**: required.

**Behavior**:
- Verify JWT.
- Enforce JWT identity == `{user_id}`.
- Return task if it exists and is owned by user.

**Response 200**:
```json
{
  "task": <Task>
}
```

**Errors**:
- 401 if missing/invalid/expired token.
- 403 if `{user_id}` mismatch.
- 404 if task does not exist in user scope.

---

### PUT /api/{user_id}/tasks/{id}
Update a task’s mutable fields.

**Auth**: required.

**Request body**: `TaskUpdateRequest`

**Behavior**:
- Verify JWT.
- Enforce JWT identity == `{user_id}`.
- Validate fields per `features/task-crud.md`.
- Update only allowed fields.
- Ownership is immutable.

**Response 200**:
```json
{
  "task": <Task>
}
```

**Errors**:
- 400 for validation failures.
- 401 if missing/invalid/expired token.
- 403 if `{user_id}` mismatch.
- 404 if task does not exist in user scope.

---

### DELETE /api/{user_id}/tasks/{id}
Delete a task.

**Auth**: required.

**Behavior**:
- Verify JWT.
- Enforce JWT identity == `{user_id}`.
- Delete only if the task exists and is owned by the user.

**Response 204**: no body.

**Errors**:
- 401 if missing/invalid/expired token.
- 403 if `{user_id}` mismatch.
- 404 if task does not exist in user scope.

---

### PATCH /api/{user_id}/tasks/{id}/complete
Update completion state.

**Auth**: required.

**Behavior (explicit)**:
- Verify JWT.
- Enforce JWT identity == `{user_id}`.
- If the task exists in the user scope, toggle `completed`:
  - If currently `false`, set to `true`.
  - If currently `true`, set to `false`.

**Response 200**:
```json
{
  "task": <Task>
}
```

**Errors**:
- 401 if missing/invalid/expired token.
- 403 if `{user_id}` mismatch.
- 404 if task does not exist in user scope.
