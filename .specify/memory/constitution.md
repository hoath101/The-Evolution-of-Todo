<!--
Sync Impact Report
- Version change: null → 1.0.0 (initial ratification)
- Modified principles: N/A (initial creation)
- Added sections: Core Principles (I-VI), Phase Boundaries, Enforcement
- Removed sections: N/A (initial creation)
- Templates requiring updates: ✅ plan-template.md (constitution check section), ✅ spec-template.md (scope/requirements), ✅ tasks-template.md (task categorization), ✅ phr-template.prompt.md (stage routing)
- Follow-up TODOs: None
-->

# In-Memory Python Console Todo Application Constitution

## Core Principles

### I. Agentic Workflow (NON-NEGOTIABLE)
Claude Code acts as the **sole implementing agent** for this project. All code, structure, documentation, and changes MUST be generated through Claude Code. Manual coding by the human operator is strictly prohibited.

This project MUST follow the **Agentic Dev Stack workflow** in strict order:
1. Write a formal specification (Spec-Kit Plus format)
2. Generate an explicit implementation plan
3. Break the plan into atomic, reviewable tasks
4. Implement tasks incrementally via Claude Code
5. Validate against requirements before proceeding

Claude Code MUST NOT skip steps, merge steps, or implement code before a spec is approved. Each phase must leave an auditable trail in `specs/history/`.

**Rationale**: Ensures traceability, prevents ad-hoc changes, and maintains alignment with approved specifications throughout the development lifecycle.

### II. In-Memory Only
Phase I is limited to a **local, in-memory, console-based Python application**.

Explicit constraints:
- No persistence (no files, no databases)
- No networking
- No UI beyond standard console I/O
- No external services

All state MUST exist only in memory during runtime.

**Rationale**: Establishes clear boundaries for Phase I, prevents scope creep, and forces focus on core functionality without complexity from persistence or external dependencies.

### III. Functional Completeness
Claude Code MUST implement **all** of the following features without exception:

1. **Add a task** - Task must have: `id`, `title`, `description`, `completed` status
2. **View tasks** - List all tasks, clearly indicate completion status, display task IDs
3. **Update a task** - Update title and/or description by ID
4. **Delete a task** - Delete by ID, handle invalid IDs gracefully
5. **Mark task complete / incomplete** - Toggle completion state by ID

Failure to implement **any** of the above is a Phase I failure.

**Rationale**: These are non-negotiable requirements that define the minimum viable product. Completing all features ensures the application fulfills its core purpose.

### IV. Technical Discipline
Language: Python 3.13+
Dependency management: UV
Execution: Console / CLI only
Platform: Linux (WSL 2 for Windows users)

Code MUST:
- Be readable and idiomatic Python
- Follow clean code principles
- Avoid over-engineering
- Be logically structured into modules

**Rationale**: Consistent tooling and code standards maintain quality, readability, and maintainability while keeping the implementation simple and focused.

### V. Project Structure (REQUIRED)
Claude Code MUST produce the following structure:

```text
/
├── sp.constitution
├── specs/
│ └── history/
├── src/
│ └── todo/
│ ├── __init__.py
│ ├── models.py
│ ├── service.py
│ ├── cli.py
│ └── main.py
├── README.md
└── CLAUDE.md
```

Deviations require explicit justification in the spec.

**Rationale**: Enforces a consistent, logical structure that separates concerns (models, business logic, CLI interface) and makes the codebase navigable and maintainable.

### VI. Quality & Validation
Claude Code MUST:
- Validate all user input
- Handle invalid IDs safely
- Avoid crashes on incorrect input
- Ensure deterministic behavior

If ambiguity exists, Claude Code MUST document assumptions in the spec and prefer simplicity over complexity.

**Rationale**: Defensive programming prevents runtime failures, while documented assumptions and simplicity reduce technical debt and cognitive load.

## Documentation Requirements

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

**Rationale**: Comprehensive documentation enables both human and AI agents to understand, use, and extend the project consistently.

## Phase Boundaries

Claude Code MUST NOT:
- Implement features from future phases
- Add persistence, tests, or UI enhancements
- Introduce frameworks or unnecessary abstractions

Phase I ends when:
- All five features work as specified
- Application runs successfully from console
- Repository structure matches the constitution

**Rationale**: Prevents scope creep, ensures focus on approved requirements, and maintains clear phase transition points for future development.

## Governance

This constitution supersedes all other instructions unless explicitly amended.

**Amendment Process**:
1. Proposed amendments MUST be documented in `specs/history/`
2. Amendments require explicit approval in specification
3. Version MUST be incremented according to semantic versioning:
   - MAJOR: Backward incompatible principle removals or redefinitions
   - MINOR: New principle/section added or materially expanded guidance
   - PATCH: Clarifications, wording, typo fixes, non-semantic refinements
4. All PRs and reviews MUST verify compliance with current constitution
5. Constitution violations MUST trigger rollback, corrected spec, and re-approval

**Compliance Review**:
- Every specification must reference and satisfy applicable principles
- Every implementation plan must include a Constitution Check section
- Code review MUST validate adherence to functional and technical constraints
- Use `CLAUDE.md` for runtime development guidance and phase transition rules

**Version**: 1.0.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2025-12-27
