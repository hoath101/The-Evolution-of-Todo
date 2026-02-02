# Backend Guide

This backend is built with **FastAPI**, **SQLModel**, and **PyJWT**.

## Structure

- `src/main.py`: Application entry point
- `src/api/`: REST API routers
- `src/models/`: SQLModel DB models
- `src/auth/`: JWT and user verification
- `src/services/`: Business logic

## Setup

1. Install UV: `pip install uv`
2. Sync dependencies: `uv sync`
3. Run dev server: `uv run uvicorn src.main:app --reload`

## Authentication

- Stateless JWT verification relying on Better Auth (frontend).
- `BETTER_AUTH_SECRET` must match frontend.
- No session state in backend.

## Rules (from Constitution)

- **User Isolation**: `owner_user_id` enforced on EVERY query.
- **API Contract**: `/api/{user_id}/tasks` endpoints only.
- **Error Format**: `{"error": "message", "detail": "opt"}` (aligned with constitution).
