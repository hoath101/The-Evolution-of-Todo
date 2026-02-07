"""AI Agent Service for Todo AI Chatbot"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
from openai import OpenAI
from ..models.message import Message, MessageRole
from ..models.conversation import Conversation
from .mcp_server import mcp_server
from sqlmodel import Session
from ..database.session import get_session_sync

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentService:
    def __init__(self):
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")

        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o"  # Updated to use gpt-4o as per documentation

        # Create or retrieve assistant with proper tools
        self.assistant = self._create_assistant()

    def _create_assistant(self):
        """Create or retrieve the assistant with proper function tools"""
        # Define the function tools for task management
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "title": {"type": "string", "description": "The title of the task"},
                            "description": {"type": "string", "description": "The description of the task"},
                            "priority": {
                                "type": "string",
                                "enum": ["low", "medium", "high"],
                                "description": "The priority of the task"
                            },
                            "due_date": {"type": "string", "description": "The due date in YYYY-MM-DD format"}
                        },
                        "required": ["user_id", "title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List all tasks for the user, optionally filtered by status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "status": {
                                "type": "string",
                                "enum": ["pending", "completed"],
                                "description": "Filter tasks by status"
                            }
                        },
                        "required": ["user_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "string", "description": "The ID of the task to complete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "string", "description": "The ID of the task to delete"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "The ID of the user"},
                            "task_id": {"type": "string", "description": "The ID of the task to update"},
                            "title": {"type": "string", "description": "The new title of the task"},
                            "description": {"type": "string", "description": "The new description of the task"},
                            "status": {
                                "type": "string",
                                "enum": ["pending", "completed"],
                                "description": "The new status of the task"
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["low", "medium", "high"],
                                "description": "The new priority of the task"
                            },
                            "due_date": {"type": "string", "description": "The new due date in YYYY-MM-DD format"}
                        },
                        "required": ["user_id", "task_id"]
                    }
                }
            }
        ]

        # Create the assistant with the tools
        assistant = self.client.beta.assistants.create(
            name="Todo AI Assistant",
            instructions="""You are an AI assistant that helps users manage their todos using available tools.
            The available tools are:
            - add_task: Add a new task with title, description, priority, and due date
            - list_tasks: List all tasks for the user, optionally filtered by status
            - complete_task: Mark a task as completed
            - delete_task: Remove a task
            - update_task: Update task details

            Always use the appropriate tool when the user wants to perform these actions.
            If you need to ask for clarification, do so before calling a tool.
            Be concise and helpful in your responses.""",
            model=self.model,
            tools=tools
        )

        return assistant

    def _get_default_system_prompt(self) -> str:
        """Get the default system prompt for the agent"""
        return """You are an AI assistant that helps users manage their todos using available tools.
        The available tools are:
        - add_task: Add a new task with title, description, priority, and due date
        - list_tasks: List all tasks for the user, optionally filtered by status
        - complete_task: Mark a task as completed
        - delete_task: Remove a task
        - update_task: Update task details

        Always use the appropriate tool when the user wants to perform these actions.
        If you need to ask for clarification, do so before calling a tool.
        Be concise and helpful in your responses."""

    def set_system_prompt(self, prompt: str):
        """Set a custom system prompt for the agent"""
        self.system_prompt = prompt

    def _prepare_messages_for_agent(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Prepare messages for the agent by converting them to the required format"""
        prepared_messages = [{"role": "system", "content": self.system_prompt}]

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            # Map roles appropriately
            if role == "assistant":
                agent_role = "assistant"
            elif role == "user":
                agent_role = "user"
            else:
                agent_role = "user"  # Default to user for any other role

            prepared_messages.append({
                "role": agent_role,
                "content": content
            })

        return prepared_messages

    def _call_mcp_tool(self, tool_name: str, tool_arguments: Dict[str, Any], user_id: str) -> str:
        """Call an MCP tool with the given arguments"""
        # Add user_id to arguments if not present
        if "user_id" not in tool_arguments:
            tool_arguments["user_id"] = user_id

        logger.info(f"Calling MCP tool: {tool_name} with args: {tool_arguments}")

        # In a real implementation, this would call the actual MCP server
        # For now, we'll call the registered tools directly
        if tool_name in mcp_server.tools:
            import asyncio
            try:
                # Run the async tool function
                result = asyncio.run(mcp_server.tools[tool_name](tool_arguments))
                return result
            except Exception as e:
                logger.error(f"Error calling MCP tool {tool_name}: {str(e)}")
                return f"Error calling tool: {str(e)}"
        else:
            return f"Unknown tool: {tool_name}"

    def execute_agent(self, messages: List[Dict[str, str]], user_id: str) -> Dict[str, Any]:
        """Execute the agent with the provided messages and return the response"""
        try:
            # Create a thread for the conversation
            thread = self.client.beta.threads.create()

            # Add user messages to the thread
            for msg in messages:
                self.client.beta.threads.messages.create(
                    thread_id=thread.id,
                    role=msg.get("role", "user"),
                    content=msg.get("content", "")
                )

            # Run the assistant
            run = self.client.beta.threads.runs.create_and_poll(
                thread_id=thread.id,
                assistant_id=self.assistant.id,
            )

            result = {
                "content": "",
                "tool_calls": [],
                "tool_results": []
            }

            # Check if the run requires action (tool calls)
            if run.status == 'requires_action':
                tool_calls = run.required_action.submit_tool_outputs.tool_calls

                # Process each tool call
                tool_outputs = []
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    # Ensure user_id is in the arguments
                    function_args["user_id"] = user_id

                    # Call the appropriate tool
                    tool_result = self._execute_tool_with_confirmation(function_name, function_args, user_id)

                    # Store tool call info
                    result["tool_calls"].append({
                        "id": tool_call.id,
                        "name": function_name,
                        "arguments": function_args
                    })

                    # Store tool result info
                    result["tool_results"].append({
                        "tool_call_id": tool_call.id,
                        "output": tool_result
                    })

                    # Add to outputs to submit back to the assistant
                    tool_outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": tool_result
                    })

                # Submit tool outputs back to the assistant
                if tool_outputs:
                    run = self.client.beta.threads.runs.submit_tool_outputs_and_poll(
                        thread_id=thread.id,
                        run_id=run.id,
                        tool_outputs=tool_outputs
                    )

            # Get the final response after tool execution
            if run.status == 'completed':
                messages_response = self.client.beta.threads.messages.list(
                    thread_id=thread.id
                )

                # Get the latest message as the response
                if messages_response.data:
                    # Find the latest assistant message
                    assistant_messages = [msg for msg in messages_response.data if msg.role == "assistant"]
                    if assistant_messages:
                        latest_message = assistant_messages[0]  # Most recent assistant message
                        if latest_message.content and len(latest_message.content) > 0:
                            result["content"] = latest_message.content[0].text.value
            else:
                result["content"] = f"Run failed with status: {run.status}"

            return result

        except Exception as e:
            logger.error(f"Error executing agent: {str(e)}")

            # Fallback response
            fallback_response = self._get_fallback_response(messages)

            return {
                "content": fallback_response,
                "tool_calls": [],
                "tool_results": [],
                "error": str(e)
            }

    def _get_fallback_response(self, messages: List[Dict[str, str]]) -> str:
        """Provide a fallback response when the agent fails"""
        try:
            # Analyze the last message to provide a relevant response
            if messages:
                last_message = messages[-1]
                user_input = last_message.get('content', '').lower()

                if any(word in user_input for word in ['hello', 'hi', 'hey']):
                    return "Hi there! I'm your AI assistant for managing tasks. How can I help you today?"
                elif any(word in user_input for word in ['help', 'what can you do']):
                    return "I can help you manage your tasks! I can add, list, update, complete, or delete tasks. Just tell me what you'd like to do."
                elif any(word in user_input for word in ['add', 'create', 'new']):
                    return "I can help you add a new task. Please specify the task you'd like to add."
                elif any(word in user_input for word in ['list', 'show', 'view']):
                    return "I can list your tasks. Would you like to see all tasks or just pending/completed ones?"
                else:
                    return "I'm having trouble processing your request right now. Could you please rephrase or try again?"
            else:
                return "I'm having trouble processing your request right now. Please try again."

        except Exception as e:
            logger.error(f"Error in fallback response: {str(e)}")
            return "I'm currently experiencing difficulties. Please try again later."

    def _execute_tool_with_confirmation(self, tool_name: str, tool_args: Dict[str, Any], user_id: str) -> str:
        """Execute a tool with confirmation logic"""
        # Add user_id to arguments
        tool_args["user_id"] = user_id

        # For certain potentially destructive operations, we might want to implement confirmation
        if tool_name in ["delete_task", "complete_task"]:
            logger.info(f"Executing potentially destructive tool: {tool_name} for user: {user_id}")

        # In a production system, you might implement actual confirmation flows here
        # For now, we'll execute directly but with logging
        result = self._call_mcp_tool(tool_name, tool_args, user_id)

        logger.info(f"Tool {tool_name} executed successfully for user: {user_id}")
        return result

def create_agent_service():
    """Create a new agent service instance per request (stateless)"""
    try:
        return AgentService()
    except ValueError as e:
        # Handle the case where API key is not available
        # This can happen during testing or import
        print(f"Warning: OpenAI API key not available. Agent service will be unavailable. Error: {e}")
        return None