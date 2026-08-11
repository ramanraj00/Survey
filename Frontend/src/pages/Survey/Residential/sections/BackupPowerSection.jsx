import React from 'react';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';
import { Trash2, Plus } from 'lucide-react';

export default function BackupPowerSection({ data = [], onChange }) {
  
  const handleAdd = () => {
    onChange([...data, { 
      type: '', 
      available: false, 
      batteryCapacity: '', 
      batteryCapacityUnit: 'Ah',
      automaticCharging: false,
      chargingControl: ''
    }]);
  };

  const handleRemove = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <Card padding="1.5rem">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Backup Power Sources</h3>
        <Button variant="ghost" onClick={handleAdd} type="button">
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Source
        </Button>
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
          No entries yet. Click "Add Source" to start.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                <button type="button" onClick={() => handleRemove(index)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Type</label>
                  <Select 
                    value={item.type || ''} 
                    onChange={(e) => handleChange(index, 'type', e.target.value)}
                    options={[
                      { value: 'INVERTER', label: 'Inverter' },
                      { value: 'UPS', label: 'UPS' }
                    ]}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={item.available || false} 
                    onChange={(e) => handleChange(index, 'available', e.target.checked)}
                  />
                  <label style={{ fontSize: '0.875rem' }}>Currently Available</label>
                </div>

                <FormInput
                  label="Battery Capacity"
                  type="number"
                  value={item.batteryCapacity || ''}
                  onChange={(e) => handleChange(index, 'batteryCapacity', e.target.value)}
                />
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Capacity Unit</label>
                  <Select 
                    value={item.batteryCapacityUnit || 'Ah'} 
                    onChange={(e) => handleChange(index, 'batteryCapacityUnit', e.target.value)}
                    options={[
                      { value: 'Ah', label: 'Ah' },
                      { value: 'kWh', label: 'kWh' }
                    ]}
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={item.automaticCharging || false} 
                    onChange={(e) => handleChange(index, 'automaticCharging', e.target.checked)}
                  />
                  <label style={{ fontSize: '0.875rem' }}>Automatic Charging</label>
                </div>
                
                <FormInput
                  label="Charging Control Mechanism"
                  type="text"
                  value={item.chargingControl || ''}
                  onChange={(e) => handleChange(index, 'chargingControl', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
