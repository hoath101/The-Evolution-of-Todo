# Data Models: Todo AI Chatbot Frontend

## Entity: User Session
**Description**: Represents the authenticated state of a user in the frontend, containing the JWT token and basic user information

**Fields**:
- `isLoading`: boolean - Indicates if the auth state is being determined
- `isAuthenticated`: boolean - Indicates if the user is currently authenticated
- `accessToken`: string (JWT) - The JWT access token received from Better Auth
- `user`: Optional<UserInfo> - Basic user display information (if provided)

**Validation Rules**:
- `accessToken` must be a valid JWT string when present
- `isAuthenticated` must be true when `accessToken` is present
- `isLoading` must be false when auth state is resolved

**State Transitions**:
- `initial` → `loading` → `authenticated` OR `unauthenticated`

## Entity: Task
**Description**: Represents a user's to-do item with properties like title, description, completion status, and creation date

**Fields**:
- `id`: string - Unique identifier for the task
- `title`: string - Title of the task (required)
- `description`: string - Detailed description of the task (optional)
- `isCompleted`: boolean - Completion status of the task
- `createdAt`: Date - Timestamp when the task was created
- `updatedAt`: Date - Timestamp when the task was last updated

**Validation Rules**:
- `id` must be unique within user's tasks
- `title` must not be empty
- `isCompleted` defaults to false
- `createdAt` is set on creation and never changed
- `updatedAt` is updated when task is modified

**State Transitions**:
- `created` → `active` → `completed` OR `deleted`

## Entity: Chat Message
**Description**: Represents a message exchanged between the user and AI chatbot with timestamp and sender information

**Fields**:
- `id`: string - Unique identifier for the message
- `content`: string - Text content of the message
- `sender`: 'user' | 'ai' - Indicates who sent the message
- `timestamp`: Date - When the message was sent/received
- `status`: 'sending' | 'sent' | 'received' | 'error' - Current status of the message

**Validation Rules**:
- `id` must be unique within the conversation
- `content` must not be empty
- `sender` must be either 'user' or 'ai'
- `timestamp` is set when message is created
- `status` reflects the delivery state

**State Transitions**:
- `sending` → `sent` → `received` OR `error`

## Entity: Auth Request
**Description**: Represents authentication requests to Better Auth service

**Fields**:
- `email`: string - User's email address
- `password`: string - User's password
- `name?`: string - User's full name (for registration)

**Validation Rules**:
- `email` must be a valid email format
- `password` must meet minimum security requirements
- `name` is required for registration but optional for login

## Entity: API Response
**Description**: Generic response structure from backend services

**Fields**:
- `success`: boolean - Whether the request was successful
- `data?`: T - Response data payload if successful
- `error?`: string - Error message if request failed
- `statusCode`: number - HTTP status code from the response

**Validation Rules**:
- `success` must match presence of `data`/`error` fields
- `statusCode` must be a valid HTTP status code