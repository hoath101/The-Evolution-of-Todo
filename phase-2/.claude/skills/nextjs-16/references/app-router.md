# App Router Reference

Advanced routing patterns and features in Next.js 16 App Router.

## Table of Contents

- Parallel Routes
- Intercepting Routes
- Route Groups
- Route Handlers
- Metadata & SEO
- Advanced Layout Patterns

## Parallel Routes

Parallel routes allow rendering multiple pages in the same layout simultaneously using named slots.

### Basic Pattern

```
app/
├── layout.tsx
├── @team/
│   └── page.tsx
├── @analytics/
│   └── page.tsx
└── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode
  team: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <>
      <div>{children}</div>
      <div>{team}</div>
      <div>{analytics}</div>
    </>
  )
}
```

### Conditional Rendering

```tsx
export default function Layout({ children, team, analytics }: Props) {
  const showAnalytics = checkPermission()

  return (
    <>
      {children}
      {team}
      {showAnalytics && analytics}
    </>
  )
}
```

### Default Fallback

Create `default.tsx` for unmatched routes:

```tsx
// app/@team/default.tsx
export default function Default() {
  return null // or fallback UI
}
```

## Intercepting Routes

Intercept routes to show content in a modal while preserving the URL.

### Convention

- `(.)` - same level
- `(..)` - one level up
- `(..)(..)` - two levels up
- `(...)` - from root

### Example: Photo Modal

```
app/
├── @modal/
│   └── (.)photos/
│       └── [id]/
│           └── page.tsx
├── photos/
│   └── [id]/
│       └── page.tsx
└── layout.tsx
```

```tsx
// app/layout.tsx
export default function Layout({ children, modal }: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

```tsx
// app/@modal/(.)photos/[id]/page.tsx
import { Modal } from '@/components/Modal'

export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <img src={`/photos/${params.id}.jpg`} alt="Photo" />
    </Modal>
  )
}
```

```tsx
// app/photos/[id]/page.tsx
export default function PhotoPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <img src={`/photos/${params.id}.jpg`} alt="Photo" />
    </div>
  )
}
```

## Route Groups

Route groups organize routes without affecting URL structure using `(folderName)`.

### Organization Without URL Impact

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx      # /about
│   └── blog/
│       └── page.tsx      # /blog
├── (shop)/
│   ├── products/
│   │   └── page.tsx      # /products
│   └── cart/
│       └── page.tsx      # /cart
└── page.tsx             # /
```

### Multiple Root Layouts

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <MarketingNav />
        {children}
      </body>
    </html>
  )
}

// app/(shop)/layout.tsx
export default function ShopLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <ShopNav />
        {children}
      </body>
    </html>
  )
}
```

### Opting Out of Layout

```
app/
├── (dashboard)/
│   ├── layout.tsx
│   ├── analytics/
│   │   └── page.tsx      # Uses dashboard layout
│   └── (without-sidebar)/
│       └── settings/
│           └── page.tsx  # Skips dashboard layout
└── layout.tsx
```

## Route Handlers

Route handlers are API endpoints in the App Router.

### All HTTP Methods

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  return NextResponse.json({ query })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json(body, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json(body)
}

export async function DELETE(request: NextRequest) {
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json(body)
}
```

### Request Helpers

```tsx
export async function GET(request: NextRequest) {
  // URL params
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  // Headers
  const authorization = request.headers.get('authorization')

  // Cookies
  const token = request.cookies.get('token')

  return NextResponse.json({ id, authorization, token })
}
```

### Response Helpers

```tsx
// JSON response
return NextResponse.json({ data: 'value' })

// With status
return NextResponse.json({ error: 'Not found' }, { status: 404 })

// With headers
return NextResponse.json({ data: 'value' }, {
  headers: { 'X-Custom': 'value' }
})

// Redirect
return NextResponse.redirect(new URL('/login', request.url))

// Set cookies
const response = NextResponse.json({ success: true })
response.cookies.set('token', 'abc123')
return response
```

## Metadata & SEO

### Static Metadata

```tsx
// app/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home Page',
  description: 'Welcome to our website',
}

export default function Page() {
  return <div>Home</div>
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage],
    },
  }
}

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}
```

### Metadata Fields

```tsx
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  authors: [{ name: 'Author Name' }],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    images: ['/og-image.jpg'],
    type: 'website',
    url: 'https://example.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter Title',
    description: 'Twitter Description',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}
```

### Title Template

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
}

// app/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog', // Becomes "Blog | My App"
}
```

## Advanced Layout Patterns

### Persistent State Across Routes

```tsx
// app/layout.tsx
'use client'

import { useState } from 'react'
import { SidebarContext } from '@/contexts/sidebar'

export default function Layout({ children }: Props) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="flex">
        <Sidebar />
        <main>{children}</main>
      </div>
    </SidebarContext.Provider>
  )
}
```

### Loading Specific Sections

```tsx
// app/dashboard/layout.tsx
import { Suspense } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Analytics } from '@/components/Analytics'

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex">
      <Sidebar />
      <main>
        {children}
        <Suspense fallback={<div>Loading analytics...</div>}>
          <Analytics />
        </Suspense>
      </main>
    </div>
  )
}
```

### Conditional Layouts

```tsx
// app/layout.tsx
import { headers } from 'next/headers'

export default function Layout({ children }: Props) {
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const isMobile = /mobile/i.test(userAgent)

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>
  }

  return <DesktopLayout>{children}</DesktopLayout>
}
```

### Authentication Layout

```tsx
// app/(auth)/layout.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function AuthLayout({ children }: Props) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <AuthNav user={session.user} />
      {children}
    </div>
  )
}
```

## Route Segment Config

Configure route behavior with segment config options:

```tsx
// app/dashboard/page.tsx

// Dynamic rendering
export const dynamic = 'force-dynamic' // 'auto' | 'force-dynamic' | 'error' | 'force-static'

// Revalidate
export const revalidate = 60 // false | 0 | number

// Runtime
export const runtime = 'edge' // 'nodejs' | 'edge'

// Fetch cache
export const fetchCache = 'default-cache' // 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'

export default function Page() {
  return <div>Dashboard</div>
}
```

## Best Practices

1. **Use Route Groups** for organization without affecting URLs
2. **Parallel Routes** for dashboards and split views
3. **Intercepting Routes** for modals and overlays
4. **Metadata Functions** for dynamic SEO
5. **Loading States** with loading.tsx for better UX
6. **Error Boundaries** with error.tsx for resilience
7. **Segment Config** for fine-grained control
