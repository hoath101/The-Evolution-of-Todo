
import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_user_id: str = Field(index=True, nullable=False)
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
