# Phase II Full-Stack Todo Application

A multi-user todo web application built with Next.js, FastAPI, and Better Auth for authentication.

## Features

- User authentication (sign up, sign in, sign out)
- Create, read, update, and delete tasks
- User isolation (users can only see their own tasks)
- Responsive UI with Tailwind CSS
- JWT-based authentication between frontend and backend

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLModel, PostgreSQL
- **Authentication**: Better Auth
- **Database**: PostgreSQL (with Neon)

## Prerequisites

- Node.js 18+
- Python 3.9+
- UV package manager
- PostgreSQL or Neon database

## Environment Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install UV if you haven't already:
   ```bash
   pip install uv
   ```

3. Install dependencies:
   ```bash
   uv sync
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your database URL and auth secret:
   ```env
   DATABASE_URL=your_postgres_connection_string
   BETTER_AUTH_SECRET=your_secret_key
   ALLOWED_ORIGINS=["http://localhost:3000"]
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Update the `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=your_secret_key
   ```

## Running the Application

### Backend

From the `backend` directory:

uv run uvicorn src.main:app --reload --port 8000```bash

```

### Frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## API Endpoints

The backend exposes the following authenticated endpoints:

- `GET /api/{user_id}/tasks` - Get user's tasks
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{id}` - Update a task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle task completion
- `DELETE /api/{user_id}/tasks/{id}` - Delete a task

## Authentication

The application uses Better Auth for user authentication. The frontend handles user sessions, and the backend validates JWT tokens on each request to ensure users can only access their own resources.

## Development

Both the frontend and backend support hot reloading during development. Make sure to start both services when developing.

## Troubleshooting

- Make sure the `BETTER_AUTH_SECRET` is the same in both frontend and backend environments
- Ensure the `ALLOWED_ORIGINS` in the backend includes your frontend URL
- Check that the database connection string is properly configured