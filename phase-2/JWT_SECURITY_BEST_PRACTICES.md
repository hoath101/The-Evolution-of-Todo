# JWT Security Best Practices

This document outlines the JWT security best practices implemented in this project.

## Security Features Implemented

### 1. Token Validation
- **Signature Verification**: All JWT tokens are verified using the HS256 algorithm
- **Required Claims**: Tokens must include required claims (exp, sub)
- **Clock Skew Tolerance**: 60-second leeway to handle minor time differences between servers

### 2. Token Expiration
- **Short-lived Access Tokens**: 15-minute expiration for access tokens
- **Proper Expiration Handling**: Automatic rejection of expired tokens
- **Session Management**: Separate long-lived session tokens (7 days) with refresh capability

### 3. User Identity Verification
- **Subject Validation**: Ensures the 'sub' claim exists and contains valid user ID
- **Type Checking**: Validates that user IDs are proper string/int types
- **Scope Validation**: Confirms that the authenticated user matches the requested resource owner

### 4. Error Handling
- **Specific Error Types**: Different error responses for different failure types
- **Secure Error Messages**: Generic error messages to prevent information disclosure
- **Proper Status Codes**: Standard HTTP status codes for different error conditions

### 5. Security Headers
- **WWW-Authenticate Header**: Properly set for authentication failures
- **Bearer Token Scheme**: Correct authorization header format

## Configuration

### Backend (FastAPI)
- JWT verification in `backend/src/auth/jwt.py`
- User scope validation in `backend/src/auth/user_scope.py`
- Integration with API routes in `backend/src/api/tasks.py`

### Frontend (Better Auth)
- JWT plugin configuration in `frontend/src/lib/server-auth.ts`
- Client-side token handling in `frontend/src/lib/auth.ts`

## Security Recommendations

1. **Keep Secrets Secure**: Store `BETTER_AUTH_SECRET` securely and never expose in client-side code
2. **Regular Secret Rotation**: Rotate the authentication secret periodically
3. **Monitor Token Usage**: Log token validation attempts for security monitoring
4. **Validate Token Audience**: Consider adding audience validation for multi-service architectures
5. **Consider Refresh Tokens**: For longer sessions, implement refresh token rotation

## Common Security Pitfalls to Avoid

1. **Algorithm Confusion**: Never accept 'none' algorithm in production
2. **Weak Secrets**: Use strong, random secrets (at least 32 characters)
3. **Missing Validation**: Always validate required claims and token expiration
4. **Information Disclosure**: Don't reveal specific reasons for token rejection to clients
5. **Insufficient Logging**: Log security-relevant events for monitoring and forensics