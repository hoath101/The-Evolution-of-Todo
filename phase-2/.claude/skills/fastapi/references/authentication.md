# Authentication & Security Reference

Comprehensive guide to implementing authentication, authorization, and security in FastAPI.

## Table of Contents

- OAuth2 with Password Flow
- JWT Authentication
- API Key Authentication
- Role-Based Access Control (RBAC)
- Security Best Practices
- Password Hashing
- HTTPS & SSL

## OAuth2 with Password Flow

### Complete OAuth2 Setup

```python
# auth/jwt.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

SECRET_KEY = "your-secret-key-keep-it-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

### Authentication Dependencies

```python
# auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import crud, jwt, database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = jwt.decode_access_token(token)
    if payload is None:
        raise credentials_exception

    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception

    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception

    return user

async def get_current_active_user(
    current_user = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

### Login Endpoint

```python
# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import crud, schemas, database
from ..auth import jwt

router = APIRouter(tags=["auth"])

@router.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = crud.get_user_by_username(db, username=form_data.username)

    if not user or not jwt.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=jwt.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user = Depends(jwt.get_current_active_user)):
    return current_user
```

### Protected Routes

```python
from fastapi import APIRouter, Depends
from ..auth.dependencies import get_current_active_user

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/")
async def read_items(current_user = Depends(get_current_active_user)):
    return [{"item": "Foo", "owner": current_user.username}]

@router.post("/")
async def create_item(
    item: schemas.ItemCreate,
    current_user = Depends(get_current_active_user)
):
    return {"item": item, "owner": current_user.username}
```

## JWT Authentication

### Schemas

```python
# schemas.py
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str
```

### Refresh Tokens

```python
# auth/jwt.py
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_refresh_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None
```

```python
# routers/auth.py
@router.post("/token", response_model=schemas.TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect credentials")

    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    payload = decode_refresh_token(refresh_token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    username = payload.get("sub")
    access_token = create_access_token(data={"sub": username})

    return {"access_token": access_token, "token_type": "bearer"}
```

## API Key Authentication

### Simple API Key

```python
# auth/api_key.py
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

API_KEY = "your-api-key-here"
API_KEY_NAME = "X-API-Key"

api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate API KEY"
        )
    return api_key
```

### Database-Stored API Keys

```python
# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True)
    key = Column(String(64), unique=True, index=True)
    name = Column(String(100))
    user_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used = Column(DateTime(timezone=True))
```

```python
# auth/api_key.py
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(
    api_key: str = Security(api_key_header),
    db: Session = Depends(get_db)
):
    if not api_key:
        raise HTTPException(status_code=403, detail="API Key required")

    db_key = crud.get_api_key(db, api_key)

    if not db_key or not db_key.is_active:
        raise HTTPException(status_code=403, detail="Invalid or inactive API Key")

    # Update last used
    crud.update_api_key_last_used(db, db_key.id)

    return db_key
```

## Role-Based Access Control (RBAC)

### Models

```python
# models.py
from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("role_id", Integer, ForeignKey("roles.id"))
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    description = Column(String(200))

    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary="role_permissions")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    description = Column(String(200))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    roles = relationship("Role", secondary=user_roles, back_populates="users")
```

### Permission Dependencies

```python
# auth/permissions.py
from fastapi import Depends, HTTPException, status
from .dependencies import get_current_active_user

class PermissionChecker:
    def __init__(self, required_permissions: list[str]):
        self.required_permissions = required_permissions

    def __call__(self, user = Depends(get_current_active_user)):
        for permission in self.required_permissions:
            if not user.has_permission(permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        return user

# Role checker
class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user = Depends(get_current_active_user)):
        if not any(role.name in self.allowed_roles for role in user.roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user
```

### Protected Routes with RBAC

```python
from fastapi import APIRouter, Depends
from ..auth.permissions import RoleChecker, PermissionChecker

router = APIRouter(prefix="/admin", tags=["admin"])

# Require admin role
allow_admin = RoleChecker(["admin"])

@router.get("/users")
async def list_all_users(user = Depends(allow_admin)):
    return {"users": []}

# Require specific permission
allow_create_user = PermissionChecker(["users.create"])

@router.post("/users")
async def create_user(user_data: dict, user = Depends(allow_create_user)):
    return {"message": "User created"}

# Multiple roles
allow_admin_or_moderator = RoleChecker(["admin", "moderator"])

@router.delete("/posts/{post_id}")
async def delete_post(post_id: int, user = Depends(allow_admin_or_moderator)):
    return {"message": "Post deleted"}
```

## Security Best Practices

### Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Adjust cost factor
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### Password Validation

```python
from pydantic import BaseModel, validator
import re

class UserCreate(BaseModel):
    username: str
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')

        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')

        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')

        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')

        return v
```

### Rate Limiting

```python
from fastapi import Request, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, times: int, seconds: int):
        self.times = times
        self.seconds = seconds
        self.requests = defaultdict(list)

    def __call__(self, request: Request):
        client_ip = request.client.host
        now = datetime.now()

        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < timedelta(seconds=self.seconds)
        ]

        if len(self.requests[client_ip]) >= self.times:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")

        self.requests[client_ip].append(now)

# Usage
rate_limiter = RateLimiter(times=5, seconds=60)

@app.get("/limited")
async def limited_route(request: Request, _ = Depends(rate_limiter)):
    return {"message": "Success"}
```

### CORS Security

```python
from fastapi.middleware.cors import CORSMiddleware

# Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### HTTPS Enforcement

```python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Redirect HTTP to HTTPS
app.add_middleware(HTTPSRedirectMiddleware)
```

### Security Headers

```python
from fastapi import Request

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

## Best Practices

1. **Never store passwords in plain text** - Always hash with bcrypt
2. **Use environment variables** for secrets
3. **Implement rate limiting** on auth endpoints
4. **Use HTTPS** in production
5. **Validate password strength** on registration
6. **Implement refresh tokens** for long sessions
7. **Log authentication attempts** for security monitoring
8. **Use RBAC** for complex permission requirements
9. **Expire tokens** appropriately
10. **Implement logout** by invalidating tokens
