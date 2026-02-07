import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { ReactNode, useEffect } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean; // If true, redirects to login if not authenticated; if false, redirects to dashboard if authenticated
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true
}) => {
  const { userSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to be loaded
    if (userSession.isLoading) {
      return;
    }

    // If auth is required but user is not authenticated
    if (requireAuth && !userSession.isAuthenticated) {
      router.push('/auth/sign-in');
    }
    // If auth is NOT required (e.g., sign-in page) but user IS authenticated
    else if (!requireAuth && userSession.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [userSession, requireAuth, router]);

  // Show loading state while checking auth
  if (userSession.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !userSession.isAuthenticated) {
    return null; // The redirect effect will handle navigation
  }

  // If auth is not required but user is authenticated, don't render children
  if (!requireAuth && userSession.isAuthenticated) {
    return null; // The redirect effect will handle navigation
  }

  // Render children if auth requirements are met
  return <>{children}</>;
};

export default AuthGuard;

// Higher-order component version
export const withAuthGuard = (Component: React.ComponentType, requireAuth: boolean = true) => {
  return (props: any) => (
    <AuthGuard requireAuth={requireAuth}>
      <Component {...props} />
    </AuthGuard>
  );
};