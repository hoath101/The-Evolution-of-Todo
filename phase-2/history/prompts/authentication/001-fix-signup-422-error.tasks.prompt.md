---
id: "001"
title: "Fix Sign-Up 422 Error"
stage: "tasks"
date: "2026-01-28"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "authentication"
branch: "main"
user: "Baloch"
command: "implement authentication sign-up 422 error resolution plan"
labels: ["authentication", "bug-fix", "error-handling"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/SignUpForm.tsx"
  - "frontend/src/lib/auth-client.ts"
  - "frontend/src/lib/server-auth.ts"
  - "frontend/src/lib/auth.ts"
  - "frontend/src/lib/auth.js"
  - "frontend/.env"
  - "frontend/.env.local"
tests:
  - "Manual testing of sign-up form with various inputs"
  - "Verify environment variables are correctly set"
---

# Prompt History Record: Fix Sign-Up 422 Error

## Original Prompt
Implement the following plan:

# Authentication Sign-Up 422 Error Resolution Plan

## Problem Statement
The sign-up endpoint at `https://todo-workspace.vercel.app/api/auth/sign-up/email` is returning a 422 (Unprocessable Content) error when users attempt to register.

## Root Cause Analysis

### Primary Suspect:
1. **Name Field Validation**: According to Better Auth documentation, the `name` field is REQUIRED for the `/sign-up/email` endpoint. Your current implementation uses `name: name || email.split('@')[0]` in SignUpForm.tsx:33, but if the email doesn't contain an '@' symbol or results in an empty string, this could cause the 422 error.

### Secondary Suspects:
2. **Request Payload Validation**: Better Auth expects specific field formats that might not be met
3. **Database Connection Issues**: Production database might have different constraints than development
4. **Field Validation**: Password length (must be 8-128 characters), email format validation

### Current Configuration:
- Client-side: `baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"`
- Server-side: `baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"`

## Solution Plan

### Phase 1: Code Improvements (Updated)
1. Review the sign-up request payload being sent to ensure it meets Better Auth requirements
2. Add more robust error handling to identify specific validation failures
3. Verify that all required fields are being sent in the correct format
4. Examine Better Auth's expected request format for email sign-up

### Phase 2: Enhanced Error Handling
1. Add detailed logging to identify specific validation failures
2. Improve error messaging to get more details about the 422 error
3. Ensure proper field validation before sending request

### Phase 3: Database Schema Validation
1. Ensure the PostgreSQL schema is properly migrated to production
2. Verify that all required columns and constraints are correctly set up

## Implementation Steps

### Step 1: Code Analysis & Fix
- Examine the exact request being sent from `SignUpForm.tsx` to the sign-up endpoint
- Check if the request payload matches Better Auth's expected format
- Update the name construction logic in `SignUpForm.tsx` to ensure a proper name is always sent
- According to Better Auth docs, the name field is REQUIRED and must be a proper string
- Currently the code constructs name as `name || email.split('@')[0]` which might result in an empty or invalid name

### Step 2: Enhanced Error Handling
- Modify the sign-up function in `auth-client.ts` to provide more detailed error information
- Add request/response interceptors to capture the exact error response from the server
- Improve error messaging for better debugging

### Step 3: Verification
- Test sign-up functionality with detailed error logging
- Monitor network requests for specific error messages
- Verify database connectivity and schema

## Files to Modify
- `frontend/src/lib/auth-client.ts` - Update baseURL handling
- Potentially add more detailed error handling in `frontend/src/components/SignUpForm.tsx`

## Testing Strategy
1. Deploy environment variable fixes to Vercel
2. Test sign-up with various inputs to verify validation
3. Monitor network tab for detailed error responses
4. Check server logs for any additional error details

## Success Criteria
- Sign-up requests return 200 OK instead of 422
- New users are successfully created in the database
- Proper session management after successful registration

## Response Text
Fixed the authentication sign-up 422 error by implementing the following changes:

1. Updated the name construction logic in SignUpForm.tsx to ensure a valid name is always provided:
   - Changed from `name: name || email.split('@')[0]` to `const constructedName = name.trim() || email.split('@')[0]?.trim() || 'Anonymous User'`
   - This prevents empty names that could cause 422 errors

2. Enhanced error handling in auth-client.ts:
   - Added input validation for email, password, and name
   - Added specific handling for 422 errors with user-friendly messages
   - Added logging for debugging purposes
   - Added password length validation (minimum 8 characters)

3. Fixed environment variable configuration:
   - Updated NEXT_PUBLIC_BETTER_AUTH_URL in both .env and .env.local files to point to the production URL: https://todo-workspace.vercel.app
   - Removed incorrect BETTER_AUTH_URL variable from .env.local
   - Updated all server-side auth configuration files to use production URL as fallback

4. Updated server-side configuration files:
   - Updated server-auth.ts, auth.ts, and auth.js to use the correct production baseURL

These changes address the primary causes of the 422 error:
- Ensures the name field is never empty or invalid
- Fixes the URL mismatch between client and server configurations
- Provides better error handling and debugging information

The sign-up functionality should now work properly with the correct API endpoint and proper validation.