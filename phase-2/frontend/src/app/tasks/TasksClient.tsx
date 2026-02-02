"use client";

import { useState } from "react";
import TaskEditor from "../../components/TaskEditor";
import TaskList from "../../components/TaskList";

interface TasksClientProps {
  userId: string;
  initialTasks?: any[];
}

export default function TasksClient({ userId, initialTasks }: TasksClientProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleTaskCreated = async () => {
    setShowCreateForm(false);
    // Refresh task list or update state as needed
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your tasks and stay organized
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {showCreateForm ? "Cancel" : "Add New Task"}
              </button>
            </div>
          </div>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Task
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TaskEditor
              userId={userId}
              onSuccess={handleTaskCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Task List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <TaskList initialTasks={initialTasks} userId={userId} />
        </div>
      </div>
    </div>
  );
}