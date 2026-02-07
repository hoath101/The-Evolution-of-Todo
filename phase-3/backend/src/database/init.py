"""Database initialization script"""
import sys
import os

# Add the src directory to the path so imports work
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Import using proper relative import for the module structure
from .engine import create_db_and_tables, engine

def init_db():
    """Initialize the database by creating all tables"""
    print("Initializing database...")
    create_db_and_tables()
    print("Database initialized successfully!")
    print("Tables created: tasks, conversations, messages, users")

if __name__ == "__main__":
    init_db()