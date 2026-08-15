import React, { memo, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, FileText, PlusCircle, Settings, Users } from 'lucide-react';

const agentLinks = [
  { to: '/agent/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
  { to: '/agent/surveys', label: 'My Surveys', icon: <FileText size={18} /> },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Overview', icon: <Home size={18} /> },
  { to: '/admin/surveys', label: 'All Surveys', icon: <FileText size={18} /> },
  { to: '/admin/agents', label: 'Manage Agents', icon: <Users size={18} /> },
];

const AppLayout = memo(function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('userRole') || 'agent';

  const handleLogout = () => {
    // Clear auth
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const links = role === 'admin' ? adminLinks : agentLinks;

  return (
    <div className="app-layout">
      {/* Top Navigation - Glassmorphism style */}
      <aside className="glass-panel app-sidebar">
        <div className="app-sidebar-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#2563EB', letterSpacing: '-0.025em' }}>Survey</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {role.toUpperCase()} PORTAL
            </p>
          </div>
          <button 
            className="app-sidebar-logout-icon"
            onClick={handleLogout}
            style={{ fontWeight: 600, color: '#000000', fontSize: '0.875rem' }}
          >
            Logout
          </button>
        </div>

        <nav className="app-sidebar-nav">
          {useMemo(() => links.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link 
                key={link.to} 
                to={link.to}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {link.icon}
                <span className="nav-label">{link.label}</span>
              </Link>
            )
          }), [links, location.pathname])}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        <div style={{ padding: 0, width: '100%', maxWidth: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
});

export default AppLayout;
