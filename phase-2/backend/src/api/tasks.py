from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..db import get_session
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..services.tasks import (
    create_task, get_tasks_by_owner, get_task_by_id_and_owner,
    update_task, delete_task, toggle_task_completion
)
from ..auth.jwt import verify_token
from ..auth.user_scope import validate_user_scope
from ..api.errors import error_response
from typing import Annotated
import uuid

router = APIRouter(prefix="/{user_id}/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse)
def create_user_task(
    user_id: str,
    task_data: TaskCreate,
    token_payload: Annotated[dict, Depends(verify_token)],
    session: Session = Depends(get_session),
):
    validated_user_id = validate_user_scope(user_id, token_payload)

    try:
        task = create_task(session, task_data, validated_user_id)
        return task
    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes and messages
        raise
    except Exception as e:
        return error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Failed to create task",
            detail=str(e)
        )


@router.get("", response_model=List[TaskResponse])
def list_user_tasks(
    user_id: str,
    token_payload: Annotated[dict, Depends(verify_token)],
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100
):
    validated_user_id = validate_user_scope(user_id, token_payload)

    # Limit the maximum number of items returned
    if limit > 100:
        limit = 100

    try:
        tasks = get_tasks_by_owner(session, validated_user_id, skip=skip, limit=limit)
        return tasks
    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes and messages
        raise
    except Exception as e:
        return error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Failed to retrieve tasks",
            detail=str(e)
        )


@router.get("/{id}", response_model=TaskResponse)
def get_user_task(
    user_id: str,
    id: uuid.UUID,
    token_payload: Annotated[dict, Depends(verify_token)],
    session: Session = Depends(get_session),
):
    validated_user_id = validate_user_scope(user_id, token_payload)

    try:
        task = get_task_by_id_and_owner(session, id, validated_user_id)
        if not task:
            return error_response(
                status_code=status.HTTP_404_NOT_FOUND,
                message="Task not found"
            )
        return task
    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes and messages
        raise
    except Exception as e:
        return error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Failed to retrieve task",
            detail=str(e)
        )


@router.put("/{id}", response_model=TaskResponse)
def update_user_task(
    user_id: str,
    id: uuid.UUID,
    task_data: TaskUpdate,
    token_payload: Annotated[dict, Depends(verify_token)],
    session: Session = Depends(get_session),
):
    validated_user_id = validate_user_scope(user_id, token_payload)

    try:
        task = update_task(session, id, task_data, validated_user_id)
        if not task:
            return error_response(
                status_code=status.HTTP_404_NOT_FOUND,
                message="Task not found"
            )
        return task
    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes and messages
        raise
    except Exception as e:
        return error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Failed to update task",
            detail=str(e)
        )


@router.patch("/{id}/complete", response_model=TaskResponse)
def toggle_user_task_completion(
    user_id: str,
    id: uuid.UUID,
    token_payload: Annotated[dict, Depends(verify_token)],
    session: Session = Depends(get_session),
):
    validated_user_id = validate_user_scope(user_id, token_payload)

    try:
        task = toggle_task_completion(session, id, validated_user_id)
        if not task:
            return error_response(
                status_code=status.HTTP_404_NOT_FOUND,
                message="Task not found"
            )
        return task
    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes and messages
        raise
    except Exception as e:
        return error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Failed to toggle task completion",
            detail=str(e)
        )


@router.delete("/{id}")
def delete_user_task(
    user_id: str,
    id: uuid.UUID,
    token_payload: Annotated[dict, Depends(verify_token)],
    session: Session = Depends(get_session),
):
    validated_user_id = validate_user_scope(user_id, token_payload)

    try:
        deleted = delete_task(session, id, validated_user_id)
        if not deleted:
            return error_response(
                status_code=status.HTTP_404_NOT_FOUND,
                message="Task not found"
            )
        return {"message": "Task deleted successfully"}
    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes and messages
        raise
    except Exception as e:
        return error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Failed to delete task",
            detail=str(e)
        )