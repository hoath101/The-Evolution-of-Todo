import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils } from './src/services/jwt-utils';

// Define protected routes
const protectedRoutes = ['/dashboard', '/tasks', '/chat', '/profile'];

export function proxy(request: NextRequest) {
  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get the token from Better Auth session cookies
    // Better Auth sets several cookies, check for the main session cookie
    const sessionToken = request.cookies.get('better-auth.session_token')?.value ||  // Better Auth's default session cookie
                        request.cookies.get('__Secure-better-auth.session_token')?.value || // Secure version
                        request.cookies.get('access_token')?.value ||               // Our custom token storage
                        request.headers.get('authorization')?.replace('Bearer ', ''); // Authorization header

    // If we have a session token from Better Auth, we consider the user authenticated
    // Better Auth's session tokens are validated by Better Auth itself
    const token = sessionToken;

    // If no token, redirect to sign-in
    if (!token) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    // Optionally, validate token expiration
    if (JWTUtils.isTokenExpired(token)) {
      // Token is expired, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth (public authentication pages)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
  ],
};