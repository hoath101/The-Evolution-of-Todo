// Use Next.js API routes to proxy requests to Better Auth service
const API_BASE_URL = '/api/auth';
const BETTER_AUTH_BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:4000';

console.log('Better Auth Base URL:', BETTER_AUTH_BASE_URL); // Debug logging

interface AuthResponse {
  user?: any;
  session?: any;
  error?: {
    message: string;
  };
}

// Helper function to get JWT token after authentication
async function getJwtToken(): Promise<{ token?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { error: 'Failed to retrieve JWT token' };
    }

    const data = await response.json();

    if (data.token) {
      return { token: data.token };
    } else {
      return { error: 'No token returned from server' };
    }
  } catch (error: any) {
    return { error: error.message || 'Error retrieving JWT token' };
  }
}

// Export a simplified authentication service with direct fetch requests
export const betterAuthClient = {
  async register(email: string, password: string, name?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: data.error?.message || 'Registration failed',
        };
      }

      // After successful registration, try to get the JWT token
      const tokenResult = await getJwtToken();

      // Store the session token if available in the response or from token endpoint
      if (data.session?.token || tokenResult.token) {
        localStorage.setItem('access_token', data.session?.token || tokenResult.token!);
      }

      // Also store user data if available
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return {
        success: true,
        data: {
          ...data,
          session: {
            ...data.session,
            token: data.session?.token || tokenResult.token
          }
        },
        error: null,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Registration failed',
      };
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: data.error?.message || 'Login failed',
        };
      }

      // After successful login, try to get the JWT token
      const tokenResult = await getJwtToken();

      // Store the session token if available in the response or from token endpoint
      if (data.session?.token || tokenResult.token) {
        localStorage.setItem('access_token', data.session?.token || tokenResult.token!);
      }

      // Also store user data if available
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return {
        success: true,
        data: {
          ...data,
          session: {
            ...data.session,
            token: data.session?.token || tokenResult.token
          }
        },
        error: null,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Login failed',
      };
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Clear stored tokens and user data regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');

      return {
        success: response.ok,
        error: response.ok ? null : 'Logout failed',
      };
    } catch (error: any) {
      // Still remove local data even if the API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');

      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  },

  async getCurrentSession() {
    try {
      // First, try to get the current session from Better Auth
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // We have an active session, get the JWT token if needed
        let token = localStorage.getItem('access_token');

        // If we don't have a token stored or if it's expired, try to get a fresh one
        if (!token) {
          const tokenResponse = await fetch('/api/auth/token', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.token) {
              token = tokenData.token;
              localStorage.setItem('access_token', token);
            }
          }
        }

        return {
          success: true,
          data: {
            user: data.user,
            session: { token }
          },
          error: null,
        };
      } else {
        // No active session, clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');

        return {
          success: false,
          data: null,
          error: 'No active session',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to get session',
      };
    }
  },
};

export default betterAuthClient;