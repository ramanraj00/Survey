import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, FileText, PlusCircle, Settings, Users } from 'lucide-react';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('userRole') || 'agent';

  const handleLogout = () => {
    // Clear auth
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const agentLinks = [
    { to: '/agent/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/agent/surveys', label: 'My Surveys', icon: <FileText size={18} /> },
    { to: '/agent/surveys/new', label: 'New Survey', icon: <PlusCircle size={18} /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: <Home size={18} /> },
    { to: '/admin/surveys', label: 'All Surveys', icon: <FileText size={18} /> },
    { to: '/admin/agents', label: 'Manage Agents', icon: <Users size={18} /> },
  ];

  const links = role === 'admin' ? adminLinks : agentLinks;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar - Glassmorphism style */}
      <aside className="glass-panel" style={{ 
        width: '260px', 
        borderLeft: 'none', 
        borderTop: 'none', 
        borderBottom: 'none',
        borderRadius: '0',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>SmartMeter</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {role.toUpperCase()} PORTAL
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link 
                key={link.to} 
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid var(--border-glass)' : '1px solid transparent'
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>

        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            marginTop: 'auto',
            textAlign: 'left'
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', height: '100vh' }}>
        <div className="container" style={{ padding: 0 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
