# API Routes & Route Handlers Reference

Comprehensive guide to creating API endpoints and middleware in Next.js 16.

## Table of Contents

- Route Handlers Basics
- Request & Response
- Authentication Patterns
- Middleware
- Error Handling
- Rate Limiting
- CORS Configuration

## Route Handlers Basics

### Basic Structure

```tsx
// app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello World' })
}
```

### All HTTP Methods

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ posts: [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json(body, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json(body)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json(body)
}

export async function DELETE(request: NextRequest) {
  return new NextResponse(null, { status: 204 })
}
```

### Dynamic Routes

```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(user)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const user = await db.user.update({
    where: { id: params.id },
    data: body
  })

  return NextResponse.json(user)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.user.delete({
    where: { id: params.id }
  })

  return new NextResponse(null, { status: 204 })
}
```

### Multiple Dynamic Segments

```tsx
// app/api/users/[userId]/posts/[postId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; postId: string } }
) {
  const post = await db.post.findFirst({
    where: {
      id: params.postId,
      userId: params.userId
    }
  })

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(post)
}
```

## Request & Response

### Reading Request Data

```tsx
export async function POST(request: NextRequest) {
  // JSON body
  const body = await request.json()

  // Form data
  const formData = await request.formData()
  const name = formData.get('name')

  // URL search params
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  // Headers
  const authorization = request.headers.get('authorization')
  const contentType = request.headers.get('content-type')

  // Cookies
  const token = request.cookies.get('token')

  return NextResponse.json({ body, name, query, authorization, token })
}
```

### Setting Response Data

```tsx
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // Set headers
  response.headers.set('X-Custom-Header', 'value')
  response.headers.set('Cache-Control', 'no-store')

  // Set cookies
  response.cookies.set('token', 'abc123', {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'strict',
    path: '/'
  })

  // Delete cookie
  response.cookies.delete('session')

  return response
}
```

### Response Types

```tsx
// JSON
export async function GET() {
  return NextResponse.json({ data: 'value' })
}

// Text
export async function GET() {
  return new NextResponse('Plain text', {
    headers: { 'Content-Type': 'text/plain' }
  })
}

// HTML
export async function GET() {
  return new NextResponse('<h1>Hello</h1>', {
    headers: { 'Content-Type': 'text/html' }
  })
}

// Redirect
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url))
}

// Stream
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('data chunk')
      controller.close()
    }
  })

  return new NextResponse(stream)
}
```

## Authentication Patterns

### JWT Authentication

```tsx
// lib/auth.ts
import jwt from 'jsonwebtoken'

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch {
    return null
  }
}

export function signToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  })
}
```

```tsx
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    )
  }

  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  // Use payload data
  return NextResponse.json({ message: 'Protected data', user: payload })
}
```

### Session-Based Authentication

```tsx
// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  // Verify credentials
  const user = await db.user.findUnique({ where: { email } })

  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Create session
  const token = signToken({ userId: user.id, email: user.email })

  const response = NextResponse.json({ success: true })
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'strict'
  })

  return response
}
```

```tsx
// app/api/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session')
  return response
}
```

### API Key Authentication

```tsx
// app/api/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    )
  }

  // Process webhook
  const body = await request.json()

  return NextResponse.json({ received: true })
}
```

## Middleware

### Basic Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware executed for:', request.nextUrl.pathname)
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### Authentication Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  // Check for protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('session')

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = verifyToken(token.value)

    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Add user info to headers
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
}
```

### CORS Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### Logging Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()

  const response = NextResponse.next()

  const duration = Date.now() - start

  console.log({
    method: request.method,
    path: request.nextUrl.pathname,
    duration: `${duration}ms`,
    status: response.status
  })

  return response
}
```

## Error Handling

### Try-Catch Pattern

```tsx
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Process request
    const result = await createUser(body)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Validation Error Handling

```tsx
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().min(18).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validated = userSchema.parse(body)

    // Create user
    const user = await db.user.create({ data: validated })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Custom Error Responses

```tsx
class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Rate Limiting

### Simple Rate Limiter

```tsx
// lib/rate-limit.ts
const rateLimit = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(identifier: string, limit: number = 10) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute

  const record = rateLimit.get(identifier)

  if (!record || now > record.resetAt) {
    rateLimit.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}
```

```tsx
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const { allowed, remaining } = checkRateLimit(ip, 10)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // Process request
  const results = await search()

  return NextResponse.json(results, {
    headers: {
      'X-RateLimit-Remaining': remaining.toString()
    }
  })
}
```

## CORS Configuration

### Per-Route CORS

```tsx
// app/api/public/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: 'public' }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
```

### Restricted CORS

```tsx
const ALLOWED_ORIGINS = [
  'https://example.com',
  'https://app.example.com'
]

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403 }
    )
  }

  return NextResponse.json({ data: 'allowed' }, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    }
  })
}
```

## Best Practices

1. **Input Validation**: Always validate and sanitize input
2. **Error Handling**: Use try-catch and return proper status codes
3. **Authentication**: Secure protected routes with auth middleware
4. **Rate Limiting**: Implement rate limiting for public APIs
5. **CORS**: Configure CORS appropriately for your use case
6. **Type Safety**: Use TypeScript for request/response types
7. **Logging**: Log errors and important events
8. **Status Codes**: Use appropriate HTTP status codes
