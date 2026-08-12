import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';

export default function IndustrialDRSection({ data = {}, onChange }) {
  const handleChange = (name, value) => {
    onChange(name, value);
  };

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem', fontWeight: 600 }}>E4.1 - E4.20: Demand Response (DR) Willingness</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.1 Adjust non-critical loads during peak?
          </label>
          <Select
            value={data.drAdjustNonCriticalLoads || ''}
            onChange={(e) => handleChange('drAdjustNonCriticalLoads', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Situation-based', label: 'Situation-based' }
            ]}
          />
        </div>

        <FormInput
          label="E4.2 Which processes could be adjusted?"
          type="text"
          value={data.drAdjustableProcesses || ''}
          onChange={(e) => handleChange('drAdjustableProcesses', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.3 Type of adjustment possible?
          </label>
          <Select
            value={data.drAdjustmentType || ''}
            onChange={(e) => handleChange('drAdjustmentType', e.target.value)}
            options={[
              { value: 'Operate later', label: 'Operate later' },
              { value: 'Reduce output', label: 'Reduce output' },
              { value: 'Temporarily switch off', label: 'Temporarily switch off' },
              { value: 'Use alternative supply', label: 'Use alternative supply' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.4 Adjust entire load or part?
          </label>
          <Select
            value={data.drLoadAdjustability || ''}
            onChange={(e) => handleChange('drLoadAdjustability', e.target.value)}
            options={[
              { value: 'Entire load', label: 'Entire load' },
              { value: 'Part of the load', label: 'Part of the load' },
              { value: 'Situation-based', label: 'Situation-based' },
              { value: 'Not possible', label: 'Not possible' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.5 How long could loads be adjusted?
          </label>
          <Select
            value={data.drAdjustmentDurationLimit || ''}
            onChange={(e) => handleChange('drAdjustmentDurationLimit', e.target.value)}
            options={[
              { value: '15mins', label: '15mins' },
              { value: '30mins', label: '30mins' },
              { value: '1hr', label: '1hr' },
              { value: '2hrs', label: '2hrs' },
              { value: 'More than 2 hrs', label: 'More than 2 hrs' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.6 Advance notice required?
          </label>
          <Select
            value={data.drAdvanceNoticeRequired || ''}
            onChange={(e) => handleChange('drAdvanceNoticeRequired', e.target.value)}
            options={[
              { value: 'Immediate', label: 'Immediate' },
              { value: '15-30mins', label: '15-30mins' },
              { value: '1-2hrs', label: '1-2hrs' },
              { value: 'Day ahead', label: 'Day ahead' },
              { value: 'More than a day', label: 'More than a day' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.7 Participation frequency comfort?
          </label>
          <Select
            value={data.drParticipationFrequency || ''}
            onChange={(e) => handleChange('drParticipationFrequency', e.target.value)}
            options={[
              { value: 'Daily', label: 'Daily' },
              { value: '2-3 times/week', label: '2-3 times/week' },
              { value: 'Weekly', label: 'Weekly' },
              { value: 'Only emergencies', label: 'Only emergencies' },
              { value: 'Not willing', label: 'Not willing' }
            ]}
          />
        </div>

        <FormInput
          label="E4.8 When is participation not possible?"
          type="text"
          value={data.drImpossibleParticipationPeriods || ''}
          onChange={(e) => handleChange('drImpossibleParticipationPeriods', e.target.value)}
          placeholder="Record details"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.9 What could prevent participation?
          </label>
          <Select
            value={data.drParticipationBarriers || ''}
            onChange={(e) => handleChange('drParticipationBarriers', e.target.value)}
            options={[
              { value: 'Safety', label: 'Safety' },
              { value: 'Product quality', label: 'Product quality' },
              { value: 'Production target', label: 'Production target' },
              { value: 'Equipment limitation', label: 'Equipment limitation' },
              { value: 'Labour availability', label: 'Labour availability' },
              { value: 'Delivery timeline', label: 'Delivery timeline' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.10 Increase prod before peak?
          </label>
          <Select
            value={data.drIncreaseProductionBeforePeak || ''}
            onChange={(e) => handleChange('drIncreaseProductionBeforePeak', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Maybe (situation basis)', label: 'Maybe (situation basis)' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.11 Complete delayed prod after?
          </label>
          <Select
            value={data.drCompleteDelayedProductionAfterPeak || ''}
            onChange={(e) => handleChange('drCompleteDelayedProductionAfterPeak', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Maybe (situation basis)', label: 'Maybe (situation basis)' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.12 Delayed prod creates new peak?
          </label>
          <Select
            value={data.drDelayedProductionNewPeak || ''}
            onChange={(e) => handleChange('drDelayedProductionNewPeak', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Not sure', label: 'Not sure' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.13 Option to decline individual requests?
          </label>
          <Select
            value={data.drOptionToDeclineRequests || ''}
            onChange={(e) => handleChange('drOptionToDeclineRequests', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.14 Preferred notification method?
          </label>
          <Select
            value={data.drPreferredNotificationMethod || ''}
            onChange={(e) => handleChange('drPreferredNotificationMethod', e.target.value)}
            options={[
              { value: 'Phone call', label: 'Phone call' },
              { value: 'SMS', label: 'SMS' },
              { value: 'Whatsapp', label: 'Whatsapp' },
              { value: 'Dedicated Mobile app', label: 'Dedicated Mobile app' },
              { value: 'Email', label: 'Email' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.15 Bill savings increase willingness?
          </label>
          <Select
            value={data.drSavingsInfoIncreasesWillingness || ''}
            onChange={(e) => handleChange('drSavingsInfoIncreasesWillingness', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'Maybe', label: 'Maybe' },
              { value: 'No', label: 'No' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.16 Incentive increase willingness?
          </label>
          <Select
            value={data.drIncentiveIncreasesWillingness || ''}
            onChange={(e) => handleChange('drIncentiveIncreasesWillingness', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'Maybe', label: 'Maybe' },
              { value: 'No', label: 'No' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.17 Preferred incentive type?
          </label>
          <Select
            value={data.drPreferredIncentiveType || ''}
            onChange={(e) => handleChange('drPreferredIncentiveType', e.target.value)}
            options={[
              { value: 'Financial incentive per kWh', label: 'Financial incentive per kWh' },
              { value: 'Demand charge reduction', label: 'Demand charge reduction' },
              { value: 'Fixed financial payment', label: 'Fixed financial payment' },
              { value: 'Bill rebate', label: 'Bill rebate' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.18 Consider automated controls?
          </label>
          <Select
            value={data.drConsiderAutomatedControls || ''}
            onChange={(e) => handleChange('drConsiderAutomatedControls', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'Maybe (with more information)', label: 'Maybe (with more information)' },
              { value: 'No', label: 'No' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.19 Willing to participate in trial?
          </label>
          <Select
            value={data.drWillingToParticipateInTrial || ''}
            onChange={(e) => handleChange('drWillingToParticipateInTrial', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Not sure', label: 'Not sure' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E4.20 Use data to verify reduction?
          </label>
          <Select
            value={data.drEquipmentDataVerification || ''}
            onChange={(e) => handleChange('drEquipmentDataVerification', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Subject to approval', label: 'Subject to approval' }
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
