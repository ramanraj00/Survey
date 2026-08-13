import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Button from '../../../../components/common/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function ProductionProcessesSection({ data = [], onChange }) {
  const addProcess = () => {
    onChange([
      ...data,
      {
        processName: '',
        operatesDuringPeak: false,
        mustOperateContinuously: false,
        canBeDelayed: false,
        canBeReduced: false,
        canBeStopped: false
      }
    ]);
  };

  const removeProcess = (index) => {
    const newProcesses = [...data];
    newProcesses.splice(index, 1);
    onChange(newProcesses);
  };

  const handleChange = (index, field, value) => {
    const newProcesses = [...data];
    newProcesses[index][field] = value;
    onChange(newProcesses);
  };

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem', fontWeight: 600 }}>E2.1 - E2.6: Production Processes Overview</h3>
      <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.9rem' }}>
        List the main stages of production and indicate their operational flexibility.
      </p>

      {data.length === 0 ? (
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>No processes added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '1.5rem' }}>
          {data.map((proc, index) => (
            <div key={index} style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => removeProcess(index)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                title="Remove process"
              >
                <Trash2 size={20} />
              </button>
              
              <div style={{ paddingRight: '2rem', marginBottom: '1.5rem' }}>
                <FormInput
                  label={`E2.1 Process Name (Stage ${index + 1})`}
                  type="text"
                  value={proc.processName || ''}
                  onChange={(e) => handleChange(index, 'processName', e.target.value)}
                  placeholder="e.g. Melting, Molding, Packaging..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <input type="checkbox" checked={proc.operatesDuringPeak || false} onChange={(e) => handleChange(index, 'operatesDuringPeak', e.target.checked)} />
                  E2.2 Operates during peak hours
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <input type="checkbox" checked={proc.mustOperateContinuously || false} onChange={(e) => handleChange(index, 'mustOperateContinuously', e.target.checked)} />
                  E2.3 Must operate continuously
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <input type="checkbox" checked={proc.canBeDelayed || false} onChange={(e) => handleChange(index, 'canBeDelayed', e.target.checked)} />
                  E2.4 Can be delayed/rescheduled
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <input type="checkbox" checked={proc.canBeReduced || false} onChange={(e) => handleChange(index, 'canBeReduced', e.target.checked)} />
                  E2.5 Can operate at reduced level
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                  <input type="checkbox" checked={proc.canBeStopped || false} onChange={(e) => handleChange(index, 'canBeStopped', e.target.checked)} />
                  E2.6 Can be temporarily stopped
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="secondary" onClick={addProcess} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Plus size={16} /> Add Production Process
      </Button>
    </Card>
  );
}
