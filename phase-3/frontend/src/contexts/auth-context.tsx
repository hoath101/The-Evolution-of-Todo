'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, UserInfo } from '../types/auth';
import betterAuthClient from '../services/better-auth-client';
import JWTUtils from '../services/jwt-utils';

interface AuthContextType {
  userSession: UserSession;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userSession, setUserSession] = useState<UserSession>({
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      setUserSession(prev => ({
        ...prev,
        isLoading: true,
      }));

      // Try to get the session from localStorage first
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');

      if (token) {
        // Validate token expiration
        if (JWTUtils.isTokenExpired(token)) {
          // Token is expired, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');

          setUserSession({
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
          });
        } else {
          // Token is valid
          setUserSession({
            isLoading: false,
            isAuthenticated: true,
            accessToken: token,
            user: userData ? JSON.parse(userData) : undefined,
          });
        }
      } else {
        // No token in storage
        setUserSession({
          isLoading: false,
          isAuthenticated: false,
          accessToken: null,
        });
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setUserSession(prev => ({
        ...prev,
        isLoading: true,
      }));

      // Use Better Auth client for actual sign in
      const response = await betterAuthClient.login(email, password);

      if (response.success) {
        // Wait briefly to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get token and user data from localStorage which were set by betterAuthClient.login
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          setUserSession({
            isLoading: false,
            isAuthenticated: true,
            accessToken: token,
            user: JSON.parse(userData),
          });
          return true;
        } else {
          // If tokens weren't properly stored, mark as unauthenticated
          setUserSession({
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
          });
          return false;
        }
      } else {
        setUserSession(prev => ({
          ...prev,
          isLoading: false,
        }));
        return false;
      }
    } catch (error) {
      setUserSession(prev => ({
        ...prev,
        isLoading: false,
      }));
      console.error("Sign in error:", error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setUserSession(prev => ({
        ...prev,
        isLoading: true,
      }));

      // Use Better Auth client for actual registration
      const response = await betterAuthClient.register(email, password, name);

      if (response.success) {
        // Wait briefly to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get token and user data from localStorage which were set by betterAuthClient.register
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          setUserSession({
            isLoading: false,
            isAuthenticated: true,
            accessToken: token,
            user: JSON.parse(userData),
          });
          return true;
        } else {
          // If tokens weren't properly stored, mark as unauthenticated
          setUserSession({
            isLoading: false,
            isAuthenticated: false,
            accessToken: null,
          });
          return false;
        }
      } else {
        setUserSession(prev => ({
          ...prev,
          isLoading: false,
        }));
        return false;
      }
    } catch (error) {
      setUserSession(prev => ({
        ...prev,
        isLoading: false,
      }));
      console.error("Sign up error:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Call the Better Auth client to handle the sign out
      const response = await betterAuthClient.logout();

      // Regardless of the response, clear our local state and data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');

      setUserSession({
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Still remove local data even if the API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');

      setUserSession({
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      });
    }
  };

  const getAccessToken = (): string | null => {
    return userSession.accessToken;
  };

  const value = {
    userSession,
    signIn,
    signOut,
    signUp,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};