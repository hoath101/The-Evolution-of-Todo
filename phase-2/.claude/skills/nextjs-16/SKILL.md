---
name: nextjs-16
description: Comprehensive Next.js 16 development expert for building full-stack applications with App Router, Server Components, Server Actions, API Routes, and data fetching patterns. Use when working with Next.js 16 projects for: (1) Building new Next.js applications from scratch, (2) Implementing App Router features (layouts, loading states, error handling, parallel/intercepting routes), (3) Data fetching and caching strategies, (4) Creating API routes and route handlers, (5) Server Components and Server Actions, (6) Debugging and troubleshooting Next.js issues, (7) Performance optimization and best practices guidance, (8) Project setup and configuration.
---

# Next.js 16 Expert

## Overview

This skill provides comprehensive guidance for developing modern Next.js 16 applications using the App Router, Server Components, Server Actions, and the latest data fetching patterns. It includes templates, reference documentation, and utilities for common Next.js development tasks.

## Quick Start

### Creating a New Next.js 16 Project

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

When prompted:
- TypeScript: Yes (recommended)
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes (recommended for organization)
- App Router: Yes (required for Next.js 16 features)
- Import alias: `@/*` (recommended)

### Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── loading.tsx       # Loading UI
│   │   ├── error.tsx         # Error UI
│   │   ├── api/              # API routes
│   │   └── [feature]/        # Feature routes
│   ├── components/           # React components
│   ├── lib/                  # Utilities and helpers
│   └── actions/              # Server Actions
├── public/                   # Static assets
└── next.config.js           # Next.js configuration
```

## App Router & Routing

### File-Based Routing

Next.js 16 uses the App Router with file-based routing:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/:slug`
- `app/dashboard/settings/page.tsx` → `/dashboard/settings`

### Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <div>Blog post: {params.slug}</div>
}

// app/shop/[category]/[id]/page.tsx
export default function Product({
  params
}: {
  params: { category: string; id: string }
}) {
  return <div>Category: {params.category}, ID: {params.id}</div>
}
```

### Layouts

Layouts wrap pages and persist across navigation. See [app-router.md](references/app-router.md) for advanced layout patterns.

```tsx
// app/layout.tsx (Root Layout)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// app/dashboard/layout.tsx (Nested Layout)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <nav>Dashboard Nav</nav>
      <main>{children}</main>
    </div>
  )
}
```

### Loading States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>
}
```

### Error Handling

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

For complete routing patterns including parallel routes, intercepting routes, and route groups, see [app-router.md](references/app-router.md).

## Server Components & Client Components

### Server Components (Default)

Server Components are the default in Next.js 16. They:
- Run only on the server
- Can directly access databases and APIs
- Reduce client-side JavaScript bundle
- Cannot use hooks or browser APIs

```tsx
// app/posts/page.tsx (Server Component by default)
async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

### Client Components

Add `'use client'` directive for:
- Interactivity (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, etc.)

```tsx
// components/Counter.tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Composition Pattern

Keep Server Components at the top, use Client Components for interactivity:

```tsx
// app/dashboard/page.tsx (Server Component)
import { ClientSidebar } from '@/components/ClientSidebar'

export default async function Dashboard() {
  const data = await fetchData() // Server-side data fetching

  return (
    <div>
      <ClientSidebar items={data.items} />
      <main>{/* Server-rendered content */}</main>
    </div>
  )
}
```

See [data-fetching.md](references/data-fetching.md) for advanced Server Component patterns.

## Data Fetching & Caching

### Fetching Data in Server Components

```tsx
// Cached by default (static)
async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

// Revalidate every 60 seconds
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  })
  return res.json()
}

// No caching (dynamic)
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  })
  return res.json()
}
```

### Server Actions

Server Actions allow mutations from Client Components without API routes:

```tsx
// actions/posts.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title')

  // Save to database
  await db.post.create({ data: { title } })

  // Revalidate the posts page
  revalidatePath('/posts')
}
```

```tsx
// app/posts/new/page.tsx
import { createPost } from '@/actions/posts'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}
```

For advanced data fetching patterns, streaming, and revalidation strategies, see [data-fetching.md](references/data-fetching.md).

## API Routes & Route Handlers

### Creating API Routes

API routes use Route Handlers in the `app/api` directory:

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = await db.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}
```

### Dynamic API Routes

```tsx
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({ where: { id: params.id } })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}
```

### Error Handling in API Routes

```tsx
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Process request
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

For authentication patterns, middleware, and advanced API route patterns, see [api-routes.md](references/api-routes.md).

## Middleware

Middleware runs before requests are completed and can modify the response:

```tsx
// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Authentication check
  const token = request.cookies.get('token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}
```

See [api-routes.md](references/api-routes.md) for advanced middleware patterns.

## Configuration

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

See `assets/config/next.config.js` for an optimized configuration template.

## Templates

This skill includes ready-to-use templates in `assets/templates/`:

- **api-route/** - API route boilerplate with error handling
- **server-component/** - Server Component patterns
- **server-action/** - Server Action examples
- **middleware/** - Middleware templates

## References

For detailed documentation on specific topics:

- **[app-router.md](references/app-router.md)** - Advanced routing patterns (parallel routes, intercepting routes, route groups)
- **[data-fetching.md](references/data-fetching.md)** - Comprehensive data fetching, caching, and revalidation strategies
- **[api-routes.md](references/api-routes.md)** - API routes, authentication, middleware patterns
- **[deployment.md](references/deployment.md)** - Deployment to Vercel, Docker, and self-hosting
- **[troubleshooting.md](references/troubleshooting.md)** - Common errors and solutions

## Troubleshooting

For common Next.js 16 errors and solutions, see [troubleshooting.md](references/troubleshooting.md).

Quick fixes:
- **"use client" errors**: Add `'use client'` directive for interactive components
- **Hydration errors**: Ensure server and client render the same content
- **Dynamic import errors**: Use `dynamic` from `next/dynamic` for client-only components
- **Environment variables**: Prefix with `NEXT_PUBLIC_` for client-side access

## Best Practices

1. **Server Components First**: Use Server Components by default, Client Components only when needed
2. **Colocation**: Keep components close to where they're used
3. **Server Actions**: Prefer Server Actions over API routes for mutations
4. **Streaming**: Use loading.tsx for better perceived performance
5. **Error Boundaries**: Use error.tsx for graceful error handling
6. **Type Safety**: Use TypeScript for better DX and fewer bugs
7. **Metadata**: Use generateMetadata for SEO
