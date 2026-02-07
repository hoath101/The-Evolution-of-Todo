"""
User model for the Todo AI Chatbot application.
This model represents user information stored by the application.
Better Auth manages authentication tables separately with Drizzle Kit.
"""
from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime

def generate_uuid() -> str:
    return str(uuid.uuid4())

class UserApplication(SQLModel, table=True):
    """
    Application-level user model.
    Stores application-specific user data linked to Better Auth user IDs.
    Better Auth manages authentication tables separately.
    """
    __tablename__ = "user_applications"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    auth_user_id: str = Field(unique=True, index=True)  # Better Auth user ID
    name: Optional[str] = Field(default=None)
    email: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def __repr__(self):
        return f"<UserApplication(id='{self.id}', auth_user_id='{self.auth_user_id}', email='{self.email}')>"