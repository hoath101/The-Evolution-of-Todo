# Chat API Endpoint Specification

## Endpoint Definition

**Path**: `POST /api/{user_id}/chat`
**Method**: `POST`
**Authentication**: Required (JWT Bearer token)

## Request Schema

```json
{
  "messages": [
    {
      "role": "user",
      "content": "string (user's message)",
      "timestamp": "ISO 8601 timestamp (optional)"
    }
  ],
  "conversation_id": "string (UUID, optional)",
  "metadata": {
    "client_info": "string (optional)",
    "preferences": "object (optional)"
  }
}
```

### Path Parameter
- `{user_id}`: String representation of the authenticated user's ID
- Must match the user ID in the JWT token
- Required for routing and authorization validation

### Headers
- `Authorization`: Bearer token containing the JWT
- `Content-Type`: application/json

## Response Schema

```json
{
  "response": {
    "role": "assistant",
    "content": "string (AI-generated response)",
    "timestamp": "ISO 8601 timestamp"
  },
  "conversation_id": "string (UUID)",
  "tool_calls": [
    {
      "id": "string (tool call ID)",
      "name": "string (tool name)",
      "arguments": "object (tool arguments)"
    }
  ],
  "tool_results": [
    {
      "tool_call_id": "string",
      "result": "object (tool result)"
    }
  ]
}
```

## Conversation ID Handling

- If `conversation_id` is provided in request, retrieves existing conversation context
- If `conversation_id` is not provided, generates a new conversation ID
- Conversation context is reconstructed from database for each request
- Same `conversation_id` may be used across multiple requests for continuity

## Stateless Request Guarantees

- Each request contains all necessary information for processing
- Server maintains no session state between requests
- Conversation history reconstructed from database on each request
- User identity validated via JWT on each request
- Response includes updated conversation context

## Error Responses

### 401 Unauthorized
- Missing JWT token
- Invalid JWT token
- Expired JWT token
- JWT user ID doesn't match `{user_id}` path parameter

Response body:
```json
{
  "error": "Unauthorized",
  "message": "Valid JWT authentication required"
}
```

### 400 Bad Request
- Invalid request schema
- Malformed JSON
- Missing required fields

Response body:
```json
{
  "error": "Bad Request",
  "message": "Invalid request format"
}
```

### 500 Internal Server Error
- Server-side processing errors
- Database connection failures
- MCP server unavailability

Response body:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Additional Requirements

- All timestamps use ISO 8601 format
- Request and response bodies use UTF-8 encoding
- Maximum request size limited to prevent abuse
- Rate limiting applied per user ID to prevent excessive requests