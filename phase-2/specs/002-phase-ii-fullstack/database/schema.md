# Database Schema — Neon PostgreSQL

## Scope
This schema defines the backend-owned persistence for tasks and its relationship to user identity.

User/auth tables are assumed to be managed by Better Auth (via its adapter). This spec only defines the minimal requirements the backend relies upon.

## Assumptions
- PostgreSQL database is hosted on Neon.
- Migrations exist, but migration tooling is out of scope.
- User identifiers used by JWT (`user_id`) are stable and map to a user record in the auth system.

## Tables

### 1) tasks
Stores todo tasks.

#### Columns
- `id` — **primary key**, type: UUID (or another globally unique identifier)
- `owner_user_id` — type: text (or UUID), **not null**
- `title` — type: text, **not null**
- `description` — type: text, nullable
- `completed` — type: boolean, **not null**, default `false`
- `created_at` — type: timestamp with time zone, **not null**
- `updated_at` — type: timestamp with time zone, **not null**

#### Constraints
- Primary key: `tasks.id`
- Ownership constraint (logical): `tasks.owner_user_id` must equal authenticated JWT user identity for all reads/writes.
- Title length constraint enforced at application level per `features/task-crud.md`.

#### Indexes
- Index on `(owner_user_id, created_at DESC)` to support listing tasks.
- Optional index on `(owner_user_id, completed)` to support filtering in the future.

## Relationships

### tasks → users (conceptual)
- `tasks.owner_user_id` references the auth system’s user identifier.
- Relationship cardinality: one user → many tasks.

**Ownership enforcement**:
- The backend MUST only return or mutate rows where `tasks.owner_user_id == JWT user identity`.

## Migration assumptions (no tooling details)
- Schema changes are applied via forward-only migrations.
- Backward-incompatible changes require explicit data migration steps.
- Initial migration creates the `tasks` table and indexes.
