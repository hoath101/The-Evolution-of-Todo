# Implementation Plan: Todo AI Chatbot

**Branch**: `001-todo-ai-chatbot` | **Date**: 2026-02-03 | **Spec**: [specs/overview.md](../../overview.md)
**Input**: Feature specification from `/specs/001-todo-ai-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of an AI-powered todo chatbot system that allows users to manage their tasks through natural language conversations. The system uses FastAPI backend with OpenAI Agents SDK, MCP tools for database operations, and ChatKit for the frontend UI. The architecture is stateless with all data persisted in the database and reconstructed per request.

## Technical Context

**Language/Version**: Python 3.11, JavaScript/TypeScript for frontend integration
**Primary Dependencies**: FastAPI, SQLModel, OpenAI Agents SDK, Official MCP SDK, Better Auth
**Storage**: Neon PostgreSQL database with SQLModel ORM
**Testing**: pytest for backend testing
**Target Platform**: Linux server (backend), Web browser (frontend via ChatKit)
**Project Type**: web (dual backend/frontend structure)
**Performance Goals**: Support 1000 concurrent users, response time under 2 seconds
**Constraints**: <500ms p95 latency for API responses, JWT-based authentication required, user data isolation mandatory
**Scale/Scope**: Support 10k users, persistent conversation history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Authority & Execution**: Claude Code is the sole implementing agent (COMPLIES)
2. **Mandatory Workflow**: Following Agentic Dev Stack in order (COMPLIES)
3. **Scope**: Building AI-powered chatbot for todo management (COMPLIES)
4. **Core Architectural Rules**: Backend is stateless, all state in DB, conversation history reconstructed per request (COMPLIES)
5. **Technology Stack**: Using FIXED stack: FastAPI, OpenAI Agents SDK, MCP SDK, SQLModel, Neon PostgreSQL, Better Auth (COMPLIES)
6. **Authentication & Security**: All requests require JWT authentication, user-scoped access (COMPLIES)
7. **API Contract**: Single endpoint POST /api/{user_id}/chat with JWT validation (COMPLIES)
8. **MCP Tool Contract**: Exposing add_task, list_tasks, complete_task, delete_task, update_task (COMPLIES)
9. **Agent Behavior**: Agent interacts via MCP tools only, no direct DB access (COMPLIES)
10. **Repository & Specs**: Following monorepo structure with specs under /specs (COMPLIES)
11. **Quality Constraints**: Deterministic behavior, clear error handling, simple designs (COMPLIES)

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py             # Base SQLModel classes
│   │   ├── task.py             # Task model
│   │   ├── conversation.py     # Conversation model
│   │   └── message.py          # Message model
│   ├── database/
│   │   ├── __init__.py
│   │   ├── engine.py           # Database engine setup
│   │   └── session.py          # Session management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependency injection
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── chat.py         # Chat endpoint implementation
│   │       └── auth.py         # Authentication utilities
│   ├── services/
│   │   ├── __init__.py
│   │   ├── agent_service.py    # Agent orchestration
│   │   ├── mcp_server.py       # MCP server implementation
│   │   └── auth_service.py     # Authentication service
│   └── utils/
│       ├── __init__.py
│       └── constants.py        # Application constants
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest configuration
│   ├── test_chat.py            # Chat endpoint tests
│   ├── test_models.py          # Model tests
│   └── test_auth.py            # Authentication tests
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables example
├── .env                       # Environment variables (gitignored)
├── Dockerfile                 # Container definition
└── docker-compose.yml         # Service orchestration
```

**Structure Decision**: Selected web application structure with separate backend and frontend directories to properly separate concerns between the AI chatbot backend and the ChatKit frontend integration.

## Phase 0: Research & Unknown Resolution

1. **OpenAI Agents SDK Integration**: Research current best practices for integrating with the Agents SDK
2. **MCP SDK Usage**: Research how to properly implement MCP tools for task management
3. **Better Auth JWT Validation**: Research JWT validation patterns with FastAPI
4. **ChatKit Integration Patterns**: Research how to properly connect ChatKit to our backend API in a stateless manner
5. **SQLModel Best Practices**: Research optimal patterns for database schema design with SQLModel

## Phase 1: Design & Implementation Plan

1. **Data Models**: Create SQLModel definitions based on database schema spec ensuring all state persists in DB
2. **API Contracts**: Define OpenAPI schemas for the stateless chat endpoint
3. **MCP Tool Definitions**: Create stateless, DB-backed MCP tool specifications for task operations
4. **Agent Configuration**: Design agent orchestration with no server-held state between requests
5. **Authentication Flow**: Design JWT validation and user identity propagation with no session state

## Phase 2: Task Decomposition

1. **Backend Infrastructure**: Set up FastAPI app with stateless design principles, database models, and basic structure
2. **Authentication Layer**: Implement Better Auth JWT validation with no session state
3. **Database Layer**: Implement SQLModel models and database operations ensuring all state persists in DB
4. **MCP Server**: Implement stateless, DB-backed MCP tools for task management
5. **Agent Service**: Integrate OpenAI Agents SDK with no server-held state between requests
6. **Chat Endpoint**: Implement the main stateless chat endpoint that reconstructs conversation state from DB
7. **Frontend Integration**: Prepare for ChatKit integration maintaining stateless backend
8. **Environment Setup**: Configure environment variables and dependencies
9. **Testing**: Implement comprehensive test coverage verifying stateless behavior

## Repository & Folder Structure

Following the constitutional requirement for monorepo structure, the implementation will be organized as follows:

1. **Backend** (`/backend`): Contains all server-side code including FastAPI application, database models, services, and MCP server
2. **Specifications** (`/specs`): Contains all specification documents as required by constitution
3. **History** (`/history`): Contains prompt history records and architectural decision records

## Implementation Sequence

1. **Foundation**: Set up project structure, dependencies, and basic FastAPI app with stateless design principles
2. **Data Layer**: Implement SQLModel models and database connection ensuring all state persists in DB
3. **Authentication**: Implement JWT validation and user identity propagation with no server-held state
4. **MCP Server**: Create the Model Context Protocol server with required tools (stateless, DB-backed)
5. **AI Agent**: Integrate OpenAI Agents SDK to process natural language (interacting only via MCP tools)
6. **API Endpoint**: Implement the main chat endpoint with strict stateless architecture (reconstructing conversation state from DB per request)
7. **Integration**: Connect all components ensuring no in-memory state between requests
8. **Testing**: Implement comprehensive tests verifying stateless behavior and user isolation
9. **Deployment**: Prepare for deployment with proper environment configuration

## MCP Server & Tools

The MCP server will implement the following tools as required by the constitution:
- add_task: Creates new tasks in the database
- list_tasks: Retrieves tasks for the authenticated user
- complete_task: Marks tasks as completed
- delete_task: Removes tasks from the database
- update_task: Modifies existing task properties

Each tool will enforce user ownership validation to ensure data isolation between users.

## Quality Assurance

All implementation will follow the constitutional quality constraints:
- Deterministic backend behavior with no server-held state between requests
- Clear error handling
- Simple, explicit designs
- No speculative abstractions
- Correctness over cleverness
- Strict adherence to stateless architecture with all state persisted in database

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (No violations found) | | |
