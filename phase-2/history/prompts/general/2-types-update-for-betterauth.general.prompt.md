---
id: 2
title: Types Update for BetterAuth Compatibility
stage: general
date: 2026-01-26
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: Claude
command: "update types.ts for BetterAuth response format"
labels: ["betterauth", "types", "typescript", "authentication"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - ./frontend/src/lib/types.ts
  - ./frontend/src/lib/auth-client.ts
tests: []
---

# Types Update for BetterAuth Compatibility

## PROMPT_TEXT
update @..\frontend\src\lib\types.ts also so my auth-client do not get type error

## RESPONSE_TEXT
Updated the types.ts file to be compatible with BetterAuth's response format. Made the following changes:

1. Added BetterAuthResponse<T> interface that represents BetterAuth's standard { data, error } response format
2. Updated User and Session interfaces to match BetterAuth's actual field structure
3. Updated SignUpResult, SignInResult, and GetSessionResult types to use BetterAuthResponse<T>
4. Added helper type guard functions (hasData, hasError) to work with BetterAuth's response format
5. Updated auth-client.ts to use the new types and simplified the response handling since BetterAuth already returns the correct format

The changes ensure that the auth-client.ts functions work properly with BetterAuth's native response format without needing additional transformation.

## OUTCOME
The types.ts file now properly defines BetterAuth's response format, eliminating type errors in auth-client.ts. Both files are now aligned with BetterAuth's actual API response structure.

## EVALUATION
All type errors between auth-client.ts and types.ts have been resolved. The implementation now correctly uses BetterAuth's native { data, error } response format.