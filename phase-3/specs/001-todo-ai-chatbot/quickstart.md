# Todo AI Chatbot Quickstart Guide

## Prerequisites
- Python 3.11+
- UV package manager
- PostgreSQL database (Neon or local)
- OpenAI API key
- Better Auth credentials

## Setup Instructions

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Backend Setup
```bash
cd backend
uv venv  # Create virtual environment
source .venv/bin/activate  # Activate virtual environment (Linux/Mac) or source .venv\Scripts\activate (Windows)
cp .env.example .env  # Copy environment variables
# Update .env with your credentials
uv pip install -r requirements.txt  # Install dependencies
```

### 3. Database Setup
```bash
# With virtual environment activated
python -m src.database.init  # Initialize database tables
```

### 4. Environment Variables
Update the `.env` file with:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `BETTER_AUTH_SECRET`: Better Auth secret
- `CHATKIT_DOMAIN_KEY`: ChatKit domain authorization

### 5. Run Services
```bash
# Start MCP server
python -m src.services.mcp_server

# In another terminal, start FastAPI app
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

## Architecture Overview
- Stateless FastAPI backend
- MCP server for tool access
- SQLModel for database operations
- Better Auth for JWT validation
- OpenAI Agents SDK for AI processing
- ChatKit for frontend UI