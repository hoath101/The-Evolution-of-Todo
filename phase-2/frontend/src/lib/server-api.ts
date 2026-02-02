import { SignJWT } from 'jose';
import { auth } from "./server-auth";

/**
 * Server-side API client for backend API calls
 */
export class ServerApiClient {
  private baseUrl: string;

  constructor() {
    // Normalize backend URL to remove /run fragment
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://todo-workspace-12hammad.hf.space/api";
  }

  /**
   * Create a JWT token with user identity for backend authentication
   */
  private async createJwtToken(userId: string): Promise<string> {
    const secret = new TextEncoder().encode(
      process.env.JWT_SIGNING_SECRET || "fallback_secret_for_dev"
    );

    const jwt = await new SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setIssuer('todo-workspace')
      .sign(secret);

    return jwt;
  }

  /**
   * Get authorization headers with JWT token from Better Auth session
   */
  private async getAuthHeaders(userId: string): Promise<Record<string, string>> {
    // Create JWT token with user identity
    const jwtToken = await this.createJwtToken(userId);

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`,  // Use standard Authorization header with JWT
    };
  }

  /**
   * Generic request method for server-side usage with enhanced error handling
   */
  async request<T>(endpoint: string, options: RequestInit = {}, userId: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get authentication headers with user ID validation
    const authHeaders = await this.getAuthHeaders(userId);

    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    };

    try {
      const response = await fetch(url, config);

      // Check if the backend service is available
      if (response.status === 404) {
        throw new Error(`Backend service endpoint not found: ${url}. The service may be unavailable.`);
      }

      if (response.status >= 500) {
        throw new Error(`Backend service error: ${response.status} - ${response.statusText}`);
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, create a generic error
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
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
    } catch (error) {
      if (error instanceof TypeError && 'message' in error && typeof error.message === 'string' && error.message.includes('fetch')) {
        throw new Error("Network error: Unable to connect to backend service. Please check your internet connection and try again.");
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Request timeout: Backend service took too long to respond. Please try again.");
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, userId: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, userId);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, userId: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }, userId);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, userId: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }, userId);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, userId: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }, userId);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, userId: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, userId);
  }

  /**
   * Create a new task
   */
  async createTask(userId: string, taskData: { title: string; description?: string }): Promise<any> {
    return this.post("/tasks", userId, taskData);  // Remove user_id from URL
  }

  /**
   * Get user's tasks
   */
  async getUserTasks(userId: string, skip: number = 0, limit: number = 100): Promise<any[]> {
    return this.get(`/tasks?skip=${skip}&limit=${limit}`, userId);  // Remove user_id from URL
  }

  /**
   * Get a specific task
   */
  async getTask(userId: string, taskId: string): Promise<any> {
    return this.get(`/tasks/${taskId}`, userId);  // Remove user_id from URL
  }

  /**
   * Update a task
   */
  async updateTask(userId: string, taskId: string, taskData: Partial<{ title: string; description?: string; completed?: boolean }>): Promise<any> {
    return this.put(`/tasks/${taskId}`, userId, taskData);  // Remove user_id from URL
  }

  /**
   * Toggle task completion
   */
  async toggleTaskCompletion(userId: string, taskId: string): Promise<any> {
    return this.patch(`/tasks/${taskId}/complete`, userId, undefined);  // Remove user_id from URL
  }

  /**
   * Delete a task
   */
  async deleteTask(userId: string, taskId: string): Promise<any> {
    return this.delete(`/tasks/${taskId}`, userId);  // Remove user_id from URL
  }
}

// Export singleton instance
export const serverApiClient = new ServerApiClient();