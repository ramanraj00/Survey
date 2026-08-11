import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';

export default function DRProfilesSection({ data = {}, onChange }) {
  
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem' }}>Demand Response Profile</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Willingness to Participate</label>
          <Select 
            value={data.willingness || ''} 
            onChange={(e) => handleChange('willingness', e.target.value)}
            options={[
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
              { value: 'NOT_INTERESTED', label: 'Not Interested' }
            ]}
          />
        </div>

        <FormInput
          label="Estimated Adjustment Duration (Text)"
          type="text"
          value={data.estimatedAdjustmentDuration || ''}
          onChange={(e) => handleChange('estimatedAdjustmentDuration', e.target.value)}
        />

        <FormInput
          label="Maximum Adjustment Duration (mins)"
          type="number"
          value={data.maximumAdjustmentDuration || ''}
          onChange={(e) => handleChange('maximumAdjustmentDuration', e.target.value === '' ? null : Number(e.target.value))}
        />

        <FormInput
          label="Required Advance Notice (mins)"
          type="number"
          value={data.requiredAdvanceNotice || ''}
          onChange={(e) => handleChange('requiredAdvanceNotice', e.target.value === '' ? null : Number(e.target.value))}
        />

        <FormInput
          label="Participation Frequency"
          type="text"
          value={data.participationFrequency || ''}
          onChange={(e) => handleChange('participationFrequency', e.target.value)}
          placeholder="e.g. Once a week"
        />

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Preferred Notification Method</label>
          <Select 
            value={data.notificationMethod || ''} 
            onChange={(e) => handleChange('notificationMethod', e.target.value)}
            options={[
              { value: 'SMS', label: 'SMS' },
              { value: 'EMAIL', label: 'Email' },
              { value: 'APP', label: 'App Notification' }
            ]}
          />
        </div>

        <FormInput
          label="Influence of Bill Savings"
          type="text"
          value={data.billSavingsInfluence || ''}
          onChange={(e) => handleChange('billSavingsInfluence', e.target.value)}
        />

        <FormInput
          label="Influence of Incentives"
          type="text"
          value={data.incentiveInfluence || ''}
          onChange={(e) => handleChange('incentiveInfluence', e.target.value)}
        />

        <FormInput
          label="Preferred Incentive Type"
          type="text"
          value={data.preferredIncentive || ''}
          onChange={(e) => handleChange('preferredIncentive', e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input 
            type="checkbox" 
            checked={data.automationInterest || false} 
            onChange={(e) => handleChange('automationInterest', e.target.checked)}
          />
          <label style={{ fontSize: '0.875rem' }}>Interested in Automation</label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input 
            type="checkbox" 
            checked={data.trialEventWillingness || false} 
            onChange={(e) => handleChange('trialEventWillingness', e.target.checked)}
          />
          <label style={{ fontSize: '0.875rem' }}>Willing to Participate in Trial Events</label>
        </div>

        <FormInput
          label="Other Constraints"
          type="text"
          value={data.constraints || ''}
          onChange={(e) => handleChange('constraints', e.target.value)}
        />
        
      </div>
    </Card>
  );
}
