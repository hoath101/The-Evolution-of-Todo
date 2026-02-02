# UI Components — Core Components and Responsibilities

## Overview
This document defines the core UI components and the rules for rendering based on authentication state.

Component names are conceptual; the implementation may use equivalent components as long as responsibilities and behaviors match.

## Global UI structure

### AppShell
**Responsibilities**:
- Provides consistent layout (header/nav/main).
- Hosts auth-dependent navigation.

**Auth-dependent rendering**:
- If signed out: show sign-in and sign-up navigation options.
- If signed in: show tasks navigation and sign-out option.

### AuthGuard (route-level)
**Responsibilities**:
- Prevents signed-out users from viewing authenticated pages.
- Redirects signed-out users to sign-in.

**Auth-dependent rendering**:
- Signed out → redirect to sign-in.
- Signed in → render child route.

## Authentication UI components

### SignUpForm
**Responsibilities**:
- Collects sign-up inputs.
- Submits to authentication system.
- Displays field-level and form-level errors.

**Auth-dependent rendering**:
- If already signed in: redirect to tasks.

### SignInForm
**Responsibilities**:
- Collects sign-in inputs.
- Submits to authentication system.
- Displays errors.

**Auth-dependent rendering**:
- If already signed in: redirect to tasks.

### SignOutButton
**Responsibilities**:
- Signs the user out.
- Clears auth state from the UI.

## Task UI components

### TaskList
**Responsibilities**:
- Renders the user’s tasks.
- Supports empty state.
- Allows selecting a task to view/edit.

**Auth-dependent rendering**:
- Only renders for signed-in users.

### TaskListItem
**Responsibilities**:
- Displays task title and completion state.
- Provides quick actions (toggle complete, delete).

### TaskEditor (create/update)
**Responsibilities**:
- Provides form to create or edit a task.
- Enforces basic client-side constraints (required title).
- Submits create/update requests.
- Displays validation errors returned by API.

### TaskDetail
**Responsibilities**:
- Displays full task details.
- Supports navigation back to list.

### LoadingState
**Responsibilities**:
- Provides visible loading state while fetching tasks or submitting changes.

### ErrorBanner
**Responsibilities**:
- Displays user-friendly error messages.
- Does not leak sensitive technical details.

## Auth-dependent rendering rules (summary)
- Signed-out users:
  - Can access sign-in/sign-up pages.
  - Cannot access task pages.
  - Are redirected to sign-in when attempting to access tasks.
- Signed-in users:
  - Can access tasks pages.
  - Can create/update/delete/toggle tasks.
