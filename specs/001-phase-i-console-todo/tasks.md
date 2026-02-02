# Tasks: Phase I - In-Memory Python Console Todo Application

**Input**: Design documents from `/specs/001-phase-i-console-todo/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests for Phase I (tests excluded per Phase I non-goals)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are organized by user story for independent testability.

  Based on user stories from spec.md:
  - US1 (P1): Add New Tasks - 4 acceptance scenarios
  - US2 (P1): View Task List - 4 acceptance scenarios
  - US3 (P1): Mark Tasks Complete/Incomplete - 5 acceptance scenarios
  - US4 (P2): Delete Tasks - 5 acceptance scenarios
  - US5 (P2): Update Task Information - 5 acceptance scenarios

  Tests are EXCLUDED per Phase I non-goals.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create directory structure per constitution (src/todo/, specs/history/)
- [X] T002 Initialize UV project with pyproject.toml configuration
- [X] T003 Create empty __init__.py for todo package in src/todo/__init__.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define Task data structure in src/todo/models.py (dict with id, title, description, completed)
- [X] T005 Initialize in-memory task storage as empty list in src/todo/models.py
- [X] T006 Initialize next ID counter to 1 in src/todo/models.py
- [X] T007 Implement add_task(title, description) in src/todo/service.py (creates task with sequential ID)
- [X] T008 Implement get_all_tasks() in src/todo/service.py (returns list of all tasks)
- [X] T009 Implement get_task_by_id(id) in src/todo/service.py (returns task or None)
- [X] T010 Implement validate_id(id) in src/todo/service.py (checks positive integer, exists)
- [X] T011 Implement validate_title(title) in src/todo/service.py (checks non-empty after trim)
- [X] T012 Implement update_task(id, title, description) in src/todo/service.py
- [X] T013 Implement delete_task(id) in src/todo/service.py
- [X] T014 Implement mark_complete(id) in src/todo/service.py
- [X] T015 Implement mark_incomplete(id) in src/todo/service.py
- [X] T016 Implement error message constants in src/todo/cli.py (all user-facing messages)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add New Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to create new tasks with title and optional description

**Independent Test**: Can be fully tested by launching application, selecting Add Task, entering valid title/description, and verifying task appears in list with sequential ID and incomplete status

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement display_menu() in src/todo/cli.py (shows options 1-7)
- [X] T018 [US1] Implement get_menu_choice() in src/todo/cli.py (validates input 1-7, re-prompts on invalid)
- [X] T019 [US1] Implement get_valid_id(prompt) in src/todo/cli.py (parses integer, validates positive)
- [X] T020 [US1] Implement get_task_title() in src/todo/cli.py (collects and validates non-empty title)
- [X] T021 [US1] Implement get_task_description() in src/todo/cli.py (collects optional description)
- [X] T022 [US1] Implement handle_add_task() in src/todo/cli.py (calls service.add_task, displays result)
- [X] T023 [US1] Add Add Task option to main menu in src/todo/cli.py (option 1)

**Checkpoint**: At this point, users can add tasks but cannot yet view them

---

## Phase 4: User Story 2 - View Task List (Priority: P1) 🎯 MVP

**Goal**: Enable users to view all tasks with completion status indicators

**Independent Test**: Can be fully tested by creating multiple tasks (some complete, some incomplete), selecting View Tasks, and verifying all tasks display with correct status indicators

### Implementation for User Story 2

- [X] T024 [US2] Implement format_task(task) in src/todo/cli.py (returns formatted string with [ ]/[X] indicator)
- [X] T025 [US2] Implement handle_view_tasks() in src/todo/cli.py (checks empty list, formats all tasks, displays total count)
- [X] T026 [US2] Add View Tasks option to main menu in src/todo/cli.py (option 2)

**Checkpoint**: At this point, User Stories 1 AND 2 are functional - users can add and view tasks

---

## Phase 5: User Story 3 - Mark Tasks Complete/Incomplete (Priority: P1) 🎯 MVP

**Goal**: Enable users to toggle task completion status by ID

**Independent Test**: Can be fully tested by creating a task, marking it complete, viewing list to confirm, marking it incomplete, and verifying status reverts

### Implementation for User Story 3

- [X] T027 [US3] Implement handle_mark_complete() in src/todo/cli.py (gets ID, calls service.mark_complete, displays result)
- [X] T028 [US3] Implement handle_mark_incomplete() in src/todo/cli.py (gets ID, calls service.mark_incomplete, displays result)
- [X] T029 [P] [US3] Add Mark Complete option to main menu in src/todo/cli.py (option 5)
- [X] T030 [P] [US3] Add Mark Incomplete option to main menu in src/todo/cli.py (option 6)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 are all functional - core MVP complete

---

## Phase 6: User Story 4 - Delete Tasks (Priority: P2)

**Goal**: Enable users to permanently remove tasks from memory by ID

**Independent Test**: Can be fully tested by creating tasks, deleting specific task by ID, confirming deletion, and verifying task no longer appears

### Implementation for User Story 4

- [X] T031 [US4] Implement handle_delete_task() in src/todo/cli.py (gets ID, calls service.delete_task, displays result)
- [X] T032 [US4] Add Delete Task option to main menu in src/todo/cli.py (option 4)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 are all functional

---

## Phase 7: User Story 5 - Update Task Information (Priority: P2)

**Goal**: Enable users to modify task title and/or description by ID

**Independent Test**: Can be fully tested by creating a task, updating its title/description, and verifying updated values appear when viewing tasks

### Implementation for User Story 5

- [X] T033 [US5] Implement handle_update_task() in src/todo/cli.py (gets ID, shows current, collects new values, calls service.update_task, displays result)
- [X] T034 [US5] Add Update Task option to main menu in src/todo/cli.py (option 3)

**Checkpoint**: All five user stories should now be independently functional

---

## Phase 8: Application Entry Point

**Purpose**: Wire together CLI, services, and data models into running application

- [X] T035 Implement main() function in src/todo/main.py (initializes storage, displays menu, runs main loop)
- [X] T036 Add application welcome message in src/todo/main.py
- [X] T037 Implement main loop in src/todo/main.py (menu → handle action → repeat until exit)
- [X] T038 Implement application exit handling in src/todo/main.py (displays "Goodbye!" message)
- [X] T039 Add Exit option to main menu in src/todo/cli.py (option 7)

**Checkpoint**: Application should now be fully functional and runnable

---

## Phase 9: Documentation Artifacts

**Purpose**: User-facing documentation and AI agent guidance

- [X] T040 [P] Generate README.md with project overview, setup instructions, usage examples
- [X] T041 [P] Generate CLAUDE.md with continuation instructions, phase transition rules, spec interpretation guidance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2)
  - User Stories 1, 2, 3 (all P1) form core MVP
  - User Stories 4, 5 (P2) build on MVP
- **Application Entry Point (Phase 8)**: Depends on all user stories and CLI being complete
- **Documentation (Phase 9)**: Depends on all implementation being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational phase - No dependencies on other stories
- **User Story 2 (P1)**: Depends on Foundational phase - Depends on US1 (need tasks to view)
- **User Story 3 (P1)**: Depends on Foundational phase - Depends on US1 (need tasks to mark), uses US2 for verification
- **User Story 4 (P2)**: Depends on Foundational phase - Depends on US1 (need tasks to delete)
- **User Story 5 (P2)**: Depends on Foundational phase - Depends on US1 (need tasks to update), uses US2 for verification

### Within Each User Story

- Display/menu functions before handler functions
- Input validation functions before handler functions
- Handler functions use services from Foundational phase

### Parallel Opportunities

- T029 and T030 (menu option additions for US3) can run in parallel
- T040 and T041 (README.md and CLAUDE.md generation) can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch both menu option additions together:
Task: "Add Mark Complete option to main menu in src/todo/cli.py (option 5)"
Task: "Add Mark Incomplete option to main menu in src/todo/cli.py (option 6)"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Add Tasks)
4. Complete Phase 4: User Story 2 (View Tasks)
5. Complete Phase 5: User Story 3 (Mark Complete/Incomplete)
6. Complete Phase 8: Application Entry Point (to make it runnable)
7. **STOP and VALIDATE**: Test core MVP (add, view, mark tasks)
8. Demo/run if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Can create tasks
3. Add User Story 2 → Can view tasks
4. Add User Story 3 → Can mark complete/incomplete
5. Add Application Entry Point → Core MVP is runnable
6. Add User Story 4 → Can delete tasks
7. Add User Story 5 → Can update tasks
8. Add Documentation → Complete Phase I

Each user story adds value without breaking previous stories.

### Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are EXCLUDED per Phase I non-goals
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
