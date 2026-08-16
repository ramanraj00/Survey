import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SurveyAPI } from '../../services/api';

/**
 * ProtectedRoute — validates the session server-side.
 * localStorage is used only as a fast hint to avoid flicker on initial render.
 * The server session is the authoritative source of truth.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  // Fast pre-render hint from localStorage (reduces flicker)
  const [role, setRole] = useState(localStorage.getItem('userRole'));
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'unauth' | 'forbidden'

  useEffect(() => {
    let cancelled = false;
    SurveyAPI.getSession()
      .then((res) => {
        if (cancelled) return;
        const serverRole = res?.user?.role;
        if (!serverRole) {
          localStorage.removeItem('userRole');
          setStatus('unauth');
          return;
        }
        // Sync localStorage with the authoritative server role
        localStorage.setItem('userRole', serverRole);
        setRole(serverRole);
        if (allowedRoles && !allowedRoles.includes(serverRole)) {
          setStatus('forbidden');
        } else {
          setStatus('ok');
        }
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('userRole');
        setStatus('unauth');
      });
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') {
    // Show nothing while verifying (avoids flash of protected content)
    return null;
  }

  if (status === 'unauth') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (status === 'forbidden') {
    if (role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
