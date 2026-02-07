<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified sections: Scope, Core Architectural Rules, Technology Stack, Completion Criteria, Additional Constraints
- Added sections: Containerization Rules, Documentation Requirements
- Removed sections: None
- Templates requiring updates: ✅ No templates to update
- Follow-up TODOs: None
-->
# Phase IV – Todo AI Chatbot Containerization Constitution

## Core Principles

### Authority & Execution
Claude Code is the **sole implementing agent**. All specs, plans, tasks, and code MUST be produced via Claude Code. Manual coding is strictly forbidden.

### Mandatory Workflow
This phase MUST follow the Agentic Dev Stack in order: 1. Write specifications 2. Generate implementation plan 3. Decompose into atomic tasks 4. Implement incrementally 5. Validate against acceptance criteria. No step may be skipped, merged, or reordered.

### Scope
Phase IV focuses on **containerization** of existing Phase III Todo AI Chatbot services. Included: Dockerfile creation for each service, docker-compose.yml for local orchestration, Network configuration for inter-service communication, Environment configuration for containerized deployments. Excluded: Orchestration platforms (Kubernetes, ECS), Production deployment infrastructure, Changes to Phase III application code, Service mesh implementation.

### Core Architectural Rules
Phase III code remains unchanged, Container layers wrap existing services, Services communicate via network interfaces, Configuration is externalized via environment variables, Containerized services maintain original functionality, Database connections use network addresses.

### Technology Stack (FIXED)
Container Runtime: Docker, Orchestration: docker-compose, Frontend: Next.js (in container), Backend: FastAPI (in container), Auth: Better Auth Service (in container), Database: Neon PostgreSQL (external), No orchestrator beyond docker-compose.

### Authentication & Security
Containerized services maintain original JWT authentication flow, Environment variables manage secrets securely, Container network isolation is preserved, No direct database access from outside containers, Authentication flow remains unchanged.

### API Contract (LOCKED)
Service endpoints remain identical to Phase III, Containerized services expose same ports, Network routing follows original API contracts, JWT validation continues unchanged, Cross-container communication maintains original protocols.

### MCP Tool Contract (MANDATORY)
MCP tools remain unchanged from Phase III, Container networking supports tool invocation, Database connectivity preserved in containerized context, Tool contracts maintain original parameter and return structures.

### Agent Behavior Rules
AI agent behavior remains identical to Phase III, MCP tool invocations occur via containerized services, Natural language processing continues unchanged, Agent interactions with MCP tools preserved.

### Repository & Specs
Phase III codebase remains intact, New containerization artifacts in phase-4/, All container configurations under /specs/phase-4, Container documentation centralized in phase-4/.

### Quality Constraints
No functional changes to Phase III code, Deterministic container builds, Clear environment configuration, Network compatibility between containers, Minimal security surface area in containers.

### Completion Criteria
Phase IV is complete when: All Phase III services run in containers, Services communicate correctly over container network, Original functionality preserved, Dockerfiles and compose file operational.

## Containerization Rules

### Dockerfile Requirements
Each service must have its own Dockerfile, Images use minimal base images, Dependencies are pinned and secured, Build contexts exclude unnecessary files, Multi-stage builds preferred where beneficial.

### Networking Rules
Services communicate via docker-compose networks, Internal service discovery through container names, External access via mapped ports, Network isolation prevents unauthorized access, Health checks ensure service readiness.

### Environment Management
Configuration externalized via environment variables, Secrets managed via docker-compose secrets or env files, Service URLs constructed dynamically, Database connection strings passed via env vars, Port configurations externalized.

### Image Management
Images tagged with semantic versions, Latest tag maintained for development, Build-time arguments customize environments, Layer optimization reduces image size, Security scanning implemented where possible.

## Documentation Requirements

### Output Location
All containerization documentation in phase-4/, Dockerfiles and compose files in phase-4/, Configuration guides under phase-4/docs/, Network diagrams in phase-4/docs/.

### Container Configuration
Dockerfile build instructions documented, docker-compose service configurations detailed, Environment variable definitions complete, Port mapping and network setup explained, Volume mounts and persistence documented.

## Additional Constraints

Phase III code must not be modified, No Minikube installation or usage allowed, No Docker AI (Gordon) reliance, Dockerfiles and docker-compose.yml generation permitted, Container network compatibility required, All outputs documented in phase-4/, Containerization-focused only (no orchestration beyond docker-compose).

## Development Workflow

Follow the Agentic Dev Stack in strict order: spec -> plan -> tasks -> implement -> validate. All implementations must follow the specified containerization requirements and architectural rules. Phase III services wrapped in containers without functional changes.

## Governance

This constitution supersedes all other practices. All development must comply with these principles. Amendments require explicit documentation and approval. All implementation must verify compliance with these rules.

**Version**: 1.1.0 | **Ratified**: 2026-02-03 | **Last Amended**: 2026-02-07