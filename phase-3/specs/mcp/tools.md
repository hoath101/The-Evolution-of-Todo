# MCP Tools Specification

This document defines the Model Context Protocol (MCP) tools that must be exposed by the MCP server for the Todo AI Chatbot system.

## add_task

### Purpose
Creates a new task for the authenticated user with specified details.

### Parameters
- `title` (string, required): The title or description of the task
- `description` (string, optional): Detailed description of the task
- `due_date` (string, optional): Due date in ISO 8601 format (YYYY-MM-DD)
- `priority` (string, optional): Priority level ("low", "medium", "high", default: "medium")

### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

### Ownership Enforcement
- Task is created with the authenticated user's ID as owner
- User ID must match the context passed from the API layer
- No cross-user task creation is allowed

### Error Behavior
- Returns error if required fields are missing
- Returns error on database connectivity issues
- Returns error if user context is invalid

## list_tasks

### Purpose
Retrieves all tasks owned by the authenticated user, with optional filtering.

### Parameters
- `status` (string, optional): Filter by status ("all", "pending", "completed", default: "all")
- `limit` (integer, optional): Maximum number of tasks to return (default: 50, max: 100)
- `sort_by` (string, optional): Sort order ("created_date", "due_date", "priority", default: "created_date")
- `order` (string, optional): Sort direction ("asc", "desc", default: "desc")

### Return Schema
```json
{
  "success": boolean,
  "tasks": [
    {
      "id": string,
      "title": string,
      "description": string,
      "status": string,
      "due_date": string,
      "priority": string,
      "created_at": string,
      "completed_at": string
    }
  ],
  "total_count": integer
}
```

### Ownership Enforcement
- Only returns tasks owned by the authenticated user
- User ID context validated before query execution
- No cross-user task access is permitted

### Error Behavior
- Returns error on database connectivity issues
- Returns error if user context is invalid
- Invalid parameters result in appropriate error messages

## complete_task

### Purpose
Marks a specific task as completed for the authenticated user.

### Parameters
- `task_id` (string, required): The ID of the task to mark as completed

### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

### Ownership Enforcement
- Validates that the task belongs to the authenticated user
- Prevents completion of tasks owned by other users
- User ID context validated before update operation

### Error Behavior
- Returns error if task does not exist
- Returns error if task is already completed
- Returns error if task does not belong to user
- Returns error on database connectivity issues

## delete_task

### Purpose
Deletes a specific task owned by the authenticated user.

### Parameters
- `task_id` (string, required): The ID of the task to delete

### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

### Ownership Enforcement
- Validates that the task belongs to the authenticated user
- Prevents deletion of tasks owned by other users
- User ID context validated before delete operation

### Error Behavior
- Returns error if task does not exist
- Returns error if task does not belong to user
- Returns error on database connectivity issues

## update_task

### Purpose
Updates the properties of a specific task owned by the authenticated user.

### Parameters
- `task_id` (string, required): The ID of the task to update
- `title` (string, optional): The new title for the task
- `description` (string, optional): The new description for the task
- `due_date` (string, optional): The new due date in ISO 8601 format
- `priority` (string, optional): The new priority level ("low", "medium", "high")
- `status` (string, optional): The new status ("pending", "completed")

### Return Schema
```json
{
  "success": boolean,
  "task_id": string,
  "message": string
}
```

### Ownership Enforcement
- Validates that the task belongs to the authenticated user
- Prevents updates to tasks owned by other users
- User ID context validated before update operation

### Error Behavior
- Returns error if task does not exist
- Returns error if task does not belong to user
- Returns error on database connectivity issues
- Returns error if invalid parameter values are provided