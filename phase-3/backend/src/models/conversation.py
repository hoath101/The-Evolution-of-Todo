from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    user_id: str = Field(index=True)
    title: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True

    @classmethod
    def validate_user_id(cls, user_id: str) -> str:
        if not user_id.strip():
            raise ValueError("User ID cannot be empty")
        return user_id.strip()

    def update_timestamp(self):
        """Update the updated_at timestamp"""
        self.updated_at = datetime.utcnow()