import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  // For protected routes, check if user is authenticated
  const protectedPaths = ['/tasks', '/tasks/'];
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path) ||
    request.nextUrl.pathname === path
  );

  if (isProtected) {
    // Use Better Auth's session cookie detection
    const sessionCookie = getSessionCookie(request);

    // If no session cookie found, redirect to sign-in
    if (!sessionCookie) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Run middleware on all routes except static files and API routes
};