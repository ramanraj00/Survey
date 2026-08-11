import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';

export default function CommonLoadsInfoSection({ data = {}, onChange }) {
  
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem' }}>Common Loads Information</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input 
            type="checkbox" 
            checked={data.hasSeparateConnection || false} 
            onChange={(e) => handleChange('hasSeparateConnection', e.target.checked)}
          />
          <label style={{ fontSize: '0.875rem' }}>Has Separate Connection for Common Loads</label>
        </div>

        <FormInput
          label="Management Entity"
          type="text"
          value={data.managementEntity || ''}
          onChange={(e) => handleChange('managementEntity', e.target.value)}
        />

        <FormInput
          label="Approval Authority Name"
          type="text"
          value={data.approvalAuthorityName || ''}
          onChange={(e) => handleChange('approvalAuthorityName', e.target.value)}
        />

        <FormInput
          label="Approval Authority Role"
          type="text"
          value={data.approvalAuthorityRole || ''}
          onChange={(e) => handleChange('approvalAuthorityRole', e.target.value)}
        />

        <FormInput
          label="Approval Authority Phone"
          type="tel"
          value={data.approvalAuthorityPhone || ''}
          onChange={(e) => handleChange('approvalAuthorityPhone', e.target.value)}
        />

        <FormInput
          label="Best Time for Approval/Survey"
          type="text"
          value={data.approvalTime || ''}
          onChange={(e) => handleChange('approvalTime', e.target.value)}
        />
        
      </div>
    </Card>
  );
}
