import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';

export default function ProfileSection({ data = {}, onChange }) {
  const handleChange = (name, value) => {
    onChange(name, value);
  };

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem', fontWeight: 600 }}>E1.1 - E1.6: Industry & Production Profile</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <FormInput
          label="E1.1 Type of Industry/Sector"
          type="text"
          value={data.industryType || ''}
          onChange={(e) => handleChange('industryType', e.target.value)}
          placeholder="e.g. Textile, Automotive, Pharma..."
        />
        
        <FormInput
          label="E1.2 Products Manufactured / Processed"
          type="text"
          value={data.products || ''}
          onChange={(e) => handleChange('products', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E1.3 Nature of production
          </label>
          <Select
            value={data.natureOfProduction || ''}
            onChange={(e) => handleChange('natureOfProduction', e.target.value)}
            options={[
              { value: 'Continuous Process', label: 'Continuous Process' },
              { value: 'Batch Process', label: 'Batch Process' },
              { value: 'Seasonal', label: 'Seasonal' },
              { value: 'Demand-based', label: 'Demand-based' }
            ]}
          />
        </div>
      </div>

      <h4 style={{ marginBottom: '1rem', color: '#334155', fontSize: '1rem', fontWeight: 600 }}>Operations (E1.4 - E1.6)</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <FormInput
          label="Days of Operation (Days/Week)"
          type="number"
          min="1"
          max="7"
          value={data.daysOfOperationPerWeek || ''}
          onChange={(e) => handleChange('daysOfOperationPerWeek', e.target.value)}
        />
        
        <FormInput
          label="Days Closed (Typical)"
          type="text"
          value={data.daysClosed || ''}
          onChange={(e) => handleChange('daysClosed', e.target.value)}
          placeholder="e.g. Sundays"
        />

        <FormInput
          label="Typical Operating Hours"
          type="text"
          value={data.operatingHours || ''}
          onChange={(e) => handleChange('operatingHours', e.target.value)}
          placeholder="e.g. 08:00 AM - 08:00 PM"
        />
      </div>
    </Card>
  );
}
