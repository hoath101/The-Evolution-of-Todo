---
id: "001"
title: "Next.js App Router Authentication Fix Implementation"
stage: "general"
date: "2026-02-02"
surface: "agent"
model: "Sonnet 4.5"
feature: "none"
branch: "main"
user: "Baloch"
command: "implement-auth-fix-plan"
labels: ["authentication", "nextjs", "server-components", "better-auth"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "src/lib/server-auth-utils.ts"
  - "middleware.ts"
  - "src/components/ProtectedLayout.tsx"
  - "src/app/tasks/page.tsx"
  - "src/app/tasks/TasksClient.tsx"
  - "src/app/tasks/[id]/page.tsx"
  - "src/app/tasks/[id]/TaskDetailClient.tsx"
  - "src/app/profile/page.tsx"
  - "src/app/profile/ProfileClient.tsx"
  - "src/lib/server-api.ts"
  - "src/components/TaskList.tsx"
  - "src/lib/api.ts"
outcome: "Successfully implemented Next.js App Router authentication fix by moving all authentication validation to server components, fixing middleware cookie detection, and properly separating server and client logic."
evaluation: "All protected routes now validate authentication server-side before rendering, eliminating race conditions and hydration errors. The implementation follows Next.js App Router patterns and properly integrates with Better Auth."
---

# Next.js App Router Authentication Fix Implementation

## Summary

Implemented the Next.js App Router authentication fix plan by moving all authentication validation to server components and addressing race conditions, stale cache issues, and client-side session validation problems.

## Changes Made

### 1. Server-Side Auth Utilities
- Created `src/lib/server-auth-utils.ts` with `getCurrentSession()` and `requireAuth()` functions
- Implemented proper Better Auth session validation using `auth.api.getSession()` with headers
- Added server-side redirect functionality

### 2. Middleware Updates
- Updated `middleware.ts` to use Better Auth's `getSessionCookie()` function for proper cookie detection
- Fixed middleware to properly detect Better Auth session cookies

### 3. Protected Route Restructuring
- Updated `/tasks` page to be a server component with auth validation
- Created `TasksClient.tsx` as client component for UI interactions
- Updated `/tasks/[id]` page to validate auth and fetch task server-side
- Created `TaskDetailClient.tsx` for client-side interactions
- Updated `/profile` page to validate auth server-side
- Created `ProfileClient.tsx` for client-side UI

### 4. API Client Separation
- Enhanced `src/lib/api.ts` to handle both server and client contexts
- Created `src/lib/server-api.ts` with dedicated server-side API methods
- Updated components to use appropriate API client based on context

### 5. Component Updates
- Updated `TaskList.tsx` to accept initial tasks from server components
- Ensured client components only handle UI interactions, not auth validation

## Technical Implementation

### Server Component Pattern
```typescript
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  // Server-side auth validation
  const session = await requireAuth("/sign-in");
  const userId = session.user.id;

  // Fetch data server-side
  let tasks = [];
  try {
    tasks = await serverApiClient.getUserTasks(userId);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }

  return <TasksClient userId={userId} initialTasks={tasks} />;
}
```

### Middleware Cookie Detection
```typescript
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  // ...
}
```

## Results

✅ `/tasks` page redirects to `/sign-in` when not authenticated
✅ `/tasks` page loads immediately after sign-in without race conditions
✅ `/tasks/[id]` page works correctly with server-side auth validation
✅ `/profile` page validates authentication server-side
✅ No client-side useEffect redirects remain in protected routes
✅ Session validation happens on the server before rendering
✅ No stale cache issues occur on Vercel
✅ All API calls work properly in both server and client contexts
✅ Navigation works correctly after sign-in
✅ No redirect loops occur
✅ Hydration errors are eliminated
✅ Middleware properly detects Better Auth session cookies
✅ Server components properly validate auth before rendering
✅ Dynamic rendering requirements are met for Vercel

## Verification

All protected routes now follow Next.js App Router best practices:
- Authentication validation occurs server-side before rendering
- No client-side session validation or redirects
- Proper separation of server and client components
- Dynamic rendering configured for protected routes
- Middleware properly handles session cookie detection

The implementation resolves the production issues while maintaining Better Auth integration and preserving existing functionality.