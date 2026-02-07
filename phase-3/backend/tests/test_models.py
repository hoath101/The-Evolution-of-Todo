"""Tests for the data models"""
import pytest
from datetime import datetime
from src.models.task import Task, TaskStatus, TaskPriority
from src.models.conversation import Conversation
from src.models.message import Message, MessageRole


def test_task_model_creation():
    """Test that Task model can be created with valid data"""
    task = Task(
        user_id="user123",
        title="Test Task",
        description="This is a test task",
        status=TaskStatus.PENDING,
        priority=TaskPriority.MEDIUM
    )

    assert task.user_id == "user123"
    assert task.title == "Test Task"
    assert task.description == "This is a test task"
    assert task.status == TaskStatus.PENDING
    assert task.priority == TaskPriority.MEDIUM
    assert task.created_at is not None
    assert task.completed_at is None


def test_task_validation_title():
    """Test that Task model validates title properly"""
    # Valid title should work
    task = Task(
        user_id="user123",
        title="Valid Title",
        priority=TaskPriority.MEDIUM,
        status=TaskStatus.PENDING
    )
    assert task.title == "Valid Title"

    # Empty title should raise an error when validated
    with pytest.raises(ValueError):
        Task.validate_title("")


def test_task_validation_status():
    """Test that Task model validates status properly"""
    # Valid statuses should work
    assert Task.validate_status("pending") == TaskStatus.PENDING
    assert Task.validate_status("completed") == TaskStatus.COMPLETED

    # Invalid status should raise an error
    with pytest.raises(ValueError):
        Task.validate_status("invalid_status")


def test_task_validation_priority():
    """Test that Task model validates priority properly"""
    # Valid priorities should work
    assert Task.validate_priority("low") == TaskPriority.LOW
    assert Task.validate_priority("medium") == TaskPriority.MEDIUM
    assert Task.validate_priority("high") == TaskPriority.HIGH

    # Invalid priority should raise an error
    with pytest.raises(ValueError):
        Task.validate_priority("invalid_priority")


def test_task_complete_task():
    """Test completing a task updates the status and completion timestamp"""
    task = Task(
        user_id="user123",
        title="Test Task",
        status=TaskStatus.PENDING,
        priority=TaskPriority.MEDIUM
    )

    # Manually update the status to completed
    task.status = TaskStatus.COMPLETED
    task.completed_at = datetime.utcnow()

    assert task.status == TaskStatus.COMPLETED
    assert task.completed_at is not None


def test_conversation_model_creation():
    """Test that Conversation model can be created with valid data"""
    conversation = Conversation(
        user_id="user123",
        title="Test Conversation"
    )

    assert conversation.user_id == "user123"
    assert conversation.title == "Test Conversation"
    assert conversation.created_at is not None
    assert conversation.updated_at is not None


def test_conversation_update_timestamp():
    """Test that Conversation model updates timestamp correctly"""
    conversation = Conversation(
        user_id="user123",
        title="Test Conversation"
    )

    original_updated_at = conversation.updated_at

    # Update timestamp
    conversation.update_timestamp()

    # New timestamp should be after the original
    assert conversation.updated_at >= original_updated_at


def test_conversation_validation():
    """Test that Conversation model validates user ID properly"""
    # Valid user ID should work
    conv = Conversation(user_id="valid_user", title="Test")
    assert conv.validate_user_id("valid_user") == "valid_user"

    # Empty user ID should raise an error when validated
    with pytest.raises(ValueError):
        Conversation.validate_user_id("")


def test_message_model_creation():
    """Test that Message model can be created with valid data"""
    message = Message(
        conversation_id="conv123",
        user_id="user123",
        role=MessageRole.USER,
        content="Hello, world!"
    )

    assert message.conversation_id == "conv123"
    assert message.user_id == "user123"
    assert message.role == MessageRole.USER
    assert message.content == "Hello, world!"
    assert message.timestamp is not None


def test_message_validation_role():
    """Test that Message model validates role properly"""
    # Valid roles should work
    assert Message.validate_role("user") == MessageRole.USER
    assert Message.validate_role("assistant") == MessageRole.ASSISTANT
    assert Message.validate_role("system") == MessageRole.SYSTEM

    # Invalid role should raise an error
    with pytest.raises(ValueError):
        Message.validate_role("invalid_role")


def test_message_validation_content():
    """Test that Message model validates content properly"""
    # Valid content should work
    assert Message.validate_content("Valid content") == "Valid content"

    # Empty content should raise an error when validated
    with pytest.raises(ValueError):
        Message.validate_content("")


def test_message_tool_calls_storage():
    """Test that Message model can store and retrieve tool calls"""
    message = Message(
        conversation_id="conv123",
        user_id="user123",
        role=MessageRole.USER,
        content="Test message"
    )

    # Test setting and getting tool calls
    tool_calls_data = {
        "tool1": {"param1": "value1"},
        "tool2": {"param2": "value2"}
    }

    message.set_tool_calls(tool_calls_data)
    retrieved_calls = message.get_tool_calls()

    assert retrieved_calls == tool_calls_data


def test_message_tool_results_storage():
    """Test that Message model can store and retrieve tool results"""
    message = Message(
        conversation_id="conv123",
        user_id="user123",
        role=MessageRole.USER,
        content="Test message"
    )

    # Test setting and getting tool results
    tool_results_data = {
        "result1": {"status": "success", "data": "some data"},
        "result2": {"status": "failed", "error": "some error"}
    }

    message.set_tool_results(tool_results_data)
    retrieved_results = message.get_tool_results()

    assert retrieved_results == tool_results_data


def test_message_with_none_tool_data():
    """Test that Message model handles None tool data properly"""
    message = Message(
        conversation_id="conv123",
        user_id="user123",
        role=MessageRole.USER,
        content="Test message"
    )

    # Setting None should work
    message.set_tool_calls(None)
    message.set_tool_results(None)

    # Retrieving None should return None
    assert message.get_tool_calls() is None
    assert message.get_tool_results() is None