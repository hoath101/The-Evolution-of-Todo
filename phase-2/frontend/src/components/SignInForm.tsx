"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "../lib/auth-client";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      // Call signIn and ensure we handle the response properly
      const response = await signIn({
        email,
        password,
        callbackURL: "/tasks"
      });

      // Check if the response indicates an error
      if (response && typeof response === 'object' && 'error' in response) {
        // Ensure error is always a string to prevent React rendering issues
        const errorMessage = response.error || "Sign in failed";
        let userFriendlyMessage = "Sign in failed";

        // Provide more specific user-friendly messages based on the error
        if (typeof errorMessage === 'string') {
          if (errorMessage.toLowerCase().includes('invalid')) {
            userFriendlyMessage = "Invalid email or password. Please try again.";
          } else if (errorMessage.toLowerCase().includes('credentials')) {
            userFriendlyMessage = "Incorrect credentials. Please check your email and password.";
          } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
            userFriendlyMessage = "Unable to connect to the server. Please check your internet connection.";
          } else if (errorMessage.toLowerCase().includes('500') || errorMessage.toLowerCase().includes('internal server error')) {
            userFriendlyMessage = "We're experiencing technical difficulties during sign in. This might be related to our authentication service. Please try again later, and if the problem persists, contact support.";
          } else {
            userFriendlyMessage = errorMessage;
          }
        } else {
          userFriendlyMessage = JSON.stringify(errorMessage);
        }

        setError(userFriendlyMessage);
        return;
      }

      // If we get here, the sign in was successful
      // Redirect to tasks page after successful sign in
      router.push("/tasks");
      router.refresh(); // Refresh to update the UI
    } catch (err) {
      console.error("Sign in error:", err);

      // Handle various error types gracefully
      if (err && typeof err === 'object' && 'status' in err && 'statusText' in err) {
        // This is likely a response object with status and statusText
        const statusCode = err.status;
        let userFriendlyMessage = "";

        // Specific handling for 500 Internal Server Error
        if (statusCode === 500) {
          userFriendlyMessage = "We're experiencing technical difficulties during sign in. This might be related to our authentication service. Please try again later, and if the problem persists, contact support.";
        } else {
          // Provide more user-friendly messages based on common HTTP status codes
          switch(statusCode) {
            case 400:
              userFriendlyMessage = "Invalid request. Please check your input.";
              break;
            case 401:
              userFriendlyMessage = "Unauthorized. Please check your credentials.";
              break;
            case 403:
              userFriendlyMessage = "Access denied. You don't have permission to perform this action.";
              break;
            case 404:
              userFriendlyMessage = "Sign in service temporarily unavailable. Please try again later.";
              break;
            case 502:
            case 503:
            case 504:
              userFriendlyMessage = "Service temporarily unavailable. Please check your internet connection and try again.";
              break;
            default:
              userFriendlyMessage = `We encountered an unexpected error (${statusCode}). Please try again.`;
          }
        }
        setError(userFriendlyMessage);
      } else if (err instanceof Error) {
        // Handle Error objects
        if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
          setError("Unable to connect to the server. Please check your internet connection.");
        } else if (err.message.toLowerCase().includes('invalid')) {
          setError("Invalid email or password. Please try again.");
        } else if (err.message.toLowerCase().includes('credentials')) {
          setError("Incorrect credentials. Please check your email and password.");
        } else if (err.message.toLowerCase().includes('500') || err.message.toLowerCase().includes('internal server error')) {
          setError("We're experiencing technical difficulties during sign in. Our team has been notified. Please try again later.");
        } else {
          setError(err.message);
        }
      } else if (typeof err === 'string') {
        // Handle string errors
        if (err.toLowerCase().includes('500') || err.toLowerCase().includes('internal server error')) {
          setError("We're experiencing technical difficulties during sign in. Our team has been notified. Please try again later.");
        } else {
          setError(err);
        }
      } else {
        // Handle unknown error types
        setError("Something went wrong during sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 transition-all duration-300 hover:shadow-md">
          <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-300 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/sign-up" className="font-semibold text-indigo-600 hover:text-indigo-500 transition duration-300">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}