# Data Fetching Reference

Comprehensive guide to data fetching, caching, and revalidation in Next.js 16.

## Table of Contents

- Server Components Data Fetching
- Caching Strategies
- Revalidation
- Server Actions
- Streaming & Suspense
- Database Integration
- Error Handling

## Server Components Data Fetching

### Basic Fetch

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts')

  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }

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

### Parallel Data Fetching

```tsx
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
}

async function getPosts(userId: string) {
  const res = await fetch(`https://api.example.com/posts?userId=${userId}`)
  return res.json()
}

export default async function UserProfile({ params }: { params: { id: string } }) {
  // Fetch in parallel
  const [user, posts] = await Promise.all([
    getUser(params.id),
    getPosts(params.id)
  ])

  return (
    <div>
      <h1>{user.name}</h1>
      <div>{posts.map(post => <article key={post.id}>{post.title}</article>)}</div>
    </div>
  )
}
```

### Sequential Data Fetching

```tsx
export default async function Page() {
  // Fetch user first
  const user = await getUser()

  // Then fetch posts based on user data
  const posts = await getPosts(user.id)

  return (
    <div>
      <h1>{user.name}</h1>
      {posts.map(post => <article key={post.id}>{post.title}</article>)}
    </div>
  )
}
```

## Caching Strategies

### Force Cache (Static - Default)

```tsx
// Cached indefinitely
const res = await fetch('https://api.example.com/data')

// Explicit force-cache
const res = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
})
```

### No Cache (Dynamic)

```tsx
// Never cached, always fresh
const res = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})
```

### Revalidate (ISR - Incremental Static Regeneration)

```tsx
// Revalidate every 60 seconds
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
})

// Revalidate every 10 minutes
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 600 }
})
```

### Per-Route Caching

```tsx
// app/posts/page.tsx

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Or set revalidation time
export const revalidate = 60

export default async function PostsPage() {
  const posts = await getPosts()
  return <div>{/* ... */}</div>
}
```

### Cache Tags

```tsx
// Tag cache for targeted revalidation
const res = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})

// Revalidate by tag
import { revalidateTag } from 'next/cache'
revalidateTag('posts')
```

## Revalidation

### Time-Based Revalidation

```tsx
// Revalidate every hour
export const revalidate = 3600

export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{/* ... */}</div>
}
```

### On-Demand Revalidation

```tsx
// actions/posts.ts
'use server'

import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  // Create post in database
  await db.post.create({ data: { /* ... */ } })

  // Revalidate the posts page
  revalidatePath('/posts')

  // Or revalidate by tag
  revalidateTag('posts')
}
```

### Revalidate from API Route

```tsx
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')

  if (path) {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  }

  return NextResponse.json({ error: 'No path provided' }, { status: 400 })
}
```

## Server Actions

### Basic Server Action

```tsx
// actions/posts.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await db.post.create({
    data: { title, content }
  })

  return { success: true }
}
```

### Using Server Actions in Forms

```tsx
// app/posts/new/page.tsx
import { createPost } from '@/actions/posts'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

### Server Actions with useFormState

```tsx
// actions/posts.ts
'use server'

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title') as string

  if (!title) {
    return { error: 'Title is required' }
  }

  await db.post.create({ data: { title } })

  return { success: true }
}
```

```tsx
// app/posts/new/page.tsx
'use client'

import { useFormState } from 'react-dom'
import { createPost } from '@/actions/posts'

export default function NewPost() {
  const [state, formAction] = useFormState(createPost, null)

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p className="error">{state.error}</p>}
      {state?.success && <p className="success">Post created!</p>}
      <button type="submit">Create</button>
    </form>
  )
}
```

### Server Actions with useFormStatus

```tsx
// components/SubmitButton.tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

```tsx
// app/posts/new/page.tsx
import { createPost } from '@/actions/posts'
import { SubmitButton } from '@/components/SubmitButton'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <SubmitButton />
    </form>
  )
}
```

### Programmatic Server Actions

```tsx
// actions/posts.ts
'use server'

export async function updatePost(id: string, data: { title: string }) {
  await db.post.update({
    where: { id },
    data
  })

  return { success: true }
}
```

```tsx
// components/EditPost.tsx
'use client'

import { updatePost } from '@/actions/posts'

export function EditPost({ id, title }: { id: string; title: string }) {
  const handleUpdate = async () => {
    const result = await updatePost(id, { title: 'New Title' })
    if (result.success) {
      alert('Updated!')
    }
  }

  return (
    <button onClick={handleUpdate}>
      Update
    </button>
  )
}
```

## Streaming & Suspense

### Basic Streaming

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

async function SlowComponent() {
  // Simulate slow data fetch
  await new Promise(resolve => setTimeout(resolve, 3000))
  const data = await fetchData()

  return <div>{data}</div>
}

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

### Multiple Suspense Boundaries

```tsx
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading revenue...</div>}>
        <Revenue />
      </Suspense>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>

      <Suspense fallback={<div>Loading users...</div>}>
        <Users />
      </Suspense>
    </div>
  )
}
```

### Nested Suspense

```tsx
export default function Page() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <Header />

      <Suspense fallback={<div>Loading content...</div>}>
        <Content />
      </Suspense>

      <Footer />
    </Suspense>
  )
}
```

### Streaming with Loading UI

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>
}

// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchData() // Streams automatically
  return <div>{data}</div>
}
```

## Database Integration

### Prisma Example

```tsx
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

```tsx
// app/posts/page.tsx
import { prisma } from '@/lib/db'

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author.name}</p>
        </article>
      ))}
    </div>
  )
}
```

### Direct Database Queries

```tsx
// lib/db.ts
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

export default sql
```

```tsx
// app/users/page.tsx
import sql from '@/lib/db'

export default async function UsersPage() {
  const users = await sql`SELECT * FROM users ORDER BY created_at DESC`

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

## Error Handling

### Try-Catch in Server Components

```tsx
export default async function Page() {
  try {
    const data = await fetchData()
    return <div>{data}</div>
  } catch (error) {
    return <div>Error loading data</div>
  }
}
```

### Error Boundaries

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
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Global Error Handling

```tsx
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

### Not Found Handling

```tsx
// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'

export default async function Post({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return <article>{post.title}</article>
}
```

```tsx
// app/posts/[id]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Post Not Found</h2>
      <p>Could not find the requested post.</p>
    </div>
  )
}
```

## Best Practices

1. **Parallel Fetching**: Use Promise.all() for independent requests
2. **Streaming**: Use Suspense for slow components
3. **Caching**: Choose appropriate cache strategy per route
4. **Server Actions**: Prefer over API routes for mutations
5. **Revalidation**: Use tags for granular cache control
6. **Error Handling**: Implement error boundaries at appropriate levels
7. **Database**: Use connection pooling for better performance
8. **Type Safety**: Use TypeScript for database queries
