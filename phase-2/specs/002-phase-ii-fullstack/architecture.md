# Architecture — Phase II Full-Stack Todo Web Application

## Architecture overview
The system is a three-tier web application:

1. **Frontend (browser + Next.js server runtime)**
   - Renders pages and components.
   - Handles user sign-up/sign-in UI.
   - Stores/reads authentication state via Better Auth.
   - Calls the backend REST API to manage tasks.

2. **Backend (FastAPI)**
   - Provides a REST API for task CRUD.
   - Performs request validation.
   - Performs authorization enforcement (user isolation).
   - Persists and queries tasks in PostgreSQL.

3. **Database (Neon PostgreSQL)**
   - Stores tasks.
   - Stores Better Auth–managed user/auth tables (owned by Better Auth) OR references them as an external schema, depending on the Better Auth adapter configuration.

## Authentication flow (Better Auth → JWT → FastAPI)

### Key invariant
The backend **never manages sessions**.

- The backend does **not** create sessions.
- The backend does **not** store session state.
- The backend only **verifies JWTs** and enforces authorization based on JWT claims.

### High-level flow
1. User navigates to the web app.
2. User signs up or signs in through the frontend.
3. Better Auth authenticates the user and issues a JWT.
4. The frontend attaches the JWT to API requests as an `Authorization: Bearer <token>` header.
5. The backend verifies the JWT and extracts the authenticated user identity.
6. The backend enforces that any user-scoped URL parameter (e.g., `{user_id}`) matches the JWT user identity.

### JWT contents (conceptual)
JWT must contain a stable, unique user identity claim (referred to as `user_id` throughout these specs). The backend treats this as the source of truth for the authenticated user.

## Request/response lifecycle

### Typical request lifecycle (authenticated)
1. Browser initiates an action (e.g., "Create task").
2. Frontend validates minimal UI constraints (e.g., required title).
3. Frontend sends HTTP request to backend.
4. Backend validates:
   - Authorization header presence and format.
   - JWT signature and expiry.
   - User-scoping constraint: JWT identity must match `{user_id}` in the path.
   - Request body schema and field constraints.
5. Backend executes the database operation.
6. Backend returns a JSON response.
7. Frontend updates UI based on the response.

### Failure lifecycle
If any step fails, the backend returns a structured JSON error with an appropriate HTTP status code. The frontend must render a user-friendly error state and must not leak other users’ data.

## Trust boundaries and security assumptions

### Trust boundaries
- **Untrusted**: browser, user input, network.
- **Trusted**:
  - Backend process and its environment variables.
  - Database connection between backend and Neon.
  - Better Auth’s token signing secret/config.

### Security assumptions
- All network communication is via HTTPS in production.
- JWT signing secret is private and not exposed to clients.
- Better Auth is configured to prevent CSRF/session fixation as required by its standard operation.

### Security invariants
- A user can only read/write tasks that they own.
- Requests with missing/invalid/expired JWTs are rejected.
- Requests where `{user_id}` does not match JWT user identity are rejected.

## Monorepo structure and responsibilities
This phase is developed in a monorepo containing separate frontend and backend applications.

**Responsibilities by area**:

- **Frontend app**
  - UI pages and components
  - Authentication UI flows
  - Token acquisition and attachment to API requests
  - Rendering states: signed out, signed in

- **Backend app**
  - REST endpoints defined in `specs/002-phase-ii-fullstack/api/rest-endpoints.md`
  - JWT verification and user identity extraction
  - Task ownership enforcement
  - Database persistence for tasks

- **Database**
  - Task persistence schema and indexes defined in `specs/002-phase-ii-fullstack/database/schema.md`
  - User/auth schema managed by Better Auth (exact tables are not specified here; the application treats them as owned by Better Auth)
