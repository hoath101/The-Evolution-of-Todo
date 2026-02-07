---
id: 1
title: "todo-ai-frontend-specification"
stage: spec
date: 2026-02-05
surface: agent
model: claude-opus-4-5-20251101
feature: todo-ai-frontend
branch: 001-todo-ai-frontend
user: user
command: /sp.specify
labels:
  - specification
  - frontend
  - auth
  - nextjs
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - specs/001-todo-ai-frontend/spec.md
  - specs/001-todo-ai-frontend/checklists/requirements.md
tests: []
prompt: |
  Frontend Specification (Next.js 15 + Better Auth + FastAPI)
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
  Use Context7 MCP for correctness and best practices.
response: |
  Created complete specification for the Todo AI Chatbot frontend. The specification includes:

  - User Scenarios & Testing section with 3 prioritized user stories (authentication, task management, and AI chatbot interaction)
  - Functional Requirements section with 18 specific requirements covering authentication, task management, and AI chatbot functionality
  - Key Entities section defining User Session, Task, and Chat Message entities
  - Success Criteria section with 7 measurable outcomes

  The specification adheres to all architectural constraints specified in the requirements, including JWT-only authentication, no cookie usage, and strict separation of concerns between Better Auth, FastAPI, and the Next.js frontend. The spec has been validated against quality criteria and is ready for the planning phase.
outcome: "Specification successfully created for Todo AI Chatbot frontend feature. The spec includes user scenarios, functional requirements, key entities, and success criteria that align with the architectural constraints. Quality validation passed and checklist confirmed."
evaluation: "The specification is comprehensive, follows the template structure, meets all quality criteria, and is ready to proceed to the planning phase (/sp.plan)."
---