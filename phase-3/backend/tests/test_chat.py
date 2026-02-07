"""Tests for the chat endpoint"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.main import app
from src.models.task import Task
from src.models.conversation import Conversation
from src.models.message import Message
from src.database.session import get_session
from sqlmodel import Session, select

client = TestClient(app)

def test_chat_endpoint_success():
    """Test that the chat endpoint works with valid input"""
    user_id = "test_user_123"

    # Mock the agent service to return a predictable response
    with patch('src.api.v1.chat.agent_service') as mock_agent:
        mock_agent.execute_agent.return_value = {
            "content": "I've added your task.",
            "tool_calls": [],
            "tool_results": []
        }

        response = client.post(
            f"/api/{user_id}/chat",
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": "Add a task to buy groceries"
                    }
                ]
            },
            headers={"Authorization": "Bearer fake_token"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert data["response"] == "I've added your task."


def test_chat_endpoint_invalid_user_id():
    """Test that the chat endpoint rejects mismatched user IDs"""
    user_id = "test_user_123"

    # This will fail because the fake token doesn't match the user_id
    response = client.post(
        f"/api/{user_id}/chat",
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Hello"
                }
            ]
        },
        headers={"Authorization": "Bearer fake_token"}
    )

    assert response.status_code == 403


def test_chat_endpoint_missing_messages():
    """Test that the chat endpoint handles missing messages"""
    user_id = "test_user_123"

    with patch('src.api.v1.chat.agent_service'), \
         patch('src.api.deps.get_current_user_id', return_value=user_id):
        response = client.post(
            f"/api/{user_id}/chat",
            json={"messages": []},  # Empty messages
            headers={"Authorization": "Bearer fake_token"}
        )

        # Should fail because there are no messages
        assert response.status_code == 422  # Validation error


def test_chat_endpoint_invalid_message_format():
    """Test that the chat endpoint handles invalid message formats"""
    user_id = "test_user_123"

    with patch('src.api.v1.chat.agent_service'), \
         patch('src.api.deps.get_current_user_id', return_value=user_id):
        response = client.post(
            f"/api/{user_id}/chat",
            json={
                "messages": [
                    {
                        "role": "invalid_role",  # Invalid role
                        "content": "Hello"
                    }
                ]
            },
            headers={"Authorization": "Bearer fake_token"}
        )

        assert response.status_code == 400


def test_chat_endpoint_network_error_handling():
    """Test that the chat endpoint handles network errors gracefully"""
    user_id = "test_user_123"

    # Mock the agent service to raise an exception
    with patch('src.api.v1.chat.agent_service') as mock_agent:
        mock_agent.execute_agent.side_effect = Exception("Network error")

        with patch('src.api.deps.get_current_user_id', return_value=user_id):
            response = client.post(
                f"/api/{user_id}/chat",
                json={
                    "messages": [
                        {
                            "role": "user",
                            "content": "Hello"
                        }
                    ]
                },
                headers={"Authorization": "Bearer fake_token"}
            )

            # Should return 500 error
            assert response.status_code == 500
            data = response.json()
            assert "detail" in data


def test_chat_endpoint_retry_logic():
    """Test that the chat endpoint implements retry logic"""
    user_id = "test_user_123"

    # Mock the agent service to fail twice then succeed
    mock_agent_execute = MagicMock()
    mock_agent_execute.side_effect = [
        Exception("First try failed"),
        Exception("Second try failed"),
        {"content": "Success on third try", "tool_calls": [], "tool_results": []}  # Third try succeeds
    ]

    with patch('src.services.agent_service.agent_service') as mock_agent_service:
        mock_agent_service.execute_agent = mock_agent_execute

        with patch('src.api.deps.get_current_user_id', return_value=user_id):
            response = client.post(
                f"/api/{user_id}/chat",
                json={
                    "messages": [
                        {
                            "role": "user",
                            "content": "Hello"
                        }
                    ]
                },
                headers={"Authorization": "Bearer fake_token"}
            )

            # Should succeed after retries
            assert response.status_code == 200
            data = response.json()
            assert data["response"] == "Success on third try"

            # Verify that the function was called 3 times
            assert mock_agent_execute.call_count == 3


def test_chat_endpoint_empty_message():
    """Test that the chat endpoint handles empty messages"""
    user_id = "test_user_123"

    with patch('src.api.deps.get_current_user_id', return_value=user_id):
        response = client.post(
            f"/api/{user_id}/chat",
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": ""  # Empty content
                    }
                ]
            },
            headers={"Authorization": "Bearer fake_token"}
        )

        assert response.status_code == 400


def test_chat_endpoint_multiple_messages():
    """Test that the chat endpoint handles multiple messages"""
    user_id = "test_user_123"

    with patch('src.api.v1.chat.agent_service') as mock_agent:
        mock_agent.execute_agent.return_value = {
            "content": "I understand your multiple messages.",
            "tool_calls": [],
            "tool_results": []
        }

        with patch('src.api.deps.get_current_user_id', return_value=user_id):
            response = client.post(
                f"/api/{user_id}/chat",
                json={
                    "messages": [
                        {
                            "role": "user",
                            "content": "First message"
                        },
                        {
                            "role": "assistant",
                            "content": "Response to first"
                        },
                        {
                            "role": "user",
                            "content": "Follow-up question"
                        }
                    ]
                },
                headers={"Authorization": "Bearer fake_token"}
            )

            assert response.status_code == 200
            data = response.json()
            assert "response" in data