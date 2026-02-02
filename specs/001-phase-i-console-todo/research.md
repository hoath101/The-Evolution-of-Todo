# Research: Phase I - In-Memory Python Console Todo Application

**Created**: 2025-12-27
**Feature**: Phase I - In-Memory Python Console Todo Application

## Overview

Research findings for implementing a console-based todo application in Python with in-memory storage. All technical decisions align with specification requirements and constitutional constraints.

## Technical Decisions

### Python Standard Library for CLI Interactions

**Decision**: Use Python's built-in `input()` function and `print()` statements for all console I/O operations.

**Rationale**:
- Zero external dependencies required
- Sufficient for text-based command-line interfaces
- Provides cross-platform compatibility
- Supports UTF-8 encoding for unicode text

**Alternatives Considered**:
- `curses` library: Rejected as unnecessary complexity for simple menu interface
- `argparse` for CLI flags: Rejected as application uses interactive menu, not command-line arguments
- Third-party CLI frameworks (Click, Typer): Rejected per constitution's "avoid over-engineering" principle

### In-Memory Data Structure for Task Storage

**Decision**: Use Python `list` for task storage with task objects stored as dictionary instances.

**Rationale**:
- Simple, built-in data structure requiring no external dependencies
- O(n) lookup by ID is acceptable for Phase I scale (no performance requirements specified)
- List preserves insertion order, matching ID sequence naturally
- Dictionary-based task objects provide clear attribute access

**Alternatives Considered**:
- `dict` with ID as key: Rejected as it would require manual tracking of next ID value
- `pandas` DataFrame: Rejected as external dependency, over-engineering for Phase I
- Custom class-based storage: Considered, but dictionary objects offer simpler implementation

### ID Generation Strategy

**Decision**: Use a simple integer counter starting at 1, incrementing for each new task. Store counter in application state.

**Rationale**:
- Matches specification requirement for sequential positive integer IDs starting from 1
- Simple, predictable, and easy to verify manually
- No complexity from UUID generation or random IDs
- Supports specification requirement that IDs are never reused after deletion

**Alternatives Considered**:
- UUID strings: Rejected as not sequential integers (violates spec)
- Timestamp-based IDs: Rejected as not sequential and potentially confusing
- Reuse deleted IDs: Explicitly prohibited by specification (FR-013)

### Input Validation Approach

**Decision**: Implement validation functions using Python's built-in string methods and type checking with `try/except` for integer parsing.

**Rationale**:
- Zero external dependencies required
- `str.strip()` handles whitespace trimming (FR-019)
- `int()` conversion with exception handling validates numeric input (FR-016)
- String methods (`len()`, `isspace()`) validate non-empty titles (FR-012)

**Alternatives Considered**:
- `pydantic` or `marshmallow` validation libraries: Rejected as external dependencies, over-engineering
- Regular expressions: Considered but rejected as unnecessary complexity for simple validations

### Menu Interface Design

**Decision**: Implement a loop-based menu with numbered options displayed to user. User enters option number to select action. Loop continues until user selects "exit" option.

**Rationale**:
- Simple, familiar pattern for console applications
- Easy to understand and use
- Minimal keyboard interaction required (numbers only)
- Supports all five operations with clear menu labels

**Menu Options Structure**:
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Complete
6. Mark Incomplete
7. Exit

**Alternatives Considered**:
- Command-line arguments: Rejected as not suitable for interactive task management
- Single-letter shortcuts: Rejected as less discoverable than numbered menu
- Graphical menu using ASCII art: Rejected as unnecessary complexity

### Modular Code Organization

**Decision**: Separate concerns into four Python modules as specified in constitution:
- `models.py`: Task data model definition
- `service.py`: Business logic and task management operations
- `cli.py`: User interaction and menu handling
- `main.py`: Application entry point and initialization

**Rationale**:
- Directly matches constitution's required project structure
- Clear separation of concerns (data, logic, UI, entry)
- Each module can be read and tested independently
- Follows Python best practices for package organization

**Alternatives Considered**:
- Single monolithic file: Rejected as violates constitution's structure requirement
- Additional utility modules: Rejected as over-engineering for Phase I scope

### Error Handling Strategy

**Decision**: Use `try/except` blocks for input parsing and conditional checks for business logic errors. All errors result in user-friendly messages printed to console, application continues running.

**Rationale**:
- Matches specification requirement FR-017 for user-friendly error messages
- Prevents application crashes (constitution requirement)
- Allows user to retry failed operations without restarting
- Python's exception handling is built-in and robust

**Error Categories**:
1. Input format errors (non-numeric when ID required)
2. Validation errors (empty title, negative ID)
3. Business logic errors (task not found)
4. Unexpected errors (catch-all with generic message)

**Alternatives Considered**:
- Exit application on any error: Rejected as fails constitution's "avoid crashes" requirement
- Silent error swallowing: Rejected as prevents user feedback
- Exception propagation to main with logging: Considered but rejected as adds complexity for simple CLI app

### UV Dependency Management

**Decision**: Use UV for Python environment setup even though Phase I has no external dependencies. Initialize a minimal UV project structure.

**Rationale**:
- Matches constitution's requirement for UV dependency management
- Provides consistent environment for future phases
- Establishes standard Python project structure
- Minimal overhead for dependency-free project

**Configuration**:
- `pyproject.toml` with project metadata
- No external package dependencies
- Python 3.13+ version requirement specified

**Alternatives Considered**:
- Skip UV entirely: Rejected as violates constitution's technical discipline principle
- Use `pip` and `requirements.txt`: Rejected as constitution specifies UV

## Constraints Compliance

### Constitution Principles Verified

- **Agentic Workflow**: All implementation through Claude Code ✓
- **In-Memory Only**: No persistence, no networking, console-only ✓
- **Functional Completeness**: All five features (add, view, update, delete, mark complete/incomplete) supported ✓
- **Technical Discipline**: Python 3.13+, UV, console/CLI, modular structure ✓
- **Project Structure**: Required directory structure planned ✓
- **Quality & Validation**: Input validation, error handling, deterministic behavior designed ✓

### Non-Goals Maintained

- No persistence mechanisms included ✓
- No test framework or automated tests planned ✓
- No UI frameworks or GUI libraries ✓
- No networking or external services ✓
- No user accounts or authentication ✓
- No task prioritization or due dates ✓
- No search or filtering capabilities ✓
- No bulk operations ✓
- No undo/redo functionality ✓

## Summary

All technical decisions are aligned with:
1. Specification requirements (all 19 functional requirements addressed)
2. Constitution principles (all six principles satisfied)
3. Phase I boundaries (all non-goals respected)
4. Industry best practices for simple console applications

No external dependencies required beyond Python 3.13+ standard library and UV for environment management.
