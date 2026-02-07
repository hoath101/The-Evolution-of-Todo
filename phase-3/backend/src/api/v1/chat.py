"""Chat API endpoint for Todo AI Chatbot"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from sqlmodel import Session, select
import logging
import secrets
from ...database.session import get_session
from ...models.message import Message, MessageRole
from ...models.conversation import Conversation
from ...models.task import Task
from ...services.agent_service import create_agent_service
from ...api.deps import get_current_user_id
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["chat"])

@router.post("/chat")
async def chat_endpoint(
    messages: List[Dict[str, str]],
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Main chat endpoint that processes user messages and returns AI responses
    """
    # Use the authenticated user ID from the JWT token
    user_id = current_user_id

    try:
        # Find or create a conversation for this user
        conversation_id = _get_or_create_conversation_id(session, user_id)

        # Validate and persist incoming messages
        validated_messages = []
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content", "")

            # Validate message format
            if not role or not content:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Each message must have a role and content"
                )

            # Validate role
            try:
                MessageRole(role)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role: {role}. Must be one of: user, assistant, system"
                )

            validated_messages.append(msg)

        # Persist user messages to the database
        for msg in validated_messages:
            if msg["role"] == "user":
                _persist_user_message(session, conversation_id, user_id, msg["content"])

        # Fetch conversation history to reconstruct the full context
        conversation_history = _fetch_conversation_history(session, conversation_id, user_id)

        # Combine conversation history with new messages
        all_messages = conversation_history + validated_messages

        # Create a new agent service instance per request (stateless)
        agent_srv = create_agent_service()
        if agent_srv is None:
            # Fallback response if agent service is not available
            return {
                "response": "I'm sorry, but the AI assistant is currently unavailable. Please make sure the OpenAI API key is configured.",
                "tool_calls": [],
                "tool_results": [],
                "conversation_id": conversation_id,
                "timestamp": datetime.utcnow().isoformat()
            }

        # Execute the agent with the complete message history
        # Apply retry logic for agent execution
        agent_response = _retry_on_failure(agent_srv.execute_agent)(all_messages, user_id)

        # Persist assistant response and tool call metadata to the database
        if agent_response["content"]:
            _persist_assistant_message(
                session,
                conversation_id,
                user_id,
                agent_response["content"],
                agent_response["tool_calls"]
            )

        # Return the response as per API specification
        return {
            "response": agent_response["content"],
            "tool_calls": agent_response["tool_calls"],
            "tool_results": agent_response["tool_results"],
            "conversation_id": conversation_id,
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")

        # Log the full traceback for debugging
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")

        # Return a more informative error response
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "An error occurred while processing your request",
                "timestamp": datetime.utcnow().isoformat(),
                "conversation_id": conversation_id if 'conversation_id' in locals() else None
            }
        )


def _get_or_create_conversation_id(session: Session, user_id: str) -> str:
    """
    Get or create a conversation ID for the user
    Looks for an active conversation for this user (created in last 24 hours),
    otherwise creates a new one to maintain some conversation continuity
    """
    from uuid import uuid4
    from datetime import timedelta

    # Look for an existing conversation for this user created in the last 24 hours
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)

    existing_conversation = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .where(Conversation.created_at > twenty_four_hours_ago)
        .order_by(Conversation.created_at.desc())
        .limit(1)
    ).first()

    if existing_conversation:
        # Update the conversation timestamp to show activity
        existing_conversation.update_timestamp()
        session.add(existing_conversation)
        session.commit()
        return existing_conversation.id

    # Create a new conversation if no recent one exists
    conversation = Conversation(
        user_id=user_id,
        title=f"Chat session {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    return conversation.id


def _persist_user_message(session: Session, conversation_id: str, user_id: str, content: str):
    """Persist a user message to the database"""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=MessageRole.USER,
        content=content,
        timestamp=datetime.utcnow()
    )

    session.add(message)
    session.commit()


def _persist_assistant_message(
    session: Session,
    conversation_id: str,
    user_id: str,
    content: str,
    tool_calls: List[Dict[str, Any]]
):
    """Persist an assistant message to the database"""
    try:
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=MessageRole.ASSISTANT,
            content=content,
            timestamp=datetime.utcnow()
        )

        # Store tool calls if any
        if tool_calls:
            import json
            message.set_tool_calls({"calls": tool_calls})

        session.add(message)
        session.commit()
        session.refresh(message)  # Refresh to get the saved message ID

        return message
    except Exception as e:
        logger.error(f"Error persisting assistant message: {str(e)}")
        session.rollback()
        raise


def _retry_on_failure(func, max_retries=3, delay=1):
    """Decorator to retry a function on failure"""
    import time
    def wrapper(*args, **kwargs):
        last_exception = None

        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                if attempt < max_retries - 1:
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {delay}s...")
                    time.sleep(delay)
                else:
                    logger.error(f"All {max_retries} attempts failed. Last error: {str(e)}")

        raise last_exception

    return wrapper


def _fetch_conversation_history(session: Session, conversation_id: str, user_id: str) -> List[Dict[str, str]]:
    """
    Fetch conversation history from database per request
    """
    try:
        statement = select(Message).where(
            Message.conversation_id == conversation_id,
            Message.user_id == user_id
        ).order_by(Message.timestamp)

        messages = session.exec(statement).all()

        result = []
        for msg in messages:
            result.append({
                "role": msg.role,
                "content": msg.content
            })

            # Add tool results if they exist
            tool_results = msg.get_tool_results()
            if tool_results:
                result.append({
                    "role": "tool",
                    "content": str(tool_results)
                })

        return result
    except Exception as e:
        logger.error(f"Error fetching conversation history: {str(e)}")
        return []  # Return empty list if there's an error


@router.post("/chatkit/session")
async def create_chatkit_session(
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a ChatKit session for the authenticated user
    NOTE: This is a placeholder implementation. In a real OpenAI ChatKit integration,
    you would create a session via the OpenAI API.
    """
    try:
        # Placeholder implementation - in a real ChatKit integration,
        # you would create a session via OpenAI's API
        # For now, we'll return a dummy client_secret to allow frontend to work
        client_secret = f"sk-chatkit-{secrets.token_urlsafe(32)}"

        return {
            "client_secret": client_secret,
            "user_id": current_user_id,
            "expires_at": (datetime.utcnow().timestamp() + 3600)  # Expires in 1 hour
        }
    except Exception as e:
        logger.error(f"Error creating ChatKit session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the chat session"
        )