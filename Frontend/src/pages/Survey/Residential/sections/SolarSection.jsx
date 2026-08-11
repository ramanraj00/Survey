import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';

export default function SolarSection({ data = {}, onChange }) {
  
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem' }}>Solar Installations</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input 
            type="checkbox" 
            checked={data.installed || false} 
            onChange={(e) => handleChange('installed', e.target.checked)}
          />
          <label style={{ fontSize: '0.875rem' }}>Solar Installed</label>
        </div>

        {data.installed && (
          <>
            <FormInput
              label="Capacity"
              type="number"
              value={data.capacity || ''}
              onChange={(e) => handleChange('capacity', e.target.value)}
            />

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Capacity Unit</label>
              <Select 
                value={data.capacityUnit || 'kW'} 
                onChange={(e) => handleChange('capacityUnit', e.target.value)}
                options={[
                  { value: 'kW', label: 'kW' },
                  { value: 'MW', label: 'MW' }
                ]}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <input 
                type="checkbox" 
                checked={data.batteryConnected || false} 
                onChange={(e) => handleChange('batteryConnected', e.target.checked)}
              />
              <label style={{ fontSize: '0.875rem' }}>Battery Connected</label>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
