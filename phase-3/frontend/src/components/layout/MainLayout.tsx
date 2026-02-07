'use client';

import React from 'react';
import { useAuth } from '../../contexts/auth-context';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { userSession, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">Todo AI</Link>

          <div className="flex items-center space-x-4">
            {userSession.isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <Link href="/tasks" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Tasks
                </Link>
                <Link href="/chat" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Chat
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Sign In
                </Link>
                <Link href="/auth/sign-up" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow py-8">
        <div className="max-w-6xl mx-auto px-4">
          {children}
        </div>
      </main>

      <footer className="bg-gray-50 py-6 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 Todo AI Chatbot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;