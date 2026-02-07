"""Dependency injection module for API endpoints

This module ensures user isolation by validating that users can only access
resources they own through JWT token verification and ownership checks.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from jose import jwt, JWTError
from jose.constants import ALGORITHMS
import os
from datetime import datetime
from ..models.task import Task
from ..models.conversation import Conversation
from ..models.message import Message
from ..database.session import get_session
from sqlmodel import Session, select
from contextlib import contextmanager
import requests
from urllib.parse import urljoin

security = HTTPBearer()

# Get Better Auth configuration from environment
BETTER_AUTH_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:4000")
BETTER_AUTH_JWT_SECRET = os.getenv("BETTER_AUTH_SECRET", "fallback_secret_for_dev")

def get_jwks_url() -> str:
    """Get the JWKS URL for Better Auth"""
    return urljoin(BETTER_AUTH_URL.rstrip('/') + '/', 'api/auth/v1/jwks')

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify JWT token using Better Auth's JWKS endpoint
    """
    token = credentials.credentials

    try:
        # First try to decode using the secret (for HS256)
        try:
            payload = jwt.decode(
                token,
                BETTER_AUTH_JWT_SECRET,
                algorithms=[ALGORITHMS.HS256],
                options={"verify_exp": True}  # Verify expiration by default
            )
            return payload
        except JWTError:
            # If HS256 fails, try to fetch JWKS and verify with RS256
            jwks_url = get_jwks_url()
            try:
                jwks_client = jwt.PyJWKClient(jwks_url)
                signing_key = jwks_client.get_signing_key_from_jwt(token)

                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=[ALGORITHMS.RS256],
                    options={"verify_exp": True}  # Verify expiration by default
                )
                return payload
            except Exception as e:
                print(f"JWKS verification failed: {str(e)}")  # For debugging
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Unexpected error during token verification: {str(e)}")  # For debugging
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_id(payload: Dict[str, Any] = Depends(verify_token)) -> str:
    """
    Extract user ID from JWT payload and normalize it
    According to Better Auth documentation, the user ID is stored in 'sub' claim
    """
    user_id = payload.get("sub")  # Better Auth uses 'sub' for user ID
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Normalize the user ID to ensure consistent format
    normalized_user_id = str(user_id).strip()
    if not normalized_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return normalized_user_id

def check_user_owns_task(session: Session, user_id: str, task_id: str) -> bool:
    """
    Check if the user owns the specified task
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    return task is not None

def check_user_owns_conversation(session: Session, user_id: str, conversation_id: str) -> bool:
    """
    Check if the user owns the specified conversation
    """
    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    )
    conversation = session.exec(statement).first()
    return conversation is not None

def check_user_owns_message(session: Session, user_id: str, message_id: str) -> bool:
    """
    Check if the user owns the specified message
    """
    statement = select(Message).where(
        Message.id == message_id,
        Message.user_id == user_id
    )
    message = session.exec(statement).first()
    return message is not None

def verify_user_ownership_of_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Task:
    """
    Verify that the user owns the specified task, and return the task
    """
    if not check_user_owns_task(session, user_id, task_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    statement = select(Task).where(Task.id == task_id)
    task = session.exec(statement).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

def verify_user_ownership_of_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> Conversation:
    """
    Verify that the user owns the specified conversation, and return the conversation
    """
    if not check_user_owns_conversation(session, user_id, conversation_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this conversation"
        )

    statement = select(Conversation).where(Conversation.id == conversation_id)
    conversation = session.exec(statement).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation