import { NextRequest } from "next/server";
import { auth } from "../../../../../lib/server-auth";
import { serverApiClient } from "../../../../../lib/server-api";
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      const updatedTask = await serverApiClient.toggleTaskCompletion(userId, taskId);

      return new Response(JSON.stringify(updatedTask), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (backendError) {
      console.error(`Backend error in PATCH /api/tasks/${taskId}/complete:`, backendError);

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
    console.error(`Server error in PATCH /api/tasks/${awaitedParams?.id}/complete:`, error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
      detail: "An unexpected error occurred while processing your request"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}