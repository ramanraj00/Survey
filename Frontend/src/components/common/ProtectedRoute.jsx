import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Note: For now, we mock the auth state. In reality, this would use a hook like useSession() from better-auth/react
const useAuth = () => {
  // Mock logged in agent or admin based on localStorage or fixed state for development
  // Return { user: { role: 'agent' }, isAuthenticated: true }
  const role = localStorage.getItem('userRole') || 'agent'; // Sync with Login.jsx
  return { 
    user: { role }, 
    isAuthenticated: true 
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
