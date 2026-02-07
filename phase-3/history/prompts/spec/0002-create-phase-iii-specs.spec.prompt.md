---
id: "0002"
title: "create-phase-iii-specs"
stage: "spec"
date_iso: "2026-02-03"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "master"
user: "Baloch"
command: "/sp.specify"
labels: ["specification", "todo-ai-chatbot", "mcp", "agents-sdk"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "specs/overview.md"
  - "specs/architecture.md"
  - "specs/features/chatbot.md"
  - "specs/features/authentication.md"
  - "specs/api/chat-endpoint.md"
  - "specs/mcp/tools.md"
  - "specs/ai/agent.md"
  - "specs/database/schema.md"
  - "specs/ui/chatkit.md"
tests_yaml:
  - "none"
---

# Prompt Text
```
# /sp.specify — Phase III Specification Prompt

You are Claude Code operating under the rules defined in `sp.constitution`.

---

## CRITICAL KNOWLEDGE SOURCE RULE (MANDATORY)
OpenAI ChatKit is a **new and evolving library**.

For this phase, you MUST:
- Use **Context7 MCP** as the authoritative documentation source
- Actively query Context7 MCP for:
  - OpenAI ChatKit
  - OpenAI Agents SDK (latest behavior)
  - Official MCP SDK
  - Any other library introduced in this phase that is new or rapidly evolving

You MUST NOT:
- Rely on prior model knowledge
- Guess APIs, configuration, or usage
- Invent functions, props, or setup steps

If documentation is missing or ambiguous, you MUST record assumptions explicitly in the spec.

---

## Objective
Produce the **complete Phase III specification set** for:

**Todo AI Chatbot using ChatKit, OpenAI Agents SDK, and MCP**

The specs must enable correct implementation despite new libraries by grounding all behavior in **documented sources**.

---

## HARD CONSTRAINTS
- DO NOT write implementation code
- DO NOT generate plans or tasks
- DO NOT create or modify source files
- ONLY write specifications
- Specs MUST reference documentation sources where applicable

---

## REQUIRED SPEC OUTPUTS
You MUST generate the following specification files under `/specs/`:

---

### 1. `/specs/overview.md`
Include:
- Purpose of the AI chatbot
- Phase scope
- High-level description of stateless chat architecture
- Explicit note that ChatKit usage is doc-driven via Context7 MCP

---

### 2. `/specs/architecture.md`
Define:
- End-to-end request lifecycle
- ChatKit ↔ FastAPI ↔ Agents SDK ↔ MCP ↔ Database flow
- Stateless server guarantees
- Trust boundaries
- Failure and retry behavior

All flows MUST be logically complete.

---

### 3. `/specs/features/chatbot.md`
Specify:
- Conversational capabilities
- Supported natural language intents
- Agent decision rules
- Confirmation and error behaviors
- Multi-tool chaining expectations

---

### 4. `/specs/features/authentication.md`
Specify:
- Auth requirements for chat access
- JWT usage and enforcement
- User identity propagation through chat and MCP tools

---

### 5. `/specs/api/chat-endpoint.md`
Define:
- POST `/api/{user_id}/chat`
- Request/response schemas
- Conversation ID handling
- Stateless request guarantees
- Error responses

---

### 6. `/specs/mcp/tools.md`
For each MCP tool:
- Name
- Purpose
- Parameters (types + required/optional)
- Return schema
- Ownership enforcement
- Error behavior

Tools:
- add_task
- list_tasks
- complete_task
- delete_task
- update_task

---

### 7. `/specs/ai/agent.md`
Specify:
- Agent configuration
- Prompting strategy (high-level, no prompt text)
- Tool selection rules
- Tool chaining rules
- Error recovery behavior

---

### 8. `/specs/database/schema.md`
Define:
- Task
- Conversation
- Message
- Relationships and indexes
- Persistence guarantees

---

### 9. `/specs/ui/chatkit.md`
**Context7-backed spec**

Specify:
- ChatKit integration model
- Required configuration
- Auth token usage
- Message send/receive lifecycle
- Domain allowlist requirements
- Environment variables

All claims MUST be grounded in Context7 MCP–retrieved documentation.

---

## STYLE & ACCURACY RULES
- Use precise, technical language
- No pseudocode
- No framework-specific code
- No undocumented assumptions
- Prefer explicit constraints over flexibility

When documentation is unclear:
- Document the uncertainty
- Choose the safest documented behavior
- Record assumptions explicitly

---

## CROSS-SPEC CONSISTENCY
All specs MUST:
- Use consistent terminology
- Agree on field names
- Align agent, MCP, API, DB, and UI semantics
- Enforce statelessness and user isolation uniformly

---

## COMPLETION RULE
Stop immediately after writing the final specification file.
Do not summarize.
Do not propose plans or tasks.
Do not suggest next steps.

These specs MUST be approved before `/sp.plan` is allowed.
```

# Response Text
Created all required specification documents for the Todo AI Chatbot project, covering overview, architecture, features, API, MCP tools, AI agent, database schema, and UI integration with ChatKit.

# Outcome Impact
Successfully generated a complete set of specifications for the Todo AI Chatbot project, establishing clear requirements and constraints for implementation while adhering to the constitutional principles of stateless architecture and MCP-based tool access.

# Tests Summary
none

# Files Summary
- specs/overview.md: Created with project purpose and stateless architecture description
- specs/architecture.md: Created with end-to-end flow and trust boundaries
- specs/features/chatbot.md: Created with conversational capabilities and agent rules
- specs/features/authentication.md: Created with JWT and user identity requirements
- specs/api/chat-endpoint.md: Created with detailed request/response schemas
- specs/mcp/tools.md: Created with all required MCP tool specifications
- specs/ai/agent.md: Created with agent configuration and behavior rules
- specs/database/schema.md: Created with entity definitions and relationships
- specs/ui/chatkit.md: Created with ChatKit integration requirements

# Next Prompts
/sp.plan - to generate implementation plan for the Todo AI Chatbot

# Reflection Note
Creating comprehensive specifications upfront helps ensure all system components integrate properly and reduces implementation errors.

## Failure Modes Observed
None observed - all required specifications were created according to the detailed requirements.

## Next Experiment to Improve Prompt Quality
Consider adding validation steps to automatically check cross-spec consistency before completion.