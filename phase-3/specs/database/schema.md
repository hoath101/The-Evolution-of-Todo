# Database Schema Specification

## Task Entity

### Fields
- `id` (String/UUID, Primary Key): Unique identifier for the task
- `user_id` (String): ID of the user who owns this task
- `title` (String, Required): Title or short description of the task
- `description` (String, Optional): Detailed description of the task
- `status` (String, Required): Task status ("pending", "completed")
- `due_date` (Date, Optional): Date when the task is due
- `priority` (String, Required): Priority level ("low", "medium", "high")
- `created_at` (DateTime, Required): Timestamp when task was created
- `completed_at` (DateTime, Optional): Timestamp when task was completed

### Indexes
- Index on `(user_id, status)` for efficient user task filtering
- Index on `due_date` for efficient date-based queries
- Index on `priority` for priority-based sorting
- Index on `created_at` for chronological ordering

### Relationships
- Belongs to a single User (via user_id foreign key reference)

### Constraints
- `title` must not be empty
- `status` must be one of the allowed values
- `priority` must be one of the allowed values
- `user_id` must reference an existing user

## Conversation Entity

### Fields
- `id` (String/UUID, Primary Key): Unique identifier for the conversation
- `user_id` (String): ID of the user who owns this conversation
- `title` (String, Optional): Auto-generated or user-provided title
- `created_at` (DateTime, Required): Timestamp when conversation was created
- `updated_at` (DateTime, Required): Timestamp when conversation was last updated

### Indexes
- Index on `user_id` for efficient user conversation retrieval
- Index on `updated_at` for chronological ordering

### Relationships
- Has many Messages (via conversation_id foreign key reference)

### Constraints
- `user_id` must reference an existing user

## Message Entity

### Fields
- `id` (String/UUID, Primary Key): Unique identifier for the message
- `conversation_id` (String, Required): ID of the associated conversation
- `user_id` (String): ID of the user who owns this message
- `role` (String, Required): Role of the message sender ("user", "assistant", "system")
- `content` (Text, Required): The content of the message
- `timestamp` (DateTime, Required): When the message was sent
- `tool_calls` (JSON, Optional): Tool calls made in this message (if any)
- `tool_results` (JSON, Optional): Results from tool calls (if any)

### Indexes
- Index on `conversation_id` for efficient conversation message retrieval
- Index on `user_id` for user-based filtering
- Index on `timestamp` for chronological ordering

### Relationships
- Belongs to a single Conversation (via conversation_id foreign key reference)

### Constraints
- `role` must be one of the allowed values
- `conversation_id` must reference an existing conversation
- `user_id` must reference an existing user and match the conversation owner

## Relationships and Integrity

### Task Relationships
- Each Task belongs to exactly one User via the user_id field
- Users can have zero or many Tasks
- Referential integrity enforced with cascading deletes (user deletion removes tasks)

### Conversation Relationships
- Each Conversation belongs to exactly one User via the user_id field
- Each Conversation can have zero or many Messages
- Users can have zero or many Conversations
- Referential integrity enforced with cascading deletes

### Message Relationships
- Each Message belongs to exactly one Conversation via the conversation_id field
- Each Message belongs to exactly one User via the user_id field
- Conversations can have zero or many Messages
- Referential integrity enforced with cascading deletes

## Persistence Guarantees

- ACID-compliant transactions for all data modifications
- User data isolation through mandatory user_id filtering
- Automatic cleanup of related entities on parent deletion
- Point-in-time recovery capabilities
- Backup and replication for data durability