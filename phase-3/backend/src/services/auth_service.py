"""Authentication service with user ownership validation"""
from sqlmodel import Session, select
from typing import Optional
from ..models.task import Task
from ..models.conversation import Conversation
from ..models.message import Message


class AuthService:
    """Service for handling authentication and user ownership validation"""

    @staticmethod
    def user_owns_task(session: Session, user_id: str, task_id: str) -> bool:
        """
        Check if a user owns a specific task
        """
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        task = session.exec(statement).first()
        return task is not None

    @staticmethod
    def user_owns_conversation(session: Session, user_id: str, conversation_id: str) -> bool:
        """
        Check if a user owns a specific conversation
        """
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        conversation = session.exec(statement).first()
        return conversation is not None

    @staticmethod
    def user_owns_message(session: Session, user_id: str, message_id: str) -> bool:
        """
        Check if a user owns a specific message
        """
        statement = select(Message).where(
            Message.id == message_id,
            Message.user_id == user_id
        )
        message = session.exec(statement).first()
        return message is not None

    @staticmethod
    def validate_user_access_to_task(session: Session, user_id: str, task_id: str) -> Task:
        """
        Validate that a user has access to a specific task, returning the task if valid
        Raises ValueError if the user doesn't have access or task doesn't exist
        """
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        task = session.exec(statement).first()

        if not task:
            raise ValueError(f"User {user_id} does not have access to task {task_id} or task does not exist")

        return task

    @staticmethod
    def validate_user_access_to_conversation(session: Session, user_id: str, conversation_id: str) -> Conversation:
        """
        Validate that a user has access to a specific conversation, returning the conversation if valid
        Raises ValueError if the user doesn't have access or conversation doesn't exist
        """
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        conversation = session.exec(statement).first()

        if not conversation:
            raise ValueError(f"User {user_id} does not have access to conversation {conversation_id} or conversation does not exist")

        return conversation

    @staticmethod
    def validate_user_access_to_message(session: Session, user_id: str, message_id: str) -> Message:
        """
        Validate that a user has access to a specific message, returning the message if valid
        Raises ValueError if the user doesn't have access or message doesn't exist
        """
        statement = select(Message).where(
            Message.id == message_id,
            Message.user_id == user_id
        )
        message = session.exec(statement).first()

        if not message:
            raise ValueError(f"User {user_id} does not have access to message {message_id} or message does not exist")

        return message