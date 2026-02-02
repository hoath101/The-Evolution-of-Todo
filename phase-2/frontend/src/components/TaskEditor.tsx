"use client";

import { useState } from "react";
import { apiClient } from "../lib/api";
import { useRouter } from "next/navigation";

interface TaskEditorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  userId?: string; // New optional prop for server-provided user ID
  task?: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
  };
}

export default function TaskEditor({ onSuccess, onCancel, userId, task }: TaskEditorProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!task;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        // Update existing task - pass userId if available
        await apiClient.updateTask(task.id, { title, description }, false, userId);
      } else {
        // Create new task - pass userId if available
        await apiClient.createTask({ title, description }, false, userId);
      }

      // Reset form
      setTitle("");
      setDescription("");

      // Call success callback
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to tasks list
        router.push("/tasks");
        router.refresh();
      }
    } catch (err) {
      console.error(isEditing ? "Update task error:" : "Create task error:", err);
      // Ensure error is always a string to prevent React rendering issues
      if (err instanceof Error) {
        // Provide more user-friendly error messages
        if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
          setError("Unable to connect to the server. Please check your internet connection.");
        } else if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('unauthorized')) {
          setError("Your session has expired. Please sign in again.");
        } else if (isEditing) {
          setError("Failed to update task. Please try again.");
        } else {
          setError("Failed to create task. Please try again.");
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
            userFriendlyMessage = isEditing ? "Invalid request. Unable to update task." : "Invalid request. Unable to create task.";
            break;
          case 401:
          case 403:
            userFriendlyMessage = "Your session has expired. Please sign in again.";
            break;
          case 404:
            userFriendlyMessage = "Task not found. Please refresh the page.";
            break;
          case 500:
            userFriendlyMessage = isEditing ? "Server error. Failed to update task. Please try again later." : "Server error. Failed to create task. Please try again later.";
            break;
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            userFriendlyMessage = isEditing ? "Failed to update task. Please try again." : "Failed to create task. Please try again.";
        }
        setError(userFriendlyMessage);
      } else {
        setError(isEditing ? "Failed to update task. Please try again." : "Failed to create task. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Task title"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Task description (optional)"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
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

        <div className="flex justify-between">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Task" : "Create Task")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}