# Todo Application Backend

A robust, secure backend API for the Todo application built with FastAPI, SQLModel, and PyJWT. This backend provides a RESTful API for task management with JWT-based authentication and user isolation.

## Features

- **RESTful API**: Clean, well-documented API endpoints for task management
- **JWT Authentication**: Stateless authentication using Better Auth JWTs
- **User Isolation**: Strict enforcement that users can only access their own tasks
- **Database Persistence**: PostgreSQL database with SQLModel ORM
- **Security**: Comprehensive authentication and authorization validation
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **CORS Support**: Configurable CORS middleware for frontend integration
- **Logging**: Comprehensive logging for monitoring and debugging

## Technology Stack

- **Framework**: FastAPI 0.115.0
- **ORM**: SQLModel 0.0.22 (SQLAlchemy + Pydantic)
- **Authentication**: PyJWT, jwcrypto for JWT verification
- **Database**: Neon Cloud PostgreSQL with psycopg2-binary driver
- **Security**: passlib for password hashing, python-jose for JWT operations
- **Configuration**: pydantic-settings for environment management
- **Runtime**: Python 3.13+

## Architecture

The backend follows a modular architecture with clear separation of concerns:

- **API Layer**: `src/api/` - REST endpoints with authentication middleware
- **Authentication**: `src/auth/` - JWT verification and user scope validation
- **Data Models**: `src/models/` - SQLModel database models
- **Business Logic**: `src/services/` - Task management operations
- **Request/Response**: `src/schemas/` - Pydantic models for validation
- **Configuration**: `src/config.py` - Environment and settings management
- **Database**: `src/db.py` - Connection and session management

## API Endpoints

All endpoints follow the pattern `/api/{user_id}/tasks` and require JWT authentication:

### Task Management

- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks` - Retrieve all tasks for a user (with pagination)
- `GET /api/{user_id}/tasks/{id}` - Retrieve a specific task
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle task completion status
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task

### System Endpoints

- `GET /` - Health and status information
- `GET /health` - Simple health check
- `GET /help` - API help and available endpoints
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

## Authentication & Authorization

The backend implements a stateless authentication system:

1. **JWT Verification**: Validates JWT tokens issued by Better Auth
2. **Token Fetching**: Dynamically fetches JWKS from Better Auth endpoint
3. **Claim Validation**: Verifies issuer, audience, expiration, and subject claims
4. **User Scoping**: Enforces that `{user_id}` in URL matches JWT `sub` claim
5. **Caching**: Caches JWKS for improved performance (1-hour TTL)

## Security Features

- **User Isolation**: Each user can only access their own tasks
- **Input Validation**: All requests validated with Pydantic schemas
- **SQL Injection Prevention**: SQLModel parameterized queries
- **Authentication Required**: All task endpoints require valid JWT
- **Rate Limiting Ready**: Architecture supports adding rate limiting
- **Logging**: Authentication failures logged for monitoring

## Getting Started

### Prerequisites

- Python 3.13+
- UV package manager
- Neon Cloud PostgreSQL database
- Better Auth frontend with configured JWT secret

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
# Install UV if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync
```

### Environment Configuration

Create a `.env` file with the following configuration:

```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/todo_database?sslmode=require
BETTER_AUTH_SECRET=your_better_auth_secret_here
BASE_URL=http://localhost:3000
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

Note: Replace the Neon connection string with your actual Neon database URL from the Neon dashboard.

### Running the Development Server

Start the development server with auto-reload:

```bash
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the provided script:

```bash
# From the backend directory
uv run python -m uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Database Schema

The application uses Neon Cloud PostgreSQL with a single `tasks` table that has the following structure:

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_owner ON tasks(owner_user_id);
```

## Error Handling

All API endpoints return structured error responses:

```json
{
  "error": "Error message",
  "detail": "Additional details (optional)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (user scope violation)
- `404`: Not Found (resource not found)
- `500`: Internal Server Error

## Configuration

The application is configured through environment variables:

- `DATABASE_URL`: Neon Cloud PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key for JWT verification (must match frontend)
- `BASE_URL`: Base URL for token validation (default: http://localhost:3000)
- `ALLOWED_ORIGINS`: CORS allowed origins (default: ["http://localhost:3000"])

## Development

### Project Structure

```
src/
├── main.py               # Application entry point
├── config.py             # Configuration and settings
├── db.py                 # Database connection and session management
├── api/                  # API routes and endpoints
│   ├── __init__.py
│   ├── tasks.py          # Task management endpoints
│   └── errors.py         # Error handling utilities
├── auth/                 # Authentication and authorization
│   ├── jwt.py            # JWT verification logic
│   └── user_scope.py     # User scope validation
├── models/               # Database models
│   └── task.py           # Task model definition
├── schemas/              # Request/response schemas
│   └── task.py           # Pydantic models
└── services/             # Business logic
    └── tasks.py          # Task operations
```

### Running Tests

```bash
uv run pytest
```

### Code Formatting

```bash
uv run black src/
uv run ruff check src/
```

## Production Deployment

For production deployment:

1. Use environment variables for configuration
2. Set up a reverse proxy (nginx, Apache)
3. Configure SSL certificates
4. Use a production WSGI server (Gunicorn)
5. Set up proper logging and monitoring

Example production command:

```bash
uv run gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## API Documentation

The API includes interactive documentation available at:
- Swagger UI: `http://your-domain/docs`
- ReDoc: `http://your-domain/redoc`

Documentation is automatically generated from the FastAPI application and includes request/response schemas, example values, and test functionality.

## Integration with Frontend

The backend is designed to work seamlessly with the Better Auth frontend:

1. Frontend handles user registration/login
2. Better Auth issues JWTs upon successful authentication
3. Frontend includes JWT in `Authorization: Bearer <token>` header
4. Backend verifies JWT and validates user scope
5. Backend enforces user isolation for all operations

## Monitoring and Logging

The application includes comprehensive logging:

- Authentication failures are logged with method, URL, and status code
- All requests can be monitored through FastAPI's built-in logging
- Database operations can be logged by configuring SQLModel's SQL echoing

## Troubleshooting

### Common Issues

- **JWT Secret Mismatch**: Ensure `BETTER_AUTH_SECRET` matches the frontend
- **Neon Database Connection**: Verify `DATABASE_URL` is correctly configured with proper Neon connection string and SSL settings
- **User Scope Violation**: Check that JWT `sub` matches URL `user_id`
- **CORS Errors**: Confirm `ALLOWED_ORIGINS` includes your frontend URL

### Debugging Authentication

Enable debug logging to troubleshoot authentication issues:

```bash
# Set logging level to DEBUG in your environment
LOG_LEVEL=DEBUG
```