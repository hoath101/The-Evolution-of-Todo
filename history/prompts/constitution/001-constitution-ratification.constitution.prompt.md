---
id: 001
title: Constitution Ratification
stage: constitution
date: 2025-12-27
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: Baloch
command: sp.constitution
labels: ["constitution","governance","setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - No tests for this session
---

## Prompt

Spec-Kit Plus Constitution
Project: Phase I – In-Memory Python Console Todo Application

## 1. Role & Authority
Claude Code acts as the **sole implementing agent** for this project.
All code, structure, documentation, and changes MUST be generated through Claude Code.
Manual coding by the human operator is strictly prohibited.

Claude Code is responsible for:
- Writing specifications
- Generating plans
- Decomposing tasks
- Implementing code
- Iterating based on review feedback

Failure to follow this workflow is considered a specification violation.

---

## 2. Development Methodology (MANDATORY)
This project MUST follow the **Agentic Dev Stack workflow** in strict order:

1. Write a formal specification (Spec-Kit Plus format)
2. Generate an explicit implementation plan
3. Break the plan into atomic, reviewable tasks
4. Implement tasks incrementally via Claude Code
5. Validate against requirements before proceeding

Claude Code MUST NOT:
- Skip steps
- Merge steps
- Implement code before a spec is approved

Each phase must leave an auditable trail in `specs/history/`.

---

## 3. Scope Definition – Phase I
Phase I is limited to a **local, in-memory, console-based Python application**.

Explicit constraints:
- No persistence (no files, no databases)
- No networking
- No UI beyond standard console I/O
- No external services

All state MUST exist only in memory during runtime.

---

## 4. Functional Requirements (NON-NEGOTIABLE)
Claude Code MUST implement **all** of the following features:

1. Add a task
   - Task must have: `id`, `title`, `description`, `completed` status

2. View tasks
   - List all tasks
   - Clearly indicate completion status
   - Display task IDs

3. Update a task
   - Update title and/or description by ID

4. Delete a task
   - Delete by ID
   - Handle invalid IDs gracefully

5. Mark task complete / incomplete
   - Toggle completion state by ID

Failure to implement **any** of the above is a Phase I failure.

---

## 5. Technical Constraints
- Language: Python 3.13+
- Dependency management: UV
- Execution: Console / CLI only
- Platform: Linux (WSL 2 for Windows users)

Code MUST:
- Be readable and idiomatic Python
- Follow clean code principles
- Avoid over-engineering
- Be logically structured into modules

---

## 6. Project Structure (REQUIRED)
Claude Code MUST produce the following structure:

/
├── sp.constitution
├── specs/
│ └── history/
├── src/
│ └── todo/
│ ├── init.py
│ ├── models.py
│ ├── service.py
│ ├── cli.py
│ └── main.py
├── README.md
└── CLAUDE.md

yaml
Copy code

Deviations require explicit justification in the spec.

---

## 7. Documentation Requirements
Claude Code MUST generate:

### README.md
- Project overview
- Setup instructions using UV
- How to run the console app
- Example usage

### CLAUDE.md
- Instructions for Claude Code on how to continue development
- Rules for adding future phases
- How to interpret existing specs

---

## 8. Quality & Validation Rules
Claude Code MUST:
- Validate all user input
- Handle invalid IDs safely
- Avoid crashes on incorrect input
- Ensure deterministic behavior

If ambiguity exists, Claude Code MUST:
- Document assumptions in the spec
- Prefer simplicity over complexity

---

## 9. Phase Boundaries
Claude Code MUST NOT:
- Implement features from future phases
- Add persistence, tests, or UI enhancements
- Introduce frameworks or unnecessary abstractions

Phase I ends when:
- All five features work as specified
- Application runs successfully from console
- Repository structure matches the constitution

---

## 10. Enforcement Clause
If Claude Code violates this constitution:
- The implementation must be rolled back
- A corrected spec must be written
- Work resumes only after spec approval

This constitution supersedes all other instructions unless explicitly amended.

## Response snapshot

Constitution ratified at version 1.0.0. Documented six core principles (Agentic Workflow, In-Memory Only, Functional Completeness, Technical Discipline, Project Structure, Quality & Validation), documentation requirements, phase boundaries, and governance rules. Sync impact report included at the top of the file. Templates validated for consistency.

## Outcome

- ✅ Impact: Constitution successfully ratified at v1.0.0 (initial)
- 🧪 Tests: No tests for this session
- 📁 Files: .specify/memory/constitution.md (created/updated)
- 🔁 Next prompts: /sp.specify - to create Phase I feature specification
- 🧠 Reflection: Initial constitution establishes clear guardrails for Phase I development. All principles are declarative, testable, and include rationales.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
