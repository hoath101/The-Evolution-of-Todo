# CLI Contracts: Phase I - In-Memory Python Console Todo Application

**Created**: 2025-12-27
**Feature**: Phase I - In-Memory Python Console Todo Application

## Overview

CLI contracts define the interactive command-line interface specifications for the todo application. These contracts specify the menu-driven user interaction flow, command inputs, and expected outputs.

## Menu Interface Specification

### Main Menu Display

**Menu Display Format**:
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

**Behavior**:
- Menu displays at application startup and after each operation (except Exit)
- Cursor (`_`) indicates user input position
- Menu options are numbered 1-7
- User enters number to select action

### Input Validation Rules

**Menu Selection**:
- Accept integers 1-7
- Reject non-numeric input with message: "Invalid choice. Please enter a number between 1 and 7."
- Reject numbers outside range with message: "Invalid choice. Please enter a number between 1 and 7."

**ID-Based Operations** (Add Task excluded):
- Accept positive integers only
- Reject non-numeric input with message: "Invalid ID: must be a positive integer."
- Reject zero or negative integers with message: "Invalid ID: must be a positive integer."
- Reject IDs that don't exist with message: "Task not found: ID {id}."

## Command Contracts

### CMD-001: Add Task

**Trigger**: User selects option 1 from main menu

**Interaction Flow**:
```
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Complete
6. Mark Incomplete
7. Exit

Enter your choice (1-7): 1

--- Add Task ---
Enter task title: [user input]
Enter task description (optional, press Enter to skip): [user input]

Task added successfully! (ID: {id})
```

**Inputs**:
- **Title**: Required string, non-empty after trimming whitespace
- **Description**: Optional string, may be empty

**Validation**:
- Empty/whitespace-only title: Display error "Title cannot be empty." and re-prompt for title
- Title length limit: None specified (accept up to reasonable terminal width)

**Outputs**:
- **Success**: "Task added successfully! (ID: {id})"
- **Failure**: "Title cannot be empty."

**Post-Operation**: Return to main menu

**Traceability**: FR-001, FR-002, FR-003, FR-012, FR-015, FR-019

---

### CMD-002: View Tasks

**Trigger**: User selects option 2 from main menu

**Interaction Flow**:

**Empty Task List**:
```
Enter your choice (1-7): 2

No tasks available.
```

**Tasks Present**:
```
Enter your choice (1-7): 2

--- Task List ---
ID: 1 | [ ] Buy groceries
Description:

ID: 2 | [X] Review project proposal
Description: Check requirements and prepare feedback

ID: 3 | [ ] Send email to client

Total: 3 tasks
```

**Inputs**: None

**Display Format Rules**:
- Tasks displayed in ID order (ascending)
- Completion indicator: `[ ]` for incomplete, `[X]` for complete
- Format: `ID: {id} | [{indicator}] {title}`
- Description (if non-empty): Display on next line indented with "Description: {text}"
- Total count: Displayed at bottom
- Empty description: No description line displayed

**Outputs**:
- **Empty list**: "No tasks available."
- **Success**: Formatted task list as shown above

**Post-Operation**: Return to main menu

**Traceability**: FR-004, FR-005, FR-014, SC-002

---

### CMD-003: Update Task

**Trigger**: User selects option 3 from main menu

**Interaction Flow**:
```
Enter your choice (1-7): 3

--- Update Task ---
Enter task ID to update: [user input]

Current task:
Title: Buy groceries
Description: Milk, eggs, bread

Enter new title (or press Enter to keep current): [user input]
Enter new description (or press Enter to keep current): [user input]

Task updated successfully! (ID: {id})
```

**Inputs**:
- **Task ID**: Positive integer, must exist
- **New Title**: Optional string (empty means keep current), non-empty if provided
- **New Description**: Optional string (empty means keep current)

**Validation**:
- Non-numeric ID: "Invalid ID: must be a positive integer."
- Invalid ID (not found): "Task not found: ID {id}."
- Empty title when provided: "Title cannot be empty."

**Display**:
- Show current task details before prompting for new values
- Allow user to press Enter to skip/keep current value

**Outputs**:
- **Success**: "Task updated successfully! (ID: {id})"
- **Failure**: "Invalid ID: must be a positive integer.", "Task not found: ID {id}.", "Title cannot be empty."

**Post-Operation**: Return to main menu

**Traceability**: FR-009, FR-010, FR-011, FR-012, FR-015, FR-017

---

### CMD-004: Delete Task

**Trigger**: User selects option 4 from main menu

**Interaction Flow**:
```
Enter your choice (1-7): 4

--- Delete Task ---
Enter task ID to delete: [user input]

Task deleted successfully! (ID: {id})
```

**Inputs**:
- **Task ID**: Positive integer, must exist

**Validation**:
- Non-numeric ID: "Invalid ID: must be a positive integer."
- Invalid ID (not found): "Task not found: ID {id}."

**Confirmation**: No confirmation prompt (direct deletion as per spec)

**Outputs**:
- **Success**: "Task deleted successfully! (ID: {id})"
- **Failure**: "Invalid ID: must be a positive integer.", "Task not found: ID {id}."

**Post-Operation**: Return to main menu

**Traceability**: FR-008, FR-010, FR-011, FR-013, FR-015, FR-017

---

### CMD-005: Mark Complete

**Trigger**: User selects option 5 from main menu

**Interaction Flow**:
```
Enter your choice (1-7): 5

--- Mark Task Complete ---
Enter task ID to mark as complete: [user input]

Task marked as complete! (ID: {id})
```

**Inputs**:
- **Task ID**: Positive integer, must exist

**Validation**:
- Non-numeric ID: "Invalid ID: must be a positive integer."
- Invalid ID (not found): "Task not found: ID {id}."

**Behavior**:
- Toggle `completed` status to `True`
- If already complete, still confirm success (idempotent)

**Outputs**:
- **Success**: "Task marked as complete! (ID: {id})"
- **Failure**: "Invalid ID: must be a positive integer.", "Task not found: ID {id}."

**Post-Operation**: Return to main menu

**Traceability**: FR-006, FR-010, FR-011, FR-015, FR-017

---

### CMD-006: Mark Incomplete

**Trigger**: User selects option 6 from main menu

**Interaction Flow**:
```
Enter your choice (1-7): 6

--- Mark Task Incomplete ---
Enter task ID to mark as incomplete: [user input]

Task marked as incomplete! (ID: {id})
```

**Inputs**:
- **Task ID**: Positive integer, must exist

**Validation**:
- Non-numeric ID: "Invalid ID: must be a positive integer."
- Invalid ID (not found): "Task not found: ID {id}."

**Behavior**:
- Toggle `completed` status to `False`
- If already incomplete, still confirm success (idempotent)

**Outputs**:
- **Success**: "Task marked as incomplete! (ID: {id})"
- **Failure**: "Invalid ID: must be a positive integer.", "Task not found: ID {id}."

**Post-Operation**: Return to main menu

**Traceability**: FR-007, FR-010, FR-011, FR-015, FR-017

---

### CMD-007: Exit Application

**Trigger**: User selects option 7 from main menu

**Interaction Flow**:
```
Enter your choice (1-7): 7

Goodbye!
```

**Behavior**:
- Display "Goodbye!" message
- Terminate application
- All in-memory data is lost

**Inputs**: None

**Outputs**: "Goodbye!"

**Post-Operation**: Application terminates (no return to menu)

**Traceability**: Constitution (application execution), SC-001 (time to exit)

---

## Error Handling Contracts

### ERR-001: Non-Numeric ID Input

**Applicable Commands**: CMD-003, CMD-004, CMD-005, CMD-006

**Trigger**: User provides non-numeric string when ID required

**Response**: "Invalid ID: must be a positive integer."

**Behavior**: Return to command prompt (allow retry)

---

### ERR-002: Task Not Found

**Applicable Commands**: CMD-003, CMD-004, CMD-005, CMD-006

**Trigger**: User provides valid numeric ID that doesn't exist in task list

**Response**: "Task not found: ID {id}."

**Behavior**: Return to command prompt (allow retry)

---

### ERR-003: Empty Title Input

**Applicable Commands**: CMD-001, CMD-003

**Trigger**: User provides empty or whitespace-only string for task title

**Response**: "Title cannot be empty."

**Behavior**: Re-prompt for title (allow retry)

---

### ERR-004: Invalid Menu Choice

**Applicable Commands**: Main menu only

**Trigger**: User provides number outside 1-7 or non-numeric input

**Response**: "Invalid choice. Please enter a number between 1 and 7."

**Behavior**: Re-display menu and re-prompt (allow retry)

---

## Output Formatting Rules

### General Rules
- All user-facing messages use plain text
- No ANSI colors or formatting codes
- Single blank line between sections (menu, prompts, results)
- Terminal width limit: Assume 80 characters minimum
- Long descriptions: Wrap to terminal width (don't truncate)

### Success Messages
- Action completed: "Task {action} successfully! (ID: {id})"
- Format: Capitalize action name, include ID for reference

### Error Messages
- Input validation: "{Field} {error}."
- Task not found: "Task not found: ID {id}."
- End all error messages with period
- Be specific about what went wrong

### Display Alignment
- Task list: Align columns for readability
- Indent descriptions by 2 spaces
- Center section headers (e.g., "--- Add Task ---")

---

## Summary

CLI contracts provide precise specification of user interaction:
- 7 menu-driven commands
- 4 error handling contracts
- Exact input/output formats
- Validation rules mapped to functional requirements
- Traceability to specification maintained

These contracts serve as implementation guide for CLI layer and validation testing reference.
