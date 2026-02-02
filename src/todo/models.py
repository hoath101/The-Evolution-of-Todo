"""Data model for Task entity and in-memory storage."""

# Task data structure: dict with id, title, description, completed
# Example: {"id": 1, "title": "Buy groceries", "description": "", "completed": False}

# In-memory task storage
_tasks = []

# Next ID counter for sequential ID generation
_next_id = 1


def create_task(title: str, description: str = "") -> dict:
    """
    Create a new task with sequential ID.

    Args:
        title: Non-empty task title
        description: Optional task description (defaults to empty string)

    Returns:
        Task dictionary with id, title, description, completed attributes
    """
    global _tasks, _next_id

    task = {
        "id": _next_id,
        "title": title.strip(),
        "description": description.strip(),
        "completed": False
    }

    _tasks.append(task)
    _next_id += 1

    return task


def get_all_tasks() -> list:
    """
    Get all tasks in memory.

    Returns:
        List of task dictionaries
    """
    return list(_tasks)


def find_task_by_id(task_id: int) -> dict | None:
    """
    Find task by ID.

    Args:
        task_id: Positive integer ID to search for

    Returns:
        Task dictionary if found, None otherwise
    """
    for task in _tasks:
        if task["id"] == task_id:
            return task
    return None


def remove_task(task_id: int) -> bool:
    """
    Remove task by ID.

    Args:
        task_id: Positive integer ID of task to remove

    Returns:
        True if task was removed, False if not found
    """
    global _tasks

    for i, task in enumerate(_tasks):
        if task["id"] == task_id:
            _tasks.pop(i)
            return True
    return False


def update_task_by_id(task_id: int, title: str = None, description: str = None) -> bool:
    """
    Update task title and/or description by ID.

    Args:
        task_id: Positive integer ID of task to update
        title: New title (None to keep existing)
        description: New description (None to keep existing)

    Returns:
        True if task was updated, False if not found
    """
    task = find_task_by_id(task_id)
    if task is None:
        return False

    if title is not None:
        task["title"] = title.strip()

    if description is not None:
        task["description"] = description.strip()

    return True


def set_task_completed(task_id: int, completed: bool) -> bool:
    """
    Set task completion status by ID.

    Args:
        task_id: Positive integer ID of task to update
        completed: New completion status

    Returns:
        True if task was updated, False if not found
    """
    task = find_task_by_id(task_id)
    if task is None:
        return False

    task["completed"] = completed
    return True
