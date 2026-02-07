# Todo AI Chatbot

AI-powered todo management system allowing users to manage tasks through natural language conversations using FastAPI, OpenAI Agents SDK, MCP tools, and ChatKit frontend.

## Features

- Natural language task management
- AI-powered task processing using OpenAI Agents
- MCP (Model Context Protocol) server for database operations
- JWT-based authentication with Better Auth integration
- Stateless architecture with all data persisted in the database
- ChatKit-based frontend for intuitive UI

## Architecture

The system follows a stateless architecture where:
- All state is persisted in the database
- Conversations and messages are reconstructed per request
- User data is isolated through JWT validation and ownership checks
- MCP tools provide database-backed operations

## Tech Stack

- **Backend**: Python 3.11, FastAPI
- **Database**: PostgreSQL with SQLModel ORM
- **AI**: OpenAI Agents API with Assistants
- **MCP**: Model Context Protocol SDK
- **Auth**: Better Auth for JWT validation (integrated via API proxy)
- **Frontend**: ChatKit integration

## Authentication Flow

The system integrates with Better Auth for user authentication:

1. **Better Auth Service**: Runs as a separate service (typically on port 4000)
2. **JWT Token Validation**: Backend validates JWT tokens issued by Better Auth
3. **API Proxy**: The backend acts as a proxy for authentication endpoints
4. **User Isolation**: All API calls validate user ownership of resources

### Required Environment Variables:
- `BETTER_AUTH_URL`: URL of the Better Auth service (e.g., http://localhost:4000)
- `BETTER_AUTH_SECRET`: Secret key for JWT verification
- `OPENAI_API_KEY`: API key for OpenAI services

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create a virtual environment:
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```
5. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
6. Update `.env` with your credentials including Better Auth configuration
7. Initialize the database:
   ```bash
   python -m src.database.init
   ```

## Running the Application

1. Start the Better Auth service (if running locally)
2. Start the MCP server:
   ```bash
   python -m src.services.mcp_server
   ```
3. In another terminal, start the FastAPI app:
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

## API Usage

The chat endpoint is available at:
`POST /api/{user_id}/chat`

Example request:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Add a task to buy groceries"
    }
  ]
}
```

## MCP Tools

The system exposes the following MCP tools:
- `add_task`: Creates new tasks in the database
- `list_tasks`: Retrieves tasks for the authenticated user
- `complete_task`: Marks tasks as completed
- `delete_task`: Removes tasks from the database
- `update_task`: Modifies existing task properties

Each tool enforces user ownership validation to ensure data isolation between users.

## Better Auth Integration

The system includes:
- **Authentication Proxy**: `/api/auth/*` endpoints forward requests to Better Auth service
- **JWT Validation**: Validates tokens using Better Auth's JWKS endpoint
- **User ID Extraction**: Extracts user ID from JWT `sub` claim
- **Session Management**: Stateless authentication with token-based sessions