# Todo AI Chatbot Specification

## Overview

### Purpose
The AI chatbot serves as an intelligent task management interface that allows users to manage their todos through natural language conversations. Users can speak to the chatbot as they would to a human assistant, expressing their intentions to add, view, update, or complete tasks without needing to learn specific commands.

### Phase Scope
This phase encompasses the development of a complete AI-powered todo management system featuring:
- Natural language processing for todo management tasks
- Integration with OpenAI's ChatKit for the frontend interface
- OpenAI Agents SDK for AI processing
- Model Context Protocol (MCP) for secure tool access
- Database persistence with user isolation
- JWT-based authentication and authorization

### Stateless Chat Architecture
The architecture follows a stateless design where:
- Each chat request contains all necessary context for processing
- Conversation history is reconstructed from the database for each request
- No session state is maintained on the server between requests
- All user data is stored in the database and retrieved as needed
- The backend scales horizontally without shared session state concerns.

## Architecture

### End-to-End Request Lifecycle

1. Client sends chat message to POST `/api/{user_id}/chat`
2. Request authenticates JWT and validates user identity matches `{user_id}`
3. Server reconstructs conversation context from database
4. FastAPI forwards request to OpenAI Agents SDK
5. Agent processes natural language and selects appropriate MCP tools
6. MCP tools execute database operations with user isolation
7. Tool results returned to Agent
8. Agent generates natural language response
9. Response and conversation state saved to database
10. Final response returned to client

### System Flow: ChatKit ↔ FastAPI ↔ Agents SDK ↔ MCP ↔ Database

#### ChatKit Client
- Runs in browser environment
- Sends chat messages via HTTP requests
- Receives natural language responses
- Handles authentication token management

#### FastAPI Server
- Stateless request processor
- JWT authentication validation
- Conversation history reconstruction
- OpenAI Agent SDK orchestration
- Database interaction coordination

#### OpenAI Agents SDK
- Natural language intent interpretation
- Tool selection and chaining logic
- Response generation
- Error handling and recovery

#### MCP Server
- Exposes todo management tools (add_task, list_tasks, etc.)
- Enforces user ownership validation
- Translates tool calls to database operations
- Maintains tool contract consistency

#### Database Layer
- Stores tasks with user ownership
- Maintains conversation history
- Preserves message logs
- Enforces data isolation between users

### Stateless Server Guarantees

- No session state stored between requests
- All conversation context retrieved from database on each request
- User identity validated via JWT on each request
- Conversation reconstruction happens on every chat request
- Horizontal scaling supported without shared state

### Trust Boundaries

- **Client ↔ Server**: JWT authentication required for all requests
- **Server ↔ Database**: Connection secured with encrypted credentials
- **Agent ↔ MCP**: Internal communication with predefined tool contracts
- **MCP ↔ Database**: Direct database access with user isolation enforcement

### Failure and Retry Behavior

- Network failures: Client implements exponential backoff for retries
- Authentication failures: Immediate 401 responses without processing
- Database failures: Server returns 500 error with descriptive message
- Tool execution failures: MCP returns structured error to Agent for handling
- Agent processing failures: Graceful degradation with error messages to user
- MCP unavailability: Server returns appropriate error codes to client

### Performance Targets

- API response time: <500ms for 95% of requests
- Concurrent user support: Up to 1000 simultaneous users
- Task completion rate: >95% of user requests result in successful task operations
- Error rate: <1% of requests result in server errors

## Features

### Chatbot Conversational Features

#### Conversational Capabilities

The AI chatbot must support natural language interactions for todo management including:
- Understanding informal and formal language styles
- Handling context-aware conversations across multiple messages
- Supporting synonyms and varied phrasing for the same intent
- Providing helpful clarifications when user intent is ambiguous
- Maintaining conversation flow without requiring rigid command structures

#### Supported Natural Language Intents

##### Task Creation
- Phrases: "Add a task to buy groceries", "Create a todo for meeting tomorrow", "I need to remember to call John"
- Variants: Synonyms for "add", "create", "remember", "schedule"

##### Task Listing
- Phrases: "Show my tasks", "What do I need to do?", "List my todos", "Show incomplete tasks"
- Variants: Synonyms for "show", "list", "display", "view"

##### Task Completion
- Phrases: "Complete task 3", "Mark grocery shopping as done", "Finish the meeting task", "I did the laundry"
- Variants: Synonyms for "complete", "finish", "done", "did"

##### Task Deletion
- Phrases: "Delete task 2", "Remove the appointment", "Cancel the reminder"
- Variants: Synonyms for "delete", "remove", "cancel", "erase"

##### Task Updates
- Phrases: "Change task 1 to buy milk", "Update meeting time to 3pm", "Rename the task to call mom"
- Variants: Synonyms for "change", "update", "rename", "modify"

#### Agent Decision Rules

- When multiple tasks match a reference, ask for clarification
- For vague task descriptions, suggest creating the task with current wording
- When completing tasks, confirm with user if the reference is ambiguous
- Always acknowledge successful operations in natural language
- If a requested operation cannot be completed, explain why in user-friendly terms

#### Confirmation and Error Behaviors

- Confirm destructive operations (deletions) before executing when ambiguity exists
- Provide natural language error messages when operations fail
- Suggest alternatives when user requests cannot be fulfilled
- Acknowledge successful operations with confirmation in natural language
- Handle unrecognized intents gracefully with helpful suggestions

#### Multi-Tool Chaining Expectations

- When listing tasks followed by a completion request, chain tools appropriately
- During task updates, may require list_task followed by update_task
- Handle complex requests that require multiple sequential operations
- Maintain context between chained tool calls
- Communicate intermediate steps to the user when multiple operations occur

### Authentication Requirements

#### Auth Requirements for Chat Access

- All requests to `/api/{user_id}/chat` require valid JWT authentication
- Requests without authentication return HTTP 401 Unauthorized
- Invalid JWT tokens result in HTTP 401 Unauthorized responses
- Expired tokens result in HTTP 401 Unauthorized responses
- Token-less requests are rejected immediately without processing

#### JWT Usage and Enforcement

- JWT tokens are validated against Better Auth public keys
- Token signature verification is mandatory for all requests
- Token expiration is checked during validation
- User ID in JWT must match the `{user_id}` path parameter
- Malformed tokens result in HTTP 401 responses

#### User Identity Propagation

##### Through Chat Requests
- User identity extracted from JWT and validated against `{user_id}` path parameter
- User ID passed to all downstream components (Agents SDK, MCP tools)
- All database queries filtered by user ID to ensure data isolation

##### Through MCP Tools
- MCP tools receive user ID context from the API layer
- All tool operations enforce user ownership validation
- Database operations filtered by user ID in all MCP tool implementations
- User ID validation occurs before any data access in MCP tools

#### Authorization Enforcement

- Users can only access their own tasks and conversations
- Cross-user data access attempts result in authorization failures
- MCP tools validate user ownership before any data modification
- Database queries always include user ID filters for security
- Unauthorized access attempts are logged for security monitoring

## API Specification

### Chat API Endpoint Specification

#### Endpoint Definition

**Path**: `POST /api/{user_id}/chat`
**Method**: `POST`
**Authentication**: Required (JWT Bearer token)

#### Request Schema

```json
{
  "messages": [
    {
      "role": "user",
      "content": "string (user's message)",
      "timestamp": "ISO 8601 timestamp (optional)"
    }
  ],
  "conversation_id": "string (UUID, optional)",
  "metadata": {
    "client_info": "string (optional)",
    "preferences": "object (optional)"
  }
}
```

##### Path Parameter
- `{user_id}`: String representation of the authenticated user's ID
- Must match the user ID in the JWT token
- Required for routing and authorization validation

##### Headers
- `Authorization`: Bearer token containing the JWT
- `Content-Type`: application/json

#### Response Schema

```json
{
  "response": {
    "role": "assistant",
    "content": "string (AI-generated response)",
    "timestamp": "ISO 8601 timestamp"
  },
  "conversation_id": "string (UUID)",
  "tool_calls": [
    {
      "id": "string (tool call ID)",
      "name": "string (tool name)",
      "arguments": "object (tool arguments)"
    }
  ],
  "tool_results": [
    {
      "tool_call_id": "string",
      "result": "object (tool result)"
    }
  ]
}
```

#### Conversation ID Handling

- If `conversation_id` is provided in request, retrieves existing conversation context
- If `conversation_id` is not provided, generates a new conversation ID
- Conversation context is reconstructed from database for each request
- Same `conversation_id` may be used across multiple requests for continuity

#### Stateless Request Guarantees

- Each request contains all necessary information for processing
- Server maintains no session state between requests
- Conversation history reconstructed from database on each request
- User identity validated via JWT on each request
- Response includes updated conversation context

#### Error Responses

##### 401 Unauthorized
- Missing JWT token
- Invalid JWT token
- Expired JWT token
- JWT user ID doesn't match `{user_id}` path parameter

Response body:
```json
{
  "error": "Unauthorized",
  "message": "Valid JWT authentication required"
}
```

##### 400 Bad Request
- Invalid request schema
- Malformed JSON
- Missing required fields

Response body:
```json
{
  "error": "Bad Request",
  "message": "Invalid request format"
}
```

##### 500 Internal Server Error
- Server-side processing errors
- Database connection failures
- MCP server unavailability

Response body:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

#### Additional Requirements

- All timestamps use ISO 8601 format
- Request and response bodies use UTF-8 encoding
- Maximum request size limited to prevent abuse
- Rate limiting applied per user ID to prevent excessive requests

## MCP Tools Specification

This document defines the Model Context Protocol (MCP) tools that must be exposed by the MCP server for the Todo AI Chatbot system.

### add_task

#### Purpose
Creates a new task for the authenticated user with specified details.

#### Parameters
- `title` (string, required): The title or description of the task
- `description` (string, optional): Detailed description of the task
- `due_date` (string, optional): Due date in ISO 8601 format (YYYY-MM-DD)
- `priority` (string, optional): Priority level ("low", "medium", "high", default: "medium")

#### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

#### Ownership Enforcement
- Task is created with the authenticated user's ID as owner
- User ID must match the context passed from the API layer
- No cross-user task creation is allowed

#### Error Behavior
- Returns error if required fields are missing
- Returns error on database connectivity issues
- Returns error if user context is invalid

### list_tasks

#### Purpose
Retrieves all tasks owned by the authenticated user, with optional filtering.

#### Parameters
- `status` (string, optional): Filter by status ("all", "pending", "completed", default: "all")
- `limit` (integer, optional): Maximum number of tasks to return (default: 50, max: 100)
- `sort_by` (string, optional): Sort order ("created_date", "due_date", "priority", default: "created_date")
- `order` (string, optional): Sort direction ("asc", "desc", default: "desc")

#### Return Schema
```json
{
  "success": boolean,
  "tasks": [
    {
      "id": string,
      "title": string,
      "description": string,
      "status": string,
      "due_date": string,
      "priority": string,
      "created_at": string,
      "completed_at": string
    }
  ],
  "total_count": integer
}
```

#### Ownership Enforcement
- Only returns tasks owned by the authenticated user
- User ID context validated before query execution
- No cross-user task access is permitted

#### Error Behavior
- Returns error on database connectivity issues
- Returns error if user context is invalid
- Invalid parameters result in appropriate error messages

### complete_task

#### Purpose
Marks a specific task as completed for the authenticated user.

#### Parameters
- `task_id` (string, required): The ID of the task to mark as completed

#### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

#### Ownership Enforcement
- Validates that the task belongs to the authenticated user
- Prevents completion of tasks owned by other users
- User ID context validated before update operation

#### Error Behavior
- Returns error if task does not exist
- Returns error if task is already completed
- Returns error if task does not belong to user
- Returns error on database connectivity issues

### delete_task

#### Purpose
Deletes a specific task owned by the authenticated user.

#### Parameters
- `task_id` (string, required): The ID of the task to delete

#### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

#### Ownership Enforcement
- Validates that the task belongs to the authenticated user
- Prevents deletion of tasks owned by other users
- User ID context validated before delete operation

#### Error Behavior
- Returns error if task does not exist
- Returns error if task does not belong to user
- Returns error on database connectivity issues

### update_task

#### Purpose
Updates the properties of a specific task owned by the authenticated user.

#### Parameters
- `task_id` (string, required): The ID of the task to update
- `title` (string, optional): The new title for the task
- `description` (string, optional): The new description for the task
- `due_date` (string, optional): The new due date in ISO 8601 format
- `priority` (string, optional): The new priority level ("low", "medium", "high")
- `status` (string, optional): The new status ("pending", "completed")

#### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

#### Ownership Enforcement
- Validates that the task belongs to the authenticated user
- Prevents updates to tasks owned by other users
- User ID context validated before update operation

#### Error Behavior
- Returns error if task does not exist
- Returns error if task does not belong to user
- Returns error on database connectivity issues
- Returns error if invalid parameter values are provided

## AI Agent Specification

### Agent Configuration

The OpenAI Agent must be configured with the following parameters:
- Model: Latest supported model compatible with Agents SDK
- Tool access: Restricted to the defined MCP tools only
- Memory context: Limited to current conversation plus recent history from database
- Temperature: Configurable parameter for response creativity (default: 0.7)

### Prompting Strategy

The agent employs a high-level contextual approach that:
- Interprets natural language user inputs for todo management intents
- Maps user requests to appropriate MCP tool calls
- Maintains conversation context across multiple exchanges
- Generates natural language responses that match the user's communication style
- Handles ambiguous requests by seeking clarification when needed

### Tool Selection Rules

- Analyzes user input to identify specific todo management intents
- Matches recognized intents to corresponding MCP tools:
  - Task creation requests → add_task tool
  - Task listing requests → list_tasks tool
  - Task completion requests → complete_task tool
  - Task deletion requests → delete_task tool
  - Task modification requests → update_task tool
- Applies fuzzy matching for variations in user language
- Requests clarification when intent is ambiguous

### Tool Chaining Rules

- Executes multiple tools in sequence when required for complex requests
- Uses output from one tool as context for subsequent tool calls
- Maintains logical flow between related operations (e.g., list then complete)
- Combines results from multiple tools into cohesive responses
- Handles dependencies between operations appropriately

### Error Recovery Behavior

- Gracefully handles tool execution failures by informing the user
- Attempts alternative approaches when specific tools fail
- Recovers from malformed tool call arguments
- Provides helpful error messages in natural language
- Maintains conversation context during error recovery
- Logs errors for debugging while protecting user privacy

## Database Schema Specification

### Task Entity

#### Fields
- `id` (String/UUID, Primary Key): Unique identifier for the task
- `user_id` (String): ID of the user who owns this task
- `title` (String, Required): Title or short description of the task
- `description` (String, Optional): Detailed description of the task
- `status` (String, Required): Task status ("pending", "completed")
- `due_date` (Date, Optional): Date when the task is due
- `priority` (String, Required): Priority level ("low", "medium", "high")
- `created_at` (DateTime, Required): Timestamp when task was created
- `completed_at` (DateTime, Optional): Timestamp when task was completed

#### Indexes
- Index on `(user_id, status)` for efficient user task filtering
- Index on `due_date` for efficient date-based queries
- Index on `priority` for priority-based sorting
- Index on `created_at` for chronological ordering

#### Relationships
- Belongs to a single User (via user_id foreign key reference)

#### Constraints
- `title` must not be empty
- `status` must be one of the allowed values
- `priority` must be one of the allowed values
- `user_id` must reference an existing user

### Conversation Entity

#### Fields
- `id` (String/UUID, Primary Key): Unique identifier for the conversation
- `user_id` (String): ID of the user who owns this conversation
- `title` (String, Optional): Auto-generated or user-provided title
- `created_at` (DateTime, Required): Timestamp when conversation was created
- `updated_at` (DateTime, Required): Timestamp when conversation was last updated

#### Indexes
- Index on `user_id` for efficient user conversation retrieval
- Index on `updated_at` for chronological ordering

#### Relationships
- Has many Messages (via conversation_id foreign key reference)

#### Constraints
- `user_id` must reference an existing user

### Message Entity

#### Fields
- `id` (String/UUID, Primary Key): Unique identifier for the message
- `conversation_id` (String, Required): ID of the associated conversation
- `user_id` (String): ID of the user who owns this message
- `role` (String, Required): Role of the message sender ("user", "assistant", "system")
- `content` (Text, Required): The content of the message
- `timestamp` (DateTime, Required): When the message was sent
- `tool_calls` (JSON, Optional): Tool calls made in this message (if any)
- `tool_results` (JSON, Optional): Results from tool calls (if any)

#### Indexes
- Index on `conversation_id` for efficient conversation message retrieval
- Index on `user_id` for user-based filtering
- Index on `timestamp` for chronological ordering

#### Relationships
- Belongs to a single Conversation (via conversation_id foreign key reference)

#### Constraints
- `role` must be one of the allowed values
- `conversation_id` must reference an existing conversation
- `user_id` must reference an existing user and match the conversation owner

### Relationships and Integrity

#### Task Relationships
- Each Task belongs to exactly one User via the user_id field
- Users can have zero or many Tasks
- Referential integrity enforced with cascading deletes (user deletion removes tasks)

#### Conversation Relationships
- Each Conversation belongs to exactly one User via the user_id field
- Each Conversation can have zero or many Messages
- Users can have zero or many Conversations
- Referential integrity enforced with cascading deletes

#### Message Relationships
- Each Message belongs to exactly one Conversation via the conversation_id field
- Each Message belongs to exactly one User via the user_id field
- Conversations can have zero or many Messages
- Referential integrity enforced with cascading deletes

### Persistence Guarantees

- ACID-compliant transactions for all data modifications
- User data isolation through mandatory user_id filtering
- Automatic cleanup of related entities on parent deletion
- Point-in-time recovery capabilities
- Backup and replication for data durability

## Clarifications

### Session 2026-02-03

- Q: How should performance targets and success criteria be defined? → A: Establish specific performance targets (e.g., API response times under 500ms, support 1000 concurrent users) and measurable success criteria (e.g., 95% task completion rate, <1% error rate)

## UI Integration Specification

### ChatKit UI Integration Specification

#### Integration Model

The OpenAI ChatKit component will be integrated as a React component within the frontend application. The integration follows the documented ChatKit patterns as verified through Context7 MCP documentation.

#### Required Configuration

Based on Context7 MCP documentation, the following configuration parameters are required:

- `apiKey`: OpenAI API key for authentication with ChatKit services
- `projectId`: Identifier for the ChatKit project
- `sessionId`: Session identifier that correlates with our backend conversation_id
- `domainAllowlist`: List of allowed domains for security (including localhost for development)

#### Auth Token Usage

- Authentication tokens will be passed to ChatKit through secure headers
- JWT tokens will be refreshed automatically when nearing expiration
- Token validation occurs before establishing ChatKit connection
- Secure token storage using HttpOnly cookies or secure local storage

#### Message Send/Receive Lifecycle

Based on Context7 MCP documentation:

1. User sends message through ChatKit UI
2. ChatKit forwards message to our backend API endpoint
3. Backend processes message and returns response
4. ChatKit displays response in the conversation thread
5. Conversation state synchronized between ChatKit and backend

#### Domain Allowlist Requirements

The following domains must be included in the allowlist:
- Production domain (to be determined)
- Staging domain (to be determined)
- localhost:3000 (development)
- localhost:8000 (backend development)

#### Environment Variables

Required environment variables based on Context7 MCP documentation:
- `NEXT_PUBLIC_CHATKIT_API_KEY`: Public API key for ChatKit
- `CHATKIT_SECRET_KEY`: Private secret for server-side operations
- `NEXT_PUBLIC_CHATKIT_PROJECT_ID`: Project identifier

**Documentation Assumption**: Since ChatKit is evolving rapidly, specific property names and configuration options are based on Context7 MCP documentation. If documentation is unavailable, the implementation will follow the most current published patterns for ChatKit integration.

#### Security Considerations

- API keys must be properly secured and not exposed in client-side code
- CORS policies must align with domain allowlist
- JWT validation must occur server-side before forwarding to ChatKit
- Message content must be sanitized according to ChatKit security guidelines