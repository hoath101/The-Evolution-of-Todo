import { getSession } from "./auth-client";
import { isSessionData, isErrorResponse, SessionResponse } from "./types";

/**
 * Base API client for backend API calls
 */
export class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use relative URLs to call Next.js API routes instead of external backend
    this.baseUrl = "";
  }

  /**
   * Get authorization header with JWT token for client-side usage
   */
  private async getClientAuthHeaders(): Promise<Record<string, string>> {
    // Import the getToken function to get JWT from Better Auth
    const { getToken } = await import('./auth-client');

    // Get the JWT token from Better Auth
    const tokenResult = await getToken();

    if (tokenResult.error) {
      console.warn("Could not retrieve auth token:", tokenResult.error);
      // Still return content-type header even if token retrieval failed
      return {
        "Content-Type": "application/json",
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenResult.token}`,
    };

    return headers;
  }

  /**
   * Get user ID from session for client-side usage
   */
  private async getClientUserId(): Promise<string> {
    const session: SessionResponse = await getSession();

    // Handle error response
    if (isErrorResponse(session)) {
      throw new Error(session.error || "Session error occurred");
    }

    // Check if we have valid session data
    if (!isSessionData(session)) {
      throw new Error("User not authenticated");
    }

    const userId = (session.user && session.user.id) || (session.user && session.user.email) || '';
    if (!userId) {
      throw new Error("User not authenticated");
    }

    return userId;
  }

  /**
   * Get authorization header with JWT token (can be used in both server and client)
   */
  private async getAuthHeaders(isServerContext: boolean = false): Promise<Record<string, string>> {
    if (isServerContext) {
      // For server-side usage, we'll handle auth differently
      // For now, just return the content-type header
      return {
        "Content-Type": "application/json",
      };
    } else {
      // For client-side usage, use the existing implementation
      return this.getClientAuthHeaders();
    }
  }

  /**
   * Generic request method
   */
  async request<T>(endpoint: string, options: RequestInit = {}, isServerContext: boolean = false): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders(isServerContext);

    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, create a generic error
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Use the constitution error format: {error: string, detail?: string}
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      const errorDetail = errorData.detail || errorData.message || errorData.error_description;

      if (errorDetail) {
        throw new Error(`${errorMessage} - ${errorDetail}`);
      } else {
        throw new Error(errorMessage);
      }
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, isServerContext: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, isServerContext);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, isServerContext: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }, isServerContext);
  }

  /**
   * Create a new task
   */
  async createTask(taskData: { title: string; description?: string }, isServerContext: boolean = false, userId?: string): Promise<any> {
    if (isServerContext) {
      // Server context should not use this method
      throw new Error("Client API methods should not be called from server context");
    }

    // For client-side, call Next.js API routes which will handle auth
    return this.post(`/api/tasks`, taskData, isServerContext);
  }

  /**
   * Get user's tasks
   */
  async getUserTasks(skip: number = 0, limit: number = 100, isServerContext: boolean = false, userId?: string): Promise<any[]> {
    if (isServerContext) {
      throw new Error("Client API methods should not be called from server context");
    }

    return this.get(`/api/tasks?skip=${skip}&limit=${limit}`, isServerContext);
  }

  /**
   * Get a specific task
   */
  async getTask(taskId: string, isServerContext: boolean = false, userId?: string): Promise<any> {
    if (isServerContext) {
      throw new Error("Client API methods should not be called from server context");
    }

    return this.get(`/api/tasks/${taskId}`, isServerContext);
  }

  /**
   * Update a task
   */
  async updateTask(taskId: string, taskData: Partial<{ title: string; description?: string; completed?: boolean }>, isServerContext: boolean = false, userId?: string): Promise<any> {
    if (isServerContext) {
      throw new Error("Client API methods should not be called from server context");
    }

    return this.put(`/api/tasks/${taskId}`, taskData, isServerContext);
  }

  /**
   * Toggle task completion
   */
  async toggleTaskCompletion(taskId: string, isServerContext: boolean = false, userId?: string): Promise<any> {
    if (isServerContext) {
      throw new Error("Client API methods should not be called from server context");
    }

    return this.patch(`/api/tasks/${taskId}/complete`, undefined, isServerContext);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string, isServerContext: boolean = false, userId?: string): Promise<any> {
    if (isServerContext) {
      throw new Error("Client API methods should not be called from server context");
    }

    return this.delete(`/api/tasks/${taskId}`, isServerContext);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, isServerContext: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }, isServerContext);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, isServerContext: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }, isServerContext);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, isServerContext: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, isServerContext);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();