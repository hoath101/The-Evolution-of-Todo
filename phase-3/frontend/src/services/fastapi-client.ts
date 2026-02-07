import { APIResponse } from '../types/auth';
import { Task, TaskRequest, TaskResponse } from '../types/task';
import { ChatRequest, ChatResponse, ChatHistoryResponse } from '../types/chat';

class FastAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const token = localStorage.getItem('access_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT token to all requests if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      return {
        success: response.ok,
        data,
        statusCode: response.status,
        error: response.ok ? undefined : data.detail || 'Request failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        statusCode: 0,
      };
    }
  }

  // Task-related methods
  async getTasks(): Promise<TaskResponse> {
    return this.makeRequest<Task[]>('/api/tasks');
  }

  async createTask(task: TaskRequest): Promise<TaskResponse> {
    return this.makeRequest<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(taskId: string, task: Partial<TaskRequest>): Promise<TaskResponse> {
    return this.makeRequest<Task>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async updateTaskCompletion(taskId: string, isCompleted: boolean): Promise<TaskResponse> {
    return this.makeRequest<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    });
  }

  async deleteTask(taskId: string): Promise<TaskResponse> {
    return this.makeRequest<Task>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Chat-related methods
  async sendMessage(userId: string, message: ChatRequest): Promise<APIResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>(`/api/${userId}/chat`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async getChatHistory(userId: string): Promise<ChatHistoryResponse> {
    // This is a placeholder - actual implementation depends on the backend API
    // For now, we'll return an empty array as the backend might not have this endpoint yet
    return {
      success: true,
      data: [],
      statusCode: 200,
    };
  }

  // Generic methods for other operations
  async get(endpoint: string) {
    return this.makeRequest(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }
}

export const fastAPIClient = new FastAPIClient();
export default fastAPIClient;