from sqlmodel import Session
from contextlib import contextmanager
from typing import Generator
from .engine import engine

def get_session() -> Generator[Session, None, None]:
    """Get a database session"""
    with Session(engine) as session:
        yield session

@contextmanager
def get_session_context():
    """Context manager for database sessions"""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def get_session_sync():
    """Synchronous way to get a session"""
    return Session(engine)