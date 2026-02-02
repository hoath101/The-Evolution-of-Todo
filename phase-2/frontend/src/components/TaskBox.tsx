'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api';

interface TaskBoxProps {
  userId?: string; // Optional prop for server-provided user ID
}

export default function TaskBox({ userId }: TaskBoxProps = {}) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch only a limited number of tasks for the main page
        const userTasks = await apiClient.getUserTasks(0, 3, false, userId); // Get first 3 tasks
        setTasks(userTasks.slice(0, 3)); // Limit to 3 tasks
      } catch (error) {
        // If there's an error (e.g., not logged in), just show empty tasks
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Loading...
          </span>
        </div>
        <div className="space-y-3 mb-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-400 cursor-not-allowed">
            View All Tasks
          </div>
          <div className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
            + Add New Task
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto flex justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">No tasks yet</p>
            <p className="text-xs text-gray-500 mt-1">Start by adding your first task</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={task.completed}
                readOnly
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className={`ml-3 text-sm truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                {task.title}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <Link
          href="/tasks"
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View All Tasks
        </Link>
        <Link
          href="/tasks"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          + Add New Task
        </Link>
      </div>
    </div>
  );
}