# Deployment Reference

Guide to deploying FastAPI applications in production with Docker, ASGI servers, and best practices.

## Table of Contents

- ASGI Servers
- Docker Deployment
- Environment Configuration
- Production Best Practices
- Monitoring & Logging
- Performance Optimization

## ASGI Servers

### Uvicorn

```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production (single worker)
uvicorn main:app --host 0.0.0.0 --port 8000

# Production (multiple workers)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With specific worker class
uvicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Gunicorn with Uvicorn Workers

```bash
# Install
pip install gunicorn uvicorn[standard]

# Run
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# With configuration file
gunicorn main:app -c gunicorn_conf.py
```

```python
# gunicorn_conf.py
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
```

### Hypercorn

```bash
# Install
pip install hypercorn

# Run
hypercorn main:app --bind 0.0.0.0:8000 --workers 4
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application
COPY ./app ./app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Multi-Stage Dockerfile (Optimized)

```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

# Install runtime dependencies
RUN pip install --no-cache /wheels/*

# Copy application
COPY ./app ./app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/dbname
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    volumes:
      - ./app:/app/app  # For development only

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream fastapi {
        server api:8000;
    }

    server {
        listen 80;
        server_name example.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name example.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        location / {
            proxy_pass http://fastapi;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support
        location /ws {
            proxy_pass http://fastapi;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

## Environment Configuration

### .env File

```bash
# .env
APP_NAME=My FastAPI App
DEBUG=False

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://example.com,https://www.example.com

# External Services
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Configuration Management

```python
# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "FastAPI App"
    debug: bool = False

    # Database
    database_url: str

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    allowed_origins: list[str] = []

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
```

## Production Best Practices

### Application Structure

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from .config import settings
from .routers import users, items

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,  # Disable in production
    redoc_url="/redoc" if settings.debug else None,
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com"]
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(items.router)

@app.on_event("startup")
async def startup_event():
    # Initialize database connections, etc.
    pass

@app.on_event("shutdown")
async def shutdown_event():
    # Close connections, cleanup
    pass

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Health Checks

```python
from fastapi import APIRouter, status
from sqlalchemy import select
from .database import engine

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/health/db")
async def database_health():
    try:
        async with engine.connect() as conn:
            await conn.execute(select(1))
        return {"database": "healthy"}
    except Exception as e:
        return {"database": "unhealthy", "error": str(e)}
```

## Monitoring & Logging

### Structured Logging

```python
# logging_config.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(levelname)s %(name)s %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger
```

```python
# main.py
import logging
from .logging_config import setup_logging

logger = setup_logging()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(
        "Request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host
        }
    )

    response = await call_next(request)

    logger.info(
        "Response",
        extra={
            "status_code": response.status_code,
            "path": request.url.path
        }
    )

    return response
```

### Prometheus Metrics

```python
# Install: pip install prometheus-fastapi-instrumentator
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

# Add metrics endpoint
Instrumentator().instrument(app).expose(app)

# Custom metrics
from prometheus_client import Counter, Histogram

request_count = Counter('app_requests_total', 'Total requests')
request_duration = Histogram('app_request_duration_seconds', 'Request duration')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    request_count.inc()

    with request_duration.time():
        response = await call_next(request)

    return response
```

## Performance Optimization

### Caching with Redis

```python
import redis.asyncio as redis
from functools import wraps

redis_client = redis.from_url("redis://localhost")

def cache(expire: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{args}:{kwargs}"

            # Try cache
            cached = await redis_client.get(cache_key)
            if cached:
                return cached

            # Execute function
            result = await func(*args, **kwargs)

            # Store in cache
            await redis_client.setex(cache_key, expire, result)

            return result
        return wrapper
    return decorator

@app.get("/items/{item_id}")
@cache(expire=300)
async def read_item(item_id: int):
    # Expensive operation
    return {"item_id": item_id}
```

### Database Connection Pooling

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=3600,
)
```

### Async Database Operations

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/db",
    pool_size=20,
    max_overflow=0,
)
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Debug mode disabled
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] API documentation disabled (or protected)
- [ ] Health check endpoint implemented
- [ ] Logging configured
- [ ] Monitoring setup (Prometheus, etc.)
- [ ] Error tracking (Sentry, etc.)
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Database connection pooling
- [ ] Backup strategy in place

## Best Practices

1. **Use Gunicorn with Uvicorn workers** for production
2. **Multiple workers** based on CPU cores
3. **Docker multi-stage builds** for smaller images
4. **Environment-based configuration** with pydantic-settings
5. **Health check endpoints** for load balancers
6. **Structured logging** for better debugging
7. **Connection pooling** for database
8. **Caching** for expensive operations
9. **Rate limiting** on public endpoints
10. **Monitoring and alerting** for production issues
