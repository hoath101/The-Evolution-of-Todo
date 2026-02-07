'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { userSession } = useAuth();

  // If still loading, show loading state
  if (userSession.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to sign-in
  if (!userSession.isAuthenticated) {
    router.push('/auth/sign-in');
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome, {userSession.user?.name || userSession.user?.email || 'User'}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition-transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>
          <p>
            <Link href="/tasks" className="text-blue-600 hover:underline font-medium">
              Manage your tasks
            </Link>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition-transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-2">AI Chatbot</h2>
          <p>
            <Link href="/chat" className="text-blue-600 hover:underline font-medium">
              Chat with AI assistant
            </Link>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition-transform hover:scale-105">
          <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
          <p>
            <Link href="/profile" className="text-blue-600 hover:underline font-medium">
              View and update your profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}