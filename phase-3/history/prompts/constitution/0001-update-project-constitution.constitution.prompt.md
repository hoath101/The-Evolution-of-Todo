---
id: "0001"
title: "update-project-constitution"
stage: "constitution"
date_iso: "2026-02-03"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "master"
user: "Baloch"
command: "/sp.constitution"
labels: ["constitution", "todo-ai-chatbot", "project-setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - ".specify/memory/constitution.md"
tests_yaml:
  - "none"
---

# Prompt Text
```
# Spec-Kit Plus Constitution
Project: Phase III – Todo AI Chatbot (MCP + Agents)

---

## 1. Authority & Execution
Claude Code is the **sole implementing agent**.
All specs, plans, tasks, and code MUST be produced via Claude Code.
Manual coding is strictly forbidden.

---

## 2. Mandatory Workflow
This phase MUST follow the Agentic Dev Stack in order:

1. Write specifications
2. Generate implementation plan
3. Decompose into atomic tasks
4. Implement incrementally
5. Validate against acceptance criteria

No step may be skipped, merged, or reordered.

---

## 3. Scope
Build an **AI-powered chatbot** that manages todos through **natural language**.

Included:
- Conversational task management
- MCP server exposing task tools
- OpenAI Agents SDK for AI logic
- Stateless chat endpoint with DB-backed conversation state
- Authenticated, user-scoped behavior

Excluded:
- UI beyond ChatKit
- Non-chat APIs
- Non-task AI features
- In-memory or server-held state

---

## 4. Core Architectural Rules
- Backend is **stateless**
- All state persists in the database
- Conversation history is reconstructed per request
- AI agents interact with the system **only via MCP tools**
- MCP tools are stateless and database-backed

---

## 5. Technology Stack (FIXED)
- Frontend: OpenAI ChatKit
- Backend: Python FastAPI
- AI: OpenAI Agents SDK
- MCP: Official MCP SDK
- ORM: SQLModel
- Database: Neon PostgreSQL
- Authentication: Better Auth (JWT-based)

No substitutions are allowed.

---

## 6. Authentication & Security
- All chat requests require authentication
- User identity is derived from JWT
- All data access is strictly user-scoped
- Unauthorized requests return 401
- No cross-user data access is permitted

---

## 7. API Contract (LOCKED)
Single endpoint:

POST /api/{user_id}/chat


Rules:
- JWT user identity MUST match `{user_id}`
- Endpoint is stateless
- Responses include assistant message and tool calls

---

## 8. MCP Tool Contract (MANDATORY)
The MCP server MUST expose tools for:
- add_task
- list_tasks
- complete_task
- delete_task
- update_task

Rules:
- Tools accept explicit parameters
- Tools return structured results
- Tools enforce ownership and validation
- Tools never maintain in-memory state

---

## 9. Agent Behavior Rules
The AI agent MUST:
- Infer user intent from natural language
- Invoke appropriate MCP tools
- Chain tools when required
- Confirm actions in natural language
- Handle errors gracefully

The agent MUST NOT:
- Modify data directly
- Bypass MCP tools
- Assume hidden state

---

## 10. Repository & Specs
- Monorepo structure is required
- All behavior must be specified under `/specs`
- Specs are the single source of truth
- Implementation MUST reference specs explicitly

---

## 11. Quality Constraints
- Deterministic backend behavior
- Clear error handling
- Simple, explicit designs
- No speculative abstractions

Correctness > cleverness.

---

## 12. Completion Criteria
Phase III is complete when:
- Chatbot manages tasks via natural language
- MCP tools are correctly invoked by the agent
- Conversation
```

# Response Text
Updated the project constitution file with the specified principles for the Todo AI Chatbot project, replacing all placeholder tokens with concrete values from the user's input.

# Outcome Impact
Created a comprehensive constitution document that establishes the core principles, constraints, and workflow for the Todo AI Chatbot project, ensuring all future development follows the specified guidelines.

# Tests Summary
none

# Files Summary
- .specify/memory/constitution.md: Updated with all project-specific principles and governance rules

# Next Prompts
None needed - constitution is established

# Reflection Note
Establishing clear project principles upfront helps ensure consistent implementation decisions throughout the development process.

## Failure Modes Observed
None observed - all required information was provided and constitution was created successfully.

## Next Experiment to Improve Prompt Quality
Consider adding validation checks to ensure all principles are properly implemented and aligned with the technology stack requirements.