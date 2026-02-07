# API Contracts: Phase IV – Containerization for Todo AI Chatbot

## Overview
API contracts for the containerized Todo AI Chatbot services. These contracts define the interfaces that remain unchanged from Phase III to ensure backward compatibility while enabling containerized deployment.

## Service Endpoints

### Backend Service (FastAPI) - Port 8000

#### Root Endpoint
```
GET /
```
- **Description**: Health check and service information
- **Response**:
  ```json
  {
    "message": "Todo AI Chatbot API"
  }
  ```
- **Containerized URL**: `http://backend:8000/` or `http://localhost:8000/`

#### Chat Endpoints
```
POST /api/v1/chat
```
- **Description**: Process chat requests and interact with AI agent
- **Request Body**:
  ```json
  {
    "message": "User's message to the AI",
    "conversation_id": "optional conversation identifier"
  }
  ```
- **Response**:
  ```json
  {
    "response": "AI's response to the user",
    "conversation_id": "unique identifier for the conversation"
  }
  ```
- **Authentication**: Bearer token via Authorization header
- **Containerized URL**: `http://backend:8000/api/v1/chat`

```
GET /api/v1/chat/{conversation_id}
```
- **Description**: Retrieve specific conversation history
- **Path Parameter**: `conversation_id` - UUID of the conversation
- **Response**: Conversation history object
- **Authentication**: Bearer token via Authorization header
- **Containerized URL**: `http://backend:8000/api/v1/chat/{conversation_id}`

#### Tasks Endpoints
```
GET /api/v1/tasks
```
- **Description**: Retrieve user's tasks
- **Response**: Array of task objects
- **Authentication**: Bearer token via Authorization header
- **Containerized URL**: `http://backend:8000/api/v1/tasks`

```
POST /api/v1/tasks
```
- **Description**: Create a new task
- **Request Body**:
  ```json
  {
    "title": "Task title",
    "description": "Optional task description",
    "status": "pending|in_progress|completed"
  }
  ```
- **Response**: Created task object with ID
- **Authentication**: Bearer token via Authorization header
- **Containerized URL**: `http://backend:8000/api/v1/tasks`

```
PUT /api/v1/tasks/{task_id}
```
- **Description**: Update an existing task
- **Path Parameter**: `task_id` - ID of the task to update
- **Request Body**: Task update object
- **Response**: Updated task object
- **Authentication**: Bearer token via Authorization header
- **Containerized URL**: `http://backend:8000/api/v1/tasks/{task_id}`

```
DELETE /api/v1/tasks/{task_id}
```
- **Description**: Delete a task
- **Path Parameter**: `task_id` - ID of the task to delete
- **Response**: Success confirmation
- **Authentication**: Bearer token via Authorization header
- **Containerized URL**: `http://backend:8000/api/v1/tasks/{task_id}`

#### Auth Proxy Endpoints
```
ALL /api/auth/{path:path}
```
- **Description**: Proxy endpoints for Better Auth service
- **Function**: Forward requests to auth service at `http://auth:4000/api/auth/{path}`
- **Containerized URL**: `http://backend:8000/api/auth/{path}`

### Auth Service (Better Auth) - Port 4000

#### Sign Up
```
POST /api/auth/sign-up/email
```
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "user_password",
    "name": "User Name"
  }
  ```
- **Response**: User object and session token
- **Containerized URL**: `http://auth:4000/api/auth/sign-up/email`

#### Sign In
```
POST /api/auth/sign-in/email
```
- **Description**: Authenticate existing user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "user_password"
  }
  ```
- **Response**: User object and session token
- **Containerized URL**: `http://auth:4000/api/auth/sign-in/email`

#### Sign Out
```
POST /api/auth/sign-out
```
- **Description**: End user session
- **Headers**: Authorization with session token
- **Response**: Success confirmation
- **Containerized URL**: `http://auth:4000/api/auth/sign-out`

#### Get Session
```
GET /api/auth/session
```
- **Description**: Retrieve current user session
- **Headers**: Authorization with session token
- **Response**: Session object with user information
- **Containerized URL**: `http://auth:4000/api/auth/session`

#### JWT Token Endpoint
```
GET /api/auth/v1/jwks
```
- **Description**: JSON Web Key Set endpoint for token validation
- **Response**: Public keys for JWT validation
- **Containerized URL**: `http://auth:4000/api/auth/v1/jwks`

### Frontend Service (Next.js) - Port 3000

The frontend service serves the React/Next.js application and provides client-side routing:

#### Main Pages
- `GET /` - Landing page
- `GET /auth/sign-in` - Login page
- `GET /auth/sign-up` - Registration page
- `GET /chat` - Chat interface page

#### API Routes (Server-side)
These are Next.js API routes that run server-side:

```
GET /api/auth/session
```
- **Description**: Get current auth session server-side
- **Response**: Session object
- **Containerized Access**: Internal to frontend container

```
POST /api/auth/signin
```
- **Description**: Handle sign-in server-side
- **Containerized Access**: Internal to frontend container

```
POST /api/auth/signup
```
- **Description**: Handle sign-up server-side
- **Containerized Access**: Internal to frontend container

```
POST /api/auth/signout
```
- **Description**: Handle sign-out server-side
- **Containerized Access**: Internal to frontend container

```
POST /api/auth/token
```
- **Description**: Handle token operations server-side
- **Containerized Access**: Internal to frontend container

## Inter-Service Communication Contracts

### Backend ↔ Auth Service Communication
- **Backend calls Auth via proxy**:
  - Backend endpoint: `POST /api/auth/{path:path}`
  - Backend forwards to: `http://auth:4000/api/auth/{path}`
  - Headers forwarded: Authorization, Origin, Referer, Content-Type
  - Response: Backend returns Auth service response directly

### Frontend ↔ Backend Communication
- **Client-side calls**:
  - API Base URL: `http://backend:8000` (internal) or `http://localhost:8000` (external)
  - Auth Headers: Bearer tokens obtained from auth service
  - Endpoints: All `/api/v1/*` routes

### Frontend ↔ Auth Service Communication
- **Client-side calls**:
  - Auth Base URL: `http://auth:4000` (internal) or `http://localhost:4000` (external)
  - Endpoints: All `/api/auth/*` routes
  - Session Management: Cookies or localStorage for token storage

## Container Network Configuration

### Service Discovery
- **Backend service** accessible as: `http://backend:8000`
- **Auth service** accessible as: `http://auth:4000`
- **Frontend service** accessible as: `http://frontend:3000`

### Environment Variables for Containerized Communication
```
# Backend container environment
DATABASE_URL=postgresql://user:password@db:5432/tododb
BETTER_AUTH_URL=http://auth:4000

# Frontend container environment
NEXT_PUBLIC_API_BASE_URL=http://backend:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://auth:4000

# Auth container environment
DATABASE_URL=postgresql://user:password@db:5432/tododb
BETTER_AUTH_URL=http://auth:4000
```

## Authentication Flow Contracts

### JWT Token Flow
1. User authenticates via `/api/auth/sign-in`
2. Auth service returns JWT token
3. Frontend stores token in secure cookie/localStorage
4. Frontend includes token in `Authorization: Bearer <token>` header
5. Backend validates token against Auth service's public keys
6. Backend processes authorized requests

### Session Consistency
- **Token Format**: Standard JWT with user ID, expiration, and signature
- **Token Validation**: All services must accept valid JWTs from auth service
- **Token Refresh**: Automatic refresh handled by auth service
- **Expiration Handling**: Client-side token expiry checks

## Error Handling Contracts

### Standard Error Responses
All services return consistent error formats:

```json
{
  "error": "Human-readable error message",
  "details": "Additional error details if available",
  "code": "Machine-readable error code"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Health Check Contracts

### Service Health Endpoints
- **Backend Health**: `GET /` - Returns service info when healthy
- **Auth Health**: `GET /` - Returns service info when healthy
- **Frontend Health**: `GET /` - Returns basic response when healthy

### Health Check Requirements
- Services must respond within 10 seconds
- Services must return HTTP 200 status when operational
- Services should check downstream dependencies (DB, auth) when appropriate