import React from 'react';

export default function FormInput({ 
  label, 
  id, 
  type = 'text', 
  error, 
  required, 
  ...props 
}) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && (
        <label 
          htmlFor={id}
          style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 500, 
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}
        >
          {label} {required && <span style={{color: 'var(--error)'}}>*</span>}
        </label>
      )}
      <input 
        id={id}
        type={type}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: disabled ? 'rgba(15, 23, 42, 0.05)' : '#FFFFFF',
          border: `1px solid ${error ? 'var(--error)' : 'var(--border-glass)'}`,
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: disabled ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
        {...props}
      />
      {error && (
        <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}
