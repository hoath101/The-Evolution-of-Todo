# Todo AI Chatbot Architecture

## End-to-End Request Lifecycle

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

## System Flow: ChatKit ↔ FastAPI ↔ Agents SDK ↔ MCP ↔ Database

### ChatKit Client
- Runs in browser environment
- Sends chat messages via HTTP requests
- Receives natural language responses
- Handles authentication token management

### FastAPI Server
- Stateless request processor
- JWT authentication validation
- Conversation history reconstruction
- OpenAI Agent SDK orchestration
- Database interaction coordination

### OpenAI Agents SDK
- Natural language intent interpretation
- Tool selection and chaining logic
- Response generation
- Error handling and recovery

### MCP Server
- Exposes todo management tools (add_task, list_tasks, etc.)
- Enforces user ownership validation
- Translates tool calls to database operations
- Maintains tool contract consistency

### Database Layer
- Stores tasks with user ownership
- Maintains conversation history
- Preserves message logs
- Enforces data isolation between users

## Stateless Server Guarantees

- No session state stored between requests
- All conversation context retrieved from database on each request
- User identity validated via JWT on each request
- Conversation reconstruction happens on every chat request
- Horizontal scaling supported without shared state

## Trust Boundaries

- **Client ↔ Server**: JWT authentication required for all requests
- **Server ↔ Database**: Connection secured with encrypted credentials
- **Agent ↔ MCP**: Internal communication with predefined tool contracts
- **MCP ↔ Database**: Direct database access with user isolation enforcement

## Failure and Retry Behavior

- Network failures: Client implements exponential backoff for retries
- Authentication failures: Immediate 401 responses without processing
- Database failures: Server returns 500 error with descriptive message
- Tool execution failures: MCP returns structured error to Agent for handling
- Agent processing failures: Graceful degradation with error messages to user
- MCP unavailability: Server returns appropriate error codes to client