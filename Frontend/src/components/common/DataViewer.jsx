import React from 'react';

// Utility to convert camelCase to Title Case
const formatLabel = (key) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function DataViewer({ data }) {
  if (data === null || data === undefined) {
    return <span style={{ color: 'var(--text-muted)' }}>Not provided</span>;
  }

  if (typeof data === 'boolean') {
    return <span style={{ color: data ? 'var(--success)' : 'var(--error)', fontWeight: 500 }}>{data ? 'Yes' : 'No'}</span>;
  }

  if (typeof data !== 'object') {
    return <span>{data.toString()}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span style={{ color: 'var(--text-muted)' }}>None</span>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <DataViewer data={item} />
          </div>
        ))}
      </div>
    );
  }

  // It's an object
  const entries = Object.entries(data).filter(([k, v]) => v !== null && v !== undefined && k !== 'surveyId' && k !== 'id');
  
  if (entries.length === 0) {
    return <span style={{ color: 'var(--text-muted)' }}>Not provided</span>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {entries.map(([key, value]) => (
        <div key={key}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {formatLabel(key)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <DataViewer data={value} />
          </div>
        </div>
      ))}
    </div>
  );
}
