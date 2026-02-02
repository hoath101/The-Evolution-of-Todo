"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession, signOut } from "../lib/auth-client";
import { isSessionData, SessionResponse } from "../lib/types";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [session, setSession] = useState<SessionResponse>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const currentSession: SessionResponse = await getSession();

        // Only set session if it's valid session data (not an error)
        if (isSessionData(currentSession)) {
          setSession(currentSession);
        } else {
          // If we get an error response or null, set session to null
          setSession(null);
        }
      } catch (error) {
        console.error("Failed to get session:", error);
        // Log the error but don't set it in state as AppShell doesn't render session errors
        setSession(null);
      }
    };

    fetchSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out failed:", error);
      // Log the error but don't set it in state as AppShell doesn't render sign out errors
    }
  };

  const navLinks = [
    { href: "/tasks", label: "Tasks" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Todo App</span>
              </Link>
              <nav className="ml-6 hidden md:block">
                <div className="flex space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === link.href
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>

            <div className="flex items-center">
              {session ? (
                <div className="relative ml-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">
                      {isSessionData(session) && session?.user
                        ? (session.user.name || session.user.email || session.user.id || "User")
                        : "User"}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Todo App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}