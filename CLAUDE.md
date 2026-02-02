# Claude Code Instructions for Todo Application

This file provides guidance for Claude Code to continue development of this todo application.

## Current Project State

**Phase**: Phase I - In-Memory Python Console Todo Application (COMPLETED)

**Status**: All five core features implemented and functional:
- Add Tasks
- View Tasks
- Update Tasks
- Delete Tasks
- Mark Complete/Incomplete

**Constraints** (per constitution):
- In-memory only (no persistence, no files, no databases)
- Console/CLI interface only
- No external dependencies beyond Python standard library
- No tests (excluded per Phase I non-goals)
- No UI frameworks, networking, or external services

## Architecture

### Module Responsibilities

- **`src/todo/models.py`**: Task data model (dict with id, title, description, completed), in-memory list storage, ID counter
- **`src/todo/service.py`**: Business logic layer (CRUD operations, validation)
- **`src/todo/cli.py`**: User interface layer (menu display, input handling, output formatting)
- **`src/todo/main.py`**: Application entry point (initialization, main loop)

### Data Flow

```
User Input (stdin) → CLI Layer (cli.py) → Service Layer (service.py) → Data Layer (models.py)
                                      ↓
                          Result → CLI Layer (cli.py) → User (stdout)
```

## Adding Future Phases

### Phase Transition Rules

Before adding a new phase, ensure:

1. **Phase I is complete**:
   - All five features work as specified
   - Application runs successfully from console
   - Repository structure matches constitution (verified)

2. **New phase is clearly defined** in `.specify/memory/constitution.md`:
   - Add new phase section describing goals and constraints
   - Increment constitution version (MAJOR.MINOR.PATCH) per governance rules
   - Document amendment in `specs/history/` with clear rationale

3. **Specification created** for new phase:
   - Create new feature spec in `specs/###-feature-name/spec.md`
   - Follow Spec-Kit Plus format
   - Explicitly reference Phase I as foundation
   - Document what changes from Phase I

4. **Implementation plan generated**:
   - Create plan.md for new phase
   - Address constitution check
   - Reference Phase I artifacts where applicable

### Phase II Example (Persistence)

**If adding persistence** (example of what Phase II might include):

```text
## Phase II: Persistent Todo Storage

### Goals
- Add file-based persistence (JSON or SQLite)
- Preserve task data between application runs
- Migrate in-memory data structure to persistent storage

### Constraints
- Maintain existing console interface
- Backward compatible with Phase I tasks
- Data migration path from Phase I in-memory format

### Non-Goals
- No API or networking
- No multi-user support
- No web interface (remains console-only)
```

**Constitution Amendment Required**:
- Update Principle II (In-Memory Only) to reflect new scope
- Document persistence approach in Technical Constraints
- Increment version to 2.0.0 (MAJOR - principle change)

### Process for Adding New Phase

1. **Create specification**:
   ```bash
   /sp.specify "Phase II: [feature description]"
   ```

2. **Create implementation plan**:
   ```bash
   /sp.plan
   ```

3. **Generate tasks**:
   ```bash
   /sp.tasks
   ```

4. **Implement**:
   ```bash
   /sp.implement
   ```

## Interpreting Existing Specs

### Reading Feature Specifications

When implementing from specs:

1. **Follow exact order**: Spec → Plan → Tasks → Implement
2. **No shortcuts**: Must complete each phase before moving to next
3. **Traceability**: Each implementation must reference specific spec requirements
4. **Validation**: Verify implemented behavior matches acceptance scenarios

### Constitution Compliance

Before any implementation work, verify:

- [ ] Agentic Workflow: All work through Claude Code only
- [ ] Scope: Phase boundaries respected
- [ ] Completeness: All mandatory features implemented
- [ ] Technical: Correct Python version, UV, console-only
- [ ] Structure: Required directory structure maintained
- [ ] Quality: Input validation, error handling present

### Modifying Existing Code

When modifying Phase I code for Phase II:

1. **Preserve backward compatibility**: Don't break existing functionality
2. **Minimal changes**: Only modify what's necessary for new features
3. **Update specs**: If scope changes, update spec.md first
4. **Incremental**: Add new features without removing Phase I capabilities
5. **Test thoroughly**: Ensure Phase I features still work after changes

## Common Patterns

### Adding a New Service Function

1. Define in `src/todo/service.py`:
   ```python
   def new_operation(params) -> dict | bool:
       # Implementation here
       pass
   ```

2. Add validation in `src/todo/service.py`:
   ```python
   def validate_new_input(params) -> tuple[bool, str | None]:
       # Validation logic
       pass
   ```

3. Add CLI handler in `src/todo/cli.py`:
   ```python
   def handle_new_operation() -> None:
       # Collect input, call service, display result
       pass
   ```

4. Add menu option in `src/todo/cli.py`:
   ```python
   def display_menu() -> None:
       # Add new option
       print("8. New Operation")
   ```

5. Wire in `src/todo/main.py`:
   ```python
   elif choice == 8:
       handle_new_operation()
   ```

### Adding Validation

1. Add validation function in `src/todo/service.py`:
   ```python
   def validate_something(value) -> tuple[bool, str | None]:
       is_valid, error_msg = True, None
       # Validation logic
       return is_valid, error_msg
   ```

2. Use in CLI handler:
   ```python
   is_valid, error_msg = service.validate_something(value)
   if not is_valid:
       print(error_msg)
       return
   ```

## Important Files

### Constitution
`.specify/memory/constitution.md` - Project governance, principles, and phase boundaries

### Specifications
`specs/001-phase-i-console-todo/spec.md` - Phase I feature specification
`specs/001-phase-i-console-todo/plan.md` - Phase I implementation plan
`specs/001-phase-i-console-todo/tasks.md` - Phase I task breakdown

### Design Artifacts
`specs/001-phase-i-console-todo/research.md` - Technical decisions
`specs/001-phase-i-console-todo/data-model.md` - Data model specification
`specs/001-phase-i-console-todo/contracts/cli-commands.md` - CLI interface contracts
`specs/001-phase-i-console-todo/quickstart.md` - Setup and usage guide

### Quality Checklists
`specs/001-phase-i-console-todo/checklists/requirements.md` - Specification quality validation

### History
`specs/history/` - Audit trail of all specification and plan changes

## Testing the Application

### Quick Validation

```bash
# Ensure Python version is 3.13+
python --version

# Run the application
uv run python src/todo/main.py

# Test each operation:
# 1. Add a task
# 2. View tasks
# 3. Update task
# 4. Mark complete
# 5. Mark incomplete
# 6. Delete task
# 7. Exit
```

### Expected Behavior

- Application starts without errors
- Menu displays all 7 options
- All operations accept valid input and reject invalid input
- All error messages are user-friendly
- Application exits cleanly with "Goodbye!" message

## Troubleshooting

### Common Issues

**Issue**: Application fails to start
- Check Python version is 3.13+
- Verify all files exist in `src/todo/`
- Check imports in each module

**Issue**: Tasks not persisting after exit
- This is expected behavior for Phase I (in-memory only)
- Do not add persistence - this violates Phase I constraints

**Issue**: Import errors
- Verify `src/todo/__init__.py` exists
- Check Python path includes project root
- Ensure running from project directory with `uv run`

## Workflow Summary

For any feature work:
1. Check `.specify/memory/constitution.md` for current constraints
2. Read relevant specs in `specs/` directory
3. Follow Spec-Kit Plus workflow: spec → plan → tasks → implement
4. Update tasks.md to mark completed tasks with `[X]`
5. Create PHR in `history/prompts/` for traceability
6. Commit changes with descriptive messages

Remember: This is a Spec-Kit Plus project. All development must follow the constitution and spec-first workflow.
