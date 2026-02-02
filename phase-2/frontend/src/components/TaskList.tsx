"use client";

import { useState, useEffect } from "react";
import { apiClient } from "../lib/api";
import TaskListItem from "./TaskListItem";
import LoadingState from "./LoadingState";
import ErrorBanner from "./ErrorBanner";

interface TaskListProps {
  initialTasks?: any[];
  userId?: string; // New optional prop for server-provided user ID
}

export default function TaskList({ initialTasks, userId }: TaskListProps = {}) {
  const [tasks, setTasks] = useState<any[]>(initialTasks || []);
  const [isLoading, setIsLoading] = useState(initialTasks === undefined); // Only load if no initial tasks provided
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks on component mount only if no initial tasks provided
  useEffect(() => {
    if (initialTasks !== undefined) {
      // If initial tasks were provided, we're done loading
      setIsLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userTasks = await apiClient.getUserTasks(0, 100, false, userId);
        setTasks(userTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        // Ensure error is always a string to prevent React rendering issues
        if (err instanceof Error) {
          // Provide more user-friendly error messages
          if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
            setError("Unable to connect to the server. Please check your internet connection.");
          } else if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('unauthorized')) {
            setError("Your session has expired. Please sign in again.");
          } else {
            setError("Failed to load tasks. Please try again later.");
          }
        } else if (typeof err === 'string') {
          setError(err);
        } else if (err && typeof err === 'object' && 'status' in err && 'statusText' in err) {
          // Handle response-like objects with status and statusText
          const statusCode = err.status;
          let userFriendlyMessage = `API Error: ${err.status} - ${err.statusText}`;

          // Provide more user-friendly messages based on common HTTP status codes
          switch(statusCode) {
            case 400:
              userFriendlyMessage = "Invalid request. Unable to load tasks.";
              break;
            case 401:
            case 403:
              userFriendlyMessage = "Your session has expired. Please sign in again.";
              break;
            case 404:
              userFriendlyMessage = "Tasks service temporarily unavailable. Please try again later.";
              break;
            case 500:
              userFriendlyMessage = "Server error. Failed to load tasks. Please try again later.";
              break;
            case 502:
            case 503:
            case 504:
              userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
              break;
            default:
              userFriendlyMessage = "Failed to load tasks. Please try again later.";
          }
          setError(userFriendlyMessage);
        } else {
          setError("Failed to load tasks. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [initialTasks]); // Only run effect if initialTasks is undefined

  // Refresh tasks after any change
  const refreshTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userTasks = await apiClient.getUserTasks(0, 100, false, userId);
      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
      // Ensure error is always a string to prevent React rendering issues
      if (err instanceof Error) {
        // Provide more user-friendly error messages
        if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
          setError("Unable to connect to the server. Please check your internet connection.");
        } else if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('unauthorized')) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError("Failed to refresh tasks. Please try again later.");
        }
      } else if (typeof err === 'string') {
        setError(err);
      } else if (err && typeof err === 'object' && 'status' in err && 'statusText' in err) {
        // Handle response-like objects with status and statusText
        const statusCode = err.status;
        let userFriendlyMessage = `API Error: ${err.status} - ${err.statusText}`;

        // Provide more user-friendly messages based on common HTTP status codes
        switch(statusCode) {
          case 400:
            userFriendlyMessage = "Invalid request. Unable to refresh tasks.";
            break;
          case 401:
          case 403:
            userFriendlyMessage = "Your session has expired. Please sign in again.";
            break;
          case 404:
            userFriendlyMessage = "Tasks service temporarily unavailable. Please try again later.";
            break;
          case 500:
            userFriendlyMessage = "Server error. Failed to refresh tasks. Please try again later.";
            break;
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            userFriendlyMessage = "Failed to refresh tasks. Please try again later.";
        }
        setError(userFriendlyMessage);
      } else {
        setError("Failed to refresh tasks. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto flex justify-center mb-6">
          <div className="bg-linear-to-br from-indigo-100 to-purple-100 rounded-full p-6">
            <svg
              className="h-16 w-16 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-900">No tasks yet</h3>
        <p className="mt-2 text-gray-600">Get started by creating your first task to stay organized.</p>
        <div className="mt-6">
          <p className="text-sm text-gray-500">Click the "Add New Task" button above to create one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onTaskUpdated={refreshTasks}
            onTaskDeleted={refreshTasks}
            userId={userId}
          />
        ))}
      </ul>
    </div>
  );
}