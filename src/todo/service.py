"""Business logic layer for task operations."""

from todo import models


# Error message constants
ERR_INVALID_ID = "Invalid ID: must be a positive integer."
ERR_TASK_NOT_FOUND = "Task not found: ID {id}."
ERR_TITLE_EMPTY = "Title cannot be empty."
ERR_INVALID_CHOICE = "Invalid choice. Please enter a number between 1 and 7."


def add_task(title: str, description: str = "") -> dict:
    """
    Create a new task with sequential ID.

    Args:
        title: Non-empty task title
        description: Optional task description (defaults to empty string)

    Returns:
        Task dictionary with id, title, description, completed attributes
    """
    return models.create_task(title, description)


def get_all_tasks() -> list:
    """
    Get all tasks in memory.

    Returns:
        List of task dictionaries
    """
    return models.get_all_tasks()


def get_task_by_id(task_id: int) -> dict | None:
    """
    Find task by ID.

    Args:
        task_id: Positive integer ID to search for

    Returns:
        Task dictionary if found, None otherwise
    """
    return models.find_task_by_id(task_id)


def update_task(task_id: int, title: str = None, description: str = None) -> bool:
    """
    Update task title and/or description by ID.

    Args:
        task_id: Positive integer ID of task to update
        title: New title (None to keep existing)
        description: New description (None to keep existing)

    Returns:
        True if task was updated, False if not found
    """
    return models.update_task_by_id(task_id, title, description)


def delete_task(task_id: int) -> bool:
    """
    Delete task by ID.

    Args:
        task_id: Positive integer ID of task to remove

    Returns:
        True if task was removed, False if not found
    """
    return models.remove_task(task_id)


def mark_complete(task_id: int) -> bool:
    """
    Mark task as complete by ID.

    Args:
        task_id: Positive integer ID of task to mark complete

    Returns:
        True if task was updated, False if not found
    """
    return models.set_task_completed(task_id, True)


def mark_incomplete(task_id: int) -> bool:
    """
    Mark task as incomplete by ID.

    Args:
        task_id: Positive integer ID of task to mark incomplete

    Returns:
        True if task was updated, False if not found
    """
    return models.set_task_completed(task_id, False)


def validate_id(task_id: int, check_exists: bool = False) -> tuple[bool, str | None]:
    """
    Validate that task ID is a positive integer and optionally check if it exists.

    Args:
        task_id: ID to validate
        check_exists: If True, also verify task exists

    Returns:
        Tuple of (is_valid, error_message) where is_valid is True if valid,
        error_message is None if valid or contains the error message otherwise
    """
    if not isinstance(task_id, int) or task_id <= 0:
        return False, ERR_INVALID_ID

    if check_exists:
        task = get_task_by_id(task_id)
        if task is None:
            return False, ERR_TASK_NOT_FOUND.format(id=task_id)

    return True, None


def validate_title(title: str) -> tuple[bool, str | None]:
    """
    Validate that task title is non-empty after trimming whitespace.

    Args:
        title: Title to validate

    Returns:
        Tuple of (is_valid, error_message) where is_valid is True if valid,
        error_message is None if valid or contains the error message otherwise
    """
    if title is None or title.strip() == "":
        return False, ERR_TITLE_EMPTY

    return True, None
