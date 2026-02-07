# Authentication Requirements

## Auth Requirements for Chat Access

- All requests to `/api/{user_id}/chat` require valid JWT authentication
- Requests without authentication return HTTP 401 Unauthorized
- Invalid JWT tokens result in HTTP 401 Unauthorized responses
- Expired tokens result in HTTP 401 Unauthorized responses
- Token-less requests are rejected immediately without processing

## JWT Usage and Enforcement

- JWT tokens are validated against Better Auth public keys
- Token signature verification is mandatory for all requests
- Token expiration is checked during validation
- User ID in JWT must match the `{user_id}` path parameter
- Malformed tokens result in HTTP 401 responses

## User Identity Propagation

### Through Chat Requests
- User identity extracted from JWT and validated against `{user_id}` path parameter
- User ID passed to all downstream components (Agents SDK, MCP tools)
- All database queries filtered by user ID to ensure data isolation

### Through MCP Tools
- MCP tools receive user ID context from the API layer
- All tool operations enforce user ownership validation
- Database operations filtered by user ID in all MCP tool implementations
- User ID validation occurs before any data access in MCP tools

## Authorization Enforcement

- Users can only access their own tasks and conversations
- Cross-user data access attempts result in authorization failures
- MCP tools validate user ownership before any data modification
- Database queries always include user ID filters for security
- Unauthorized access attempts are logged for security monitoring