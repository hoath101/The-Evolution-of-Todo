"""Task API endpoints for Todo AI Chatbot with JWT authentication"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlmodel import Session, select
from ...models.task import Task, TaskStatus, TaskPriority
from ...api.deps import get_current_user_id, verify_user_ownership_of_task
from ...database.session import get_session
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1", tags=["tasks"])

# Pydantic models for request/response
class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None

class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

@router.post("/tasks")
async def create_task(
    request: CreateTaskRequest,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user
    """
    try:
        # Validate priority
        try:
            priority_enum = TaskPriority(request.priority.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority '{request.priority}'. Must be one of: low, medium, high"
            )

        # Create new task
        task = Task(
            user_id=current_user_id,
            title=request.title,
            description=request.description,
            priority=priority_enum,
            status=TaskStatus.PENDING
        )

        # Parse due date if provided
        if request.due_date:
            try:
                from datetime import datetime
                task.due_date = datetime.strptime(request.due_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Please use YYYY-MM-DD format"
                )

        # Add to database
        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority.value,
            "status": task.status.value,
            "due_date": task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating task: {str(e)}"
        )


@router.get("/tasks")
async def list_tasks(
    status_filter: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    List all tasks for the authenticated user
    """
    try:
        # Build query based on filters
        query = select(Task).where(Task.user_id == current_user_id)

        if status_filter:
            try:
                status_enum = TaskStatus(status_filter.lower())
                query = query.where(Task.status == status_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status '{status_filter}'. Must be one of: pending, completed"
                )

        tasks = session.exec(query).all()

        # Format response
        task_list = []
        for task in tasks:
            task_dict = {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority.value,
                "status": task.status.value,
                "due_date": task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None
            }
            task_list.append(task_dict)

        return {"tasks": task_list}

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing tasks: {str(e)}"
        )


@router.get("/tasks/{task_id}")
async def get_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get a specific task by ID for the authenticated user
    """
    try:
        # Verify user owns the task (this also checks if the task exists)
        task = verify_user_ownership_of_task(task_id, current_user_id, session)

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority.value,
            "status": task.status.value,
            "due_date": task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving task: {str(e)}"
        )


@router.put("/tasks/{task_id}")
async def update_task(
    task_id: str,
    request: UpdateTaskRequest,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Update a specific task by ID for the authenticated user
    """
    try:
        # Verify user owns the task (this also checks if the task exists)
        task = verify_user_ownership_of_task(task_id, current_user_id, session)

        # Update fields if provided
        if request.title is not None:
            task.title = request.title
        if request.description is not None:
            task.description = request.description
        if request.status is not None:
            try:
                status_enum = TaskStatus(request.status.lower())
                task.status = status_enum
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status '{request.status}'. Must be one of: pending, completed"
                )
        if request.priority is not None:
            try:
                priority_enum = TaskPriority(request.priority.lower())
                task.priority = priority_enum
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid priority '{request.priority}'. Must be one of: low, medium, high"
                )
        if request.due_date is not None:
            try:
                from datetime import datetime
                # Parse date string (assuming YYYY-MM-DD format)
                due_date = datetime.strptime(request.due_date, "%Y-%m-%d")
                task.due_date = due_date
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Please use YYYY-MM-DD format"
                )

        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority.value,
            "status": task.status.value,
            "due_date": task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating task: {str(e)}"
        )


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Delete a specific task by ID for the authenticated user
    """
    try:
        # Verify user owns the task (this also checks if the task exists)
        task = verify_user_ownership_of_task(task_id, current_user_id, session)

        # Delete the task
        session.delete(task)
        session.commit()

        return {"message": f"Successfully deleted task: {task.title}", "task_id": task_id}

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting task: {str(e)}"
        )


@router.patch("/tasks/{task_id}/complete")
async def complete_task(
    task_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Mark a task as completed for the authenticated user
    """
    try:
        # Verify user owns the task (this also checks if the task exists)
        task = verify_user_ownership_of_task(task_id, current_user_id, session)

        # Update task status to completed
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority.value,
            "status": task.status.value,
            "due_date": task.due_date.strftime("%Y-%m-%d") if task.due_date else None,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing task: {str(e)}"
        )