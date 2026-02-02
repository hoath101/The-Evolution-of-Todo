# Quickstart Guide: Phase I - In-Memory Python Console Todo Application

**Created**: 2025-12-27
**Feature**: Phase I - In-Memory Python Console Todo Application

## Overview

This guide provides step-by-step instructions for setting up, running, and validating the Phase I console todo application.

## Prerequisites

### System Requirements
- Python 3.13 or higher
- UV package manager installed
- Linux operating system (Windows users must use WSL 2)
- Terminal or command-line interface access

### Installation
```bash
# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify UV installation
uv --version
```

## Project Setup

### 1. Initialize Project Structure

```bash
# Navigate to project root
cd /path/to/todo

# Create required directory structure
mkdir -p src/todo
mkdir -p specs/history
```

### 2. Initialize UV Project

```bash
# Initialize UV project (creates pyproject.toml)
uv init

# Set Python version requirement
uv python pin 3.13
```

### 3. Create Python Package Structure

```bash
# Create package files (empty initially)
touch src/todo/__init__.py
touch src/todo/models.py
touch src/todo/service.py
touch src/todo/cli.py
touch src/todo/main.py
```

### 4. Configure pyproject.toml

Your `pyproject.toml` should contain:

```toml
[project]
name = "todo"
version = "0.1.0"
requires-python = ">=3.13"
description = "In-Memory Python Console Todo Application - Phase I"
readme = "README.md"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

## Running the Application

### Start the Application

```bash
# From project root
uv run python src/todo/main.py
```

### Expected Startup Output

```
=== Todo Application ====
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Complete
6. Mark Incomplete
7. Exit

Enter your choice (1-7): _
```

## User Workflow Examples

### Example 1: Adding Tasks

```
Enter your choice (1-7): 1

--- Add Task ---
Enter task title: Buy groceries
Enter task description (optional, press Enter to skip): Milk, eggs, bread

Task added successfully! (ID: 1)
```

```
Enter your choice (1-7): 1

--- Add Task ---
Enter task title: Review project proposal
Enter task description (optional, press Enter to skip): Check requirements and prepare feedback

Task added successfully! (ID: 2)
```

### Example 2: Viewing Tasks

```
Enter your choice (1-7): 2

--- Task List ---
ID: 1 | [ ] Buy groceries
Description: Milk, eggs, bread

ID: 2 | [ ] Review project proposal
Description: Check requirements and prepare feedback

Total: 2 tasks
```

### Example 3: Marking Task Complete

```
Enter your choice (1-7): 5

--- Mark Task Complete ---
Enter task ID to mark as complete: 1

Task marked as complete! (ID: 1)
```

### Example 4: Viewing Updated Task List

```
Enter your choice (1-7): 2

--- Task List ---
ID: 1 | [X] Buy groceries
Description: Milk, eggs, bread

ID: 2 | [ ] Review project proposal
Description: Check requirements and prepare feedback

Total: 2 tasks
```

### Example 5: Updating a Task

```
Enter your choice (1-7): 3

--- Update Task ---
Enter task ID to update: 2

Current task:
Title: Review project proposal
Description: Check requirements and prepare feedback

Enter new title (or press Enter to keep current): Review proposal
Enter new description (or press Enter to keep current):

Task updated successfully! (ID: 2)
```

### Example 6: Deleting a Task

```
Enter your choice (1-7): 4

--- Delete Task ---
Enter task ID to delete: 1

Task deleted successfully! (ID: 1)
```

### Example 7: Empty Task List

```
Enter your choice (1-7): 2

No tasks available.
```

### Example 8: Exit Application

```
Enter your choice (1-7): 7

Goodbye!
```

## Validation Checklist

### Phase I Completion Validation

Use this checklist to verify Phase I implementation is complete:

- [ ] Application starts without errors
- [ ] Main menu displays all 7 options correctly
- [ ] Can add tasks with title only
- [ ] Can add tasks with title and description
- [ ] Add task validates non-empty title
- [ ] Add task assigns sequential IDs starting from 1
- [ ] Can view task list when tasks exist
- [ ] Can view empty task list message when no tasks
- [ ] Task list shows correct completion indicators ([ ] vs [X])
- [ ] Can mark task as complete
- [ ] Can mark task as incomplete
- [ ] Status changes reflect immediately in task list
- [ ] Can update task title
- [ ] Can update task description
- [ ] Can update both title and description
- [ ] Update validates non-empty title
- [ ] Can delete task by ID
- [ ] Deleted tasks no longer appear in list
- [ ] Task IDs do not renumber after deletion
- [ ] Invalid ID input shows appropriate error message
- [ ] Non-numeric ID input shows appropriate error message
- [ ] Empty title input shows appropriate error message
- [ ] Task not found error displays for invalid IDs
- [ ] Application exits cleanly when selecting option 7
- [ ] All data is lost after application exit (in-memory only)

### Success Criteria Validation

Per specification SC-001 through SC-007:

- [ ] **SC-001**: Can create new task in under 30 seconds from launch
- [ ] **SC-002**: Can view 50 tasks and identify completion status within 10 seconds
- [ ] **SC-003**: Can mark task complete and see status change immediately
- [ ] **SC-004**: Can delete task by ID and confirm it no longer appears
- [ ] **SC-005**: Can update task information and see updated values
- [ ] **SC-006**: Application handles all error cases without crashing
- [ ] **SC-007**: All five core operations are functional

## Troubleshooting

### Common Issues

**Issue**: "ModuleNotFoundError: No module named 'todo'"

**Solution**: Ensure you're running from project root and using `uv run`:
```bash
uv run python src/todo/main.py
```

**Issue**: "Python version too old"

**Solution**: Install Python 3.13+:
```bash
uv python install 3.13
```

**Issue**: "uv: command not found"

**Solution**: Install UV:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Issue**: Task data persists after exit

**Solution**: This is incorrect behavior - Phase I must be in-memory only. Verify no file I/O operations in code.

## Architecture Reference

### Module Responsibilities

- **`models.py`**: Task data structure definition
- **`service.py`**: Business logic (add, view, update, delete, mark operations)
- **`cli.py`**: User interface (menu display, input handling, output formatting)
- **`main.py`**: Application entry point (initialization, main loop)

### Data Flow

```
User Input (CLI Layer)
    ↓
Validation (CLI Layer)
    ↓
Service Call (Service Layer)
    ↓
Data Operation (In-Memory List)
    ↓
Result (Service Layer)
    ↓
Display to User (CLI Layer)
```

## Additional Resources

- **Specification**: `specs/001-phase-i-console-todo/spec.md`
- **Implementation Plan**: `specs/001-phase-i-console-todo/plan.md`
- **Data Model**: `specs/001-phase-i-console-todo/data-model.md`
- **CLI Contracts**: `specs/001-phase-i-console-todo/contracts/cli-commands.md`
- **Constitution**: `.specify/memory/constitution.md`
