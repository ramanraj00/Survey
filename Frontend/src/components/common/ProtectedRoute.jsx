import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Note: For now, we mock the auth state. In reality, this would use a hook like useSession() from better-auth/react
const useAuth = () => {
  const role = localStorage.getItem('userRole');
  return { 
    user: role ? { role } : null, 
    isAuthenticated: !!role 
  };
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If agent tries to access admin route, redirect to agent dashboard
    if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
