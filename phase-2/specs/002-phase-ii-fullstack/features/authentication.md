# Feature Spec — Authentication (Better Auth + JWT)

## Summary
The application provides sign-up and sign-in via the frontend. Better Auth is responsible for authenticating users and issuing JWTs. The backend validates JWTs on every request.

## Non-negotiable statements
- The backend never manages sessions.
- The backend only verifies JWTs.

## Frontend behavior

### Sign up
- A signed-out user can create an account.
- After successful sign-up, the user becomes authenticated in the frontend.
- The UI transitions to an authenticated state (e.g., redirects to tasks page).

### Sign in
- A signed-out user can sign in.
- After successful sign-in, the user becomes authenticated in the frontend.

### Sign out
- An authenticated user can sign out.
- After sign-out, authenticated-only pages must no longer show user data.

### Auth-dependent rendering rules
- Signed-out users can access sign-in and sign-up pages.
- Signed-out users attempting to access authenticated pages are redirected to sign-in.
- Signed-in users can access task pages and can perform CRUD actions.

## Better Auth configuration expectations
This spec defines expectations and invariants, not implementation details.

- Better Auth must be configured such that it can:
  - create users (sign up)
  - authenticate users (sign in)
  - issue JWTs for authenticated users
- The JWT signing secret is shared (securely) between Better Auth and the backend JWT verifier.

## JWT issuance requirements

### JWT format
- JWT must be a Bearer token used in `Authorization` header.

### JWT contents
The JWT must include:
- A stable, unique user identifier claim (referred to as `user_id` in this spec).
- An expiry (`exp`).

### Expiry expectations
- JWTs expire after a fixed duration.
- On expiry, the frontend must obtain a new JWT via standard authentication flow.

## Auth failure modes

### Frontend
- If the user is not authenticated, the UI must not show any tasks.
- If an API request returns 401, the UI must treat the user as signed out and prompt re-authentication.

### Backend
- Missing token → 401.
- Invalid token/signature → 401.
- Expired token → 401.
- Token identity mismatch vs `{user_id}` → 403.

## Security guarantees and assumptions

### Guarantees
- Users can only act within their own scope.
- JWT verification is performed for every API call.

### Assumptions
- Better Auth is configured securely (cookie settings / CSRF as required by its design).
- JWT signing secret is kept confidential.
- Production traffic uses HTTPS.
