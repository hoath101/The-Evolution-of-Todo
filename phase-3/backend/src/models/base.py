from sqlmodel import SQLModel
from typing import Optional
import uuid
from datetime import datetime

def generate_uuid() -> str:
    return str(uuid.uuid4())

class BaseSQLModel(SQLModel):
    """Base class for all SQLModels in the application"""
    pass