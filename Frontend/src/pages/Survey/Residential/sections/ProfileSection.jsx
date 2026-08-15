import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';

export default function ProfileSection({ data = {}, onChange }) {
  const handleChange = (e) => onChange(e.target.name, e.target.value);
  const handleCheckbox = (e) => onChange(e.target.name, e.target.checked);

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C1: Household / Daily Routine</h3>
      
      <div className="form-grid">
        {/* C1.1 Type of Residence */}
        <div>
          <label className="form-label">Type of Residence (C1.1)</label>
          <Select 
            className="form-input" 
            name="residenceType" 
            value={data.residenceType || ''} 
            onChange={handleChange}
            options={[
              { value: '', label: 'Select' },
              { value: 'Independent house', label: 'Independent house' },
              { value: 'Apartment', label: 'Apartment' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>

        {/* C1.2 Approx Built Area */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 2 }}>
            <label className="form-label">Approx built area (C1.2)</label>
            <input className="form-input" name="builtArea" value={data.builtArea || ''} onChange={handleChange} placeholder="e.g. 1500" />
          </div>
          <div style={{ flex: 1 }}>
             <label className="form-label">&nbsp;</label>
             <Select 
               className="form-input" 
               name="builtAreaUnit" 
               value={data.builtAreaUnit || ''} 
               onChange={handleChange}
               options={[
                 { value: 'sq/ft', label: 'sq/ft' },
                 { value: 'Not known', label: 'Not known' }
               ]}
             />
          </div>
        </div>

        {/* C1.3 Number of household members */}
        <div>
          <label className="form-label">Adults (C1.3)</label>
          <input className="form-input" type="number" name="adultCount" value={data.adultCount || ''} onChange={handleChange} />
        </div>
        <div>
          <label className="form-label">Children (C1.3)</label>
          <input className="form-input" type="number" name="childrenCount" value={data.childrenCount || ''} onChange={handleChange} />
        </div>

        {/* C1.4 WFH */}
        <div>
          <label className="form-label">Anyone regularly WFH? (C1.4)</label>
          <Select 
            className="form-input" 
            name="workFromHome" 
            value={data.workFromHome === true ? 'true' : data.workFromHome === false ? 'false' : ''} 
            onChange={e => onChange('workFromHome', e.target.value === 'true')}
            options={[
              { value: '', label: 'Select' },
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
          />
        </div>

        {data.workFromHome && (
          <>
            <div>
              <label className="form-label">No of people WFH</label>
              <input className="form-input" type="number" name="workFromHomePeople" value={data.workFromHomePeople || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">WFH Timings</label>
              <input className="form-input" name="workFromHomeTimings" value={data.workFromHomeTimings || ''} onChange={handleChange} placeholder="e.g. 9AM - 5PM" />
            </div>
          </>
        )}

        {/* C1.5 Weekends */}
        <div>
          <label className="form-label">More people home on weekends? (C1.5)</label>
          <Select 
            className="form-input" 
            name="morePeopleOnWeekend" 
            value={data.morePeopleOnWeekend === true ? 'true' : data.morePeopleOnWeekend === false ? 'false' : ''} 
            onChange={e => onChange('morePeopleOnWeekend', e.target.value === 'true')}
            options={[
              { value: '', label: 'Select' },
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
          />
        </div>

        {/* C1.6 Usage period */}
        <div>
          <label className="form-label">Highest usage period (C1.6)</label>
          <Select 
            className="form-input" 
            name="highestUsagePeriod" 
            value={data.highestUsagePeriod || ''} 
            onChange={handleChange}
            options={[
              { value: '', label: 'Select' },
              { value: 'Morning', label: 'Morning' },
              { value: 'Afternoon', label: 'Afternoon' },
              { value: 'Evening', label: 'Evening' },
              { value: 'Night', label: 'Night' },
              { value: 'Not sure', label: 'Not sure' }
            ]}
          />
        </div>

        {/* C1.7 Activities */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Main activities/appliances during this period (C1.7)</label>
          <input className="form-input" name="mainUsageActivities" value={data.mainUsageActivities || ''} onChange={handleChange} />
        </div>

        {/* C1.8 Bill checking */}
        <div>
          <label className="form-label">Bill checking freq (C1.8)</label>
          <Select 
            className="form-input" 
            name="billCheckingFrequency" 
            value={data.billCheckingFrequency || ''} 
            onChange={handleChange}
            options={[
              { value: '', label: 'Select' },
              { value: 'Every month', label: 'Every month' },
              { value: 'Occasionally', label: 'Occasionally' },
              { value: 'Only when the bill is high', label: 'Only when the bill is high' },
              { value: 'Never', label: 'Never' }
            ]}
          />
        </div>
      </div>
      <style>{`
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid #E2E8F0; background-color: #F8FAFC; color: #0F172A; font-size: 0.95rem; box-sizing: border-box; }
      `}</style>
    </Card>
  );
}
