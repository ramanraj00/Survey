import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';

export default function EVChargingSection({ data = {}, onChange }) {
  const handleChange = (e) => onChange(e.target.name, e.target.value);
  const handleCheckbox = (name, val) => onChange(name, val);

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C3.1: Electric Vehicles</h3>
      
      <div className="form-grid">
        <div>
          <label className="form-label">Charge an EV at home? (C3.1.1)</label>
          <Select className="form-input" name="hasEV" value={data.hasEV === true ? 'true' : data.hasEV === false ? 'false' : ''} onChange={e => handleCheckbox('hasEV', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </div>

        {data.hasEV && (
          <>
            <div>
              <label className="form-label">Vehicle type (C3.1.2)</label>
              <input className="form-input" name="vehicleType" value={data.vehicleType || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Number of vehicles (C3.1.3)</label>
              <input className="form-input" type="number" name="vehicleCount" value={data.vehicleCount || ''} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 2 }}>
                <label className="form-label">Charger rating (C3.1.4)</label>
                <input className="form-input" name="chargerRating" value={data.chargerRating || ''} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                 <label className="form-label">&nbsp;</label>
                 <Select className="form-input" name="chargerRatingUnit" value={data.chargerRatingUnit || ''} onChange={handleChange}>
                   <option value="kW">kW</option>
                   <option value="W">W</option>
                 </Select>
              </div>
            </div>
            <div>
              <label className="form-label">Usual charging start (C3.1.5)</label>
              <input type="time" className="form-input" name="usualChargingStart" value={data.usualChargingStart || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Usual charging end (C3.1.5)</label>
              <input type="time" className="form-input" name="usualChargingEnd" value={data.usualChargingEnd || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Charging frequency (C3.1.6)</label>
              <Select className="form-input" name="chargingFrequency" value={data.chargingFrequency || ''} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Daily">Daily</option>
                <option value="Occasionally">Occasionally</option>
              </Select>
            </div>
            <div>
              <label className="form-label">Can charging be moved outside peak? (C3.1.7)</label>
              <Select className="form-input" name="peakShiftAbility" value={data.peakShiftAbility || ''} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Fully">Fully</option>
                <option value="Partly">Partly</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </Select>
            </div>
            <div>
              <label className="form-label">Max allowable delay (mins) (C3.1.8)</label>
              <input className="form-input" type="number" name="maximumAllowableDelay" value={data.maximumAllowableDelay || ''} onChange={handleChange} />
            </div>
          </>
        )}
      </div>
      <style>{`
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid #E2E8F0; background-color: #F8FAFC; color: #0F172A; font-size: 0.95rem; box-sizing: border-box; }
      `}</style>
    </Card>
  );
}
