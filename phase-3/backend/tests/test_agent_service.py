"""Tests for the agent service"""
import pytest
import os
from unittest.mock import patch, MagicMock
from src.services.agent_service import AgentService
from src.models.message import MessageRole


def test_agent_service_initialization():
    """Test that the agent service initializes correctly"""
    # Mock the OPENAI_API_KEY environment variable
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        assert agent_service is not None
        assert agent_service.client is not None
        assert agent_service.system_prompt is not None


def test_agent_service_without_api_key():
    """Test that the agent service raises an error without API key"""
    # Temporarily remove OPENAI_API_KEY from environment
    original_key = os.environ.get("OPENAI_API_KEY")
    if original_key:
        del os.environ["OPENAI_API_KEY"]

    try:
        with pytest.raises(ValueError, match="OPENAI_API_KEY environment variable is required"):
            AgentService()
    finally:
        # Restore original key if it existed
        if original_key:
            os.environ["OPENAI_API_KEY"] = original_key


def test_set_custom_system_prompt():
    """Test that a custom system prompt can be set"""
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        custom_prompt = "You are a helpful assistant for testing."
        agent_service.set_system_prompt(custom_prompt)

        assert agent_service.system_prompt == custom_prompt


def test_prepare_messages_for_agent():
    """Test that messages are properly prepared for the agent"""
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        input_messages = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"}
        ]

        prepared_messages = agent_service._prepare_messages_for_agent(input_messages)

        # Should include system prompt + input messages
        assert len(prepared_messages) == 3
        assert prepared_messages[0]["role"] == "system"
        assert prepared_messages[1]["role"] == "user"
        assert prepared_messages[2]["role"] == "assistant"


def test_execute_agent_success():
    """Test that agent execution works in the happy path"""
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        # Mock the OpenAI client
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        mock_message.content = "This is a test response"
        mock_message.tool_calls = None

        with patch.object(agent_service.client.chat.completions, 'create', return_value=mock_response):
            messages = [{"role": "user", "content": "Hello"}]
            result = agent_service.execute_agent(messages, "test_user_123")

            assert result["content"] == "This is a test response"
            assert result["tool_calls"] == []
            assert result["tool_results"] == []


def test_execute_agent_with_tool_calls():
    """Test that agent execution handles tool calls"""
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        # Mock the OpenAI client to return a tool call
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_message = MagicMock()

        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]

        mock_message.content = "I'll add that task for you"
        mock_tool_call = MagicMock()
        mock_tool_call.id = "call_123"
        mock_tool_call.function.name = "add_task"
        mock_tool_call.function.arguments = '{"title": "Buy groceries", "priority": "medium"}'

        mock_message.tool_calls = [mock_tool_call]

        # Mock the MCP tool call
        with patch.object(agent_service, '_call_mcp_tool', return_value="Task added successfully"):
            with patch.object(agent_service.client.chat.completions, 'create', return_value=mock_response):
                messages = [{"role": "user", "content": "Add a task to buy groceries"}]
                result = agent_service.execute_agent(messages, "test_user_123")

                assert result["content"] == "I'll add that task for you"
                assert len(result["tool_calls"]) == 1
                assert result["tool_calls"][0]["name"] == "add_task"
                assert len(result["tool_results"]) == 1
                assert "Task added successfully" in result["tool_results"][0]["output"]


def test_execute_agent_error_handling():
    """Test that agent execution handles errors gracefully"""
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        # Mock the OpenAI client to raise an exception
        with patch.object(agent_service.client.chat.completions, 'create', side_effect=Exception("API Error")):
            messages = [{"role": "user", "content": "Hello"}]
            result = agent_service.execute_agent(messages, "test_user_123")

            assert "fallback" in result["content"].lower() or "error" in result["content"].lower()
            assert result["tool_calls"] == []
            assert result["tool_results"] == []


def test_execute_tool_with_confirmation():
    """Test that tool execution with confirmation works"""
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        # Mock the MCP tool call
        with patch.object(agent_service, '_call_mcp_tool', return_value="Task completed") as mock_call:
            result = agent_service._execute_tool_with_confirmation("complete_task", {"task_id": "123"}, "test_user")

            assert result == "Task completed"
            mock_call.assert_called_once_with("complete_task", {"task_id": "123", "user_id": "test_user"}, "test_user")


def test_get_fallback_response():
    """Test that fallback responses are generated correctly"""
    with patch.dict(os.environ, {"OPENAI_API_KEY": "fake_api_key"}):
        agent_service = AgentService()

        # Test with various inputs
        hello_messages = [{"content": "hello", "role": "user"}]
        fallback_hello = agent_service._get_fallback_response(hello_messages)
        assert "hi" in fallback_hello.lower()

        help_messages = [{"content": "what can you do", "role": "user"}]
        fallback_help = agent_service._get_fallback_response(help_messages)
        assert "help" in fallback_help.lower() or "task" in fallback_help.lower()

        # Test with empty messages
        empty_fallback = agent_service._get_fallback_response([])
        assert "currently experiencing" in empty_fallback.lower()