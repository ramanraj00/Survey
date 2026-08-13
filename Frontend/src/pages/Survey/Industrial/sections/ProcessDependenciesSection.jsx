import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function ProcessDependenciesSection({ data = [], onChange }) {
  const addDependency = () => {
    onChange([
      ...data,
      {
        processName: '',
        hasDependencies: '',
        dependencyExplanation: '',
        interruptionImpact: '',
        timeToStop: '',
        timeToRestart: '',
        restartingDemandSpike: ''
      }
    ]);
  };

  const removeDependency = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    onChange(newData);
  };

  return (
    <Card padding="2rem">
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem', fontWeight: 600 }}>E2.7 - E2.11: Process Dependencies & Interruptions</h3>
      <p style={{ color: '#64748B', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Detail the dependencies and interruption impacts for your key production processes.
      </p>

      {data.length === 0 ? (
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>No process details added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '1.5rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => removeDependency(index)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                title="Remove item"
              >
                <Trash2 size={20} />
              </button>

              <div style={{ paddingRight: '2rem', marginBottom: '1.5rem' }}>
                <FormInput
                  label={`Process Name (matches above)`}
                  type="text"
                  value={item.processName || ''}
                  onChange={(e) => handleChange(index, 'processName', e.target.value)}
                  placeholder="e.g. Melting"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
                    E2.7 Dependent on another process?
                  </label>
                  <Select
                    value={item.hasDependencies || ''}
                    onChange={(e) => handleChange(index, 'hasDependencies', e.target.value)}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]}
                  />
                </div>

                <FormInput
                  label="Explain dependency"
                  type="text"
                  value={item.dependencyExplanation || ''}
                  onChange={(e) => handleChange(index, 'dependencyExplanation', e.target.value)}
                  disabled={item.hasDependencies !== 'Yes'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
                    E2.8 Impact if interrupted
                  </label>
                  <Select
                    value={item.interruptionImpact || ''}
                    onChange={(e) => handleChange(index, 'interruptionImpact', e.target.value)}
                    options={[
                      { value: 'No major impact', label: 'No major impact' },
                      { value: 'Production Loss', label: 'Production Loss' },
                      { value: 'Quality Impact', label: 'Quality Impact' },
                      { value: 'Material loss', label: 'Material loss' },
                      { value: 'Safety issues', label: 'Safety issues' },
                      { value: 'Equipment Damage', label: 'Equipment Damage' }
                    ]}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
                    E2.9 Time needed to safely stop
                  </label>
                  <Select
                    value={item.timeToStop || ''}
                    onChange={(e) => handleChange(index, 'timeToStop', e.target.value)}
                    options={[
                      { value: 'Immediate', label: 'Immediate' },
                      { value: 'Minutes', label: 'Minutes' },
                      { value: 'Hours', label: 'Hours' },
                      { value: 'Cannot be stopped', label: 'Cannot be stopped' }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem' }}>
                <FormInput
                  label="E2.10 Time required to restart (Mins/Hrs)"
                  type="text"
                  value={item.timeToRestart || ''}
                  onChange={(e) => handleChange(index, 'timeToRestart', e.target.value)}
                />

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
                    E2.11 Restart causes demand spike?
                  </label>
                  <Select
                    value={item.restartingDemandSpike || ''}
                    onChange={(e) => handleChange(index, 'restartingDemandSpike', e.target.value)}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                      { value: 'Not Sure', label: 'Not Sure' }
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="secondary" onClick={addDependency} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Plus size={16} /> Add Process Details
      </Button>
    </Card>
  );
}
