import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        if(onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <>
      <style>{`
        @keyframes slideUpSmooth {
          0% { bottom: -50px; opacity: 0; transform: translateX(-50%) scale(0.95); }
          100% { bottom: 2rem; opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#FFFFFF',
        color: '#111827',
        border: '1px solid var(--border-glass)',
        padding: '0.75rem 1.5rem',
        borderRadius: '9999px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        fontWeight: 500,
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'slideUpSmooth 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        whiteSpace: 'nowrap',
        maxWidth: '90vw'
      }}>
        <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{message}</span>
      </div>
    </>
  );
}
