import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';

export default function SolarSection({ data = {}, onChange }) {
  const handleChange = (e) => onChange(e.target.name, e.target.value);
  const handleCheckbox = (name, val) => onChange(name, val);

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C3.3: Rooftop Solar</h3>
      
      <div className="form-grid">
        <div>
          <label className="form-label">Is rooftop solar installed? (C3.3.1)</label>
          <Select className="form-input" name="installed" value={data.installed === true ? 'true' : data.installed === false ? 'false' : ''} onChange={e => handleCheckbox('installed', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </div>

        {data.installed && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 2 }}>
                <label className="form-label">Installed solar capacity (C3.3.2)</label>
                <input className="form-input" name="capacity" value={data.capacity || ''} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                 <label className="form-label">&nbsp;</label>
                 <Select className="form-input" name="capacityUnit" value={data.capacityUnit || ''} onChange={handleChange}>
                   <option value="kW">kW</option>
                   <option value="W">W</option>
                 </Select>
              </div>
            </div>
            <div>
              <label className="form-label">Is battery connected to solar? (C3.3.3)</label>
              <Select className="form-input" name="batteryConnected" value={data.batteryConnected === true ? 'true' : data.batteryConnected === false ? 'false' : ''} onChange={e => handleCheckbox('batteryConnected', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
                <option value="null">NA</option>
              </Select>
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
