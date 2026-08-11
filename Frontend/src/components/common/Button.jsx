import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  ...props 
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.625rem 1.25rem',
    borderRadius: '9999px',
    fontWeight: '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    opacity: (isLoading || props.disabled) ? 0.5 : 1,
    cursor: (isLoading || props.disabled) ? 'not-allowed' : 'pointer',
    pointerEvents: (isLoading || props.disabled) ? 'none' : 'auto'
  };

  const variants = {
    primary: {
      background: 'var(--accent-glow)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    secondary: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-glass)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--error)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    }
  };

  const combinedStyle = { ...baseStyles, ...variants[variant] };

  // Micro-animation on hover applied via standard CSS in index.css or inline
  return (
    <button 
      style={combinedStyle} 
      className={`btn-${variant} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="mr-2 animate-spin" style={{ marginRight: '0.5rem' }} />}
      {children}
    </button>
  );
}
