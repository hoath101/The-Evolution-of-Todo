"use client";

import { useState } from "react";
import { apiClient } from "../lib/api";
import { useRouter } from "next/navigation";

interface TaskListItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
  };
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
  userId?: string; // New optional prop for server-provided user ID
}

export default function TaskListItem({ task, onTaskUpdated, onTaskDeleted, userId }: TaskListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleCompletion = async () => {
    try {
      await apiClient.toggleTaskCompletion(task.id, false, userId);
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
      // Ensure error is always a string to prevent React rendering issues
      if (err instanceof Error) {
        // Provide more user-friendly error messages
        if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
          setError("Unable to connect to the server. Please check your internet connection.");
        } else if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('unauthorized')) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError("Failed to update task. Please try again.");
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
            userFriendlyMessage = "Invalid request. Unable to update task.";
            break;
          case 401:
          case 403:
            userFriendlyMessage = "Your session has expired. Please sign in again.";
            break;
          case 404:
            userFriendlyMessage = "Task not found. Please refresh the page.";
            break;
          case 500:
            userFriendlyMessage = "Server error. Failed to update task. Please try again later.";
            break;
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            userFriendlyMessage = "Failed to update task. Please try again.";
        }
        setError(userFriendlyMessage);
      } else {
        setError("Failed to update task. Please try again.");
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiClient.deleteTask(task.id, false, userId);
      onTaskDeleted();
    } catch (err) {
      console.error("Failed to delete task:", err);
      // Ensure error is always a string to prevent React rendering issues
      if (err instanceof Error) {
        // Provide more user-friendly error messages
        if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
          setError("Unable to connect to the server. Please check your internet connection.");
        } else if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('unauthorized')) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError("Failed to delete task. Please try again.");
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
            userFriendlyMessage = "Invalid request. Unable to delete task.";
            break;
          case 401:
          case 403:
            userFriendlyMessage = "Your session has expired. Please sign in again.";
            break;
          case 404:
            userFriendlyMessage = "Task not found. Please refresh the page.";
            break;
          case 500:
            userFriendlyMessage = "Server error. Failed to delete task. Please try again later.";
            break;
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            userFriendlyMessage = "Failed to delete task. Please try again.";
        }
        setError(userFriendlyMessage);
      } else {
        setError("Failed to delete task. Please try again.");
      }
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Format the date to show in the user's local timezone
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Use 12-hour format (AM/PM) to be more clear
    });
  };

  return (
    <li className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
      <div className="px-6 py-4 sm:px-6 flex items-start">
        <div className="flex items-start min-w-0 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleCompletion}
            disabled={isDeleting}
            className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
          />
          <div className="ml-4 min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-base font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                  <span className="inline-flex items-center">
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created: {formatDate(task.created_at)}
                  </span>
                  {task.completed && (
                    <span className="inline-flex items-center">
                      <svg className="mr-1 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <button
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white ${
                    isDeleting
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  } transition-colors duration-200`}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 pb-4">
          <div className="rounded-lg bg-red-50 p-3 border border-red-200">
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
        </div>
      )}
    </li>
  );
}