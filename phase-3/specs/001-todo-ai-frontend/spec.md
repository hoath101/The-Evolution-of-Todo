# Feature Specification: Todo AI Chatbot – Frontend

**Feature Branch**: `001-todo-ai-frontend`
**Created**: 2026-02-05
**Status**: Draft
**Input**: User description: "Frontend Specification (Next.js 15 + Better Auth + FastAPI)
Project Name

Todo AI Chatbot – Frontend

1. Purpose & Scope

Build a Next.js 15 frontend application that:

Handles authentication exclusively via Better Auth

Communicates with FastAPI backend for all business logic

Uses JWT-based authentication (no cookies)

Acts only as a token carrier and UI layer

Does not implement any authentication logic itself

This frontend must strictly follow the existing backend architecture.

2. Fixed Architecture (Non-Negotiable)
Services

Better Auth (Node.js / Express)
→ Identity Provider (login, signup, JWT issuance)

FastAPI (Python)
→ Business logic (tasks, AI chatbot, todos)

Next.js 15 Frontend
→ UI + routing + token forwarding

Communication Rules

Frontend → Better Auth

Sign up

Sign in

Get session/token

Frontend → FastAPI

Add task

Delete task

Complete task

List tasks

AI chatbot interactions

Frontend must never:

Validate tokens

Decode JWTs for security decisions

Store or manage users

Call FastAPI for authentication

3. Authentication Model (JWT Only)
Token Flow

User authenticates via Better Auth

Better Auth returns a JWT access token

Frontend stores the token securely

Frontend attaches token to every FastAPI request:

Authorization: Bearer <access_token>

Rules

❌ No cookies

❌ No session storage on backend

❌ No auth logic in frontend

✅ JWT is opaque to frontend (used only as a string)

4. Frontend Tech Stack

Next.js 15

App Router

Server Components + Client Components

TypeScript

Fetch / Axios for API calls

Environment variables for service URLs

5. Application Structure (Required)
Routing

/auth/sign-in

/auth/sign-up

/dashboard

/tasks

/chat

Layout Rules

Auth routes are public

All other routes require authentication

Unauthorized users are redirected to /auth/sign-in

6. Auth State Management
Auth Context Responsibilities

Track:

loading

authenticated / unauthenticated

basic user display info (if provided)

Store JWT access token

Provide helpers:

signIn()

signOut()

getAccessToken()

Auth Context Must NOT

Verify JWT

Decode JWT for authorization

Decide permissions

7. API Interaction Rules
Better Auth Client

Used only for:

Login

Signup

Logout

Session retrieval

FastAPI Client

Every request must:

Include JWT in Authorization header

Handle 401 / 403 responses gracefully

No auth retries via FastAPI

8. Pages & Features
Authentication Pages

Sign In

Sign Up

Error handling

Loading states

Task Management

Create task

List tasks

Complete task

Delete task

AI Chatbot

Natural language input

Send messages to FastAPI

Display AI responses

Task creation via AI

9. Environment Variables

Frontend must use:

NEXT_PUBLIC_BETTER_AUTH_URL=
NEXT_PUBLIC_API_BASE_URL=


No secrets embedded in frontend.

10. Error Handling & UX

Handle:

Token expiration

Unauthorized responses

Network failures

Redirect on auth failure

No silent auth assumptions

11. Documentation & Code Quality

Use Context7 MCP to reference:

Next.js 15 best practices

Better Auth client usage

Secure JWT handling patterns

Follow clean component separation

Avoid unnecessary abstractions

12. Hard Rules (Must Be Obeyed)

❌ No cookies

❌ No authentication logic in frontend

❌ No FastAPI auth endpoints

❌ No architectural redesign

❌ No undocumented assumptions

❌ No token decoding for authorization

13. Success Criteria

The frontend is complete when:

Users can authenticate via Better Auth

JWT is attached to every FastAPI request

All protected pages work correctly

No service overlaps responsibilities

Architecture matches backend exactly

Final Architecture Reminder

Better Auth = Identity Provider
Next.js = UI + Token Carrier
FastAPI = Token Verifier + Business Logic

Proceed using /sp.specify.
Do not skip constraints.
Use Context7 MCP for correctness and best practices."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Authentication (Priority: P1)

As a new user, I want to register with the application so that I can access my personal todo list and AI chatbot features.

**Why this priority**: Without authentication, users cannot access any of the core features of the application. This is the foundational requirement for everything else.

**Independent Test**: Can be fully tested by registering a new user account, logging in, and verifying that the user is properly authenticated and redirected to the dashboard.

**Acceptance Scenarios**:

1. **Given** I am on the sign-up page, **When** I provide valid registration information and submit the form, **Then** I should be successfully registered and logged in to the application
2. **Given** I am on the sign-in page, **When** I provide valid login credentials and submit the form, **Then** I should be successfully logged in to the application
3. **Given** I am not authenticated, **When** I try to access a protected route like /dashboard, **Then** I should be redirected to the sign-in page

---

### User Story 2 - Task Management Interface (Priority: P1)

As an authenticated user, I want to manage my tasks through a user-friendly interface so that I can track and organize my responsibilities.

**Why this priority**: Task management is the core functionality of the todo application, making this essential for the product's primary value proposition.

**Independent Test**: Can be fully tested by creating, viewing, completing, and deleting tasks through the UI while verifying all operations are properly sent to the backend API.

**Acceptance Scenarios**:

1. **Given** I am on the tasks page and authenticated, **When** I enter a new task and submit it, **Then** the task should be saved and appear in my task list
2. **Given** I have tasks in my list, **When** I click the complete checkbox for a task, **Then** the task should be marked as completed and updated on the backend
3. **Given** I have completed a task, **When** I click the delete button, **Then** the task should be removed from the list and deleted from the backend

---

### User Story 3 - AI Chatbot Interaction (Priority: P2)

As an authenticated user, I want to interact with an AI chatbot so that I can manage my tasks through natural language conversations.

**Why this priority**: This adds significant value to the application by enabling easier task management through conversational AI, which differentiates the product.

**Independent Test**: Can be fully tested by sending messages to the chatbot and receiving appropriate AI responses, including task creation based on natural language input.

**Acceptance Scenarios**:

1. **Given** I am on the chat page and authenticated, **When** I send a message to the AI chatbot, **Then** I should receive a relevant response from the AI
2. **Given** I send a request to create a task via the chatbot, **When** the AI understands my request, **Then** the task should be created in the backend system
3. **Given** the AI chatbot is responding to my queries, **When** there's a network failure, **Then** appropriate error handling should occur without crashing the interface

---

### Edge Cases

- What happens when JWT token expires during user session?
- How does the system handle network failures when communicating with the backend services?
- What occurs when a user tries to access protected resources without a valid token?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to sign up with email and password using Better Auth service
- **FR-002**: System MUST allow users to sign in using their credentials with Better Auth service
- **FR-003**: System MUST securely store JWT access token in browser storage upon successful authentication
- **FR-004**: System MUST redirect unauthenticated users to sign-in page when accessing protected routes
- **FR-005**: System MUST attach JWT token to every FastAPI request in Authorization header as "Bearer <token>"
- **FR-006**: System MUST provide a dashboard interface for authenticated users
- **FR-007**: System MUST allow users to create new tasks through a UI form
- **FR-008**: System MUST display all user tasks in a list format with ability to sort/filter
- **FR-009**: System MUST allow users to mark tasks as complete/incomplete
- **FR-010**: System MUST allow users to delete tasks from their list
- **FR-011**: System MUST provide an AI chatbot interface for natural language task management
- **FR-012**: System MUST send user messages to FastAPI backend for AI processing
- **FR-013**: System MUST display AI responses in the chat interface in real-time
- **FR-014**: System MUST handle 401/403 responses from backend by redirecting to login
- **FR-015**: System MUST provide loading states and error handling for all API operations
- **FR-016**: System MUST securely handle JWT token expiration and refresh when possible
- **FR-017**: System MUST validate that JWT tokens are treated as opaque strings (not decoded for security decisions)
- **FR-018**: System MUST prevent users from accessing FastAPI endpoints directly for authentication

### Key Entities

- **User Session**: Represents the authenticated state of a user in the frontend, containing the JWT token and basic user information
- **Task**: Represents a user's to-do item with properties like title, description, completion status, and creation date
- **Chat Message**: Represents a message exchanged between the user and AI chatbot with timestamp and sender information

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully register and authenticate via Better Auth with a success rate of 95% or higher
- **SC-002**: All authenticated users can access protected routes and their JWT token is properly attached to FastAPI requests 100% of the time
- **SC-003**: Users can create, view, complete, and delete tasks with responses appearing in under 3 seconds
- **SC-004**: Users can interact with the AI chatbot and receive responses within 5 seconds for 90% of requests
- **SC-005**: 95% of users can successfully complete the primary user flow (authenticate → create task → view task) without encountering authentication errors
- **SC-006**: The system properly handles token expiration and redirects users to login when JWT is invalid or expired
- **SC-007**: All protected routes correctly redirect unauthenticated users to the sign-in page with 100% accuracy
