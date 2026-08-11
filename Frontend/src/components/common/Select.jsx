import React from 'react';

export default function Select({ name, value, onChange, options = [], style, ...props }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glass)',
        color: 'var(--text-primary)',
        outline: 'none',
        ...style
      }}
      {...props}
    >
      <option value="">-- Select --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
