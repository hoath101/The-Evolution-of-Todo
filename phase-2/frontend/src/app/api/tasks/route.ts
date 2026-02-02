import { NextRequest } from "next/server";
import { auth } from "../../../lib/server-auth";
import { serverApiClient } from "../../../lib/server-api";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get the session server-side to validate authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract user ID from session
    const userId = session.user.id;

    // Parse query parameters
    const url = new URL(request.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    try {
      // Forward request to backend using server API client (now uses JWT)
      const tasks = await serverApiClient.getUserTasks(userId, skip, limit);

      return new Response(JSON.stringify(tasks), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (backendError) {
      console.error("Backend error in GET /api/tasks:", backendError);
      return new Response(JSON.stringify({
        error: "Service temporarily unavailable",
        detail: backendError instanceof Error ? backendError.message : "Unknown error"
      }), {
        status: 503, // Service Unavailable
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Server error in GET /api/tasks:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
      detail: "An unexpected error occurred while processing your request"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session server-side to validate authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract user ID from session
    const userId = session.user.id;

    // Parse request body
    const body = await request.json();

    // Validate request body
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return new Response(JSON.stringify({
        error: "Invalid request",
        detail: "Title is required and must be a non-empty string"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Forward request to backend using server API client (now uses JWT)
      const newTask = await serverApiClient.createTask(userId, body);

      return new Response(JSON.stringify(newTask), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (backendError) {
      console.error("Backend error in POST /api/tasks:", backendError);
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

    console.error("Server error in POST /api/tasks:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
      detail: "An unexpected error occurred while processing your request"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}