# Quickstart Guide: Todo AI Chatbot Frontend

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to Better Auth service
- Access to FastAPI backend service

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration:**
   Copy the `.env.example` file to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```

   Update the environment variables:
   ```env
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:4000  # Better Auth service URL
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000    # FastAPI backend service URL
   ```

## Development

1. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

## Key Features

### Authentication Flow
1. User visits `/auth/sign-up` to create an account via Better Auth
2. User visits `/auth/sign-in` to log in via Better Auth
3. JWT token is stored securely in browser
4. All subsequent API requests to FastAPI include the token in headers

### Task Management
1. Navigate to `/tasks` to view and manage tasks
2. Create new tasks via form or AI chatbot
3. Update task completion status
4. Delete tasks as needed

### AI Chatbot
1. Navigate to `/chat` to interact with the AI
2. Type natural language to create tasks or manage existing ones
3. AI processes requests and interacts with backend via MCP tools

## API Integration

### Better Auth Client
- Handles all authentication operations
- Manages JWT token lifecycle
- Provides sign-in, sign-up, and sign-out functionality

### FastAPI Client
- Wraps all backend API calls
- Attaches JWT token to requests automatically
- Handles error responses and authentication failures

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js 15 App Router pages
│   │   ├── auth/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── chat/
│   │   └── layout.tsx
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React Context providers
│   ├── services/            # API clients and utilities
│   ├── types/               # TypeScript type definitions
│   └── hooks/               # Custom React hooks
```

## Building for Production

1. **Build the application:**
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Start production server:**
   ```bash
   npm start
   # or
   yarn start
   ```

## Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

Run specific test types:
```bash
npm run test:unit      # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e       # End-to-end tests
```

## Deployment

1. Build the application for production
2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)
3. Configure environment variables for production URLs
4. Ensure CORS is configured for API communication