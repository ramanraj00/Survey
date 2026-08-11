import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';

export default function LoadFlexibilitySection({ data = {}, onChange }) {
  
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem' }}>Load Flexibility</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        <FormInput
          label="AC Temperature Adjustment (e.g. increase by 2°C)"
          type="text"
          value={data.acTemperatureAdjustment || ''}
          onChange={(e) => handleChange('acTemperatureAdjustment', e.target.value)}
        />

        <FormInput
          label="Water Heating Adjustment"
          type="text"
          value={data.waterHeatingAdjustment || ''}
          onChange={(e) => handleChange('waterHeatingAdjustment', e.target.value)}
        />

        <FormInput
          label="Washing & Cleaning Adjustment"
          type="text"
          value={data.washingCleaningAdjustment || ''}
          onChange={(e) => handleChange('washingCleaningAdjustment', e.target.value)}
        />

        <FormInput
          label="EV Charging Adjustment"
          type="text"
          value={data.evChargingAdjustment || ''}
          onChange={(e) => handleChange('evChargingAdjustment', e.target.value)}
        />

        <FormInput
          label="Water Pumping Adjustment"
          type="text"
          value={data.waterPumpingAdjustment || ''}
          onChange={(e) => handleChange('waterPumpingAdjustment', e.target.value)}
        />
        
      </div>
    </Card>
  );
}
