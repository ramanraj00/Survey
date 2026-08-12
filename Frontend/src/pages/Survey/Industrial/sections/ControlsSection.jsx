import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';

export default function ControlsSection({ data = {}, onChange }) {
  const handleChange = (name, value) => {
    onChange(name, value);
  };

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem', fontWeight: 600 }}>E3.1 - E3.6: Existing Controls and Approvals</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E3.1 Are timers or automatic controls used?
          </label>
          <Select
            value={data.automaticControlsUsed || ''}
            onChange={(e) => handleChange('automaticControlsUsed', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Not sure', label: 'Not sure' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E3.2 Is PLC, SCADA or central control available?
          </label>
          <Select
            value={data.centralControlAvailable || ''}
            onChange={(e) => handleChange('centralControlAvailable', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E3.3 Can equipment schedules be changed centrally?
          </label>
          <Select
            value={data.centrallyChangedSettings || ''}
            onChange={(e) => handleChange('centrallyChangedSettings', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Not sure', label: 'Not sure' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E3.4 Electricity monitored for individual machines?
          </label>
          <Select
            value={data.individualMonitoring || ''}
            onChange={(e) => handleChange('individualMonitoring', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Not sure', label: 'Not sure' }
            ]}
          />
        </div>
      </div>

      <h4 style={{ marginBottom: '1rem', color: '#334155', fontSize: '1rem', fontWeight: 600 }}>Approvals (E3.5 - E3.6)</h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <FormInput
          label="E3.5 Approver Name (For temporary change)"
          type="text"
          value={data.approvalAuthorityName || ''}
          onChange={(e) => handleChange('approvalAuthorityName', e.target.value)}
        />
        
        <FormInput
          label="Approver Designation"
          type="text"
          value={data.approvalAuthorityDesignation || ''}
          onChange={(e) => handleChange('approvalAuthorityDesignation', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E3.6 Who is likely to implement the approved change?
          </label>
          <Select
            value={data.implementer || ''}
            onChange={(e) => handleChange('implementer', e.target.value)}
            options={[
              { value: 'Plant Manager', label: 'Plant Manager' },
              { value: 'Production Manager', label: 'Production Manager' },
              { value: 'Electrical team', label: 'Electrical team' },
              { value: 'Operator', label: 'Operator' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
