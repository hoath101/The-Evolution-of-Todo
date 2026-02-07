# Troubleshooting Guide: Containerized Todo AI Chatbot

## Overview
This guide provides solutions for common issues encountered when running the containerized Todo AI Chatbot application.

## Common Issues and Solutions

### 1. Services Won't Start

#### Problem: Containers fail to start
**Symptoms**:
- `docker-compose up` fails
- Error messages about build failures
- Services showing as unhealthy

**Solutions**:
1. **Check Docker and Docker Compose versions**:
   ```bash
   docker --version
   docker-compose --version
   ```
   - Minimum requirements: Docker 20.10+, Docker Compose 2.0+

2. **Clean up previous containers**:
   ```bash
   docker-compose down -v
   docker system prune -f
   ```

3. **Rebuild all services**:
   ```bash
   docker-compose build --no-cache
   docker-compose up --build
   ```

#### Problem: Port conflicts
**Symptoms**:
- Error message about ports already in use
- Services failing to bind to ports 3000, 4000, or 8000

**Solutions**:
1. **Check what's using the ports**:
   ```bash
   # Linux/Mac
   lsof -i :3000
   lsof -i :4000
   lsof -i :8000

   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :4000
   netstat -ano | findstr :8000
   ```

2. **Kill processes using the ports**:
   ```bash
   # Get PID and kill (Linux/Mac)
   kill -9 <PID>

   # Windows
   taskkill /F /PID <PID>
   ```

### 2. Database Connection Issues

#### Problem: Cannot connect to database
**Symptoms**:
- Error messages about database connection failures
- Services reporting "Database unavailable"
- Authentication issues persisting

**Solutions**:
1. **Verify DATABASE_URL format**:
   ```
   Correct format: postgresql://username:password@host:port/database
   Example: postgresql://myuser:mypassword@ep-shrill-waterfall-12345.us-east-1.aws.neon.tech/mydatabase?sslmode=require
   ```

2. **Test database connectivity**:
   ```bash
   # From host machine
   docker run --rm -it --env DATABASE_URL="your-database-url" python:3.11-slim bash
   pip install psycopg2-binary
   python -c "import psycopg2; conn = psycopg2.connect('$DATABASE_URL'); print('Connected!')"
   ```

3. **Check Neon PostgreSQL configuration**:
   - Ensure your IP address is whitelisted in Neon dashboard
   - Verify the connection string is correct
   - Check if the database is running and not paused

#### Problem: Authentication service cannot access database
**Symptoms**:
- Auth service crashes or reports database errors
- Sign-in/sign-up fails

**Solutions**:
1. **Verify both services use the same DATABASE_URL**:
   - Backend and Auth service must have identical database connection strings
   - Check that environment variable is properly set in docker-compose.yml

### 3. Inter-Service Communication Issues

#### Problem: Services cannot communicate with each other
**Symptoms**:
- Backend cannot reach auth service
- Frontend cannot reach backend
- "Connection refused" or "Host not found" errors

**Solutions**:
1. **Check network connectivity between services**:
   ```bash
   # Check if backend can reach auth
   docker-compose exec backend ping auth

   # Check if frontend can reach backend
   docker-compose exec frontend ping backend
   ```

2. **Verify service URLs in environment variables**:
   - Auth service should be reachable as `http://auth:4000`
   - Backend service should be reachable as `http://backend:8000`

3. **Check service health status**:
   ```bash
   docker-compose ps
   docker-compose logs auth
   docker-compose logs backend
   ```

4. **Restart services in correct order**:
   ```bash
   docker-compose stop
   docker-compose up -d auth
   docker-compose up -d backend
   docker-compose up -d frontend
   ```

### 4. Authentication and JWT Issues

#### Problem: Authentication fails
**Symptoms**:
- Cannot sign in or sign up
- JWT token validation errors
- Sessions not working properly

**Solutions**:
1. **Verify BETTER_AUTH_SECRET**:
   - Ensure the same secret is used across all services
   - The secret should be consistent in the .env file
   - Restart all services after changing the secret

2. **Check JWT token flow**:
   ```bash
   # Verify auth service is generating tokens properly
   curl -X POST http://localhost:4000/api/auth/sign-in/email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com", "password":"password"}'
   ```

3. **Ensure CORS settings are correct**:
   - Check that the auth service allows requests from frontend origin
   - Verify that BETTER_AUTH_URL is properly configured

### 5. Frontend-Specific Issues

#### Problem: Frontend cannot connect to backend
**Symptoms**:
- API calls from browser fail
- Console errors about failed API requests
- Cannot load chat history or tasks

**Solutions**:
1. **Check frontend environment variables**:
   - Ensure NEXT_PUBLIC_API_BASE_URL points to backend
   - Ensure NEXT_PUBLIC_BETTER_AUTH_URL points to auth service

2. **Test API endpoints directly**:
   ```bash
   # Test backend API directly
   curl http://localhost:8000/

   # Test auth API directly
   curl http://localhost:4000/
   ```

### 6. Build Issues

#### Problem: Docker build failures
**Symptoms**:
- Docker build fails during dependency installation
- Error messages about missing packages or permissions

**Solutions**:
1. **Check Dockerfile syntax**:
   - Verify all COPY/ADD paths exist
   - Ensure RUN commands are valid

2. **Increase Docker build memory** (if on Docker Desktop):
   - Settings → Resources → Advanced → Memory: increase to at least 4GB

3. **Clear Docker build cache**:
   ```bash
   docker builder prune -a
   docker-compose build --no-cache
   ```

## Diagnostic Commands

### General Diagnostics
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs auth

# Follow logs in real-time
docker-compose logs -f

# Check container resource usage
docker stats

# List running containers
docker ps
```

### Network Diagnostics
```bash
# Check network configuration
docker network ls | grep todo-ai
docker network inspect todo-ai-network

# Test connectivity between services
docker-compose exec frontend nslookup backend
docker-compose exec backend nslookup auth

# Test HTTP connectivity
docker-compose exec frontend curl -I http://backend:8000/
docker-compose exec backend curl -I http://auth:4000/
```

### Environment Diagnostics
```bash
# Check environment variables in containers
docker-compose exec backend env
docker-compose exec frontend env
docker-compose exec auth env
```

## Advanced Troubleshooting

### 1. Debug Mode
To run services in debug mode with more verbose output:

1. **Modify docker-compose.yml temporarily**:
   ```yaml
   services:
     backend:
       # ... existing config
       environment:
         - LOG_LEVEL=DEBUG
         # ... other env vars

     frontend:
       # ... existing config
       environment:
         - DEBUG=*
         # ... other env vars
   ```

### 2. Container Shell Access
```bash
# Access container shell for debugging
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/bash
docker-compose exec auth /bin/bash

# Inside container, check:
# - Environment variables: env | grep -i auth
# - Network connectivity: ping auth
# - Files: ls -la
# - Logs: tail -f /app/logs (if applicable)
```

### 3. Database Connection Testing
```bash
# Test database connection from backend container
docker-compose exec backend python -c "
import sqlalchemy
try:
    engine = sqlalchemy.create_engine('${DATABASE_URL}')
    connection = engine.connect()
    print('Database connection successful')
    connection.close()
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

## Prevention Strategies

### 1. Environment Validation
Before running the application:
```bash
# Check if .env file exists and has required variables
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Verify required environment variables
env_vars=("DATABASE_URL" "BETTER_AUTH_SECRET")
for var in "${env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in environment"
        exit 1
    fi
done
```

### 2. Health Check Verification
After starting services:
```bash
# Wait for services to be healthy
sleep 10
docker-compose ps
docker-compose logs | grep -i "healthy\|error\|failed"
```

### 3. Pre-flight Checks
Run this script before starting services:
```bash
#!/bin/bash
echo "=== Pre-flight Checks ==="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
else
    echo "✅ Docker is available: $(docker --version)"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed or not in PATH"
    exit 1
else
    echo "✅ Docker Compose is available: $(docker-compose --version)"
fi

# Check .env file
if [ -f .env ]; then
    echo "✅ .env file found"
else
    echo "❌ .env file not found"
    exit 1
fi

# Check services configuration
if [ -f docker-compose.yml ]; then
    echo "✅ docker-compose.yml found"
else
    echo "❌ docker-compose.yml not found"
    exit 1
fi

echo "🎉 All checks passed! Ready to start services."
```

## When to Seek Help

Contact support or development team if you encounter:

1. **Persistent database connection issues** despite checking connection strings
2. **Network configuration problems** that prevent service-to-service communication
3. **Authentication flow issues** that persist after verifying secrets
4. **Build failures** that continue after clearing caches and checking Dockerfiles
5. **Any security-related concerns** about the containerized application

## Support Resources

- **Repository Issues**: File an issue in the GitHub repository
- **Documentation**: Check the main README and related documentation
- **Logs**: Always include relevant log snippets when seeking help
- **System Info**: Provide Docker and OS information when reporting issues