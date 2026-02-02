// Template: Server Component with data fetching
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Types
interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

interface DataType {
  id: string
  title: string
  description: string
  createdAt: string
}

// Generate metadata dynamically
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await fetchData(params.id)

  if (!data) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
    },
  }
}

// Main server component
export default async function Page({ params, searchParams }: PageProps) {
  // Fetch data on the server
  const data = await fetchData(params.id)

  // Handle not found
  if (!data) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <p className="text-gray-600 mb-8">{data.description}</p>

      {/* Use Suspense for slow components */}
      <Suspense fallback={<LoadingSkeleton />}>
        <RelatedData id={params.id} />
      </Suspense>

      {/* Static content renders immediately */}
      <Footer />
    </div>
  )
}

// Data fetching function (runs on server)
async function fetchData(id: string): Promise<DataType | null> {
  try {
    const res = await fetch(`https://api.example.com/data/${id}`, {
      // Cache for 60 seconds
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

// Slow component with its own data fetching
async function RelatedData({ id }: { id: string }) {
  // This can be slow - wrapped in Suspense
  const related = await fetchRelatedData(id)

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Related Items</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((item) => (
          <div key={item.id} className="border p-4 rounded">
            <h3 className="font-medium">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

async function fetchRelatedData(id: string) {
  const res = await fetch(`https://api.example.com/related/${id}`, {
    next: { revalidate: 300 } // Cache for 5 minutes
  })
  return res.json()
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}

// Footer component
function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t text-center text-gray-500">
      <p>&copy; 2024 Your Company</p>
    </footer>
  )
}
