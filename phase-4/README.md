# Phase IV: Containerization for Todo AI Chatbot

This directory contains all documentation, configurations, and artifacts for the containerization of the Todo AI Chatbot application. The application has been successfully containerized into three separate services: frontend, backend, and authentication service.

## Overview

The containerization process wraps the existing Phase III Todo AI Chatbot services in Docker containers while preserving all original functionality. The architecture consists of:

- **Frontend Service**: Next.js application serving the user interface
- **Backend Service**: FastAPI application handling API requests and business logic
- **Auth Service**: Better Auth service managing user authentication and JWT tokens

All services communicate via Docker networking and maintain the original API contracts from Phase III.

## Container Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │
│  Frontend   │◄──►│   Backend   │◄──►│    Auth     │
│  (Port 3000)│    │  (Port 8000)│    │  (Port 4000)│
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   Neon PostgreSQL
                   (External Database)
```

## Setup and Deployment

### Prerequisites

- Docker Engine (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Access to Neon PostgreSQL database

### Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@your-neon-db-host.neon.tech/dbname

# Auth Secret (generate a strong random string)
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production
```

### Running the Application

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Auth Service: http://localhost:4000

3. **Stop the services:**
   ```bash
   docker-compose down
   ```

## Service Details

### Frontend Service (Next.js)
- Built with Node 20-alpine base image
- Multi-stage build for optimized production image
- Exposes port 3000
- Environment variables:
  - `NEXT_PUBLIC_API_BASE_URL`: Points to backend service (`http://backend:8000`)
  - `NEXT_PUBLIC_BETTER_AUTH_URL`: Points to auth service (`http://auth:4000`)

### Backend Service (FastAPI)
- Built with Python 3.11-slim base image
- Runs with uvicorn ASGI server
- Exposes port 8000
- Environment variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `BETTER_AUTH_URL`: URL of auth service (`http://auth:4000`)

### Auth Service (Better Auth)
- Built with Node 20-alpine base image
- Express server hosting Better Auth
- Exposes port 4000
- Environment variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `BETTER_AUTH_SECRET`: JWT signing secret
  - `BETTER_AUTH_URL`: Self-referencing URL (`http://auth:4000`)

## Networking Configuration

### Internal Communication
- Services communicate via Docker's built-in DNS using service names:
  - `http://auth:4000` - Auth service
  - `http://backend:8000` - Backend service
  - `http://frontend:3000` - Frontend service

### External Access
- Ports are mapped to the host for external access:
  - Host port 3000 → Container port 3000 (frontend)
  - Host port 4000 → Container port 4000 (auth)
  - Host port 8000 → Container port 8000 (backend)

## Security Considerations

- All containers run as non-root users for security
- JWT tokens are handled consistently across services
- Environment variables are used for configuration instead of hardcoded values
- Network isolation is maintained between services

## Development Workflow

### Local Development
For local development with hot reload, you can modify the docker-compose.yml to mount source code as volumes:

```yaml
services:
  backend:
    # ... existing config
    volumes:
      - ./backend/src:/app/src  # Enable hot reload
    command: uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

  frontend:
    # ... existing config
    volumes:
      - ./frontend:/app
      - /app/node_modules  # Prevent overriding node_modules in container
    command: npm run dev
```

### Production Builds
Production images are optimized for size and security:
- Multi-stage builds where applicable
- Non-root users
- Minimal base images
- Removed build dependencies in final images

## Monitoring and Maintenance

### Health Checks
Each service includes health checks to ensure proper startup and operation:
- Auth service: `GET /` endpoint
- Backend service: `GET /` endpoint
- Frontend service: `GET /` endpoint

### Logging
Logs can be viewed with:
```bash
docker-compose logs -f <service-name>
```

### Updates
To update services:
```bash
# Pull latest changes
git pull

# Rebuild and restart services
docker-compose up --build -d
```

## Architecture Decisions

### Service Separation
- **Reason**: Maintain loose coupling between UI, business logic, and authentication
- **Benefit**: Independent scaling and deployment capabilities

### Container Networking
- **Reason**: Enable secure internal communication without exposing services externally
- **Benefit**: Cleaner service discovery and reduced attack surface

### Environment-based Configuration
- **Reason**: Follow 12-factor app methodology
- **Benefit**: Environment portability and configuration management

## Limitations and Known Issues

- Database (Neon PostgreSQL) must be externally hosted (not containerized)
- All services must be on the same Docker network
- Startup sequence is important (auth service must be ready before backend)

## Next Steps

- Deployment to container orchestration platforms (Kubernetes, Docker Swarm)
- Integration with CI/CD pipelines
- Implementation of advanced monitoring and alerting
- Configuration of automated backups for the database