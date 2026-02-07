# Data Model for Todo AI Chatbot

## Entity: Task
- **Fields**:
  - id (String/UUID, Primary Key): Unique identifier for the task
  - user_id (String): ID of the user who owns this task
  - title (String, Required): Title or short description of the task
  - description (String, Optional): Detailed description of the task
  - status (String, Required): Task status ("pending", "completed")
  - due_date (Date, Optional): Date when the task is due
  - priority (String, Required): Priority level ("low", "medium", "high")
  - created_at (DateTime, Required): Timestamp when task was created
  - completed_at (DateTime, Optional): Timestamp when task was completed

- **Validation rules**:
  - title must not be empty
  - status must be one of allowed values
  - priority must be one of allowed values
  - user_id must reference an existing user

- **Relationships**:
  - Belongs to a single User (via user_id foreign key reference)

- **Indexes**:
  - Index on (user_id, status) for efficient user task filtering
  - Index on due_date for efficient date-based queries
  - Index on priority for priority-based sorting
  - Index on created_at for chronological ordering

## Entity: Conversation
- **Fields**:
  - id (String/UUID, Primary Key): Unique identifier for the conversation
  - user_id (String): ID of the user who owns this conversation
  - title (String, Optional): Auto-generated or user-provided title
  - created_at (DateTime, Required): Timestamp when conversation was created
  - updated_at (DateTime, Required): Timestamp when conversation was last updated

- **Validation rules**:
  - user_id must reference an existing user

- **Relationships**:
  - Has many Messages (via conversation_id foreign key reference)

- **Indexes**:
  - Index on user_id for efficient user conversation retrieval
  - Index on updated_at for chronological ordering

## Entity: Message
- **Fields**:
  - id (String/UUID, Primary Key): Unique identifier for the message
  - conversation_id (String, Required): ID of the associated conversation
  - user_id (String): ID of the user who owns this message
  - role (String, Required): Role of the message sender ("user", "assistant", "system")
  - content (Text, Required): The content of the message
  - timestamp (DateTime, Required): When the message was sent
  - tool_calls (JSON, Optional): Tool calls made in this message (if any)
  - tool_results (JSON, Optional): Results from tool calls (if any)

- **Validation rules**:
  - role must be one of allowed values
  - conversation_id must reference an existing conversation
  - user_id must reference an existing user and match the conversation owner

- **Relationships**:
  - Belongs to a single Conversation (via conversation_id foreign key reference)

- **Indexes**:
  - Index on conversation_id for efficient conversation message retrieval
  - Index on user_id for user-based filtering
  - Index on timestamp for chronological ordering

## State Transitions
- Task status transitions: "pending" → "completed" only
- Conversation updated_at updates on any message addition
- Message timestamps are immutable once created