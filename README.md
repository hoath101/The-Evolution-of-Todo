# In-Memory Python Console Todo Application

A simple, in-memory todo application built with Python 3.13+ for managing tasks via a console interface.

## Features

- **Add Tasks**: Create tasks with a title and optional description
- **View Tasks**: Display all tasks with completion status indicators
- **Update Tasks**: Modify task titles and descriptions
- **Delete Tasks**: Remove tasks from memory by ID
- **Mark Complete/Incomplete**: Toggle task completion status

## In-Memory Storage

**Important**: This application stores all tasks in memory only. All data will be lost when the application exits. This is intentional for Phase I.

## Prerequisites

- Python 3.13 or higher
- UV package manager
- Linux operating system (Windows users must use WSL 2)

## Installation

### Install UV (if not already installed)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Verify UV installation

```bash
uv --version
```

### Install Python 3.13+ with UV

```bash
uv python install 3.13
```

## Project Structure

```
/
├── pyproject.toml          # Project configuration
├── README.md                # This file
├── src/
│   └── todo/
│       ├── __init__.py       # Package initialization
│       ├── models.py         # Task data model
│       ├── service.py        # Business logic layer
│       ├── cli.py            # User interface layer
│       └── main.py          # Application entry point
├── specs/                   # Feature specifications
│   ├── 001-phase-i-console-todo/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── research.md
│   │   ├── data-model.md
│   │   ├── quickstart.md
│   │   └── contracts/
│   └── history/              # Specification history
└── .specify/               # SpecKit Plus templates and scripts
```

## Running the Application

### Start the application

```bash
uv run python src/todo/main.py
```

### Expected startup

```
Welcome to the Todo Application!
All tasks are stored in-memory and will be lost when you exit.

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

## Usage Examples

### Adding a Task

```
Enter your choice (1-7): 1

--- Add Task ---
Enter task title: Buy groceries
Enter task description (optional, press Enter to skip): Milk, eggs, bread

Task added successfully! (ID: 1)
```

### Viewing Tasks

```
Enter your choice (1-7): 2

--- Task List ---
ID: 1 | [ ] Buy groceries
Description: Milk, eggs, bread

ID: 2 | [X] Review project proposal

Total: 2 tasks
```

### Marking a Task Complete

```
Enter your choice (1-7): 5

--- Mark Task Complete ---
Enter task ID to mark as complete: 1

Task marked as complete! (ID: 1)
```

### Updating a Task

```
Enter your choice (1-7): 3

--- Update Task ---
Enter task ID to update: 1

Current task:
Title: Buy groceries
Description: Milk, eggs, bread

Enter new title (or press Enter to keep current): Buy groceries and cook
Enter new description (or press Enter to keep current):

Task updated successfully! (ID: 1)
```

### Deleting a Task

```
Enter your choice (1-7): 4

--- Delete Task ---
Enter task ID to delete: 2

Task deleted successfully! (ID: 2)
```

### Exiting the Application

```
Enter your choice (1-7): 7

Goodbye!
```

## Error Handling

The application provides clear error messages for invalid input:

- **Invalid ID**: "Invalid ID: must be a positive integer."
- **Task not found**: "Task not found: ID 99."
- **Empty title**: "Title cannot be empty."
- **Invalid menu choice**: "Invalid choice. Please enter a number between 1 and 7."

All errors are non-fatal - the application continues running and allows you to retry.

## Technical Details

- **Language**: Python 3.13+
- **Dependencies**: None (Python standard library only)
- **Architecture**: Modular design with separation of concerns
  - `models.py`: Data structures and in-memory storage
  - `service.py`: Business logic and task management
  - `cli.py`: User interface and input/output
  - `main.py`: Application entry point

## Development

This project follows the Spec-Kit Plus workflow:
1. Specification (`specs/001-phase-i-console-todo/spec.md`)
2. Plan (`specs/001-phase-i-console-todo/plan.md`)
3. Tasks (`specs/001-phase-i-console-todo/tasks.md`)
4. Implementation (current)

See `.specify/memory/constitution.md` for project governance principles.

## Phase II: Full-Stack, Multi-User Todo Web Application

Phase II transforms the completed Phase I console todo application into a modern web application that supports multiple users, authentication, and persistent storage.

### Features

- **Web-Based Interface**: Modern browser-based UI built with Next.js App Router
- **Multi-User Support**: Each authenticated user has their own private task space
- **Authentication**: Secure sign-up and sign-in using Better Auth
- **Persistent Storage**: Tasks stored in Neon PostgreSQL database
- **RESTful API**: FastAPI backend with secure JWT-based authentication
- **Task Management**: All core task operations (create, read, update, delete, mark complete/incomplete)
- **User Isolation**: Strict enforcement that users can only access their own tasks

### Technology Stack

- **Frontend**: Next.js App Router (web UI)
- **Authentication**: Better Auth (issues JWTs for secure authentication)
- **Backend**: FastAPI (REST API with JWT verification)
- **Database**: Neon Cloud PostgreSQL (persistent storage for tasks)

### Architecture

The system follows a three-tier architecture:

1. **Frontend Layer**: Next.js application handling user interface and authentication flows
2. **Backend Layer**: FastAPI REST API that validates requests and enforces authorization
3. **Database Layer**: Neon PostgreSQL storing tasks with user isolation

### Security Features

- JWT-based authentication and authorization
- User isolation - users can only access their own tasks
- Secure token handling and validation
- Protection against unauthorized access attempts

### Prerequisites for Phase II

- Node.js and npm for frontend development
- Python 3.13+ for backend development
- PostgreSQL database (Neon recommended)
- Better Auth for authentication management

### Project Structure (Phase II)

```
/
├── frontend/                  # Next.js web application
│   ├── app/                   # App Router pages
│   ├── components/            # Reusable UI components
│   └── lib/                   # Utilities and authentication helpers
├── backend/                   # FastAPI REST API
│   ├── main.py               # API entry point
│   ├── models/               # Data models
│   ├── routers/              # API route definitions
│   └── auth/                 # Authentication utilities
├── database/                 # Database schema and migrations
├── specs/                    # Feature specifications for Phase II
│   └── 002-phase-ii-fullstack/
│       ├── spec.md           # Phase II feature specification
│       ├── overview.md       # High-level system description
│       ├── architecture.md   # Technical architecture details
│       ├── api/              # REST endpoint definitions
│       ├── database/         # Schema specifications
│       └── features/         # Feature-specific requirements
├── pyproject.toml            # Backend dependencies
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

### Development Workflow

Phase II follows the same Spec-Kit Plus methodology as Phase I:

1. Specification (`specs/002-phase-ii-fullstack/spec.md`)
2. Plan (`specs/002-phase-ii-fullstack/plan.md`)
3. Tasks (`specs/002-phase-ii-fullstack/tasks.md`)
4. Implementation (frontend and backend)

### Key Improvements Over Phase I

- **Persistence**: Tasks are stored in a database and survive application restarts
- **Multi-user**: Each user has their own private task list
- **Web Interface**: Accessible from any device with a browser
- **Authentication**: Secure login and user isolation
- **Scalability**: Designed to support multiple concurrent users

### Current Status

Phase II is under active development as a full-stack web application with authentication and persistent storage capabilities.

## License

This project is part of a Spec-Kit Plus driven development workflow.
