"use client";

import { useState } from "react";

interface ProfileClientProps {
  userData: any;
}

export default function ProfileClient({ userData }: ProfileClientProps) {
  const [session] = useState(userData);

  // Check if session has valid user data
  const hasValidUserData = session &&
    'user' in session &&
    session.user &&
    typeof session.user === 'object';

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100 mb-4">
            <span className="text-2xl font-bold text-indigo-600">
              {hasValidUserData && session?.user ?
                (((session.user.name || session.user.email) as string)?.charAt(0)?.toUpperCase() || 'U')
                : 'U'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {hasValidUserData ? (session.user.name || session.user.email?.split('@')[0] || 'User') : 'User'}
          </h1>
          <p className="mt-2 text-gray-600">Your account details and preferences</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Card Header */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-8 sm:px-8">
            <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            <p className="mt-1 text-indigo-200">Manage your account settings and preferences</p>
          </div>

          {/* Profile Content */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <div className="text-lg font-medium text-gray-900">
                      {hasValidUserData ? (session.user.name || session.user.email?.split('@')[0] || 'User') : 'User'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="text-gray-900 break-all">
                      {hasValidUserData ? session.user.email : 'Not available'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <div className="text-gray-900">
                      {hasValidUserData && session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-900">Password</div>
                      <div className="text-sm text-gray-500">Last changed recently</div>
                    </div>
                    <button
                      onClick={() => alert('Change password functionality would go here')}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Not enabled</div>
                    </div>
                    <button
                      onClick={() => alert('Enable 2FA functionality would go here')}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Enable
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-900">Login Activity</div>
                      <div className="text-sm text-gray-500">View recent activity</div>
                    </div>
                    <button
                      onClick={() => alert('View activity functionality would go here')}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => alert('Edit profile functionality would go here')}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </button>

              <button
                onClick={() => alert('Account settings functionality would go here')}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Account Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}