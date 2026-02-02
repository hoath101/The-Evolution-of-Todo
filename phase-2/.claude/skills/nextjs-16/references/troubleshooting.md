# Troubleshooting Reference

Common Next.js 16 errors and their solutions.

## Table of Contents

- Hydration Errors
- Client Component Errors
- Data Fetching Issues
- Build Errors
- Deployment Issues
- Performance Problems

## Hydration Errors

### Error: Text content does not match

**Cause**: Server and client render different content

```tsx
// ❌ Bad - Date changes between server and client
export default function Page() {
  return <div>{new Date().toString()}</div>
}

// ✅ Good - Use client component for dynamic content
'use client'
import { useState, useEffect } from 'react'

export default function Page() {
  const [date, setDate] = useState('')

  useEffect(() => {
    setDate(new Date().toString())
  }, [])

  return <div>{date}</div>
}
```

### Error: Hydration failed

**Cause**: Invalid HTML nesting or conditional rendering

```tsx
// ❌ Bad - Invalid HTML nesting
<p>
  <div>Content</div>
</p>

// ✅ Good - Valid HTML
<div>
  <div>Content</div>
</div>

// ❌ Bad - Conditional with different structure
{isClient && <div>Client only</div>}
{!isClient && <span>Server only</span>}

// ✅ Good - Consistent structure
<div suppressHydrationWarning>
  {isClient ? 'Client' : 'Server'}
</div>
```

### Error: Extra attributes from server

**Cause**: Browser extensions adding attributes

```tsx
// ✅ Suppress for specific element
<html suppressHydrationWarning>
  <body>{children}</body>
</html>
```

## Client Component Errors

### Error: You're importing a component that needs X

**Cause**: Using client-only features in Server Component

```tsx
// ❌ Bad - Using useState in Server Component
export default function Page() {
  const [count, setCount] = useState(0) // Error!
  return <div>{count}</div>
}

// ✅ Good - Add 'use client' directive
'use client'
import { useState } from 'react'

export default function Page() {
  const [count, setCount] = useState(0)
  return <div>{count}</div>
}
```

### Error: Cannot use hooks in Server Component

```tsx
// ❌ Bad
export default function Page() {
  useEffect(() => {}, []) // Error!
}

// ✅ Good - Move to Client Component
'use client'
export default function Page() {
  useEffect(() => {}, [])
}
```

### Error: Dynamic import issues

```tsx
// ❌ Bad - Client-only library in Server Component
import 'client-only-lib'

// ✅ Good - Dynamic import
'use client'
import dynamic from 'next/dynamic'

const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
})
```

## Data Fetching Issues

### Error: fetch is not defined

**Cause**: Using fetch in wrong context

```tsx
// ❌ Bad - fetch in client component without proper handling
'use client'
export default function Page() {
  const data = await fetch('/api/data') // Error!
}

// ✅ Good - Use in Server Component
export default async function Page() {
  const data = await fetch('/api/data')
  return <div>{/* ... */}</div>
}

// ✅ Or use in Client Component with useEffect
'use client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])
}
```

### Error: Headers already sent

**Cause**: Trying to set headers after response started

```tsx
// ❌ Bad
export async function GET() {
  const response = NextResponse.json({ data: 'value' })
  response.cookies.set('token', 'abc') // Error if already sent
  return response
}

// ✅ Good - Set before returning
export async function GET() {
  const response = NextResponse.json({ data: 'value' })
  response.cookies.set('token', 'abc')
  return response
}
```

### Error: Cannot read body multiple times

```tsx
// ❌ Bad
export async function POST(request: NextRequest) {
  const body1 = await request.json()
  const body2 = await request.json() // Error!
}

// ✅ Good - Read once
export async function POST(request: NextRequest) {
  const body = await request.json()
  // Use body multiple times
}
```

### Error: revalidatePath not working

**Cause**: Incorrect path or cache not configured

```tsx
// ❌ Bad - Missing leading slash
revalidatePath('posts')

// ✅ Good
revalidatePath('/posts')

// ✅ For layouts
revalidatePath('/posts', 'layout')

// ✅ For all paths
revalidatePath('/', 'layout')
```

## Build Errors

### Error: Module not found

```bash
# ❌ Common causes
# - Missing dependency
# - Wrong import path
# - Case sensitivity (Linux)

# ✅ Solutions
npm install missing-package

# Check import paths
import { Component } from '@/components/Component' # Correct
import { Component } from '@/Components/component' # May fail on Linux

# Clear cache
rm -rf .next node_modules package-lock.json
npm install
```

### Error: Type errors

```tsx
// ❌ Bad - Missing types
export default function Page({ params }) {
  return <div>{params.id}</div>
}

// ✅ Good - Proper types
export default function Page({
  params
}: {
  params: { id: string }
}) {
  return <div>{params.id}</div>
}
```

### Error: Cannot find module 'next/...'

```bash
# ✅ Solution - Reinstall Next.js
npm install next@latest react@latest react-dom@latest
```

### Error: Webpack build errors

```bash
# ✅ Clear cache and rebuild
rm -rf .next
npm run build

# If persistent, check next.config.js
```

## Deployment Issues

### Error: Environment variables not working

```bash
# ❌ Bad - Not prefixed for client
API_KEY=secret

# ✅ Good - Prefix for client access
NEXT_PUBLIC_API_KEY=secret

# ✅ Server-only variables (no prefix)
DATABASE_URL=postgresql://...
```

### Error: 404 on dynamic routes

```bash
# ✅ Ensure proper folder structure
app/
  posts/
    [slug]/
      page.tsx  # Must be page.tsx, not [slug].tsx
```

### Error: API routes not working

```bash
# ❌ Bad - Wrong location
app/api/users.ts

# ✅ Good - Must be route.ts in folder
app/api/users/route.ts
```

### Error: Vercel deployment fails

```bash
# ✅ Check build logs
# Common issues:
# - Environment variables not set
# - Missing dependencies in package.json
# - Build errors not caught locally

# Test build locally
npm run build
```

### Error: Docker build fails

```dockerfile
# ✅ Ensure standalone output
# next.config.js
module.exports = {
  output: 'standalone',
}

# ✅ Check Dockerfile COPY paths
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
```

## Performance Problems

### Slow page loads

```tsx
// ✅ Use Suspense for slow components
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}

// ✅ Implement proper caching
export const revalidate = 60

// ✅ Use dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />
})
```

### Large bundle size

```bash
# ✅ Analyze bundle
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})

# Run analysis
ANALYZE=true npm run build
```

```tsx
// ✅ Use dynamic imports for large libraries
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('heavy-chart-library'), {
  ssr: false
})
```

### Slow data fetching

```tsx
// ✅ Parallel fetching
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
])

// ✅ Proper caching
const res = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
})

// ✅ Database indexes
// Ensure proper indexes on database queries
```

### Memory leaks

```tsx
// ❌ Bad - Missing cleanup
'use client'
useEffect(() => {
  const interval = setInterval(() => {}, 1000)
}, [])

// ✅ Good - Proper cleanup
'use client'
useEffect(() => {
  const interval = setInterval(() => {}, 1000)
  return () => clearInterval(interval)
}, [])
```

## Common Patterns & Fixes

### Redirect not working

```tsx
// ❌ Bad - Using wrong redirect
import { redirect } from 'next/router' // Old Pages Router

// ✅ Good - App Router redirect
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
}
```

### Metadata not appearing

```tsx
// ❌ Bad - Wrong export
export const metadata = { title: 'Page' } // In Client Component

// ✅ Good - Server Component only
// page.tsx (Server Component)
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title'
}
```

### Cookies not persisting

```tsx
// ❌ Bad - Missing options
response.cookies.set('token', 'value')

// ✅ Good - Proper options
response.cookies.set('token', 'value', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/'
})
```

### Image optimization errors

```tsx
// ❌ Bad - Missing width/height
<Image src="/image.jpg" alt="Image" />

// ✅ Good - With dimensions
<Image
  src="/image.jpg"
  alt="Image"
  width={800}
  height={600}
/>

// ✅ Or use fill for responsive
<div style={{ position: 'relative', height: '400px' }}>
  <Image
    src="/image.jpg"
    alt="Image"
    fill
    style={{ objectFit: 'cover' }}
  />
</div>
```

## Debug Tools

### Enable verbose logging

```bash
# package.json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build --debug"
  }
}
```

### React DevTools

```tsx
// Install React DevTools browser extension
// Add to app for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled')
}
```

### Network inspection

```tsx
// Log all fetch requests
const originalFetch = global.fetch
global.fetch = async (...args) => {
  console.log('Fetch:', args[0])
  return originalFetch(...args)
}
```

## Getting Help

1. **Check Error Stack**: Read the full error message
2. **Search Issues**: Check Next.js GitHub issues
3. **Documentation**: Visit nextjs.org/docs
4. **Community**: Ask on Discord or Stack Overflow
5. **Minimal Reproduction**: Create minimal example to isolate issue

## Best Practices to Avoid Issues

1. **Type Everything**: Use TypeScript strictly
2. **Test Builds**: Run `npm run build` before deploying
3. **Clear Cache**: Regularly clear `.next` directory
4. **Update Dependencies**: Keep Next.js and React updated
5. **Read Docs**: Check migration guides for breaking changes
6. **Use ESLint**: Enable Next.js ESLint rules
7. **Monitor Logs**: Check production logs regularly
