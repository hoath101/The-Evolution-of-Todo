# Tasks: Todo AI Chatbot

## Feature Overview
AI-powered todo management system allowing users to manage tasks through natural language conversations using FastAPI, OpenAI Agents SDK, MCP tools, and ChatKit frontend.

## Phase 1: Setup
Initialize project structure and foundational components.

- [X] T001 Create repository folder structure (backend/, frontend/, specs/) in project root
- [X] T002 Add backend project skeleton for FastAPI in backend/src/main.py
- [X] T003 Add frontend placeholder structure for ChatKit-based UI in frontend/
- [X] T004 Create backend/.env.example with spec-derived variables
- [X] T005 Create frontend/.env.example with ChatKit domain key variables
- [X] T006 Document UV-based Python environment strategy in backend/docs/environment.md
- [X] T007 Identify backend Python dependencies from specs in requirements analysis
- [X] T008 Write backend/requirements.txt based on identified dependencies

## Phase 2: Foundational Components
Establish core infrastructure needed by all user stories.

- [X] T009 Define SQLModel base and database engine configuration in backend/src/database/
- [X] T010 Implement Task model per specification in backend/src/models/task.py
- [X] T011 Implement Conversation model per specification in backend/src/models/conversation.py
- [X] T012 Implement Message model per specification in backend/src/models/message.py
- [X] T013 Create database session management utilities in backend/src/database/session.py
- [X] T014 Implement database initialization script for stateless setup in backend/src/database/init.py
- [X] T015 Integrate Better Auth JWT validation middleware in backend/src/api/deps.py
- [X] T016 Extract and normalize user_id from authenticated requests in backend/src/api/deps.py
- [X] T017 Enforce user ownership checks at service boundaries in backend/src/services/

## Phase 3: MCP Server Implementation
Build the Model Context Protocol server with required tools.

- [X] T018 Initialize MCP server using Official MCP SDK in backend/src/services/mcp_server.py (consult Context7)
- [X] T019 Define MCP tool: add_task in backend/src/services/mcp_server.py
- [X] T020 Define MCP tool: list_tasks in backend/src/services/mcp_server.py
- [X] T021 Define MCP tool: complete_task in backend/src/services/mcp_server.py
- [X] T022 Define MCP tool: delete_task in backend/src/services/mcp_server.py
- [X] T023 Define MCP tool: update_task in backend/src/services/mcp_server.py
- [X] T024 Add MCP-level error handling for missing or unauthorized tasks in backend/src/services/mcp_server.py

## Phase 4: AI Agent Integration
Integrate OpenAI Agents SDK with the system.

- [X] T025 Configure OpenAI Agents SDK runner in backend/src/services/agent_service.py (consult Context7)
- [X] T026 Define agent system prompt per behavior specification in backend/src/services/agent_service.py
- [X] T027 Register MCP tools with the agent in backend/src/services/agent_service.py
- [X] T028 Implement tool invocation confirmation logic in backend/src/services/agent_service.py
- [X] T029 Handle agent failure and fallback responses in backend/src/services/agent_service.py

## Phase 5: Chat API Endpoint
Implement the core chat endpoint functionality.

- [X] T030 Implement /api/{user_id}/chat endpoint in backend/src/api/v1/chat.py
- [X] T031 Fetch conversation history from database per request in backend/src/api/v1/chat.py
- [X] T032 Persist incoming user messages in backend/src/api/v1/chat.py
- [X] T033 Execute agent with reconstructed message history in backend/src/api/v1/chat.py
- [X] T034 Persist assistant response and tool call metadata in backend/src/api/v1/chat.py
- [X] T035 Return response payload per API specification in backend/src/api/v1/chat.py

## Phase 6: Frontend Integration
Prepare and implement ChatKit frontend integration.

- [X] T036 Implement ChatKit integration based on OpenAI documentation in frontend/src/pages/chat.jsx
- [X] T037 Add frontend configuration for domain allowlist in frontend/.env.example
- [X] T038 Validate request/response compatibility with ChatKit expectations in frontend/src/utils/api.js
- [X] T039 Test ChatKit integration with backend API endpoint in frontend/src/services/chat-service.js

## Phase 7: Validation & Readiness
Verify system meets all requirements and is ready for use.

- [X] T040 Verify statelessness across request lifecycle in backend/src/
- [X] T041 Verify MCP tools are DB-backed and state-free in backend/src/services/mcp_server.py
- [X] T042 Verify auth isolation between users in backend/src/api/deps.py
- [X] T043 Verify spec compliance against requirements in all components
- [X] T044 Implement error handling and retry behavior per spec in backend/src/api/v1/chat.py
- [X] T045 Add comprehensive error tests for network failures and tool execution failures in backend/tests/
- [X] T046 Update README with setup and usage instructions in README.md

## Dependencies
- Phase 2 (Foundational) must complete before Phase 3 (MCP Server)
- Phase 3 (MCP Server) must complete before Phase 4 (AI Agent)
- Phase 4 (AI Agent) must complete before Phase 5 (Chat API)
- Phase 5 (Chat API) must complete before Phase 7 (Validation)

## Parallel Execution Opportunities
- [P] T002-T003: Backend and frontend skeleton creation can proceed in parallel
- [P] T004-T005: Environment files for backend and frontend can be created in parallel
- [P] T006-T008: Documentation and requirements can be prepared in parallel
- [P] T010-T012: Database models can be implemented in parallel
- [P] T019-T023: MCP tools can be developed in parallel after T018

## Implementation Strategy
1. **MVP Scope**: Complete Phase 1-3 (setup + foundational + MCP server) for basic functionality
2. **Incremental Delivery**: Add AI agent integration (Phase 4), then chat API (Phase 5), then frontend (Phase 6)
3. **Quality Assurance**: Validate throughout each phase to ensure compliance with specifications