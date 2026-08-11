import React from 'react';
import ArrayTable from '../../../../components/common/ArrayTable';
import FormInput from '../../../../components/common/FormInput';

export default function AppliancesSection({ data = [], onChange }) {
  const emptyAppliance = {
    applianceType: '',
    available: null,
    numberOfUnits: null,
    capacity: '',
    capacityUnit: '',
    typicalUsageTime: '',
    usedDuringPeak: null,
    possibleAdjustment: '',
    maximumDurationOrNewTime: '',
    constraintsOrRemarks: '',
    otherApplianceName: '',
    remarks: ''
  };

  const renderRow = (row, handleChange) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="grid-cols-2">
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Appliance Type
            </label>
            <select 
              name="applianceType"
              value={row.applianceType || ''} 
              onChange={(e) => handleChange('applianceType', e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-glass)',
                color: 'white', outline: 'none'
              }}
            >
              <option value="">-- Select Type --</option>
              <option value="AC">Air Conditioner</option>
              <option value="REFRIGERATOR">Refrigerator</option>
              <option value="WASHING_MACHINE">Washing Machine</option>
              <option value="WATER_HEATER">Water Heater (Geyser)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {row.applianceType === 'OTHER' && (
            <FormInput 
              label="Other Appliance Name" 
              name="otherApplianceName" 
              value={row.otherApplianceName || ''} 
              onChange={(e) => handleChange('otherApplianceName', e.target.value)} 
            />
          )}

          <FormInput 
            label="Number of Units" 
            type="number" 
            name="numberOfUnits" 
            value={row.numberOfUnits || ''} 
            onChange={(e) => handleChange('numberOfUnits', e.target.value === '' ? null : Number(e.target.value))} 
          />
          <FormInput 
            label="Capacity" 
            name="capacity" 
            value={row.capacity || ''} 
            onChange={(e) => handleChange('capacity', e.target.value)} 
          />
        </div>

        {/* Example Conditional Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input 
              type="checkbox" 
              checked={row.usedDuringPeak || false} 
              onChange={(e) => handleChange('usedDuringPeak', e.target.checked)} 
            />
            Used During Peak Hours
          </label>
        </div>
      </div>
    );
  };

  return (
    <ArrayTable 
      title="Appliances"
      items={data}
      emptyTemplate={emptyAppliance}
      onChange={onChange}
      renderRow={renderRow}
    />
  );
}
