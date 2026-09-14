import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

/**
 * Route guard that redirects unauthenticated users to /login.
 *
 * === REMOVABLE AUTH MODULE ===
 * Replace with SSO guard when integrating external auth.
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Đang kiểm tra phiên đăng nhập...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
