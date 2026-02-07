# Implementation Plan: Phase IV – Containerization for Todo AI Chatbot

**Branch**: `001-containerization` | **Date**: 2026-02-07 | **Spec**: specs/001-containerization/spec.md
**Input**: Feature specification from `/specs/001-containerization/spec.md`

## Summary

Complete containerization of the Todo AI Chatbot application by creating Docker images for each service (frontend, backend, auth) and orchestrating them via docker-compose. The implementation preserves all original functionality while enabling cloud-native deployment with proper inter-service communication and environment-based configuration.

## Technical Context

**Language/Version**: Python 3.11 (backend), Node.js 20.x (frontend/auth), TypeScript (frontend)
**Primary Dependencies**: FastAPI (backend), Next.js 16 (frontend), Better Auth (auth service), Neon PostgreSQL (database)
**Storage**: Neon PostgreSQL database accessed via connection strings, local session management
**Testing**: pytest (backend), Jest/Cypress (frontend)
**Target Platform**: Linux containers orchestrated via docker-compose
**Project Type**: Web application with separate frontend, backend, and auth services
**Performance Goals**: Maintain Phase III performance characteristics, support multi-container communication
**Constraints**: No changes to Phase III application code, containerized services must maintain original API contracts
**Scale/Scope**: Local development and deployment to containerized environments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ All Phase III code remains unchanged (no modifications to existing services)
- ✅ Container layers wrap existing services without functional changes
- ✅ Services communicate via network interfaces as required
- ✅ Configuration is externalized via environment variables
- ✅ Containerized services maintain original functionality
- ✅ Database connections use network addresses
- ✅ Authentication flow remains unchanged with JWT tokens
- ✅ Service endpoints remain identical to Phase III
- ✅ Container networking supports MCP tool invocation
- ✅ AI agent behavior remains identical to Phase III

## Project Structure

### Documentation (this feature)

```text
specs/001-containerization/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── Dockerfile           # Backend container configuration
├── pyproject.toml
├── requirements.txt
├── src/
│   ├── main.py              # FastAPI application entry point
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   └── tasks.py
│   │   └── deps.py
│   ├── database/
│   │   ├── engine.py
│   │   ├── init.py
│   │   └── session.py
│   └── models/
│       ├── base.py
│       └── conversation.py
└── tests/

frontend/
├── Dockerfile           # Frontend container configuration
├── package.json
├── next.config.ts
├── tsconfig.json
├── src/
│   └── app/
│       ├── api/
│       │   └── auth/
│       │       ├── session/
│       │       ├── signin/
│       │       ├── signout/
│       │       ├── signup/
│       │       └── token/
│       ├── auth/
│       └── chat/
└── public/

better-auth-service/
├── Dockerfile           # Auth service container configuration
├── package.json
├── server.js              # Express server for Better Auth
├── auth.js               # Better Auth configuration
├── src/
└── .env

# Root level container configuration
docker-compose.yml        # Service orchestration
.env                     # Environment variables
phase-4/                 # Containerization documentation
├── README.md
└── docs/
    ├── container-configuration.md
    ├── network-configuration.md
    └── troubleshooting.md
```

**Structure Decision**: Web application with separate services. Containerization creates three distinct Docker images for frontend (Next.js), backend (FastAPI), and auth (Express/Better Auth) services, orchestrated via docker-compose.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Phase 0: Research & Analysis

### Service Analysis

1. **Backend Service (FastAPI)**:
   - Main entry point: `backend/src/main.py`
   - Dependencies: FastAPI, Uvicorn, SQLModel, AsyncPG, OpenAI, Better Auth proxy
   - Port: 8000
   - Environment variables: DATABASE_URL, BETTER_AUTH_URL
   - Database: Neon PostgreSQL via connection string
   - Authentication: Proxies requests to Better Auth service

2. **Frontend Service (Next.js)**:
   - Main entry point: Next.js framework via `package.json` scripts
   - Dependencies: React 19, Next.js 16, Better Auth client
   - Port: 3000
   - Environment variables: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_BETTER_AUTH_URL
   - Communication: API calls to backend and auth services

3. **Auth Service (Better Auth)**:
   - Main entry point: `better-auth-service/server.js`
   - Dependencies: Express, Better Auth, PostgreSQL driver
   - Port: 4000
   - Environment variables: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
   - Database: Neon PostgreSQL via connection string
   - Authentication: JWT token generation/validation

### Containerization Requirements

1. **Dockerfile for Backend**:
   - Base image: Python 3.11 slim
   - Install Python dependencies via pip
   - Copy source code
   - Set environment variables
   - Expose port 8000
   - Run with Uvicorn

2. **Dockerfile for Frontend**:
   - Multi-stage build with builder and runner
   - Base image: Node 20.x Alpine
   - Install Node dependencies via npm
   - Build Next.js application in builder stage
   - Copy built assets to runner stage
   - Set environment variables for API URLs
   - Expose port 3000
   - Run Next.js server

3. **Dockerfile for Auth Service**:
   - Base image: Node 20.x Alpine
   - Install Node dependencies via npm
   - Copy source files
   - Set environment variables
   - Expose port 4000
   - Run Express server

4. **docker-compose.yml**:
   - Define three services: backend, frontend, auth
   - Configure networking between services via custom bridge network
   - Set environment variables for inter-service communication
   - Configure health checks and dependency ordering
   - Set up port mappings for external access
   - Implement restart policies

## Phase 1: Design & Contracts

### Completed Artifacts
- **research.md**: Complete analysis of services and containerization requirements
- **data-model.md**: Container configuration and orchestration data models
- **quickstart.md**: Instructions for building and running containerized services
- **contracts/api-contracts.md**: API contracts that maintain compatibility with Phase III
- **Dockerfiles**: Three Dockerfiles for each service with optimized configurations
- **docker-compose.yml**: Orchestration file with proper service networking and health checks
- **Documentation**: Comprehensive documentation in phase-4/ directory

### API Contract Preservation
- All Phase III API endpoints preserved in containerized services
- Authentication flow maintains original JWT token mechanism
- Database connections continue to use external Neon PostgreSQL
- Inter-service communication follows established patterns
- Frontend continues to interact with backend and auth services as before

### Container Design Decisions
1. **Multi-stage build for frontend**: Optimized image size for production
2. **Non-root users**: Enhanced security by running containers as non-root
3. **Health checks**: Ensured proper service readiness and dependency ordering
4. **Custom network**: Secure internal communication with service discovery
5. **Environment-based configuration**: Maintained twelve-factor app principles

## Phase 2: Task Planning (Reference)
Tasks for implementation would be defined in tasks.md by /sp.tasks command.