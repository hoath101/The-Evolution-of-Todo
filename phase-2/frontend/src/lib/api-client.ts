import { getToken } from './auth-client';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Makes authenticated API requests to the Python backend
 */
export const authenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get the JWT token from Better Auth
  const tokenResult = await getToken();

  if (tokenResult.error) {
    throw new Error(`Authentication error: ${tokenResult.error}`);
  }

  const token = tokenResult.token;

  // Prepare headers with the JWT token
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Make the API request to the Python backend
  const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

/**
 * Helper function to make GET requests to the backend
 */
export const getBackend = async (endpoint: string, options: RequestInit = {}) => {
  return authenticatedRequest(endpoint, {
    method: 'GET',
    ...options,
  });
};

/**
 * Helper function to make POST requests to the backend
 */
export const postBackend = async (endpoint: string, body: any, options: RequestInit = {}) => {
  return authenticatedRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
};

/**
 * Helper function to make PUT requests to the backend
 */
export const putBackend = async (endpoint: string, body: any, options: RequestInit = {}) => {
  return authenticatedRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
};

/**
 * Helper function to make DELETE requests to the backend
 */
export const deleteBackend = async (endpoint: string, options: RequestInit = {}) => {
  return authenticatedRequest(endpoint, {
    method: 'DELETE',
    ...options,
  });
};