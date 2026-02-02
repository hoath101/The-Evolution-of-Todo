"""User interface layer for CLI interactions."""

from todo import service


# Error message constants (already in service.py, imported here)
ERR_INVALID_ID = service.ERR_INVALID_ID
ERR_TASK_NOT_FOUND = service.ERR_TASK_NOT_FOUND
ERR_TITLE_EMPTY = service.ERR_TITLE_EMPTY
ERR_INVALID_CHOICE = service.ERR_INVALID_CHOICE

SUCCESS_ADD = "Task added successfully! (ID: {id})"
SUCCESS_UPDATE = "Task updated successfully! (ID: {id})"
SUCCESS_DELETE = "Task deleted successfully! (ID: {id})"
SUCCESS_COMPLETE = "Task marked as complete! (ID: {id})"
SUCCESS_INCOMPLETE = "Task marked as incomplete! (ID: {id})"
MSG_NO_TASKS = "No tasks available."
MSG_TOTAL_TASKS = "Total: {count} tasks"


def display_menu() -> None:
    """
    Display the main menu with numbered options 1-7.
    """
    print("\n=== Todo Application ====")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Complete")
    print("6. Mark Incomplete")
    print("7. Exit")


def get_menu_choice() -> int:
    """
    Get valid menu choice from user (1-7).

    Returns:
        Integer between 1 and 7
    """
    while True:
        try:
            choice = input("\nEnter your choice (1-7): ")
            choice_int = int(choice)

            if 1 <= choice_int <= 7:
                return choice_int
            else:
                print(ERR_INVALID_CHOICE)

        except ValueError:
            print(ERR_INVALID_CHOICE)


def get_valid_id(prompt: str = "Enter task ID: ", check_exists: bool = False, allow_cancel: bool = False) -> int | None:
    """
    Get and validate a task ID from user.

    Args:
        prompt: Input prompt message
        check_exists: If True, also verify task exists
        allow_cancel: If True, user can enter empty input, 'back', or 'b' to cancel

    Returns:
        Valid positive integer ID, or None if cancelled
    """
    while True:
        try:
            task_id = input(prompt)

            # Check for cancellation
            if allow_cancel and (task_id.strip().lower() in ('', 'back', 'b')):
                print("Operation cancelled.")
                return None

            task_id_int = int(task_id)

            is_valid, error_msg = service.validate_id(task_id_int, check_exists)

            if not is_valid:
                print(error_msg)
                if allow_cancel:
                    print("(Enter 'back' or press Enter to cancel)")
                continue

            return task_id_int

        except ValueError:
            print(ERR_INVALID_ID)
            if allow_cancel:
                print("(Enter 'back' or press Enter to cancel)")


def get_task_title(prompt: str = "Enter task title: ") -> str:
    """
    Get and validate a non-empty task title from user.

    Args:
        prompt: Input prompt message

    Returns:
        Valid non-empty title
    """
    while True:
        title = input(prompt)

        is_valid, error_msg = service.validate_title(title)

        if not is_valid:
            print(error_msg)
            continue

        return title.strip()


def get_task_description(prompt: str = "Enter task description (optional, press Enter to skip): ") -> str:
    """
    Get optional task description from user.

    Args:
        prompt: Input prompt message

    Returns:
        Description string (may be empty)
    """
    description = input(prompt)
    return description.strip()


def format_task(task: dict) -> str:
    """
    Format a task for display.

    Args:
        task: Task dictionary

    Returns:
        Formatted string with ID, status indicator, and title
    """
    indicator = "[X]" if task["completed"] else "[ ]"
    formatted = f"ID: {task['id']} | {indicator} {task['title']}"

    if task["description"]:
        formatted += f"\nDescription: {task['description']}"

    return formatted


def handle_add_task() -> None:
    """
    Handle the Add Task operation.
    """
    print("\n--- Add Task ---")
    title = get_task_title()
    description = get_task_description()

    task = service.add_task(title, description)
    print(f"\n{SUCCESS_ADD.format(id=task['id'])}")


def handle_view_tasks() -> None:
    """
    Handle the View Tasks operation.
    """
    print("\n--- Task List ---")
    tasks = service.get_all_tasks()

    if not tasks:
        print(MSG_NO_TASKS)
        return

    for task in tasks:
        print(format_task(task))
        print()

    print(f"{MSG_TOTAL_TASKS.format(count=len(tasks))}")


def handle_update_task() -> None:
    """
    Handle the Update Task operation.
    """
    print("\n--- Update Task ---")
    print("(Enter 'back' or press Enter to cancel)")
    task_id = get_valid_id("Enter task ID to update: ", check_exists=True, allow_cancel=True)

    if task_id is None:
        return

    task = service.get_task_by_id(task_id)

    print(f"\nCurrent task:")
    print(f"Title: {task['title']}")
    if task["description"]:
        print(f"Description: {task['description']}")

    print()
    title_input = input("Enter new title (or press Enter to keep current): ")
    description_input = input("Enter new description (or press Enter to keep current): ")

    title = title_input.strip() if title_input.strip() else None
    description = description_input.strip() if description_input.strip() else None

    success = service.update_task(task_id, title, description)

    if success:
        print(f"\n{SUCCESS_UPDATE.format(id=task_id)}")
    else:
        print(f"\n{ERR_TASK_NOT_FOUND.format(id=task_id)}")


def handle_delete_task() -> None:
    """
    Handle the Delete Task operation.
    """
    print("\n--- Delete Task ---")
    print("(Enter 'back' or press Enter to cancel)")
    task_id = get_valid_id("Enter task ID to delete: ", check_exists=True, allow_cancel=True)

    if task_id is None:
        return

    success = service.delete_task(task_id)

    if success:
        print(f"\n{SUCCESS_DELETE.format(id=task_id)}")
    else:
        print(f"\n{ERR_TASK_NOT_FOUND.format(id=task_id)}")


def handle_mark_complete() -> None:
    """
    Handle the Mark Complete operation.
    """
    print("\n--- Mark Task Complete ---")
    print("(Enter 'back' or press Enter to cancel)")
    task_id = get_valid_id("Enter task ID to mark as complete: ", check_exists=True, allow_cancel=True)

    if task_id is None:
        return

    success = service.mark_complete(task_id)

    if success:
        print(f"\n{SUCCESS_COMPLETE.format(id=task_id)}")
    else:
        print(f"\n{ERR_TASK_NOT_FOUND.format(id=task_id)}")


def handle_mark_incomplete() -> None:
    """
    Handle the Mark Incomplete operation.
    """
    print("\n--- Mark Task Incomplete ---")
    print("(Enter 'back' or press Enter to cancel)")
    task_id = get_valid_id("Enter task ID to mark as incomplete: ", check_exists=True, allow_cancel=True)

    if task_id is None:
        return

    success = service.mark_incomplete(task_id)

    if success:
        print(f"\n{SUCCESS_INCOMPLETE.format(id=task_id)}")
    else:
        print(f"\n{ERR_TASK_NOT_FOUND.format(id=task_id)}")


def handle_menu_choice(choice: int) -> bool:
    """
    Handle user's menu choice.

    Args:
        choice: Menu option number (1-7)

    Returns:
        True if application should continue, False to exit
    """
    if choice == 1:
        handle_add_task()
    elif choice == 2:
        handle_view_tasks()
    elif choice == 3:
        handle_update_task()
    elif choice == 4:
        handle_delete_task()
    elif choice == 5:
        handle_mark_complete()
    elif choice == 6:
        handle_mark_incomplete()
    elif choice == 7:
        return False

    return True
