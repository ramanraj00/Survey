import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export default function ArrayTable({ 
  title = "Items",
  items = [], 
  emptyTemplate = {},
  onChange, 
  renderRow 
}) {
  const handleAdd = () => {
    // We do NOT generate a temporary ID. The backend will assign one upon insert.
    onChange([...items, { ...emptyTemplate }]);
  };

  const handleRemove = (indexToRemove) => {
    onChange(items.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRowChange = (index, name, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [name]: value
    };
    onChange(newItems);
  };

  return (
    <Card padding="1.5rem" className="array-table-card">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{title}</h3>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleAdd}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          <Plus size={16} style={{ marginRight: '0.375rem' }} /> Add Row
        </Button>
      </div>

      {items.length === 0 ? (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          border: '1px dashed var(--border-glass)',
          borderRadius: 'var(--radius-md)'
        }}>
          No entries yet. Click "Add Row" to start.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((row, index) => (
            <div 
              key={row.id || index} 
              style={{ 
                position: 'relative',
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                paddingTop: '2.5rem' // space for remove button
              }}
              className="animate-fade-in"
            >
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleRemove(index)}
                  style={{
                    color: 'var(--error)',
                    opacity: 0.8,
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = 1}
                  onMouseOut={e => e.currentTarget.style.opacity = 0.8}
                  title="Remove Row"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Render the specific row fields */}
              {renderRow(row, (name, value) => handleRowChange(index, name, value), index)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
