export interface UserSession {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user?: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}