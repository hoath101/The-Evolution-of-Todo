import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { SignUpResult, SignInResult, GetSessionResult, SignOutResult } from "./types";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://todo-workspace.vercel.app",
  signInCallbackURL: "/tasks",
  signOutCallbackURL: "/sign-in",
  plugins: [
    jwtClient({
      // Configure the JWT client plugin to work properly with session management
    })
  ]
});

// Wrapper functions for authentication with proper Better Auth response handling
export const signUp = async (
  params: {
    email: string;
    password: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    callbackURL?: string;
  }
): Promise<SignUpResult> => {
  try {
    // Construct the name from firstName and lastName if name is not provided
    const constructedName = params.name || `${params.firstName || ''} ${params.lastName || ''}`.trim();

    if (!constructedName) {
      return {
        error: {
          message: "Name is required for sign up"
        }
      };
    }

    // Validate inputs before sending to Better Auth
    if (!params.email || !params.password) {
      return {
        error: {
          message: "Email and password are required"
        }
      };
    }

    // Ensure email is a string and password meets minimum length requirements
    const email = String(params.email).trim();
    const password = String(params.password);

    if (!email || !password) {
      return {
        error: {
          message: "Email and password are required and must be valid strings"
        }
      };
    }

    if (password.length < 8) {
      return {
        error: {
          message: "Password must be at least 8 characters long"
        }
      };
    }

    const signUpParams = {
      email: email,
      password: password,
      name: constructedName,
      ...(params.callbackURL && { callbackURL: params.callbackURL })
    };

    console.log("Making sign up request with params:", signUpParams); // Log for debugging

    const result = await authClient.signUp.email(signUpParams);

    console.log("Sign up response received:", result); // Log for debugging

    // Return the result as-is since it already follows BetterAuth's { data, error } format
    return result;
  } catch (error) {
    console.error("SignUp error details:", error);

    // Handle different types of errors more specifically
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;
      if (status === 422) {
        console.error("422 Unprocessable Entity error occurred during sign up");
        return {
          error: {
            message: "Invalid input provided. Please check your email, password, and name, and ensure they meet the requirements."
          }
        };
      }
    }

    return {
      error: {
        message: error instanceof Error ? error.message : "Sign up failed"
      }
    };
  }
};

export const signIn = async (
  params: {
    email: string;
    password: string;
    callbackURL?: string;
  }
): Promise<SignInResult> => {
  try {
    // Validate inputs before sending to Better Auth
    if (!params.email || !params.password) {
      return {
        error: {
          message: "Email and password are required"
        }
      };
    }

    // Ensure email is a string and password is a string
    const email = String(params.email).trim();
    const password = String(params.password);

    if (!email || !password) {
      return {
        error: {
          message: "Email and password are required and must be valid strings"
        }
      };
    }

    const signInParams: {
      email: string;
      password: string;
      callbackURL?: string;
    } = {
      email: email,
      password: password,
      ...(params.callbackURL && { callbackURL: params.callbackURL })
    };

    const result = await authClient.signIn.email(signInParams);

    // Return the result as-is since it already follows BetterAuth's { data, error } format
    return result;
  } catch (error) {
    console.error("SignIn error:", error);
    return {
      error: {
        message: error instanceof Error ? error.message : "Sign in failed"
      }
    };
  }
};

export const signOut = async (): Promise<SignOutResult> => {
  try {
    const result = await authClient.signOut();

    // Return the result as-is since it already follows BetterAuth's { data, error } format
    return result;
  } catch (error) {
    console.error("SignOut error:", error);
    return {
      error: {
        message: error instanceof Error ? error.message : "Sign out failed"
      }
    };
  }
};

export const getToken = async (): Promise<{ token?: string; error?: { message: string; code?: string } }> => {
  try {
    // With JWT plugin, use the dedicated token method to get JWT
    const tokenResult = await authClient.token();

    if (tokenResult.error) {
      console.error("Token retrieval error:", tokenResult.error);
      return { error: { message: tokenResult.error.message || "Token retrieval failed" } };
    }

    if (tokenResult.data) {
      return {
        token: tokenResult.data.token
      };
    }

    return { error: { message: "No active session found" } };
  } catch (error) {
    console.error("Token retrieval error:", error);
    return { error: { message: error instanceof Error ? error.message : "Failed to retrieve token" } };
  }
};

export const getSession = async (): Promise<GetSessionResult> => {
  try {
    const result = await authClient.getSession();

    // Log the raw result for debugging (remove in production)
    console.log("Raw getSession result:", result);

    // Return the result as-is since it already follows BetterAuth's { data, error } format
    return result;
  } catch (error) {
    console.error("GetSession error:", error);
    return {
      error: {
        message: error instanceof Error ? error.message : "Failed to get session"
      }
    };
  }
};
