# Data Model: Phase I - In-Memory Python Console Todo Application

**Created**: 2025-12-27
**Feature**: Phase I - In-Memory Python Console Todo Application

## Overview

Data model defines the structure and invariants of the Task entity and how tasks are stored in memory. This model serves as the foundation for all application services and CLI interactions.

## Core Entity: Task

### Purpose
Represents a single unit of work that needs to be tracked and potentially completed within the todo application.

### Attributes

| Attribute | Type | Required | Mutability | Description |
|-----------|------|----------|-------------|-------------|
| `id` | `int` | Yes | Immutable | Unique positive integer identifier, assigned at creation |
| `title` | `str` | Yes | Mutable | Human-readable task name, must be non-empty |
| `description` | `str` | No | Mutable | Optional detailed information about the task, may be empty string |
| `completed` | `bool` | Yes | Mutable | Indicates whether the task is finished, defaults to `False` |

### Attribute Constraints

**`id` (Integer Identifier)**:
- Must be a positive integer (1, 2, 3, ...)
- Must be unique across all tasks in memory
- Assigned sequentially starting from 1
- Never reused, even after deletion of task with that ID
- Immutable once assigned (cannot be changed after task creation)

**`title` (Task Title)**:
- Must be a string
- Must not be empty (cannot be `""`)
- Must not be whitespace-only (cannot be `"   "` after trimming)
- Leading and trailing whitespace is trimmed before validation
- Maximum length: No constraint specified in spec (assume reasonable terminal width limit ~500 characters)

**`description` (Task Description)**:
- Must be a string
- May be empty string (`""`)
- May be whitespace-only
- Leading and trailing whitespace is trimmed before storage
- Maximum length: No constraint specified in spec (assume reasonable limit ~1000 characters)

**`completed` (Completion Status)**:
- Must be a boolean value (`True` or `False`)
- Defaults to `False` (incomplete) on task creation
- Can be toggled between `True` and `False` via update operations
- No intermediate states (only complete or incomplete)

## Invariants

### Uniqueness Invariant
For any two tasks `task_a` and `task_b` in memory: `task_a.id != task_b.id`

### Sequential Assignment Invariant
When a new task is created, its `id` equals `max(existing_task_ids) + 1` or `1` if no tasks exist

### ID Immutability Invariant
Once assigned, a task's `id` cannot be modified throughout its lifecycle

### No ID Reuse Invariant
When a task is deleted, its `id` is never reassigned to a new task, even after the deletion

### Title Non-Empty Invariant
For any task: `len(task.title.strip()) > 0`

### Completion Boolean Invariant
For any task: `task.completed` is a boolean value (`True` or `False`)

## Storage Strategy

### In-Memory Collection

**Container Type**: Python `list` containing task objects

**Storage Format**: Task objects stored as dictionary-like structures with keys matching attribute names

**Example Task Object**:
```python
{
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": False
}
```

**Collection Example**:
```python
[
    {"id": 1, "title": "Task 1", "description": "", "completed": False},
    {"id": 2, "title": "Task 2", "description": "Details", "completed": True},
    {"id": 3, "title": "Task 3", "description": "", "completed": False}
]
```

### ID Tracking

**Next ID Counter**: Single integer variable tracking the next ID to assign

**Behavior**:
- Initialized to 1 at application startup
- Increments by 1 after each task creation
- Never decrements (supports no-ID-reuse invariant)
- Lost on application termination (in-memory only)

### Access Patterns

**Lookup by ID**: Linear search through task list (O(n))

**Reasoning for O(n) lookup**:
- Phase I scale is modest (no performance requirements specified)
- Simplicity favored over performance
- List preserves insertion order naturally
- No dependency on external data structures required

**Insertion**: Append to end of list (O(1))

**Deletion**: Remove from list by index (O(n) due to shifting)

**Update**: Modify task attributes in place after finding by ID (O(n) lookup + O(1) update)

**Iteration**: Iterate through all tasks for viewing (O(n))

## State Transitions

### Task Lifecycle

```
[Created]
    |
    v
[Incomplete (completed=False)]
    |
    +--- [Mark Complete] ---> [Complete (completed=True)]
    |                              |
    |                              +--- [Mark Incomplete] ---+
    |                                                      |
    +------------------------------------------------------+
    |
    +--- [Delete] ---> [Removed from Memory]
```

### Valid State Changes

| Current State | Operation | New State | Notes |
|--------------|-----------|-----------|-------|
| N/A | Create | Incomplete (`completed=False`) | Initial state |
| Incomplete (`completed=False`) | Mark Complete | Complete (`completed=True`) | Toggle on |
| Complete (`completed=True`) | Mark Incomplete | Incomplete (`completed=False`) | Toggle off |
| Incomplete or Complete | Update Title/Description | Same `completed` status | Only title/description changes |
| Any state | Delete | Removed | Task no longer in memory |

### Invalid State Changes

| Attempted Change | Reason for Rejection |
|-----------------|---------------------|
| Change `id` after creation | ID is immutable |
| Set `completed` to non-boolean | Must be `True` or `False` |
| Set `title` to empty/whitespace-only | Must be non-empty |
| Set `title` to non-string | Must be string type |
| Set `description` to non-string | Must be string type |

## Validation Rules (Functional Requirement Mapping)

### FR-001: Add Task Validation
- Title is non-empty string
- Description is string (may be empty)
- Unique sequential ID assigned

### FR-010: Task ID Validation (Positive Integer)
- Input is convertible to integer
- Integer value is positive (greater than 0)

### FR-011: Task ID Exists Validation
- ID exists in task list
- Lookup succeeds (task found)

### FR-012: Title Validation (Non-Empty)
- Title is not empty string after trimming whitespace
- Title contains at least one non-whitespace character

### FR-019: Whitespace Trimming
- Leading and trailing whitespace removed from all string inputs before validation or storage

## Data Relationships

### Relationships
No relationships defined in Phase I. Tasks are independent entities with no references to other tasks or external entities.

## Collection Management

### Empty Collection Handling
When no tasks exist in memory:
- Task list is empty (`[]`)
- Next ID counter is 1
- View operations display "no tasks available" message
- All ID-based operations fail with "task not found" error

### Large Collection Handling
When 50+ tasks exist:
- View operations display all tasks in ID order
- Terminal scrolling is expected behavior (not prevented)
- No pagination or filtering (Phase I non-goal)
- Performance acceptable for Phase I scale

## Summary

The data model is intentionally simple, aligning with Phase I constraints:
- Single entity type (Task)
- No persistence
- No complex relationships
- In-memory storage with Python standard library
- Validation rules directly mapped to functional requirements

This model provides sufficient foundation for implementing all five core operations while respecting constitutional principles of simplicity and avoiding over-engineering.
