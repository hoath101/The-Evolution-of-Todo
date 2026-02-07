from sqlmodel import SQLModel, Field, Column
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

def generate_uuid() -> str:
    return str(uuid.uuid4())

class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(min_length=1)
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    due_date: Optional[datetime] = Field(default=None)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)

    class Config:
        use_enum_values = True

    @classmethod
    def validate_title(cls, title: str) -> str:
        if not title.strip():
            raise ValueError("Title cannot be empty")
        return title.strip()

    @classmethod
    def validate_status(cls, status: str) -> TaskStatus:
        try:
            return TaskStatus(status.lower())
        except ValueError:
            raise ValueError(f"Invalid status: {status}. Valid values: {list(TaskStatus.__members__.keys())}")

    @classmethod
    def validate_priority(cls, priority: str) -> TaskPriority:
        try:
            return TaskPriority(priority.lower())
        except ValueError:
            raise ValueError(f"Invalid priority: {priority}. Valid values: {list(TaskPriority.__members__.keys())}")