import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireEmployee?: boolean;
  allowedRoles?: string[]; // New prop for flexible role-based access
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireEmployee = false,
  allowedRoles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="جاري التحميل..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is in allowedRoles (most flexible option)
  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    return <Navigate to="/" replace />;
  }

  // Backward compatibility: requireAdmin means only admin role
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Backward compatibility: requireEmployee means employee, manager, or admin
  if (requireEmployee && !['employee', 'manager', 'admin'].includes(user.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
