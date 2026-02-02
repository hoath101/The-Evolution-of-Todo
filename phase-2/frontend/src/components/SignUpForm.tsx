"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "../lib/auth-client";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false); // Make sure to reset loading state
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Register the user using the signUp function
      // Use the name field with proper validation
      const trimmedName = name.trim();

      if (!trimmedName) {
        setError("Name is required");
        setIsLoading(false);
        return;
      }

      const response = await signUp({
        name: trimmedName,
        email,
        password,
        callbackURL: "/tasks"
      });

      // Check if the response indicates an error in the Better Auth format
      const hasError = response &&
        typeof response === 'object' &&
        response.error !== null &&
        response.error !== undefined;

      // Check if the response indicates success (has data and no error)
      const hasSuccessData = response &&
        typeof response === 'object' &&
        response.data !== null &&
        response.data !== undefined &&
        (response.error === null || response.error === undefined);

      if (hasError) {
        // Extract error information from Better Auth response format
        let errorMessage: string = "Sign up failed";

        if (response.error && typeof response.error === 'object') {
          // Handle error object with message and/or code properties
          const errorObj = response.error;
          if (errorObj && 'message' in errorObj && errorObj.message) {
            errorMessage = (errorObj as any).message as string;
          } else if (errorObj && 'code' in errorObj && errorObj.code) {
            errorMessage = (errorObj as any).code as string;
          } else {
            errorMessage = JSON.stringify(response.error);
          }
        } else if (response.error && typeof response.error === 'string') {
          errorMessage = response.error;
        }

        let userFriendlyMessage = "Sign up failed";

        // Provide more specific user-friendly messages based on the error
        if (typeof errorMessage === 'string') {
          if (errorMessage.toLowerCase().includes('exists') || errorMessage.toLowerCase().includes('duplicate')) {
            userFriendlyMessage = "An account with this email already exists. Please try signing in instead.";
          } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('validation')) {
            userFriendlyMessage = "Invalid input. Please check your email or password and try again.";
          } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
            userFriendlyMessage = "Unable to connect to the server. Please check your internet connection.";
          } else if (errorMessage.toLowerCase().includes('500') || errorMessage.toLowerCase().includes('internal server error')) {
            userFriendlyMessage = "We're experiencing technical difficulties during registration. Our team has been notified. Please try again later.";
          } else {
            userFriendlyMessage = errorMessage;
          }
        } else {
          userFriendlyMessage = JSON.stringify(errorMessage);
        }

        setError(userFriendlyMessage);
        setIsLoading(false);
        return;
      }

      // Check for success response (data present and no error)
      if (hasSuccessData) {
        // If we get here, the sign up was successful
        // Redirect to tasks page after successful sign up
        router.push("/tasks");
        router.refresh(); // Refresh to update the UI
        return;
      }

      // Fallback: if neither success nor error conditions are met clearly, show generic error
      setError("Sign up failed. Unexpected response format.");
      setIsLoading(false);
    } catch (err) {
      console.error("Sign up error:", err);

      // Handle various error types gracefully
      if (err && typeof err === 'object' && 'status' in err && 'statusText' in err) {
        // This is likely a response object with status and statusText
        const statusCode = err.status;
        let userFriendlyMessage = "";

        // Specific handling for 500 Internal Server Error
        if (statusCode === 500) {
          userFriendlyMessage = "We're experiencing technical difficulties during registration. This might be related to our authentication service. Please try again later, and if the problem persists, contact support.";
        } else {
          // Provide more user-friendly messages based on common HTTP status codes
          switch(statusCode) {
            case 400:
              userFriendlyMessage = "Invalid request. Please check your email or password and try again.";
              break;
            case 401:
              userFriendlyMessage = "Unauthorized. Please check your credentials.";
              break;
            case 403:
              userFriendlyMessage = "Access denied. You don't have permission to perform this action.";
              break;
            case 404:
              userFriendlyMessage = "Registration service temporarily unavailable. Please try again later.";
              break;
            case 409:
              userFriendlyMessage = "An account with this email already exists. Please try signing in instead.";
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
        } else if (err.message.toLowerCase().includes('exists') || err.message.toLowerCase().includes('duplicate')) {
          setError("An account with this email already exists. Please try signing in instead.");
        } else if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('validation')) {
          setError("Invalid input. Please check your email or password and try again.");
        } else if (err.message.toLowerCase().includes('500') || err.message.toLowerCase().includes('internal server error')) {
          setError("We're experiencing technical difficulties during registration. Our team has been notified. Please try again later.");
        } else {
          setError(err.message);
        }
      } else if (typeof err === 'string') {
        // Handle string errors
        if (err.toLowerCase().includes('500') || err.toLowerCase().includes('internal server error')) {
          setError("We're experiencing technical difficulties during registration. Our team has been notified. Please try again later.");
        } else {
          setError(err);
        }
      } else {
        // Handle unknown error types
        setError("Something went wrong during registration. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us today and get started
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300"
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
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirm-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-500">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition duration-300">
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-300 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-500 transition duration-300">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}