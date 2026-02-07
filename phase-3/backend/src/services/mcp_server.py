"""MCP Server Implementation for Todo AI Chatbot

This server is designed to be stateless. All state is persisted in the database
and retrieved as needed. No in-memory state is maintained between requests.
"""
import asyncio
import logging
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from mcp.server import Server
from mcp.types import (
    InitializeRequest,
    InitializeResult,
    CallToolRequest,
    CallToolResult,
    TextContent,
    ResourceTemplate,
    ListResourcesRequest,
    ListResourcesResult,
    ReadResourceRequest,
    ReadResourceResult,
)
from sqlmodel import Session, select
from ..database.session import get_session_sync
from ..database.engine import create_db_and_tables
from ..models.task import Task, TaskStatus, TaskPriority
from ..services.auth_service import AuthService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables to hold database session and app
db_session = None

class TodoMCPServer:
    def __init__(self):
        self.tools = {}
        self.resources = {}
        self.session = None

    def initialize_database(self):
        """Initialize the database and create tables"""
        global db_session
        create_db_and_tables()
        db_session = get_session_sync()
        logger.info("Database initialized and session created")

    def register_tool(self, name: str, handler):
        """Register a tool with the MCP server"""
        self.tools[name] = handler
        logger.info(f"Registered tool: {name}")

    async def handle_initialize(self, request: InitializeRequest) -> InitializeResult:
        """Handle initialize request from MCP client"""
        logger.info("Handling MCP initialization")

        # Initialize database
        self.initialize_database()

        return InitializeResult(
            server_info={"name": "Todo AI Chatbot MCP Server", "version": "1.0.0"},
            capabilities={},
        )

    async def handle_call_tool(self, request: CallToolRequest) -> CallToolResult:
        """Handle tool call request"""
        logger.info(f"Handling tool call: {request.name}")

        if request.name not in self.tools:
            raise ValueError(f"Unknown tool: {request.name}")

        # Execute the tool with provided parameters
        try:
            result = await self.tools[request.name](request.arguments or {})
            return CallToolResult(output=[TextArtifact(text=str(result))])
        except Exception as e:
            logger.error(f"Error executing tool {request.name}: {str(e)}")
            return CallToolResult(output=[TextArtifact(text=f"Error: {str(e)}")])

    async def handle_list_resources(self, request: ListResourcesRequest) -> ListResourcesResult:
        """Handle list resources request"""
        return ListResourcesResult(resources=[])

    async def handle_read_resource(self, request: ReadResourceRequest) -> ReadResourceResult:
        """Handle read resource request"""
        raise NotImplementedError("Reading resources not implemented")

# Global MCP server instance
mcp_server = TodoMCPServer()

# Register MCP tools
async def add_task_tool(args: Dict[str, Any]) -> str:
    """Add a new task to the database"""
    try:
        user_id = args.get("user_id")
        title = args.get("title")
        description = args.get("description", "")
        priority = args.get("priority", "medium")

        if not user_id or not title:
            return "Error: user_id and title are required"

        # Validate priority
        try:
            priority_enum = TaskPriority(priority.lower())
        except ValueError:
            return f"Error: Invalid priority '{priority}'. Must be one of: low, medium, high"

        # Create new task
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority_enum,
            status=TaskStatus.PENDING
        )

        # Add to database
        with get_session_sync() as session:
            session.add(task)
            session.commit()
            session.refresh(task)

        return f"Successfully added task: {task.title} (ID: {task.id})"

    except Exception as e:
        return f"Error adding task: {str(e)}"

async def list_tasks_tool(args: Dict[str, Any]) -> str:
    """List tasks for a user"""
    try:
        user_id = args.get("user_id")
        status_filter = args.get("status", None)  # Optional: pending, completed

        if not user_id:
            return "Error: user_id is required"

        with get_session_sync() as session:
            # Build query based on filters
            query = select(Task).where(Task.user_id == user_id)

            if status_filter:
                try:
                    status_enum = TaskStatus(status_filter.lower())
                    query = query.where(Task.status == status_enum)
                except ValueError:
                    return f"Error: Invalid status '{status_filter}'. Must be one of: pending, completed"

            tasks = session.exec(query).all()

        if not tasks:
            return "No tasks found for this user"

        task_list = []
        for task in tasks:
            task_list.append(
                f"ID: {task.id}\n"
                f"Title: {task.title}\n"
                f"Description: {task.description or 'N/A'}\n"
                f"Status: {task.status.value}\n"
                f"Priority: {task.priority.value}\n"
                f"Due Date: {task.due_date.strftime('%Y-%m-%d') if task.due_date else 'N/A'}\n"
                f"Created: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
                "---"
            )

        return "\n".join(task_list)

    except Exception as e:
        return f"Error listing tasks: {str(e)}"

async def complete_task_tool(args: Dict[str, Any]) -> str:
    """Complete a task"""
    try:
        user_id = args.get("user_id")
        task_id = args.get("task_id")

        if not user_id or not task_id:
            return "Error: user_id and task_id are required"

        with get_session_sync() as session:
            # Verify user owns the task
            if not AuthService.user_owns_task(session, user_id, task_id):
                return f"Error: User does not have access to task {task_id}"

            # Get the task
            statement = select(Task).where(Task.id == task_id)
            task = session.exec(statement).first()

            if not task:
                return f"Error: Task {task_id} not found"

            # Update task status
            task.status = TaskStatus.COMPLETED
            task.completed_at = None  # Will be set by SQLModel to current time

            session.add(task)
            session.commit()

        return f"Successfully completed task: {task.title}"

    except Exception as e:
        return f"Error completing task: {str(e)}"

async def delete_task_tool(args: Dict[str, Any]) -> str:
    """Delete a task"""
    try:
        user_id = args.get("user_id")
        task_id = args.get("task_id")

        if not user_id or not task_id:
            return "Error: user_id and task_id are required"

        with get_session_sync() as session:
            # Verify user owns the task
            if not AuthService.user_owns_task(session, user_id, task_id):
                return f"Error: User does not have access to task {task_id}"

            # Get the task
            statement = select(Task).where(Task.id == task_id)
            task = session.exec(statement).first()

            if not task:
                return f"Error: Task {task_id} not found"

            # Delete the task
            session.delete(task)
            session.commit()

        return f"Successfully deleted task: {task.title}"

    except Exception as e:
        return f"Error deleting task: {str(e)}"

async def update_task_tool(args: Dict[str, Any]) -> str:
    """Update a task"""
    try:
        user_id = args.get("user_id")
        task_id = args.get("task_id")

        if not user_id or not task_id:
            return "Error: user_id and task_id are required"

        with get_session_sync() as session:
            # Verify user owns the task
            if not AuthService.user_owns_task(session, user_id, task_id):
                return f"Error: User does not have access to task {task_id}"

            # Get the task
            statement = select(Task).where(Task.id == task_id)
            task = session.exec(statement).first()

            if not task:
                return f"Error: Task {task_id} not found"

            # Update fields if provided
            if "title" in args:
                task.title = args["title"]
            if "description" in args:
                task.description = args["description"]
            if "status" in args:
                try:
                    status_enum = TaskStatus(args["status"].lower())
                    task.status = status_enum
                except ValueError:
                    return f"Error: Invalid status '{args['status']}'. Must be one of: pending, completed"
            if "priority" in args:
                try:
                    priority_enum = TaskPriority(args["priority"].lower())
                    task.priority = priority_enum
                except ValueError:
                    return f"Error: Invalid priority '{args['priority']}'. Must be one of: low, medium, high"
            if "due_date" in args:
                from datetime import datetime
                try:
                    # Parse date string (assuming YYYY-MM-DD format)
                    due_date = datetime.strptime(args["due_date"], "%Y-%m-%d")
                    task.due_date = due_date
                except ValueError:
                    return f"Error: Invalid date format '{args['due_date']}'. Please use YYYY-MM-DD format"

            session.add(task)
            session.commit()
            session.refresh(task)

        return f"Successfully updated task: {task.title}"

    except Exception as e:
        return f"Error updating task: {str(e)}"

# Enhanced error handling decorator
def handle_mcp_errors(func):
    """Decorator to add consistent error handling to MCP tools"""
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ValueError as e:
            return f"Value Error: {str(e)}"
        except PermissionError as e:
            return f"Permission Error: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            return f"System Error: {str(e)}"
    return wrapper

# Register all tools when module is imported
def register_tools_sync():
    """Register all MCP tools synchronously"""
    mcp_server.register_tool("add_task", handle_mcp_errors(add_task_tool))
    mcp_server.register_tool("list_tasks", handle_mcp_errors(list_tasks_tool))
    mcp_server.register_tool("complete_task", handle_mcp_errors(complete_task_tool))
    mcp_server.register_tool("delete_task", handle_mcp_errors(delete_task_tool))
    mcp_server.register_tool("update_task", handle_mcp_errors(update_task_tool))

# Initialize tools
register_tools_sync()

def run_mcp_server(host: str = "0.0.0.0", port: int = 8080):
    """Run the MCP server"""
    logger.info(f"Starting MCP server on {host}:{port}")

    # Initialize database
    mcp_server.initialize_database()

    # In a real MCP implementation, you'd use the proper MCP server protocol
    # For now, we'll simulate it with a simple API

    app = FastAPI(title="Todo AI Chatbot MCP Server", lifespan=lambda app: None)

    @app.post("/mcp/call-tool")
    async def call_tool(request: Dict[str, Any]):
        """Endpoint to simulate MCP tool calls"""
        tool_name = request.get("name")
        arguments = request.get("arguments", {})

        if tool_name not in mcp_server.tools:
            return {"error": f"Unknown tool: {tool_name}"}

        result = await mcp_server.tools[tool_name](arguments)
        return {"result": result}

    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    run_mcp_server()