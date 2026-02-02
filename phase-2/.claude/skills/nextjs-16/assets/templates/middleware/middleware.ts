// Template: Middleware for authentication, logging, and redirects
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // 1. Authentication check
  const authResult = checkAuth(request)
  if (authResult) return authResult

  // 2. CORS headers
  const response = addCorsHeaders(NextResponse.next(), request)

  // 3. Logging
  logRequest(request)

  // 4. Custom headers
  response.headers.set('x-custom-header', 'value')
  response.headers.set('x-pathname', request.nextUrl.pathname)

  return response
}

// Authentication logic
function checkAuth(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/']
  if (publicRoutes.includes(pathname)) {
    return null
  }

  // Check for session token
  const token = request.cookies.get('session')

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/protected')) {
    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token (simplified - use proper JWT verification)
    const isValid = verifyToken(token.value)
    if (!isValid) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return null
}

// CORS headers
function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only add CORS for API routes
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'http://localhost:3000',
      'https://example.com',
    ]

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      )
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      )
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
  }

  return response
}

// Request logging
function logRequest(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    console.log({
      method: request.method,
      url: request.url,
      pathname: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    })
  }
}

// Token verification (replace with your implementation)
function verifyToken(token: string): boolean {
  // Implement your token verification logic
  // For example, verify JWT token
  try {
    // const payload = jwt.verify(token, process.env.JWT_SECRET!)
    // return !!payload
    return true // Simplified for template
  } catch {
    return false
  }
}

// Rate limiting example
const rateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  const record = rateLimit.get(ip)

  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (record.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  record.count++
  return null
}

// Redirect examples
function handleRedirects(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Redirect old URLs to new ones
  const redirects: Record<string, string> = {
    '/old-page': '/new-page',
    '/blog/old-post': '/blog/new-post',
  }

  if (pathname in redirects) {
    return NextResponse.redirect(new URL(redirects[pathname], request.url))
  }

  return null
}

// Configure which routes middleware runs on
export const config = {
  // Match all routes except static files and api routes
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],

  // Or match specific patterns:
  // matcher: ['/dashboard/:path*', '/api/:path*'],
}

// Advanced: Chain multiple middleware functions
function chain(
  functions: Array<(request: NextRequest) => NextResponse | null>,
  request: NextRequest
): NextResponse {
  for (const fn of functions) {
    const result = fn(request)
    if (result) return result
  }
  return NextResponse.next()
}

// Usage example:
// export function middleware(request: NextRequest) {
//   return chain(
//     [
//       handleRedirects,
//       checkAuth,
//       checkRateLimit,
//     ],
//     request
//   )
// }
