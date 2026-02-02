---
id: 0002
title: Phase II web plan
stage: plan
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-phase-ii-fullstack
branch: 001-phase-ii-fullstack-webapp
user: Baloch
command: /sp.plan
labels: ["phase-ii","plan","fullstack","nextjs","fastapi","betterauth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\history\phase-2.web.plan.md
 - C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\plan.md
tests:
 - (not run)
---

## Prompt

```text
<command-message>sp.plan</command-message>
<command-name>/sp.plan</command-name>
<command-args>Phase II Implementation Plan Prompt

You are Claude Code operating under the rules defined in `sp.constitution`.

Phase I is COMPLETE and FROZEN.
You MUST NOT modify, refactor, or depend on Phase I implementation code.

Approved Phase II specifications exist under:
/specs/

You MUST treat all specs as authoritative and reference them explicitly.

---

## REQUIRED SKILL USAGE (MANDATORY)
When generating this plan and during all future Phase II work, you MUST use the following Claude skills:

- **`nextjs-16`**
  For all frontend architecture, routing, rendering model, and UI concerns.

- **`betterauth`**
  For all authentication-related design, JWT issuance, session behavior, and frontend auth flows.

- **`fastapi`**
  For all backend API design, middleware, JWT verification, and request handling.

You MUST:
- Explicitly apply the appropriate skill when reasoning about each layer
- Align plan steps with the capabilities and best practices of each skill
- Avoid generic or framework-agnostic planning where a skill applies

Failure to use these skills is a plan violation.

---

## Objective
Generate a **clear, ordered, cross-stack implementation plan** for:

**Phase II: Full-Stack, Multi-User Todo Web Application**

The plan must describe **what will be built and in what sequence**, without performing implementation.

---

## HARD CONSTRAINTS (NON-NEGOTIABLE)
- DO NOT write implementation code
- DO NOT break work into atomic tasks
- DO NOT create or modify files
- DO NOT restate specifications verbatim
- DO NOT alter Phase I artifacts

This step is planning ONLY.

---

## Plan Output Requirements
Your output MUST be saved to:

specs/history/phase-2.web.plan.md

The plan MUST be:
- Sequential and dependency-aware
- Traceable to specific specs (via @specs references)
- Explicit about frontend vs backend responsibilities
- Auth-aware and user-isolation–centric

---

## MANDATORY PLAN STRUCTURE (IN THIS ORDER)

### 1. Plan Overview
- Scope confirmation (Phase II only)
- High-level execution strategy across frontend, backend, and database

---

### 2. Monorepo & Spec-Kit Alignment
- Validate Spec-Kit folder structure
- Confirm spec references and boundaries
- Ensure Phase I isolation

---

### 3. Database Layer (SQLModel + Neon)
- Apply @specs/database/schema.md
- Plan model definitions and ownership constraints
- Connection and environment assumptions

(Skill context: `fastapi`)

---

### 4. Backend API Foundation (FastAPI)
- App initialization and routing structure
- JWT verification middleware
- User identity extraction and enforcement
- Error handling strategy

(Skill context: `fastapi`)

---

### 5. REST Endpoint Implementation Order
- CRUD endpoints sequencing
- Ownership enforcement per endpoint
- Status codes and response consistency

Reference:
- @specs/api/rest-endpoints.md

(Skill context: `fastapi`)

---

### 6. Authentication Flow (Frontend-Driven)
- Better Auth setup and configuration
- JWT issuance and expiry assumptions
- Secure storage and usage of tokens
- Frontend → Backend trust model

Reference:
- @specs/features/authentication.md

(Skill context: `betterauth`)

---

### 7. Frontend Application Architecture (Next.js)
- App Router structure
- Page and layout responsibilities
- Server vs client component strategy
- Protected route behavior
- API client responsibilities

Reference:
- @specs/ui/pages.md
- @specs/ui/components.md

(Skill context: `nextjs-16`)

---

### 8. Frontend–Backend Integration
- API request flow with JWT
- Error and loading state handling
- User-scoped data rendering

(Skill context: `nextjs-16` + `fastapi`)

---

### 9. Documentation Artifacts
- Root README.md updates
- frontend/CLAUDE.md alignment
- backend/CLAUDE.md alignment

---

### 10. Validation & Phase Completion Checks
- Manual verification steps
- Auth enforcement validation
- User isolation verification
- Confirmation that Phase I remains untouched

---

## STYLE RULES
- Use numbered sections and substeps
- Use precise, technical language
- Reference specs using @specs/ paths
- Avoid speculative alternatives
- No pseu</command-args>
```

## Response snapshot

- Generated Phase II implementation plan and saved to:
  - `C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\history\phase-2.web.plan.md`
- Copied the finalized plan into the feature directory for Spec-Kit alignment:
  - `C:\Users\Baloch\GIAIC-WORK\todo\phase-2\specs\002-phase-ii-fullstack\plan.md`

Plan properties:
- Sequential and dependency-aware across DB → FastAPI → Better Auth → Next.js → integration
- References Phase II specs using @specs/002-phase-ii-fullstack/*
- Applies skill contexts for `fastapi`, `betterauth`, and `nextjs-16`
- Includes validation checks for auth enforcement and user isolation

## Outcome

- ✅ Impact: Phase II plan artifact created in phase-2 workspace.
- 🧪 Tests: Not run (planning-only).
- 📁 Files: 2 plan files written (history + feature plan).
- 🔁 Next prompts: /sp.tasks for Phase II.
- 🧠 Reflection: Resolve the error response shape mismatch before implementation to avoid contract drift.

## Evaluation notes (flywheel)

- Failure modes observed: `create-phr.sh` expected root-level `todo/specs/...`; used agent-native PHR creation under `phase-2/history/prompts/`.
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Update Spec-Kit scripts/config to operate within the `phase-2/` workspace.
