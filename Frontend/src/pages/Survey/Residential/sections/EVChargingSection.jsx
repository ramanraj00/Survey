import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';

export default function EVChargingSection({ data = {}, onChange }) {
  const handleCheckbox = (e) => onChange(e.target.name, e.target.checked);
  const handleChange = (e) => onChange(e.target.name, e.target.value);
  const handleNumber = (e) => onChange(e.target.name, e.target.value === '' ? null : Number(e.target.value));

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1rem' }}>EV Charging</h3>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          id="hasEV" 
          name="hasEV" 
          checked={data.hasEV || false} 
          onChange={handleCheckbox} 
        />
        <label htmlFor="hasEV">Household has an Electric Vehicle</label>
      </div>

      {data.hasEV === true && (
        <div className="grid-cols-2 animate-fade-in">
          <FormInput label="Vehicle Type" name="vehicleType" value={data.vehicleType || ''} onChange={handleChange} />
          <FormInput label="Vehicle Count" type="number" name="vehicleCount" value={data.vehicleCount || ''} onChange={handleNumber} />
          <FormInput label="Usual Charging Start" name="usualChargingStart" value={data.usualChargingStart || ''} onChange={handleChange} />
          <FormInput label="Usual Charging End" name="usualChargingEnd" value={data.usualChargingEnd || ''} onChange={handleChange} />
        </div>
      )}
      {data.hasEV === false && (
         <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
           EV related fields are hidden and will be ignored during validation.
         </div>
      )}
    </Card>
  );
}
