
import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    BETTER_AUTH_SECRET: str
    BASE_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
