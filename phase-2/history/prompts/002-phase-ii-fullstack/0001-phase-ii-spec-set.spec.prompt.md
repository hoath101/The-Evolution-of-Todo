---
id: 0001
title: phase ii spec set
stage: spec
date: 2026-01-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-phase-ii-fullstack
branch: 001-phase-ii-fullstack-webapp
user: Baloch
command: /sp.specify
labels: ["phase-ii","spec","fullstack","todo"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\overview.md
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\architecture.md
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\features\task-crud.md
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\features\authentication.md
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\api\rest-endpoints.md
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\database\schema.md
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\ui\components.md
tests:
 - (not run)
---

## Prompt

```text
Phase II Specification Prompt

You are Claude Code operating under the rules defined in `sp.constitution`.

Phase I is COMPLETE and FROZEN.
You MUST NOT modify, refactor, or depend on Phase I implementation code.

---

## Objective
Produce the **complete Phase II specification set** for:

**Phase II: Full-Stack, Multi-User Todo Web Application**

This phase transforms the console app into a modern, authenticated, persistent web application using a Spec-Kit Plus–managed monorepo.

---

## HARD CONSTRAINTS (NON-NEGOTIABLE)
- DO NOT write implementation code
- DO NOT generate plans or task breakdowns
- DO NOT create or modify source files
- DO NOT alter Phase I specs or code
- ONLY write specifications in Spec-Kit Plus format

Any violation invalidates the output.

---

## Specification Output Requirements
You MUST generate **multiple structured specification files** under `/specs/` following Spec-Kit conventions.

All files MUST be written in markdown and MUST be precise enough that Claude Code can implement the system without clarification.

---

## REQUIRED SPEC FILES (MANDATORY)

### 1. `/specs/overview.md`
Include:
- Project purpose
- Current phase: Phase II
- High-level system description
- Explicit statement that Phase I is frozen and out of scope
- Technology stack summary

---

### 2. `/specs/architecture.md`
Define:
- Frontend ↔ Backend ↔ Database architecture
- Authentication flow (Better Auth → JWT → FastAPI)
- Request/response lifecycle
- Trust boundaries and security assumptions
- Monorepo structure and responsibilities

No diagrams required, but logical flow MUST be explicit.

---

### 3. `/specs/features/task-crud.md`
Specify:
- User stories for all five CRUD operations
- Task ownership rules
- Validation rules (title length, description limits, etc.)
- Acceptance criteria for each operation
- Behavior under authentication failure

All behavior MUST be user-scoped.

---

### 4. `/specs/features/authentication.md`
Specify:
- User signup and signin behavior (frontend)
- Better Auth configuration expectations
- JWT issuance, contents, and expiry
- Auth failure modes
- Security guarantees and assumptions

Explicitly state:
- Backend never manages sessions
- Backend only verifies JWTs

---

### 5. `/specs/api/rest-endpoints.md`
Define:
- Base API URL conventions
- Authentication requirements (Authorization header)
- Exact endpoint behavior for:
  - GET /api/{user_id}/tasks
  - POST /api/{user_id}/tasks
  - GET /api/{user_id}/tasks/{id}
  - PUT /api/{user_id}/tasks/{id}
  - DELETE /api/{user_id}/tasks/{id}
  - PATCH /api/{user_id}/tasks/{id}/complete
- Request/response schemas
- Error responses and status codes

JWT user identity MUST match `{user_id}`.

---

### 6. `/specs/database/schema.md`
Define:
- Database tables
- Columns and data types
- Relationships
- Indexes
- Ownership constraints
- Migration assumptions (no tooling details)

Assume Neon PostgreSQL.

---

### 7. `/specs/ui/components.md`
Specify:
- Core UI components
- Responsibilities of each component
- Auth-dependent rendering rules
```

## Response snapshot

Created the Phase II specification set under `phase-2/specs/002-phase-ii-fullstack/` with the required files:
- overview.md
- architecture.md
- features/task-crud.md
- features/authentication.md
- api/rest-endpoints.md
- database/schema.md
- ui/components.md

## Outcome

- ✅ Impact: Phase II multi-file spec set exists in the phase-2 workspace and is ready for planning/tasks.
- 🧪 Tests: Not run (spec-only output).
- 📁 Files: 7 spec files created.
- 🔁 Next prompts: /sp.plan (Phase II) then /sp.tasks.
- 🧠 Reflection: Keep auth/user-scope invariants explicit across features and API specs.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
