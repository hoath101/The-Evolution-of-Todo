// Template: API Route Handler with error handling and validation
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Request validation schema
const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).optional(),
})

// GET - Retrieve resources
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    // Fetch data (replace with your logic)
    const data = await fetchData(parseInt(page), parseInt(limit))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      }
    })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST - Create resource
export async function POST(request: NextRequest) {
  try {
    // Parse and validate body
    const body = await request.json()
    const validated = requestSchema.parse(body)

    // Create resource (replace with your logic)
    const created = await createResource(validated)

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}

// PUT - Update resource
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = requestSchema.partial().parse(body)

    // Update resource (replace with your logic)
    const updated = await updateResource(validated)

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('PUT Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

// DELETE - Delete resource
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    // Delete resource (replace with your logic)
    await deleteResource(id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}

// Helper functions (replace with your implementation)
async function fetchData(page: number, limit: number) {
  // Your data fetching logic
  return []
}

async function createResource(data: z.infer<typeof requestSchema>) {
  // Your creation logic
  return data
}

async function updateResource(data: Partial<z.infer<typeof requestSchema>>) {
  // Your update logic
  return data
}

async function deleteResource(id: string) {
  // Your deletion logic
}
