"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "../../../lib/api";
import TaskEditor from "../../../components/TaskEditor";
import TaskDetail from "../../../components/TaskDetail";

interface TaskDetailClientProps {
  userId: string;
  initialTask: any;
}

export default function TaskDetailClient({ userId, initialTask }: TaskDetailClientProps) {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTaskUpdated = async () => {
    setIsEditing(false);
    // Refresh the task data
    try {
      const updatedTask = await apiClient.getTask(id as string, false, userId);
      setTask(updatedTask);
    } catch (err) {
      console.error("Failed to refresh task:", err);
      // Ensure error is always a string to prevent React rendering issues
      if (err instanceof Error) {
        // Provide more user-friendly error messages
        if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch')) {
          setError("Unable to connect to the server. Please check your internet connection.");
        } else if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('unauthorized')) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError("Failed to refresh task. Please try again later.");
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
            userFriendlyMessage = "Invalid request. Unable to refresh task.";
            break;
          case 401:
          case 403:
            userFriendlyMessage = "Your session has expired. Please sign in again.";
            break;
          case 404:
            userFriendlyMessage = "Task not found. Please refresh the page.";
            break;
          case 500:
            userFriendlyMessage = "Server error. Failed to refresh task. Please try again later.";
            break;
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
            break;
          default:
            userFriendlyMessage = "Failed to refresh task. Please try again later.";
        }
        setError(userFriendlyMessage);
      } else {
        setError("Failed to refresh task. Please try again later.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Task Details</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isEditing ? "Cancel Edit" : "Edit Task"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-8">
          <TaskEditor
            userId={userId}
            task={task}
            onSuccess={handleTaskUpdated}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="mt-8">
          <TaskDetail task={task} />
        </div>
      )}
    </div>
  );
}