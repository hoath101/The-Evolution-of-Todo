# Database Integration Reference

Comprehensive guide to database integration, SQLAlchemy ORM, async databases, and migrations.

## Table of Contents

- SQLAlchemy Setup
- Models & Relationships
- CRUD Operations
- Async Databases
- Alembic Migrations
- Connection Pooling
- Transactions

## SQLAlchemy Setup

### Synchronous Database

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# PostgreSQL
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

# MySQL
# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://user:password@localhost/dbname"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Only needed for SQLite
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

### Async Database

```python
# database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

# MySQL
# DATABASE_URL = "mysql+aiomysql://user:password@localhost/dbname"

engine = create_async_engine(DATABASE_URL, echo=True)

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Dependency
async def get_db():
    async with async_session() as session:
        yield session
```

## Models & Relationships

### Basic Models

```python
# models.py
from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### Relationships

```python
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

# One-to-Many
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

    # Relationship
    posts = relationship("Post", back_populates="owner")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationship
    owner = relationship("User", back_populates="posts")

# Many-to-Many
association_table = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("role_id", Integer, ForeignKey("roles.id"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)

    roles = relationship("Role", secondary=association_table, back_populates="users")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)

    users = relationship("User", secondary=association_table, back_populates="roles")

# One-to-One
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)

    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    bio = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    user = relationship("User", back_populates="profile")
```

## CRUD Operations

### Synchronous CRUD

```python
# crud.py
from sqlalchemy.orm import Session
from . import models, schemas

# Create
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Read
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# Update
def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        for key, value in user.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

# Delete
def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# With relationships
def get_user_with_posts(db: Session, user_id: int):
    return db.query(models.User)\
        .filter(models.User.id == user_id)\
        .options(joinedload(models.User.posts))\
        .first()
```

### Async CRUD

```python
# crud.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

# Create
async def create_user(db: AsyncSession, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# Read
async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(models.User).filter(models.User.id == user_id)
    )
    return result.scalars().first()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(models.User).offset(skip).limit(limit)
    )
    return result.scalars().all()

# Update
async def update_user(db: AsyncSession, user_id: int, user: schemas.UserUpdate):
    result = await db.execute(
        select(models.User).filter(models.User.id == user_id)
    )
    db_user = result.scalars().first()

    if db_user:
        for key, value in user.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        await db.commit()
        await db.refresh(db_user)
    return db_user

# Delete
async def delete_user(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(models.User).filter(models.User.id == user_id)
    )
    db_user = result.scalars().first()

    if db_user:
        await db.delete(db_user)
        await db.commit()
    return db_user

# With relationships
async def get_user_with_posts(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(models.User)
        .filter(models.User.id == user_id)
        .options(selectinload(models.User.posts))
    )
    return result.scalars().first()
```

### Using in Routes

```python
# routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(database.get_db)
):
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

@router.get("/", response_model=list[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user: schemas.UserUpdate,
    db: Session = Depends(database.get_db)
):
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = crud.delete_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
```

## Alembic Migrations

### Setup

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic

# Configure alembic/env.py
```

```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Import your models
from app.database import Base
from app import models

config = context.config

# Set SQLAlchemy URL
config.set_main_option("sqlalchemy.url", "postgresql://user:pass@localhost/db")

target_metadata = Base.metadata

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()
```

### Create and Apply Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Create users table"

# Apply migrations
alembic upgrade head

# Downgrade
alembic downgrade -1

# View history
alembic history

# View current revision
alembic current
```

### Manual Migration

```python
# alembic/versions/xxxxx_create_users.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

def downgrade():
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
```

## Connection Pooling

```python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://user:password@localhost/dbname",
    pool_size=10,          # Number of connections to maintain
    max_overflow=20,       # Max connections beyond pool_size
    pool_pre_ping=True,    # Verify connections before using
    pool_recycle=3600,     # Recycle connections after 1 hour
    echo=False             # Don't log SQL statements
)
```

## Transactions

```python
from sqlalchemy.orm import Session

# Automatic transaction
def create_user_with_profile(db: Session, user_data, profile_data):
    try:
        user = models.User(**user_data)
        db.add(user)
        db.flush()  # Get user.id without committing

        profile = models.Profile(**profile_data, user_id=user.id)
        db.add(profile)

        db.commit()
        return user
    except Exception:
        db.rollback()
        raise

# Manual transaction
from sqlalchemy import select

def transfer_funds(db: Session, from_account: int, to_account: int, amount: float):
    with db.begin():
        # Get accounts
        from_acc = db.execute(
            select(models.Account).filter(models.Account.id == from_account)
        ).scalar_one()

        to_acc = db.execute(
            select(models.Account).filter(models.Account.id == to_account)
        ).scalar_one()

        # Update balances
        from_acc.balance -= amount
        to_acc.balance += amount

        # Commit happens automatically when context exits
```

## Best Practices

1. **Use connection pooling** for better performance
2. **Async databases** for high-concurrency applications
3. **Alembic migrations** for schema changes
4. **Relationships** with `lazy="select"` or `selectinload` for async
5. **Indexes** on frequently queried columns
6. **Transactions** for multi-step operations
7. **Type hints** for better IDE support
8. **Close sessions** properly with dependency injection
