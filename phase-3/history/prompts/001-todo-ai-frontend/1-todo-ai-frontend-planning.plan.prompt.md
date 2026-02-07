---
id: 1
title: "Todo AI Chatbot Frontend Planning"
stage: "plan"
date: "2026-02-06"
surface: "agent"
model: "Claude Opus 4.6"
feature: "001-todo-ai-frontend"
branch: "001-todo-ai-frontend"
user: "Baloch"
command: "/sp.plan"
labels: ["frontend", "nextjs", "authentication", "planning"]
links:
  spec: "../specs/001-todo-ai-frontend/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - "specs/001-todo-ai-frontend/plan.md"
  - "specs/001-todo-ai-frontend/research.md"
  - "specs/001-todo-ai-frontend/data-model.md"
  - "specs/001-todo-ai-frontend/quickstart.md"
  - "specs/001-todo-ai-frontend/contracts/fastapi-openapi.yaml"
tests: []
---

# Implementation Plan Prompt for Todo AI Chatbot Frontend

## Feature Overview
Create an implementation plan for a Next.js 15 frontend application that serves as the UI layer for a Todo AI Chatbot system. The frontend will handle authentication via Better Auth, communicate with a FastAPI backend for all business logic, and use JWT-based authentication without implementing any authentication logic itself.

## Architecture Constraints (Hard Rules)
- Use Next.js 15 with App Router
- Use Better Auth for authentication (signup, signin, JWT issuance)
- Communicate with FastAPI backend for all business logic (tasks, AI chatbot)
- Use JWT-based authentication only (no cookies)
- Frontend acts only as a token carrier and UI layer
- Do NOT implement any authentication logic in frontend
- Do NOT validate tokens in frontend
- Do NOT decode JWTs for security decisions
- Do NOT store or manage users in frontend
- Do NOT call FastAPI for authentication

## Required Pages & Routes
- `/auth/sign-in` - Public authentication page
- `/auth/sign-up` - Public registration page
- `/dashboard` - Protected dashboard for authenticated users
- `/tasks` - Task management interface
- `/chat` - AI chatbot interface

## Core Features to Plan
1. **Auth State Management System**
   - Auth Context to track loading/authenticated states
   - Store JWT access token securely
   - Provide helpers: signIn(), signOut(), getAccessToken()
   - Do NOT verify/decode JWT for authorization decisions

2. **API Interaction Layer**
   - Better Auth Client for login/signup/logout/session
   - FastAPI Client that includes JWT in Authorization header
   - Handle 401/403 responses gracefully
   - No auth retries via FastAPI

3. **Task Management Interface**
   - Create task functionality
   - List tasks with sorting/filtering
   - Complete/incomplete tasks
   - Delete tasks

4. **AI Chatbot Interface**
   - Natural language input
   - Send messages to FastAPI backend
   - Display AI responses in real-time
   - Task creation via AI

## Technical Requirements
- TypeScript for type safety
- Environment variables: NEXT_PUBLIC_BETTER_AUTH_URL and NEXT_PUBLIC_API_BASE_URL
- Proper error handling for token expiration, network failures
- Loading states and error boundaries
- Secure JWT handling patterns
- Clean component separation

## Success Criteria
- Users can authenticate via Better Auth
- JWT is attached to every FastAPI request
- All protected pages work correctly
- No service overlaps responsibilities
- Architecture matches backend exactly

## Planning Considerations
- Follow Next.js 15 best practices
- Reference Better Auth client usage patterns
- Implement secure JWT handling
- Plan for proper routing with protected/unprotected pages
- Consider user experience for authentication flow
- Plan error handling and edge cases (token expiration, network failures)

## Outcome

The implementation plan for the Todo AI Chatbot frontend has been successfully created with the following artifacts:

1. **Plan Document**: `specs/001-todo-ai-frontend/plan.md` - Comprehensive implementation plan detailing architecture, technical context, and project structure.

2. **Research Findings**: `specs/001-todo-ai-frontend/research.md` - Research outcomes covering technology choices, authentication approach, API communication strategy, and security implementation.

3. **Data Models**: `specs/001-todo-ai-frontend/data-model.md` - Detailed data models for User Session, Task, Chat Message, Auth Request, and API Response entities.

4. **API Contracts**: `specs/001-todo-ai-frontend/contracts/fastapi-openapi.yaml` - OpenAPI specification for the FastAPI backend endpoints that the frontend will consume.

5. **Quickstart Guide**: `specs/001-todo-ai-frontend/quickstart.md` - Step-by-step guide for setting up, developing, and deploying the frontend application.

6. **Agent Context Updated**: The Claude Code context file has been updated with the new technology stack information for the frontend project.

The plan adheres to all architectural constraints specified in the feature requirements, maintaining clear separation between authentication (via Better Auth) and business logic (via FastAPI). The frontend will act strictly as a UI layer and token carrier without implementing any authentication logic itself.