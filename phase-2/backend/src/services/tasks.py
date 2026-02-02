from sqlmodel import Session, select
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate
from typing import List, Optional
import uuid


def create_task(session: Session, task_data: TaskCreate, owner_user_id: str) -> Task:
    """Create a new task for the given user."""
    task = Task(
        owner_user_id=owner_user_id,
        title=task_data.title,
        description=task_data.description,
        completed=False  # New tasks start as incomplete
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_tasks_by_owner(session: Session, owner_user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
    """Get all tasks for the given user."""
    statement = select(Task).where(Task.owner_user_id == owner_user_id).offset(skip).limit(limit)
    return session.exec(statement).all()


def get_task_by_id_and_owner(session: Session, task_id: uuid.UUID, owner_user_id: str) -> Optional[Task]:
    """Get a specific task by ID for the given user."""
    statement = select(Task).where(Task.id == task_id, Task.owner_user_id == owner_user_id)
    return session.exec(statement).first()


def update_task(session: Session, task_id: uuid.UUID, task_data: TaskUpdate, owner_user_id: str) -> Optional[Task]:
    """Update a specific task for the given user."""
    task = get_task_by_id_and_owner(session, task_id, owner_user_id)
    if not task:
        return None

    update_data = task_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, task_id: uuid.UUID, owner_user_id: str) -> bool:
    """Delete a specific task for the given user."""
    task = get_task_by_id_and_owner(session, task_id, owner_user_id)
    if not task:
        return False

    session.delete(task)
    session.commit()
    return True


def toggle_task_completion(session: Session, task_id: uuid.UUID, owner_user_id: str) -> Optional[Task]:
    """Toggle the completion status of a task."""
    task = get_task_by_id_and_owner(session, task_id, owner_user_id)
    if not task:
        return None

    task.completed = not task.completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task