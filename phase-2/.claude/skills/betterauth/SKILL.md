---
name: betterauth
description: "Better Auth expert for Next.js App Router and Node/TypeScript projects. Use when implementing authentication/authorization with Better Auth for: (1) creating the Better Auth instance (providers, plugins, security options), (2) wiring Next.js route handlers (`/api/auth/[...all]`), (3) reading sessions in Server Components/Route Handlers, (4) protecting routes via middleware (cookie-only or full session validation with Node runtime), (5) using database adapters (especially Prisma) and schema setup, and (6) troubleshooting cookies/CSRF/trusted origins/baseURL and callback URL issues."
---

# betterauth

## Working agreement

- Prefer official Better Auth docs when writing code that depends on library-specific APIs.
  - If any detail is uncertain (option names, file locations, adapter signatures), invoke `fetch-library-docs` before proposing code.
- Keep diffs small and align with the existing codebase style (Next.js version, App Router conventions, runtime constraints).

## Quick start (Next.js App Router)

### 1) Create `auth` instance

- Create `auth` with `betterAuth(...)` (commonly in `src/lib/auth.ts`).
- Configure security basics early:
  - `trustedOrigins: ["http://localhost:3000", "https://yourdomain.com"]`
  - `baseURL` or `process.env.BETTER_AUTH_URL`

If you need the exact options structure for your Better Auth version, invoke `fetch-library-docs`.

### 2) Add the route handler

Create `app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### 3) Read session in Server Components (RSC)

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function ServerComponent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return <div>Not authenticated</div>;
  return <div>Welcome {session.user.name}</div>;
}
```

## Route protection patterns

### Pattern A: Cookie-only gating (fast, no DB call)

Use when you just need “is there a session cookie?”

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### Pattern B: Full session validation in middleware (DB-backed)

Use when you must validate session against the database.

Important: this requires `runtime: "nodejs"`.

```ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard/:path*"],
};
```

## Prisma adapter

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
});
```

Notes:
- If your Prisma client is generated to a custom output directory, import the client from that path (not necessarily `@prisma/client`).
- If you need the correct `provider` values or schema requirements for your setup, invoke `fetch-library-docs`.

## Cookie / CSRF / callback troubleshooting checklist

1) **Blocked requests / CSRF failures**
- Ensure `trustedOrigins` includes the exact origin (scheme + host + port).

2) **Wrong redirect/callback host**
- Ensure `baseURL` is set correctly or `BETTER_AUTH_URL` is set.

3) **Cross-site cookie issues** (auth across different domains)
- Consider `advanced.defaultCookieAttributes` with `sameSite: "none"` and `secure: true`.
- Only do this when you truly need cross-site cookies; otherwise prefer stricter defaults.

4) **Edge runtime constraints**
- Middleware with DB lookups requires Node runtime (`config.runtime = "nodejs"`).

## Security defaults (don’t skip)

- Always configure `trustedOrigins`.
- Avoid permissive wildcard origins.
- Keep cookies `httpOnly` and `secure` in production.
- Keep CSRF checks enabled unless you have a documented reason.

## If you need more detail

Invoke `fetch-library-docs` with a precise topic, for example:
- “Better Auth Next.js integration route handler and session retrieval”
- “Better Auth Prisma adapter schema and provider options”
- “Better Auth advanced cookie options crossSubDomainCookies and cookiePrefix”

Then implement using the exact patterns from the fetched docs.
