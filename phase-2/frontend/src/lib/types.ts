// Type definitions for Better Auth session
// Based on BetterAuth's standard user and session types and database schema

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean; // Based on schema: DEFAULT false NOT NULL
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// Response types for authentication operations
// Account for JWT plugin which adds token field and can modify response structure

// Response data formats can vary based on plugins and operations
export type SignUpResponseData = {
  user: User;
  session: Session;
} | {
  user: User;
  token?: string | null;
};

export type SignInResponseData = {
  user: User;
  session: Session;
} | {
  user: User;
  token?: string;
  redirect?: boolean;
  url?: string;
};

export type GetSessionResponseData = {
  user: User;
  session: Session;
} | null;

// BetterAuth actually returns an object that may have both data and error as potentially null
// The actual response follows a pattern where exactly one of data/error is present
export type SignUpResult = {
  data?: SignUpResponseData | null;
  error?: {
    message?: string;
    code?: string;
  } | null;
};

export type SignInResult = {
  data?: SignInResponseData | null;
  error?: {
    message?: string;
    code?: string;
  } | null;
};

export type GetSessionResult = {
  data?: GetSessionResponseData | null;
  error?: {
    message?: string;
    code?: string;
  } | null;
};

export type SignOutResult = {
  data?: {
    success: boolean;
  } | null;
  error?: {
    message?: string;
    code?: string;
  } | null;
};

// Additional types for session handling
export interface SessionData {
  user: User;
  session: Session;
}

// Union type for session response that can be either data or error
// Made compatible with both simple format and BetterAuth's GetSessionResult format
export type SessionResponse = SessionData | { error: string } | GetSessionResult | null;

// Helper type guard functions
// Note: When SessionResponse includes GetSessionResult, we need to handle both formats
export function isSessionData(response: SessionResponse): response is SessionData {
  if (response === null || typeof response !== 'object') {
    return false;
  }

  // Check if it's the simple SessionData format (user and session, no error)
  if ('user' in response && 'session' in response && !('error' in response as any)) {
    const user = (response as SessionData).user;
    const session = (response as SessionData).session;
    return Boolean(user?.id && session?.id);
  }

  // Check if it's the GetSessionResult format with data
  if ((response as GetSessionResult).data && typeof (response as GetSessionResult).data === 'object') {
    // Check if data contains both user and session (traditional format)
    if ('user' in (response as GetSessionResult).data! && 'session' in (response as GetSessionResult).data!) {
      const userData = (response as GetSessionResult).data!.user;
      const sessionData = (response as GetSessionResult).data!.session;
      return Boolean(userData?.id && sessionData?.id);
    }

    // Or check if data itself looks like a user object (could happen with JWT plugin)
    const dataAsUser = (response as GetSessionResult).data;
    if (dataAsUser && typeof dataAsUser === 'object' && 'id' in dataAsUser && ('email' in dataAsUser || 'name' in dataAsUser)) {
      return Boolean(dataAsUser.id);
    }
  }

  return false;
}

export function isErrorResponse(response: SessionResponse): response is { error: string } {
  if (response === null || typeof response !== 'object') {
    return false;
  }

  // Check if it's the simple error format
  if ('error' in response && typeof (response as { error: string }).error === 'string') {
    return true;
  }

  // Check if it's the GetSessionResult error format
  if ('error' in response && (response as GetSessionResult).error) {
    const errorObj = (response as GetSessionResult).error;
    return Boolean(errorObj &&
           (typeof errorObj.message === 'string' || typeof errorObj.code === 'string'));
  }

  return false;
}

// Utility functions to convert BetterAuth results to the simpler SessionResponse format
export function toSessionResponse(result: GetSessionResult): SessionResponse {
  if (result.error) {
    return { error: result.error.message || result.error.code || "Unknown error" };
  }
  // Handle the case where data might be undefined
  return result.data !== undefined ? result.data : null;
}

