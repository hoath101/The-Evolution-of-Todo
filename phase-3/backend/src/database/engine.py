from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlmodel import SQLModel
from typing import Optional
import os

# Import models to register them with SQLModel
from ..models.task import Task  # Import models to register them with SQLModel
from ..models.conversation import Conversation
from ..models.message import Message
from ..models.user import UserApplication  # Import UserApplication model (Better Auth handles auth tables)

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_ai_chatbot.db")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False  # Set to True for SQL debugging
)

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)