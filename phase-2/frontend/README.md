# Todo Application Frontend

A modern, full-stack todo application frontend built with Next.js 16.1.1 and the App Router architecture. This application provides a beautiful, responsive interface for managing tasks with secure authentication and persistent storage.

## Features

- **Modern UI/UX**: Beautiful, responsive design with animated elements and smooth transitions
- **Secure Authentication**: User registration and login powered by Better Auth with JWT-based security
- **Task Management**: Full CRUD operations for tasks (Create, Read, Update, Delete)
- **Real-time Updates**: Interactive task management with immediate feedback
- **Protected Routes**: Middleware-enforced authentication for sensitive areas
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Clean Architecture**: Well-structured components and clear separation of concerns

## Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Runtime**: React 19.2.3
- **Styling**: Tailwind CSS with custom animations
- **Authentication**: Better Auth for secure user management
- **Database**: Neon Cloud PostgreSQL with Drizzle ORM
- **Environment**: TypeScript for type safety

## Architecture

The frontend follows Next.js App Router conventions with:

- **Protected routes**: `/tasks/*` routes are secured with authentication middleware
- **Public routes**: Home, sign-up, and sign-in are accessible to all users
- **API integration**: Communicates with backend API for task operations
- **Component structure**: Organized in `src/components/` with reusable UI elements
- **Utility functions**: Located in `src/lib/` for shared logic

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Environment Configuration

Copy the environment file and configure your settings:

```bash
cp .env.local .env
```

Configure the following environment variables in `.env`:

```env
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000  # Use https://your-app.vercel.app in production
BETTER_AUTH_SECRET=your-secret-key-here

# Database Configuration (for Better Auth)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/todo_app?sslmode=require"
```

Note: Replace the Neon connection string with your actual Neon database URL from the Neon dashboard.

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Migration

If using Better Auth with Neon Cloud PostgreSQL persistence, run migrations:

```bash
npm run migrate
# or
yarn migrate
# or
pnpm run migrate
```

## Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── profile/            # Profile management page
│   ├── sign-in/            # Login page
│   ├── sign-up/            # Registration page
│   ├── tasks/              # Task management pages
│   ├── favicon.ico         # Site icon
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Homepage
├── components/             # Reusable UI components
│   └── TaskBox.tsx         # Interactive task demo component
├── lib/                    # Utility functions and helpers
├── middleware.ts           # Authentication middleware
└── auth-schema.ts          # Better Auth database schema
```

## Authentication Flow

The application implements secure authentication using Better Auth:

1. **Public Access**: Users can visit home, sign-up, and sign-in pages
2. **Registration/Login**: New users can sign up; existing users can sign in
3. **Session Management**: Better Auth handles secure session tokens
4. **Route Protection**: Middleware protects `/tasks/*` routes
5. **Automatic Redirect**: Unauthenticated users are redirected to sign-in

## Protected Routes

The middleware protects specific routes by checking for valid authentication:

- `/tasks/*` - Task management requires authentication
- Unauthenticated access redirects to `/sign-in` with callback URL preservation

## Styling and UI

- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Custom Animations**: Blob animations and hover effects for modern feel
- **Responsive Grid**: Mobile-first responsive design
- **Accessibility**: Semantic HTML and proper contrast ratios

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations

## API Integration

The frontend communicates with the backend API for task operations. API routes are located in `src/app/api/` and follow Next.js convention for server-side operations.

## Deployment

This application can be deployed to any platform that supports Next.js applications, including:

- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Custom Node.js hosting

For production deployment, ensure environment variables are properly configured and database connections are established.

## Learn More

To learn more about the technologies used in this application:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Better Auth Documentation](https://www.better-auth.com/docs) - Authentication framework
- [Drizzle ORM Documentation](https://orm.drizzle.team/) - Database toolkit
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework
