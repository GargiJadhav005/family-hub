import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== allowedRole) {
    const redirectMap: Record<UserRole, string> = {
      teacher: '/teacher',
      parent: '/parent',
      student: '/student',
    };
    return <Navigate to={redirectMap[user?.role || 'student']} replace />;
  }

  return <>{children}</>;
}
