---
name: fastapi
description: Comprehensive Python FastAPI expert for building modern REST APIs with async support, automatic validation, and interactive documentation. Use when working with FastAPI projects for: (1) Building new REST APIs from scratch, (2) Implementing CRUD operations and endpoints, (3) Database integration with SQLAlchemy or async databases, (4) Authentication and authorization (OAuth2, JWT, API keys), (5) Request/response validation with Pydantic, (6) Dependency injection patterns, (7) Debugging and troubleshooting FastAPI applications, (8) Performance optimization and async patterns, (9) Deployment with Docker and ASGI servers.
---

# FastAPI Expert

## Overview

This skill provides comprehensive guidance for developing modern REST APIs with FastAPI, Python's fastest web framework. It includes patterns for async operations, database integration, authentication, validation, and production deployment.

## Quick Start

### Creating a New FastAPI Project

```bash
# Create project directory
mkdir my-api && cd my-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install FastAPI and server
pip install "fastapi[all]" uvicorn[standard]

# Create main.py
```

### Minimal FastAPI Application

```python
# main.py
from fastapi import FastAPI

app = FastAPI(title="My API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
```

### Run Development Server

```bash
uvicorn main:app --reload

# API runs at http://127.0.0.1:8000
# Interactive docs at http://127.0.0.1:8000/docs
# Alternative docs at http://127.0.0.1:8000/redoc
```

### Project Structure

```
my-api/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Database operations
│   ├── database.py       # Database connection
│   ├── dependencies.py   # Dependency injection
│   ├── routers/          # API routes
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── items.py
│   └── auth/             # Authentication
│       ├── __init__.py
│       └── jwt.py
├── tests/                # Tests
├── requirements.txt      # Dependencies
├── .env                  # Environment variables
└── Dockerfile           # Docker config
```

## API Development & Routing

### Path Operations

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

# GET request
@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    return {"items": [], "skip": skip, "limit": limit}

# POST request with validation
@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(item: Item):
    return item

# PUT request
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    return {"item_id": item_id, **item.dict()}

# DELETE request
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    return None
```

### Request Validation with Pydantic

```python
from pydantic import BaseModel, Field, EmailStr, field_validator

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    age: int = Field(..., ge=18, le=120)
    is_active: bool = True

    @field_validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'must be alphanumeric'
        return v

@app.post("/users")
async def create_user(user: User):
    return user
```

### Dependency Injection

```python
from fastapi import Depends, HTTPException, Header

# Simple dependency
async def get_token_header(x_token: str = Header()):
    if x_token != "secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")

# Dependency with yield (for cleanup)
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/protected")
async def protected_route(token: str = Depends(get_token_header)):
    return {"message": "You have access"}
```

For advanced routing patterns, middleware, and background tasks, see [api-development.md](references/api-development.md).

## Database Integration

### SQLAlchemy Setup

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
# For PostgreSQL: "postgresql://user:password@localhost/dbname"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Only for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Database Models

```python
# models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    items = relationship("Item", back_populates="owner")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")
```

### CRUD Operations

```python
# crud.py
from sqlalchemy.orm import Session
from . import models, schemas

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(email=user.email, hashed_password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

### Using in Routes

```python
# routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
```

For async databases, Alembic migrations, and advanced ORM patterns, see [database.md](references/database.md).

## Authentication & Security

### OAuth2 with Password Flow

```python
# auth/jwt.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Get user from database
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user
```

### Login Endpoint

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(tags=["auth"])

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
```

For API key authentication, role-based access control, and security best practices, see [authentication.md](references/authentication.md).

## Response Models & Status Codes

```python
from fastapi import status
from pydantic import BaseModel

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # For ORM mode

@app.post("/users", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    # Create user
    return created_user
```

## Error Handling

```python
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse

class CustomException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": f"Oops! {exc.name} did something wrong."},
    )

# Raise exceptions
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(
            status_code=404,
            detail="Item not found",
            headers={"X-Error": "There goes my error"},
        )
    return items[item_id]
```

## Configuration Management

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "My API"
    database_url: str
    secret_key: str
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY=your-secret-key-here
DEBUG=True
```

## Templates

This skill includes ready-to-use templates in `assets/templates/`:

- **crud-api/** - Complete CRUD API with database
- **auth/** - Authentication setup with JWT
- **database/** - Database models and configuration

## References

For detailed documentation on specific topics:

- **[api-development.md](references/api-development.md)** - Advanced routing, middleware, background tasks, WebSockets
- **[database.md](references/database.md)** - Async databases, Alembic migrations, complex relationships
- **[authentication.md](references/authentication.md)** - OAuth2, JWT, API keys, RBAC, security
- **[deployment.md](references/deployment.md)** - Docker, ASGI servers, production configuration
- **[troubleshooting.md](references/troubleshooting.md)** - Common errors and solutions

## Troubleshooting

For common FastAPI errors and solutions, see [troubleshooting.md](references/troubleshooting.md).

Quick fixes:
- **422 Validation errors**: Check Pydantic model field types and constraints
- **Database connection errors**: Verify connection string and database is running
- **CORS errors**: Add CORSMiddleware to your app
- **Import errors**: Ensure proper package structure with `__init__.py` files

## Best Practices

1. **Async by default**: Use `async def` for path operations unless calling blocking code
2. **Type hints**: Always use type hints for better validation and documentation
3. **Pydantic models**: Separate models for input (Create) and output (Read)
4. **Dependency injection**: Use dependencies for database sessions, authentication
5. **Router organization**: Split routes into separate router files by domain
6. **Environment variables**: Use pydantic-settings for configuration
7. **Testing**: Write tests using TestClient from fastapi.testclient
8. **Documentation**: Let FastAPI auto-generate docs, add descriptions where helpful
