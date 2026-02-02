# Phase II Overview — Full-Stack, Multi-User Todo Web Application

## Project purpose
Phase II transforms the completed Phase I console todo application into a modern web application that supports multiple users, authentication, and persistent storage.

This phase is intended to deliver a production-style user experience where each authenticated user can manage their own todo tasks from a browser.

## Current phase
**Current phase**: Phase II (web application)

## High-level system description
The system consists of:

- A browser-based frontend where users sign up, sign in, and manage tasks.
- A backend API that persists tasks and enforces per-user authorization.
- A PostgreSQL database that stores tasks and any backend-owned application data.
- An authentication provider layer that issues JWTs after successful sign-in.

### Core user value
- Users can access their tasks from any device by signing in.
- Users only ever see and modify their own tasks.
- Tasks persist across sessions and devices.

## Phase boundaries
### Phase I is frozen (explicit)
Phase I is **complete and frozen**. It is out of scope for Phase II.

- Do **not** modify Phase I specs.
- Do **not** refactor or depend on Phase I implementation code.
- Phase II is implemented as a separate web application surface.

## Technology stack summary (Phase II)
This phase uses a full-stack web architecture:

- **Frontend**: Next.js App Router (web UI)
- **Authentication**: Better Auth (issues JWTs)
- **Backend**: FastAPI (REST API; verifies JWTs only)
- **Database**: Neon PostgreSQL (persistent storage)

## Out of scope (non-goals)
- Sharing tasks between users
- Admin roles, team workspaces, or organization management
- Offline-first behavior
- Real-time multi-client synchronization
- Background jobs, reminders, or notifications
- Import/export of tasks
