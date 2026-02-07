'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/auth-context';
import MainLayout from '../components/layout/MainLayout';

interface ClientWrapperProps {
  children: ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      <MainLayout>{children}</MainLayout>
    </AuthProvider>
  );
};

export default ClientWrapper;