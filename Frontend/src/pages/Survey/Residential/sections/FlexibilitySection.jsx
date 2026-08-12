import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';

export default function FlexibilitySection({ drData = {}, onChangeDR, flexData = {}, onChangeFlex }) {
  const handleDRChange = (e) => onChangeDR(e.target.name, e.target.value);
  const handleFlexChange = (e) => onChangeFlex(e.target.name, e.target.value);

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C4: Residential Flexibility / Willingness</h3>
      
      <div className="form-grid">
        {/* C4.1 */}
        <div>
          <label className="form-label">Willing to adjust use of non-essential appliances? (C4.1)</label>
          <Select className="form-input" name="willingness" value={drData.willingness || ''} onChange={handleDRChange}>
            <option value="">Select</option>
            <option value="HIGH">Yes</option>
            <option value="LOW">No</option>
            <option value="MEDIUM">Conditional</option>
          </Select>
        </div>
        
        {/* C4.2 */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Which appliances could be adjusted? (C4.2)</label>
          <input className="form-input" name="constraints" value={drData.constraints || ''} onChange={handleDRChange} placeholder="Enter appliances from inventory" />
        </div>

        {/* C4.3 */}
        <div>
          <label className="form-label">How long could you reduce without inconvenience? (C4.3)</label>
          <Select className="form-input" name="estimatedAdjustmentDuration" value={drData.estimatedAdjustmentDuration || ''} onChange={handleDRChange}>
            <option value="">Select</option>
            <option value="15mins">15mins</option>
            <option value="30mins">30mins</option>
            <option value="1hr">1hr</option>
            <option value="2hr">2hr</option>
            <option value="Longer">Longer</option>
            <option value="Not willing">Not willing</option>
          </Select>
        </div>

        {/* C4.4 */}
        <div>
          <label className="form-label">How much advance notice required? (C4.4)</label>
          <Select className="form-input" name="requiredAdvanceNotice" value={drData.requiredAdvanceNotice || ''} onChange={handleDRChange}>
            <option value="">Select</option>
            <option value="0">Immediate</option>
            <option value="30">15-30mins</option>
            <option value="120">1-2hrs</option>
            <option value="1440">Day ahead</option>
          </Select>
        </div>

        {/* C4.5 */}
        <div>
          <label className="form-label">How often comfortable participating? (C4.5)</label>
          <Select className="form-input" name="participationFrequency" value={drData.participationFrequency || ''} onChange={handleDRChange}>
            <option value="">Select</option>
            <option value="Daily">Daily</option>
            <option value="2-3times/week">2-3times/week</option>
            <option value="Weekly">Weekly</option>
            <option value="Only emergencies">Only emergencies</option>
            <option value="Not willing">Not willing</option>
          </Select>
        </div>

        {/* C4.6 */}
        <div>
          <label className="form-label">How to receive DR notification? (C4.6)</label>
          <Select className="form-input" name="notificationMethod" value={drData.notificationMethod || ''} onChange={handleDRChange}>
            <option value="">Select</option>
            <option value="Call">Call</option>
            <option value="SMS">SMS</option>
            <option value="Whatsapp">Whatsapp</option>
            <option value="Dedicated app">Dedicated app/notification</option>
            <option value="Email">Email</option>
          </Select>
        </div>

        {/* C4.7 */}
        <div>
          <label className="form-label">Would info on bill savings increase willingness? (C4.7)</label>
          <Select className="form-input" name="billSavingsInfluence" value={drData.billSavingsInfluence || ''} onChange={handleDRChange}>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
          </Select>
        </div>

        {/* C4.8 */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Would an incentive increase willingness? (C4.8)</label>
          <input className="form-input" name="incentiveInfluence" value={drData.incentiveInfluence || ''} onChange={handleDRChange} />
        </div>

        {/* C4.9 */}
        <div>
          <label className="form-label">What type of incentive preferred? (C4.9)</label>
          <Select className="form-input" name="preferredIncentive" value={drData.preferredIncentive || ''} onChange={handleDRChange}>
            <option value="">Select</option>
            <option value="Electricity bill rebate">Electricity bill rebate</option>
            <option value="Payment based on energy reduced">Payment based on energy reduced</option>
            <option value="Fixed participation">Fixed participation</option>
            <option value="Points/Vouchers">Points/Vouchers</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        {/* C4.10 */}
        <div>
          <label className="form-label">Consider smart plugs/timers? (C4.10)</label>
          <Select className="form-input" name="automationInterest" value={drData.automationInterest === true ? 'true' : drData.automationInterest === false ? 'false' : drData.automationInterest === 'maybe' ? 'maybe' : ''} onChange={e => {
            let val = e.target.value;
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            onChangeDR('automationInterest', val);
          }}>
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="maybe">Maybe, with more info</option>
            <option value="false">No</option>
          </Select>
        </div>
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#E2E8F0' }} />

      <h4 style={{ marginBottom: '1rem', color: '#334155' }}>Specific Load Adjustments</h4>
      <div className="form-grid">
        <div>
          <label className="form-label">Can AC temp be increased by 1-2 degrees?</label>
          <input className="form-input" name="acTemperatureAdjustment" value={flexData.acTemperatureAdjustment || ''} onChange={handleFlexChange} />
        </div>
        <div>
          <label className="form-label">Can water heating be completed before peak?</label>
          <input className="form-input" name="waterHeatingAdjustment" value={flexData.waterHeatingAdjustment || ''} onChange={handleFlexChange} />
        </div>
        <div>
          <label className="form-label">Can washing/vacuuming/ironing be moved?</label>
          <input className="form-input" name="washingCleaningAdjustment" value={flexData.washingCleaningAdjustment || ''} onChange={handleFlexChange} />
        </div>
        <div>
          <label className="form-label">Can EV charging be delayed?</label>
          <input className="form-input" name="evChargingAdjustment" value={flexData.evChargingAdjustment || ''} onChange={handleFlexChange} />
        </div>
        <div>
          <label className="form-label">Can water pumping be advanced/delayed?</label>
          <input className="form-input" name="waterPumpingAdjustment" value={flexData.waterPumpingAdjustment || ''} onChange={handleFlexChange} />
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
