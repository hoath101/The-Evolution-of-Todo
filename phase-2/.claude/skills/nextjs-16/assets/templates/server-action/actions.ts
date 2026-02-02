// Template: Server Actions with form handling and validation
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schemas
const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  published: z.boolean().default(false),
})

const updateSchema = createSchema.partial()

// Types
type FormState = {
  success?: boolean
  error?: string
  errors?: Record<string, string[]>
}

// Create action (with FormData)
export async function createPost(formData: FormData): Promise<FormState> {
  try {
    // Extract and validate data
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      published: formData.get('published') === 'on',
    }

    const validated = createSchema.parse(rawData)

    // Create in database (replace with your logic)
    await db.post.create({
      data: validated,
    })

    // Revalidate the posts page
    revalidatePath('/posts')

    // Or revalidate by tag
    revalidateTag('posts')

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    console.error('Create error:', error)
    return { error: 'Failed to create post' }
  }
}

// Create action with useFormState (progressive enhancement)
export async function createPostWithState(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      published: formData.get('published') === 'on',
    }

    const validated = createSchema.parse(rawData)

    await db.post.create({
      data: validated,
    })

    revalidatePath('/posts')

    // Optionally redirect after success
    // redirect('/posts')

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    console.error('Create error:', error)
    return { error: 'Failed to create post' }
  }
}

// Update action
export async function updatePost(
  id: string,
  formData: FormData
): Promise<FormState> {
  try {
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      published: formData.get('published') === 'on',
    }

    const validated = updateSchema.parse(rawData)

    await db.post.update({
      where: { id },
      data: validated,
    })

    revalidatePath('/posts')
    revalidatePath(`/posts/${id}`)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Validation failed',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    console.error('Update error:', error)
    return { error: 'Failed to update post' }
  }
}

// Delete action
export async function deletePost(id: string): Promise<FormState> {
  try {
    await db.post.delete({
      where: { id },
    })

    revalidatePath('/posts')

    // Redirect after deletion
    redirect('/posts')
  } catch (error) {
    console.error('Delete error:', error)
    return { error: 'Failed to delete post' }
  }
}

// Programmatic action (called from client with arguments)
export async function togglePublished(id: string): Promise<FormState> {
  try {
    const post = await db.post.findUnique({
      where: { id },
      select: { published: true },
    })

    if (!post) {
      return { error: 'Post not found' }
    }

    await db.post.update({
      where: { id },
      data: { published: !post.published },
    })

    revalidatePath('/posts')
    revalidatePath(`/posts/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Toggle error:', error)
    return { error: 'Failed to toggle published status' }
  }
}

// Bulk action
export async function bulkDeletePosts(ids: string[]): Promise<FormState> {
  try {
    await db.post.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    revalidatePath('/posts')

    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    return { error: 'Failed to delete posts' }
  }
}

// Example database client (replace with your implementation)
const db = {
  post: {
    create: async (data: any) => {
      // Your database logic
      return { id: '1', ...data.data }
    },
    update: async (args: any) => {
      // Your database logic
      return { id: args.where.id, ...args.data }
    },
    delete: async (args: any) => {
      // Your database logic
    },
    deleteMany: async (args: any) => {
      // Your database logic
    },
    findUnique: async (args: any) => {
      // Your database logic
      return { id: args.where.id, published: false }
    },
  },
}
