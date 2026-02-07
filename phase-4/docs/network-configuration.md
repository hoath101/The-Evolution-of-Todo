# Network Configuration Documentation

## Overview
This document explains the network architecture and communication patterns between containerized services in the Todo AI Chatbot application.

## Network Architecture

### Container Network Design
The application uses a custom Docker bridge network called `todo-ai-network` to enable secure communication between services. This network isolates the services from the host network and other containers while allowing them to communicate with each other using service names as hostnames.

### Service Communication Flow

#### Frontend Service Communication
The frontend service (Next.js) communicates with both backend and auth services:

```
Frontend (Port 3000) → Backend (Port 8000)
Frontend (Port 3000) → Auth (Port 4000)
```

**Outgoing Connections**:
- To Backend: `http://backend:8000` for API requests
- To Auth: `http://auth:4000` for authentication requests

#### Backend Service Communication
The backend service (FastAPI) communicates with the auth service and database:

```
Backend (Port 8000) → Auth (Port 4000)
Backend (Port 8000) → Database
```

**Outgoing Connections**:
- To Auth: `http://auth:4000` for auth proxy functionality
- To Database: Connection via DATABASE_URL

#### Auth Service Communication
The auth service (Better Auth) communicates primarily with the database:

```
Auth (Port 4000) → Database
```

**Outgoing Connections**:
- To Database: Connection via DATABASE_URL

## Service Discovery

### Internal DNS Resolution
Docker provides internal DNS resolution within the custom network. Each service can reach others using their service name as the hostname:

- **Auth Service**: Accessible as `auth` from other services
- **Backend Service**: Accessible as `backend` from other services
- **Frontend Service**: Accessible as `frontend` from other services (though not typically needed)

### URL Construction
The services use the following URLs for internal communication:

- **Auth Service URL**: `http://auth:4000`
- **Backend Service URL**: `http://backend:8000`
- **Frontend Service URL**: `http://frontend:3000` (for potential internal usage)

## Environment Variable Configuration

### Frontend Environment Variables
```
NEXT_PUBLIC_API_BASE_URL=http://backend:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://auth:4000
```

### Backend Environment Variables
```
BETTER_AUTH_URL=http://auth:4000
```

### Auth Service Environment Variables
```
BETTER_AUTH_URL=http://auth:4000
```

## Network Security

### Isolation
- Services are isolated within the `todo-ai-network`
- Cannot be reached by external containers unless explicitly connected
- Host network is not directly accessible from within containers

### Access Control
- Only explicitly defined services can communicate
- No unauthorized services can join the network
- Communication is limited to specified ports and protocols

## Port Mapping

### External Access
The following ports are mapped from host to container for external access:

| Host Port | Container Port | Service | Purpose |
|-----------|----------------|---------|---------|
| 3000 | 3000 | Frontend | User Interface Access |
| 4000 | 4000 | Auth | Authentication API |
| 8000 | 8000 | Backend | Application API |

### Internal Communication
Internal communication uses the original service ports (3000, 4000, 8000) on the internal network without port mapping.

## Health Checks and Connectivity

### Service Health Checks
Each service has a health check configuration that verifies network accessibility:

#### Auth Service Health Check
- **Endpoint**: `GET http://localhost:4000/`
- **Purpose**: Verify auth service is responding
- **Frequency**: Every 30 seconds
- **Timeout**: 10 seconds

#### Backend Service Health Check
- **Endpoint**: `GET http://localhost:8000/`
- **Purpose**: Verify backend service is responding
- **Frequency**: Every 30 seconds
- **Timeout**: 10 seconds

#### Frontend Service Health Check
- **Endpoint**: `GET http://localhost:3000/`
- **Purpose**: Verify frontend service is responding
- **Frequency**: Every 30 seconds
- **Timeout**: 10 seconds

## Inter-Service Communication Patterns

### Authentication Flow
```
1. User → Frontend
2. Frontend → Auth Service (Sign-in/Sign-up)
3. Auth Service → Database (Store user data)
4. Auth Service → Frontend (Return JWT)
5. Frontend → Backend (With JWT)
6. Backend → Auth Service (Validate JWT)
7. Backend → Database (Process request)
8. Backend → Frontend (Return response)
```

### API Proxy Pattern
The backend service implements an API proxy pattern for auth requests:
```
Frontend ↔ Backend ↔ Auth Service
```

This pattern allows the backend to forward authentication requests to the auth service while maintaining consistent API endpoints for the frontend.

## Dependency Relationships

### Service Startup Dependencies
```
Auth Service → Backend Service → Frontend Service
```

- **Backend** depends on **Auth** being healthy before starting
- **Frontend** depends on **Backend** being available before starting
- This ensures services are ready before dependent services try to connect

### Network Dependency Checks
During startup, each service verifies network connectivity to its dependencies:

1. **Backend** verifies connectivity to Auth service via `BETTER_AUTH_URL`
2. **Frontend** expects backend and auth services to be available
3. All services verify database connectivity (if applicable)

## External Database Connection

### Network Configuration for Database
The database connection is external to the container network:

```
Services (Internal Network) → Database (External)
```

- **Database URL**: Passed via environment variable (`DATABASE_URL`)
- **Network Access**: Depends on external network configuration
- **Security**: Encrypted connection (recommended with SSL)

## Troubleshooting Network Issues

### Common Network Problems

#### 1. Service Unreachable
**Symptoms**: Service returns connection refused or timeout
**Diagnosis**:
```bash
docker-compose exec <service> ping <target-service>
docker-compose exec <service> wget --spider http://<target-service>:<port>
```

#### 2. DNS Resolution Failure
**Symptoms**: Hostname cannot be resolved
**Diagnosis**:
```bash
docker-compose exec <service> nslookup <target-service>
docker-compose exec <service> cat /etc/hosts
```

#### 3. Environment Variable Misconfiguration
**Symptoms**: Wrong URLs in application
**Diagnosis**:
```bash
docker-compose exec <service> env | grep -i url
```

### Network Diagnostics Commands

#### Check Network Connectivity
```bash
# From frontend to backend
docker-compose exec frontend ping backend

# From backend to auth
docker-compose exec backend ping auth

# Test HTTP connectivity
docker-compose exec backend wget --spider http://auth:4000
```

#### View Network Information
```bash
# List networks
docker network ls | grep todo-ai

# Inspect network
docker network inspect todo-ai-network

# Check service networks
docker-compose ps
```

## Best Practices

### Network Security
- Use custom networks for service isolation
- Avoid host network mode unless absolutely necessary
- Regularly review service-to-service communication patterns
- Monitor network traffic between services

### Configuration Management
- Use environment variables for service URLs
- Maintain consistent naming conventions
- Document all inter-service communication paths
- Use health checks to verify connectivity

### Performance Optimization
- Minimize network hops where possible
- Optimize payload sizes between services
- Implement appropriate retry logic
- Monitor network latency between services

## Future Enhancements

### Potential Improvements
- Service mesh implementation for advanced traffic management
- Mutual TLS for service-to-service encryption
- Advanced load balancing patterns
- Circuit breaker patterns for fault tolerance