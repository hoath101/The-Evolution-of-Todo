'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { JWTUtils } from '../../services/jwt-utils';
import Link from 'next/link';

const ProfilePage: React.FC = () => {
  const { userSession, signOut } = useAuth();
  const [tokenExpiration, setTokenExpiration] = useState<number | null>(null);
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<string>('');

  useEffect(() => {
    if (userSession.accessToken) {
      const exp = JWTUtils.getTokenExpiration(userSession.accessToken);
      setTokenExpiration(exp);

      // Calculate time until expiration
      if (exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const secondsUntilExp = exp - currentTime;

        if (secondsUntilExp > 0) {
          const hours = Math.floor(secondsUntilExp / 3600);
          const minutes = Math.floor((secondsUntilExp % 3600) / 60);
          const secs = secondsUntilExp % 60;

          setTimeUntilExpiration(
            `${hours}h ${minutes}m ${secs}s`
          );
        } else {
          setTimeUntilExpiration('Expired');
        }
      }
    }
  }, [userSession.accessToken]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (userSession.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userSession.isAuthenticated || !userSession.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">Please sign in to view your profile.</p>
            <div className="mt-6">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userSession.user.name || 'Not provided'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userSession.user.email}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userSession.user.id}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Access Token Expiration</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {tokenExpiration
                    ? new Date(tokenExpiration * 1000).toLocaleString()
                    : 'Unknown'}
                  <div className="text-xs text-gray-500 mt-1">
                    Time until expiration: {timeUntilExpiration}
                  </div>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Authentication Status</dt>
                <dd className="mt-1 text-sm text-green-600 sm:mt-0 sm:col-span-2">
                  {userSession.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                </dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 sm:px-6 flex justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
            <div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;