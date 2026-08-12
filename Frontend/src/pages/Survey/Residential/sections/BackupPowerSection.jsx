import React, { useEffect } from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';

export default function BackupPowerSection({ data = [], onChange }) {
  useEffect(() => {
    if (data.length === 0) {
      onChange([
        { sourceType: 'Inverter / UPS', available: null, batteryCapacity: '', batteryCapacityUnit: 'Ah', automaticCharging: null, chargingControl: '' }
      ]);
    }
  }, [data, onChange]);

  const handleChange = (index, field, value) => {
    const newData = [...data];
    if (!newData[index]) return;
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C3.2: Inverter / UPS</h3>
      
      {data.map((item, index) => (
        <div key={index} className="form-grid">
          <div>
            <label className="form-label">Available? (C3.2.1)</label>
            <Select className="form-input" value={item.available === true ? 'true' : item.available === false ? 'false' : ''} onChange={e => handleChange(index, 'available', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>

          {item.available && (
            <>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Battery capacity (C3.2.2)</label>
                  <input className="form-input" value={item.batteryCapacity || ''} onChange={e => handleChange(index, 'batteryCapacity', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                   <label className="form-label">&nbsp;</label>
                   <Select className="form-input" value={item.batteryCapacityUnit || ''} onChange={e => handleChange(index, 'batteryCapacityUnit', e.target.value)}>
                     <option value="Ah">Ah</option>
                     <option value="kWh">kWh</option>
                   </Select>
                </div>
              </div>
              <div>
                <label className="form-label">Charges automatically? (C3.2.3)</label>
                <Select className="form-input" value={item.automaticCharging === true ? 'true' : item.automaticCharging === false ? 'false' : ''} onChange={e => handleChange(index, 'automaticCharging', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                  <option value="null">Not known</option>
                </Select>
              </div>
              <div>
                <label className="form-label">Can charging be controlled? (C3.2.4)</label>
                <Select className="form-input" value={item.chargingControl || ''} onChange={e => handleChange(index, 'chargingControl', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not known">Not known</option>
                </Select>
              </div>
            </>
          )}
        </div>
      ))}
      <style>{`
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid #E2E8F0; background-color: #F8FAFC; color: #0F172A; font-size: 0.95rem; box-sizing: border-box; }
      `}</style>
    </Card>
  );
}
