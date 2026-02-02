import { NextRequest } from "next/server";
import { auth } from "../../../../lib/server-auth";
import { serverApiClient } from "../../../../lib/server-api";
import { headers } from "next/headers";

// Helper function to get session
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session.user.id;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const taskId = awaitedParams.id;

  try {
    const userId = await getAuthenticatedUser();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate task ID
    if (!taskId || typeof taskId !== 'string') {
      return new Response(JSON.stringify({
        error: "Invalid request",
        detail: "Task ID is required and must be a string"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Forward request to backend using server API client (now uses JWT)
      const task = await serverApiClient.getTask(userId, taskId);

      return new Response(JSON.stringify(task), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (backendError) {
      console.error(`Backend error in GET /api/tasks/${taskId}:`, backendError);

      // Check if it's a "not found" error from backend
      if (backendError instanceof Error && backendError.message.includes("404")) {
        return new Response(JSON.stringify({
          error: "Task not found",
          detail: "The requested task does not exist"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        error: "Service temporarily unavailable",
        detail: backendError instanceof Error ? backendError.message : "Unknown error"
      }), {
        status: 503, // Service Unavailable
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error(`Server error in GET /api/tasks/${awaitedParams?.id}:`, error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
      detail: "An unexpected error occurred while processing your request"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const taskId = awaitedParams.id;

  try {
    const userId = await getAuthenticatedUser();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate task ID
    if (!taskId || typeof taskId !== 'string') {
      return new Response(JSON.stringify({
        error: "Invalid request",
        detail: "Task ID is required and must be a string"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    // Validate request body
    if (!body.title && !body.description && body.completed === undefined) {
      return new Response(JSON.stringify({
        error: "Invalid request",
        detail: "At least one field (title, description, or completed) must be provided for update"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Forward request to backend using server API client (now uses JWT)
      const updatedTask = await serverApiClient.updateTask(userId, taskId, body);

      return new Response(JSON.stringify(updatedTask), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (backendError) {
      console.error(`Backend error in PUT /api/tasks/${taskId}:`, backendError);

      // Check if it's a "not found" error from backend
      if (backendError instanceof Error && backendError.message.includes("404")) {
        return new Response(JSON.stringify({
          error: "Task not found",
          detail: "The task to update does not exist"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        error: "Service temporarily unavailable",
        detail: backendError instanceof Error ? backendError.message : "Unknown error"
      }), {
        status: 503, // Service Unavailable
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({
        error: "Invalid JSON",
        detail: "Request body contains invalid JSON"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error(`Server error in PUT /api/tasks/${awaitedParams?.id}:`, error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
      detail: "An unexpected error occurred while processing your request"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params;
  const taskId = awaitedParams.id;

  try {
    const userId = await getAuthenticatedUser();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate task ID
    if (!taskId || typeof taskId !== 'string') {
      return new Response(JSON.stringify({
        error: "Invalid request",
        detail: "Task ID is required and must be a string"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Forward request to backend using server API client (now uses JWT)
      await serverApiClient.deleteTask(userId, taskId);

      return new Response(null, { status: 204 });
    } catch (backendError) {
      console.error(`Backend error in DELETE /api/tasks/${taskId}:`, backendError);

      // Check if it's a "not found" error from backend
      if (backendError instanceof Error && backendError.message.includes("404")) {
        return new Response(JSON.stringify({
          error: "Task not found",
          detail: "The task to delete does not exist"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        error: "Service temporarily unavailable",
        detail: backendError instanceof Error ? backendError.message : "Unknown error"
      }), {
        status: 503, // Service Unavailable
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error(`Server error in DELETE /api/tasks/${awaitedParams?.id}:`, error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
      detail: "An unexpected error occurred while processing your request"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}