from sqlmodel import SQLModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import json

def generate_uuid() -> str:
    return str(uuid.uuid4())

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: str = Field(default_factory=generate_uuid, primary_key=True)
    conversation_id: str = Field(index=True)
    user_id: str = Field(index=True)
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_calls: Optional[str] = Field(default=None)  # Store as JSON string
    tool_results: Optional[str] = Field(default=None)  # Store as JSON string

    class Config:
        use_enum_values = True
        arbitrary_types_allowed = True

    @classmethod
    def validate_role(cls, role: str) -> MessageRole:
        try:
            return MessageRole(role.lower())
        except ValueError:
            raise ValueError(f"Invalid role: {role}. Valid values: {list(MessageRole.__members__.keys())}")

    @classmethod
    def validate_content(cls, content: str) -> str:
        if not content.strip():
            raise ValueError("Content cannot be empty")
        return content.strip()

    def set_tool_calls(self, tool_calls: Optional[Dict[str, Any]]):
        """Store tool calls as JSON string"""
        if tool_calls:
            self.tool_calls = json.dumps(tool_calls)
        else:
            self.tool_calls = None

    def get_tool_calls(self) -> Optional[Dict[str, Any]]:
        """Retrieve tool calls from JSON string"""
        if self.tool_calls:
            return json.loads(self.tool_calls)
        return None

    def set_tool_results(self, tool_results: Optional[Dict[str, Any]]):
        """Store tool results as JSON string"""
        if tool_results:
            self.tool_results = json.dumps(tool_results)
        else:
            self.tool_results = None

    def get_tool_results(self) -> Optional[Dict[str, Any]]:
        """Retrieve tool results from JSON string"""
        if self.tool_results:
            return json.loads(self.tool_results)
        return None