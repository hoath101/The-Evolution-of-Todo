import { JWTUtils } from './jwt-utils';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string, defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get the access token from storage
      const token = JWTUtils.getToken();

      // Add authorization header if token exists
      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: responseData,
        };
      } else {
        return {
          success: false,
          error: responseData.error || 'Request failed',
          message: responseData.message,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  // Method to check if the token is still valid before making requests
  async isTokenValid(): Promise<boolean> {
    const token = JWTUtils.getToken();
    return token !== null && !JWTUtils.isTokenExpired(token);
  }

  // Method to refresh the token if needed
  async refreshTokenIfNeeded(): Promise<boolean> {
    const token = JWTUtils.getToken();

    if (token && JWTUtils.isTokenExpired(token)) {
      // Token is expired, need to refresh or require re-login
      // For now, we'll just return false indicating the user needs to re-authenticate
      return false;
    }

    return true;
  }
}

// Create a default API service instance
export const apiService = new ApiService(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
);

export default ApiService;