# Container Configuration Documentation

## Overview
This document provides detailed information about the containerization configuration for the Todo AI Chatbot application. It covers Dockerfiles, docker-compose setup, and network configuration.

## Dockerfile Explanations

### Backend Dockerfile
The backend service (FastAPI) Dockerfile includes:

- **Base Image**: `python:3.11-slim` - Lightweight Python 3.11 image
- **Security**: Non-root user (`appuser`) for reduced privilege access
- **Dependencies**: Installs from `requirements.txt` in the backend directory
- **Port Exposure**: Port 8000 for the FastAPI application
- **Command**: Uses Uvicorn to run the application with proper host binding

### Frontend Dockerfile
The frontend service (NextJS) Dockerfile includes:

- **Multi-stage Build**: Builder stage compiles the application, runner stage runs it
- **Base Image**: `node:20-alpine` - Lightweight Node.js 20 image
- **Optimization**: Production build with only production dependencies
- **Process Management**: Uses `dumb-init` for proper signal handling
- **Security**: Non-root user (`nextjs`) for reduced privilege access
- **Port Exposure**: Port 3000 for the Next.js application

### Auth Service Dockerfile
The auth service (Better Auth) Dockerfile includes:

- **Base Image**: `node:20-alpine` - Lightweight Node.js 20 image
- **Security**: Non-root user (`authuser`) for reduced privilege access
- **Dependencies**: Installs production dependencies only
- **Port Exposure**: Port 4000 for the Express/Better Auth application
- **Command**: Runs the server.js file directly

## Docker Compose Configuration

### Services
The docker-compose.yml defines three main services:

#### Auth Service
- **Purpose**: Manages user authentication and JWT token generation
- **Build Context**: `./better-auth-service`
- **Ports**: 4000:4000 (host:container)
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `BETTER_AUTH_SECRET`: JWT signing secret
  - `BETTER_AUTH_URL`: Self-referencing URL for the service
- **Health Check**: Verifies service availability via HTTP request
- **Restart Policy**: `unless-stopped` to ensure service remains available

#### Backend Service
- **Purpose**: Handles API requests and business logic
- **Build Context**: `./backend`
- **Ports**: 8000:8000 (host:container)
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `BETTER_AUTH_URL`: URL of the auth service for proxy requests
- **Dependencies**: Waits for auth service to be healthy before starting
- **Health Check**: Verifies service availability via HTTP request
- **Restart Policy**: `unless-stopped`

#### Frontend Service
- **Purpose**: Serves the Next.js user interface
- **Build Context**: `./frontend`
- **Ports**: 3000:3000 (host:container)
- **Environment Variables**:
  - `NEXT_PUBLIC_API_BASE_URL`: URL of the backend service
  - `NEXT_PUBLIC_BETTER_AUTH_URL`: URL of the auth service
- **Dependencies**: Waits for backend service to be available
- **Health Check**: Verifies service availability via HTTP request
- **Restart Policy**: `unless-stopped`

### Networks
- **Custom Network**: `todo-ai-network` using bridge driver
- **Service Discovery**: Services can communicate using service names as hostnames
- **Isolation**: Internal communication is isolated from host network

### Health Checks
Each service includes a health check configuration:
- **Test**: Uses `wget` to check service availability
- **Interval**: 30 seconds between checks
- **Timeout**: 10 seconds for each check
- **Retries**: 3 consecutive failures before marking as unhealthy
- **Start Period**: Initial waiting time before starting health checks (40s for backend/auth, 60s for frontend)

## Environment Variables

### Database Configuration
- **DATABASE_URL**: PostgreSQL connection string for both backend and auth services
- **Format**: `postgresql://username:password@host:port/database`
- **Usage**: Both backend and auth services connect to the same database

### Authentication Configuration
- **BETTER_AUTH_SECRET**: Secret key used for signing JWT tokens
- **BETTER_AUTH_URL**: URL where the auth service is accessible
- **Importance**: Must be consistent across services for JWT validation

### Service Communication Configuration
- **NEXT_PUBLIC_API_BASE_URL**: URL where frontend can reach the backend
- **NEXT_PUBLIC_BETTER_AUTH_URL**: URL where frontend can reach the auth service
- **Usage**: Determines how services communicate with each other

## Build and Runtime Process

### Build Process
1. **Backend**:
   - Dependencies installed from `requirements.txt`
   - Source code copied to container
   - Application runs with Uvicorn server

2. **Frontend**:
   - Dependencies installed in builder stage
   - Application built using `npm run build`
   - Production server prepared with only necessary files

3. **Auth Service**:
   - Dependencies installed from `package.json`
   - Source files copied to container
   - Application runs with Node.js

### Runtime Process
1. **Database Initialization**: Services connect to external Neon PostgreSQL
2. **Service Startup**: Auth service starts first, then backend, then frontend
3. **Health Verification**: Each service undergoes health checks
4. **Network Communication**: Services communicate via internal Docker DNS
5. **External Access**: Ports are mapped for external access

## Security Considerations

### Container Security
- **Non-root Users**: All services run as non-root users to limit potential damage
- **Minimal Images**: Base images are kept minimal to reduce attack surface
- **Dependency Scanning**: Production dependencies only to minimize package count

### Network Security
- **Isolated Network**: Services communicate via isolated Docker network
- **Internal DNS**: Service discovery via container names prevents IP exposure
- **Port Mapping**: Only necessary ports are exposed to host

### Environment Security
- **Variable Isolation**: Sensitive data passed via environment variables
- **No Hardcoding**: Configuration is externalized and not in code
- **Secret Management**: Secrets should be handled via Docker secrets in production

## Scaling and Performance

### Resource Usage
- **Lightweight Base Images**: Alpine-based images minimize resource usage
- **Optimized Builds**: Multi-stage builds for frontend reduce final image size
- **Efficient Processes**: Proper process management with dumb-init

### Scalability Considerations
- **Stateless Services**: All services are stateless for easy scaling
- **External Database**: Shared database allows multiple instances
- **Network Configuration**: Designed for multi-container deployments

## Troubleshooting

### Common Issues
- **Port Conflicts**: Ensure ports 3000, 4000, and 8000 are available
- **Database Connection**: Verify DATABASE_URL format and accessibility
- **Service Dependencies**: Check startup order and health check requirements

### Diagnostic Commands
- **View Logs**: `docker-compose logs -f <service-name>`
- **Check Network**: `docker-compose exec <service-name> ping <other-service>`
- **Environment Variables**: `docker-compose exec <service-name> env`
- **Resource Usage**: `docker stats`

## Development vs Production

### Development Configuration
- May include volume mounts for hot reloading
- Might use development-specific commands
- Could include additional debugging tools

### Production Configuration
- Optimized images with minimal attack surface
- Production-only dependencies
- Security-hardened configurations
- Proper restart policies and health checks