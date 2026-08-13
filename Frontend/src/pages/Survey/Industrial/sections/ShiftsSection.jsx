import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';
import Button from '../../../../components/common/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function ShiftsSection({ data = [], onChange, profileData = {}, onProfileChange }) {
  const handleProfileChange = (name, value) => {
    onProfileChange(name, value);
  };

  const addShift = () => {
    onChange([...data, { shiftNumber: data.length + 1, startTime: '', endTime: '' }]);
  };

  const removeShift = (index) => {
    const newShifts = [...data];
    newShifts.splice(index, 1);
    newShifts.forEach((s, i) => { s.shiftNumber = i + 1; });
    onChange(newShifts);
  };

  const handleShiftChange = (index, field, value) => {
    const newShifts = [...data];
    newShifts[index][field] = value;
    onChange(newShifts);
  };

  return (
    <Card padding="2rem">
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem', fontWeight: 600 }}>E1.7 - E1.13: Production Shifts & Flexibility</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E1.7 Number of Production Shifts
          </label>
          <Select
            value={profileData.numberOfShifts || ''}
            onChange={(e) => handleProfileChange('numberOfShifts', e.target.value)}
            options={[
              { value: 'One', label: 'One' },
              { value: 'Two', label: 'Two' },
              { value: 'Three', label: 'Three' },
              { value: 'Variable', label: 'Variable' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <h4 style={{ marginBottom: '1rem', color: '#334155', fontSize: '1rem', fontWeight: 600 }}>E1.8 Shift Timings</h4>
        {data.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>No shifts added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            {data.map((shift, index) => (
              <div key={index} style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#475569', fontSize: '0.875rem' }}>Shift #{shift.shiftNumber}</div>
                  <button 
                    type="button" 
                    onClick={() => removeShift(index)}
                    style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove shift"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '1rem' }}>
                  <FormInput
                    label="Start Time"
                    type="time"
                    value={shift.startTime || ''}
                    onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                  />
                  <FormInput
                    label="End Time"
                    type="time"
                    value={shift.endTime || ''}
                    onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <Button type="button" variant="secondary" onClick={addShift} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Shift
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E1.9 Does the industry operate continuously for 24 hours?
          </label>
          <Select
            value={profileData.operates24Hours || ''}
            onChange={(e) => handleProfileChange('operates24Hours', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Only on certain days', label: 'Only on certain days' }
            ]}
          />
        </div>

        <FormInput
          label="E1.10 Which months have the highest production activity?"
          type="text"
          value={profileData.highestProductionMonths || ''}
          onChange={(e) => handleProfileChange('highestProductionMonths', e.target.value)}
          placeholder="e.g. Oct - Jan"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E1.11 Are production schedules fixed or adjustable?
          </label>
          <Select
            value={profileData.productionSchedules || ''}
            onChange={(e) => handleProfileChange('productionSchedules', e.target.value)}
            options={[
              { value: 'Fixed', label: 'Fixed' },
              { value: 'Partly adjustable', label: 'Partly adjustable' },
              { value: 'Fully adjustable', label: 'Fully adjustable' }
            ]}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>
            E1.12 Can production be increased before or after peak hours?
          </label>
          <Select
            value={profileData.productionIncreaseFlexibility || ''}
            onChange={(e) => handleProfileChange('productionIncreaseFlexibility', e.target.value)}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'Partly', label: 'Partly' },
              { value: 'No', label: 'No' }
            ]}
          />
        </div>
      </div>

      <div>
        <FormInput
          label="E1.13 Are there planned shutdown or maintenance periods? (Record frequency & timing)"
          type="text"
          value={profileData.plannedShutdowns || ''}
          onChange={(e) => handleProfileChange('plannedShutdowns', e.target.value)}
          placeholder="e.g. Annually in December"
        />
      </div>
    </Card>
  );
}
