# Troubleshooting Reference

Common FastAPI errors, their causes, and solutions.

## Table of Contents

- Validation Errors (422)
- Database Errors
- Authentication Issues
- Import Errors
- CORS Issues
- Performance Problems
- Deployment Issues

## Validation Errors (422)

### Unprocessable Entity

**Error**: 422 Unprocessable Entity

**Cause**: Request body doesn't match Pydantic model

```python
# ❌ Bad - Missing required field
@app.post("/items")
async def create_item(item: Item):  # Item requires 'name' field
    return item

# Client sends: {"price": 10.0} # Missing 'name'
```

**Solution**: Ensure all required fields are sent or make them optional

```python
# ✅ Good - Make field optional or provide default
class Item(BaseModel):
    name: str
    price: float = 0.0  # Default value

# Or make it optional
class Item(BaseModel):
    name: str | None = None
    price: float
```

### Type Validation Error

**Error**: value is not a valid integer

```python
# ❌ Bad - Path parameter type mismatch
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# GET /items/abc -> Error
```

**Solution**: Validate input or adjust type

```python
# ✅ Good - Use string if accepting non-integers
@app.get("/items/{item_id}")
async def read_item(item_id: str):
    if not item_id.isdigit():
        raise HTTPException(status_code=400, detail="Invalid item ID")
    return {"item_id": int(item_id)}
```

## Database Errors

### Connection Refused

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Cause**: Database not running or wrong connection string

**Solution**:

```bash
# Check database is running
docker ps  # For Docker containers
pg_isready  # For PostgreSQL

# Verify connection string
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Table Does Not Exist

**Error**: `relation "users" does not exist`

**Cause**: Tables not created

**Solution**:

```python
# Create tables in main.py
from .database import engine, Base
from . import models

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

# Or use Alembic migrations
alembic upgrade head
```

### Session Closed Error

**Error**: `Session is closed`

**Cause**: Using database session after it's been closed

```python
# ❌ Bad - Session closed before use
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    return user.posts  # Error: session closed
```

**Solution**: Use dependency injection

```python
# ✅ Good - Proper dependency
@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return user
```

## Authentication Issues

### Invalid Token

**Error**: `Could not validate credentials`

**Cause**: Token expired, malformed, or wrong secret key

**Solution**:

```python
# Check token expiration
from datetime import datetime, timedelta

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=30)  # Extend if needed
    to_encode = {"exp": expire, **data}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Verify secret key matches
SECRET_KEY = "same-key-for-encode-and-decode"
```

### 401 Unauthorized

**Error**: Missing or invalid Authorization header

**Solution**:

```python
# Ensure client sends header
headers = {
    "Authorization": "Bearer your-token-here"
}

# Check OAuth2 scheme is correct
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # Match your endpoint
```

## Import Errors

### Cannot Import Name

**Error**: `ImportError: cannot import name 'app' from 'main'`

**Cause**: Circular imports or missing `__init__.py`

**Solution**:

```python
# Ensure __init__.py exists in each package
app/
  __init__.py
  main.py
  routers/
    __init__.py
    users.py

# Avoid circular imports - import at function level if needed
def get_user():
    from .crud import get_user_from_db  # Import inside function
    return get_user_from_db()
```

### ModuleNotFoundError

**Error**: `No module named 'app'`

**Solution**:

```bash
# Run from correct directory
cd /path/to/project
uvicorn app.main:app

# Or install package in development mode
pip install -e .
```

## CORS Issues

### CORS Error in Browser

**Error**: `Access to fetch at 'http://localhost:8000/api' has been blocked by CORS policy`

**Solution**:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Credentials Not Allowed

**Error**: `The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true'`

**Solution**:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  # Must be True
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance Problems

### Slow Response Times

**Cause**: Blocking I/O operations, N+1 queries

**Solution**:

```python
# ✅ Use async/await for I/O
@app.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

# ✅ Eager load relationships
from sqlalchemy.orm import selectinload

async def get_user_with_posts(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(User)
        .options(selectinload(User.posts))
        .filter(User.id == user_id)
    )
    return result.scalar_one_or_none()

# ✅ Use caching for expensive operations
from functools import lru_cache

@lru_cache(maxsize=100)
def expensive_computation(param: str):
    # Expensive operation
    return result
```

### Memory Leaks

**Cause**: Not closing database sessions or file handles

**Solution**:

```python
# ✅ Use context managers and dependencies
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db():
    async with async_session() as session:
        yield session
        # Automatically closed

# ✅ Close file handles
async def process_file(file: UploadFile):
    try:
        content = await file.read()
        # Process content
    finally:
        await file.close()
```

## Deployment Issues

### Port Already in Use

**Error**: `OSError: [Errno 98] Address already in use`

**Solution**:

```bash
# Find and kill process using port
lsof -i :8000
kill -9 <PID>

# Or use different port
uvicorn main:app --port 8001
```

### Module Not Found in Docker

**Error**: `ModuleNotFoundError` in Docker container

**Solution**:

```dockerfile
# Ensure WORKDIR is set correctly
WORKDIR /app

# Copy all necessary files
COPY ./app ./app
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Set PYTHONPATH if needed
ENV PYTHONPATH=/app
```

### Environment Variables Not Loading

**Error**: Environment variables are None

**Solution**:

```dockerfile
# Pass env vars in docker-compose.yml
services:
  api:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}

# Or use env_file
services:
  api:
    env_file:
      - .env
```

```python
# Ensure pydantic-settings is installed
pip install pydantic-settings

# Use proper Settings class
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str

    class Config:
        env_file = ".env"
```

## Common Patterns & Fixes

### 404 Not Found

```python
# ❌ Wrong: Path doesn't match
@app.get("/user/{user_id}")  # Defined
# GET /users/1  # Called (note plural 'users')

# ✅ Correct: Match paths exactly
@app.get("/users/{user_id}")
```

### 405 Method Not Allowed

```python
# ❌ Wrong: POST to GET endpoint
@app.get("/items")
# POST /items  # Error

# ✅ Correct: Use matching method
@app.post("/items")
```

### Pydantic Validation Error

```python
# ❌ Bad: Using dict instead of model
@app.post("/items")
async def create_item(item: dict):  # No validation
    return item

# ✅ Good: Use Pydantic model
class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
async def create_item(item: Item):  # Validated
    return item
```

## Debug Tools

### Enable Debug Mode

```python
# main.py
app = FastAPI(debug=True)

# Or via environment
DEBUG=True uvicorn main:app
```

### Logging

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.get("/debug")
async def debug_endpoint():
    logger.debug("Debug message")
    logger.info("Info message")
    logger.error("Error message")
    return {"status": "check logs"}
```

### SQL Query Logging

```python
# Enable SQL echo
engine = create_engine(DATABASE_URL, echo=True)
```

## Best Practices to Avoid Issues

1. **Use type hints** for automatic validation
2. **Dependency injection** for database sessions
3. **Async/await** for I/O operations
4. **Proper error handling** with try/except
5. **Environment variables** for configuration
6. **Logging** for debugging
7. **Testing** with TestClient
8. **CORS middleware** before production
9. **Database migrations** with Alembic
10. **Health check endpoints** for monitoring
