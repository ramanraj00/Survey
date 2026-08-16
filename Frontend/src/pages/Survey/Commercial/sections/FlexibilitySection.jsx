import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';
import { D2_FIXED_EQUIPMENT } from '../constants';

export default function FlexibilitySection({ data, onChange, isReadOnly, inventoryItems = [] }) {
  const dynamicEquipmentList = inventoryItems.map(item => item.equipmentDescription).filter(Boolean);
  const equipmentOptions = dynamicEquipmentList.length > 0 ? dynamicEquipmentList : D2_FIXED_EQUIPMENT;
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleMultiSelectChange = (name, value) => {
    const currentStr = data[name] || '';
    let currentArr = currentStr ? currentStr.split(', ') : [];
    
    if (currentArr.includes(value)) {
      currentArr = currentArr.filter(v => v !== value);
    } else {
      currentArr.push(value);
    }
    
    onChange({ [name]: currentArr.join(', ') });
  };

  const SectionHeader = ({ title }) => (
    <div style={{ marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
    </div>
  );

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
        D4: Demand Response (DR) Flexibility & Willingness
      </h2>

      {/* Group 1: Flexibility Readiness */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionHeader title="Flexibility Readiness" />
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">
              D4.1 Would the business be willing to adjust selected non-critical loads during peak-demand periods?
            </label>
            <Select
              name="willingness"
              value={data.willingness || ''}
              onChange={handleChange}
              disabled={isReadOnly}
              style={{ maxWidth: '400px' }}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Depends on the situation">Depends on the situation</option>
            </Select>
          </div>

          {data.willingness && data.willingness !== 'No' && (
            <div style={{ gridColumn: '1 / -1', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                D4.2 Which loads could be adjusted? (Select all that apply)
              </label>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {equipmentOptions.map((equip, idx) => {
                  const isSelected = (data.constraints || '').includes(equip);
                  return (
                    <label key={`${equip}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: isReadOnly ? 'default' : 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isReadOnly && handleMultiSelectChange('constraints', equip)}
                        disabled={isReadOnly}
                      />
                      {equip}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="form-label">
              D4.3 What type of adjustment would be possible?
            </label>
            <Select
              name="adjustmentType"
              value={data.adjustmentType || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Operate later">Operate later</option>
              <option value="Reduce Use">Reduce Use</option>
              <option value="Temporarily Switch off">Temporarily Switch off</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Group 2: Operational Parameters */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionHeader title="Operational Parameters" />
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          
          <div>
            <label className="form-label">
              D4.4 For how long could these loads be adjusted?
            </label>
            <Select
              name="estimatedAdjustmentDuration"
              value={data.estimatedAdjustmentDuration || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="15mins">15mins</option>
              <option value="30mins">30mins</option>
              <option value="1hr">1hr</option>
              <option value="2hr">2hr</option>
              <option value="Longer">Longer</option>
              <option value="Not willing">Not willing</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.5 How much advance notice would the establishment require?
            </label>
            <Select
              name="requiredAdvanceNotice"
              value={data.requiredAdvanceNotice || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Immediate">Immediate</option>
              <option value="15-30mins">15-30mins</option>
              <option value="1-2hrs">1-2hrs</option>
              <option value="Day ahead">Day ahead</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.6 How often would the business be comfortable participating?
            </label>
            <Select
              name="participationFrequency"
              value={data.participationFrequency || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Daily">Daily</option>
              <option value="2-3times/week">2-3times/week</option>
              <option value="Weekly">Weekly</option>
              <option value="Only emergencies">Only emergencies</option>
              <option value="Not willing">Not willing</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.7 Would the shifted load be operated immediately after the peak period?
            </label>
            <Select
              name="shiftedLoadTiming"
              value={data.shiftedLoadTiming || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Depends on the Load">Depends on the Load</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.8 What could prevent participation?
            </label>
            <Select
              name="participationBarriers"
              value={data.participationBarriers || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Customer comfort">Customer comfort</option>
              <option value="Service quality">Service quality</option>
              <option value="Business hours">Business hours</option>
              <option value="Staff Availability">Staff Availability</option>
              <option value="Equipment Limitations">Equipment Limitations</option>
              <option value="Regulatory requirements">Regulatory requirements</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Group 3: Communication & Incentives */}
      <div>
        <SectionHeader title="Communication & Incentives" />
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          
          <div>
            <label className="form-label">
              D4.9 What is the preferred notification method?
            </label>
            <Select
              name="notificationMethod"
              value={data.notificationMethod || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Call">Call</option>
              <option value="SMS">SMS</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="Dedicated app/notification">Dedicated app/notification</option>
              <option value="Email">Email</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.10 Would expected bill savings increase willingness?
            </label>
            <Select
              name="billSavingsInfluence"
              value={data.billSavingsInfluence || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="Maybe">Maybe</option>
              <option value="No">No</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.11 Would an incentive increase willingness?
            </label>
            <Select
              name="incentiveInfluence"
              value={data.incentiveInfluence || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="Maybe">Maybe</option>
              <option value="No">No</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.12 What type of incentive would the business prefer?
            </label>
            <Select
              name="preferredIncentive"
              value={data.preferredIncentive || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Electricity bill rebate">Electricity bill rebate</option>
              <option value="Payment based on energy red.">Payment based on energy red.</option>
              <option value="Fixed participation">Fixed participation</option>
              <option value="Points/Vouchers">Points/Vouchers</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.13 Consider smart plugs/timers if voluntary?
            </label>
            <Select
              name="automationInterest"
              value={data.automationInterest || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="Maybe, with more info">Maybe, with more info</option>
              <option value="No">No</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D4.14 Willing to participate in a trial DR event?
            </label>
            <Select
              name="trialEventWillingnessText"
              value={data.trialEventWillingnessText || ''}
              onChange={handleChange}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="Maybe">Maybe</option>
              <option value="No">No</option>
            </Select>
          </div>

        </div>
      </div>
    </Card>
  );
}
