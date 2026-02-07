# Quickstart Guide: Phase IV – Containerization for Todo AI Chatbot

## Overview
This guide provides instructions for building, running, and managing the containerized Todo AI Chatbot application. The application consists of three services: frontend (Next.js), backend (FastAPI), and authentication (Better Auth).

## Prerequisites

### System Requirements
- Docker Engine (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git for cloning the repository
- Access to Neon PostgreSQL database

### Environment Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Navigate to the project directory:
   ```bash
   cd phase-3  # or appropriate directory containing the services
   ```

## Container Build and Run

### Method 1: Using Docker Compose (Recommended)

1. **Navigate to the project root** (where docker-compose.yml will be located):
   ```bash
   cd path/to/project
   ```

2. **Create environment files** for each service:

   Create `.env` file with the following content:
   ```env
   # Database configuration
   DATABASE_URL=postgresql://username:password@your-neon-db-host.neon.tech/dbname

   # Auth configuration
   BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production

   # Service URLs for containerized environment
   BACKEND_SERVICE_URL=http://backend:8000
   FRONTEND_SERVICE_URL=http://frontend:3000
   AUTH_SERVICE_URL=http://auth:4000
   ```

3. **Start all services**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Auth Service: http://localhost:4000

### Method 2: Building Individual Containers

1. **Build the Backend Container**:
   ```bash
   cd backend
   docker build -t todo-ai-backend .
   ```

2. **Build the Frontend Container**:
   ```bash
   cd frontend
   docker build -t todo-ai-frontend .
   ```

3. **Build the Auth Service Container**:
   ```bash
   cd better-auth-service
   docker build -t todo-ai-auth .
   ```

4. **Run the containers**:
   ```bash
   # Run database first (if using containerized DB)
   docker run -d --name postgres-db -e POSTGRES_DB=tododb -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:13

   # Run auth service
   docker run -d --name auth-service -p 4000:4000 -e DATABASE_URL="postgresql://user:password@postgres-db:5432/tododb" -e BETTER_AUTH_SECRET="your-secret" todo-ai-auth

   # Run backend service
   docker run -d --name backend-service -p 8000:8000 -e DATABASE_URL="postgresql://user:password@postgres-db:5432/tododb" -e BETTER_AUTH_URL="http://localhost:4000" todo-ai-backend

   # Run frontend service
   docker run -d --name frontend-service -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL="http://localhost:8000" -e NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:4000" todo-ai-frontend
   ```

## Docker Compose Configuration

### docker-compose.yml Structure
```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: tododb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d tododb"]
      interval: 10s
      timeout: 5s
      retries: 5

  auth:
    build:
      context: ./better-auth-service
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/tododb
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=http://auth:4000
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/tododb
      - BETTER_AUTH_URL=http://auth:4000
    depends_on:
      auth:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8000
      - NEXT_PUBLIC_BETTER_AUTH_URL=http://auth:4000
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
```

## Service Management Commands

### Starting Services
```bash
# Start all services in detached mode
docker-compose up -d

# Start all services with rebuild
docker-compose up --build

# Start specific service
docker-compose up <service-name>
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop <service-name>

# Stop and remove volumes (careful: this deletes data)
docker-compose down -v
```

### Viewing Logs
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs <service-name>

# Follow logs in real-time
docker-compose logs -f <service-name>
```

### Managing Individual Containers
```bash
# List running containers
docker ps

# Execute command in running container
docker exec -it <container-name> /bin/sh

# View container resource usage
docker stats

# Remove stopped containers
docker container prune
```

## Environment Configuration

### Required Environment Variables

#### For External Database (Neon PostgreSQL)
Create a `.env` file in the project root:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require

# Auth Configuration
BETTER_AUTH_SECRET=change-this-to-a-secure-random-string
```

#### For Local Development
```env
# Local Development Configuration
DATABASE_URL=postgresql://user:password@host.docker.internal:5432/tododb
BETTER_AUTH_SECRET=development-secret-for-local-testing

# For services running on host machine
NEXT_PUBLIC_API_BASE_URL=http://host.docker.internal:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://host.docker.internal:4000
```

## Troubleshooting

### Common Issues

1. **Service won't start - Port already in use**
   ```bash
   # Find and kill processes using the port
   lsof -i :3000  # or 8000, 4000, etc.
   kill -9 <PID>
   ```

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check database accessibility from containers
   - Ensure proper network configuration

3. **Authentication not working**
   - Verify BETTER_AUTH_SECRET is consistent across services
   - Check that auth service is reachable from other services

4. **Frontend can't connect to backend**
   - Verify NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_BETTER_AUTH_URL
   - Check container network connectivity

### Debug Commands
```bash
# Check if containers can reach each other
docker-compose exec backend ping auth
docker-compose exec frontend ping backend

# Check environment variables in container
docker-compose exec backend env

# Test database connection in container
docker-compose exec backend python -c "import sqlalchemy; engine = sqlalchemy.create_engine('${DATABASE_URL}'); engine.connect()"
```

## Development Workflow

### Hot Reload for Development
For development, you can mount your source code as volumes to enable hot reload:

```yaml
# Add to docker-compose.yml for development
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

### Building Production Images
```bash
# Build production-ready images
docker-compose -f docker-compose.prod.yml build

# Push images to registry (if needed)
docker tag todo-ai-backend:latest your-registry/todo-ai-backend:latest
docker push your-registry/todo-ai-backend:latest
```

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use strong, random values for BETTER_AUTH_SECRET**
3. **Limit container resource usage in production**
4. **Keep base images updated**
5. **Scan images for vulnerabilities**

## Next Steps

1. **Deploy to container orchestration platform** (Docker Swarm, Kubernetes)
2. **Set up CI/CD pipeline** for automated builds
3. **Configure monitoring and logging** solutions
4. **Set up automated backup** for database