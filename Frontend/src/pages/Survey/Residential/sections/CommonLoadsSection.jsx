import React, { useEffect } from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';

const PREDEFINED_OTHER_LOADS = [
  "Common Area Lighting",
  "Clubhouse / Community Hall",
  "Swimming pool pump",
  "EV Charging Facility"
];

export default function CommonLoadsSection({ data = [], onChange }) {
  useEffect(() => {
    if (data.length === 0) {
      const initial = [
        { loadType: 'LIFT', numberOfLifts: '', ratedCapacityPerLift: '', ratedCapacityPerLiftUnit: 'kg', minimumLiftsRequired: '', canReduceLiftOperation: null, maximumAcceptableDuration: '' },
        { loadType: 'WATER_SEWAGE_PUMP', pumpType: '', numberOfPumps: '', capacityPerPump: '', capacityPerPumpUnit: 'HP', typicalOperatingTime: '', approximateStorageDuration: '', canMoveOutsidePeak: null }
      ];
      PREDEFINED_OTHER_LOADS.forEach(name => {
        initial.push({
          loadType: 'OTHER',
          loadName: name,
          available: null,
          typicalOperatingTime: '',
          operatesDuringPeak: null,
          possibleAdjustment: '',
          maximumDuration: '',
          constraints: ''
        });
      });
      onChange(initial);
    }
  }, [data, onChange]);

  const handleChange = (index, field, value) => {
    const newData = [...data];
    if (!newData[index]) return;
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const lift = data.find(d => d.loadType === 'LIFT') || {};
  const liftIndex = data.findIndex(d => d.loadType === 'LIFT');
  
  const pump = data.find(d => d.loadType === 'WATER_SEWAGE_PUMP') || {};
  const pumpIndex = data.findIndex(d => d.loadType === 'WATER_SEWAGE_PUMP');
  
  const otherLoads = data.filter(d => d.loadType === 'OTHER');

  if (liftIndex === -1 || pumpIndex === -1) return null; // Wait for init

  return (
    <Card padding="1.5rem" style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C4.15 - C4.17 Common Loads</h3>
      
      {/* LIFTS */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#334155' }}>C4.15 Lifts</h4>
        <div className="form-grid">
          <div>
            <label className="form-label">a) Number of lifts</label>
            <input type="number" className="form-input" value={lift.numberOfLifts || ''} onChange={e => handleChange(liftIndex, 'numberOfLifts', e.target.value)} />
          </div>
          <div>
            <label className="form-label">b) Rated capacity per lift</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input type="number" className="form-input" style={{ width: '60%' }} value={lift.ratedCapacityPerLift || ''} onChange={e => handleChange(liftIndex, 'ratedCapacityPerLift', e.target.value)} />
              <Select className="form-input" style={{ width: '40%', padding: '0.75rem 0.2rem' }} value={lift.ratedCapacityPerLiftUnit || ''} onChange={e => handleChange(liftIndex, 'ratedCapacityPerLiftUnit', e.target.value)}>
                <option value="kg">kg</option><option value="persons">persons</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="form-label">c) Minimum lifts that must remain available</label>
            <input type="number" className="form-input" value={lift.minimumLiftsRequired || ''} onChange={e => handleChange(liftIndex, 'minimumLiftsRequired', e.target.value)} />
          </div>
          <div>
            <label className="form-label">d) Can operation be temporarily reduced?</label>
            <Select className="form-input" value={lift.canReduceLiftOperation === true ? 'true' : lift.canReduceLiftOperation === false ? 'false' : ''} onChange={e => handleChange(liftIndex, 'canReduceLiftOperation', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
              <option value="">Select</option><option value="true">Yes</option><option value="false">No</option>
            </Select>
          </div>
          <div>
            <label className="form-label">e) Maximum acceptable duration (mins)</label>
            <input type="number" className="form-input" value={lift.maximumAcceptableDuration || ''} onChange={e => handleChange(liftIndex, 'maximumAcceptableDuration', e.target.value)} />
          </div>
        </div>
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#E2E8F0' }} />

      {/* PUMPS */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#334155' }}>C4.16 Water / Sewage Pumping</h4>
        <div className="form-grid">
          <div>
            <label className="form-label">a) Type of pump</label>
            <input type="text" className="form-input" value={pump.pumpType || ''} onChange={e => handleChange(pumpIndex, 'pumpType', e.target.value)} />
          </div>
          <div>
            <label className="form-label">b) Number of pumps</label>
            <input type="number" className="form-input" value={pump.numberOfPumps || ''} onChange={e => handleChange(pumpIndex, 'numberOfPumps', e.target.value)} />
          </div>
          <div>
            <label className="form-label">c) Capacity per pump</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input type="text" className="form-input" style={{ width: '60%' }} value={pump.capacityPerPump || ''} onChange={e => handleChange(pumpIndex, 'capacityPerPump', e.target.value)} />
              <Select className="form-input" style={{ width: '40%', padding: '0.75rem 0.2rem' }} value={pump.capacityPerPumpUnit || ''} onChange={e => handleChange(pumpIndex, 'capacityPerPumpUnit', e.target.value)}>
                <option value="HP">HP</option><option value="kW">kW</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="form-label">d) Typical operating time</label>
            <input type="text" className="form-input" value={pump.typicalOperatingTime || ''} onChange={e => handleChange(pumpIndex, 'typicalOperatingTime', e.target.value)} />
          </div>
          <div>
            <label className="form-label">e) Approximate storage duration</label>
            <input type="text" className="form-input" value={pump.approximateStorageDuration || ''} onChange={e => handleChange(pumpIndex, 'approximateStorageDuration', e.target.value)} />
          </div>
          <div>
            <label className="form-label">f) Can pumping be moved outside peak?</label>
            <Select className="form-input" value={pump.canMoveOutsidePeak === true ? 'true' : pump.canMoveOutsidePeak === false ? 'false' : ''} onChange={e => handleChange(pumpIndex, 'canMoveOutsidePeak', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
              <option value="">Select</option><option value="true">Fully</option><option value="false">No</option>
            </Select>
          </div>
        </div>
      </div>

      <hr style={{ margin: '2rem 0', borderColor: '#E2E8F0' }} />

      {/* OTHER COMMON LOADS */}
      <div>
        <h4 style={{ marginBottom: '1rem', color: '#334155' }}>C4.17 Other Common Loads</h4>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '1000px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem' }}>
                <th style={{ padding: '1rem' }}>Load Name</th>
                <th style={{ padding: '1rem' }}>Available?</th>
                <th style={{ padding: '1rem' }}>Typical Operating Time</th>
                <th style={{ padding: '1rem' }}>Used during peak?</th>
                <th style={{ padding: '1rem' }}>Possible adjustment</th>
                <th style={{ padding: '1rem' }}>Max duration</th>
                <th style={{ padding: '1rem' }}>Constraints</th>
              </tr>
            </thead>
            <tbody>
              {otherLoads.map((row) => {
                const idx = data.findIndex(d => d.loadType === 'OTHER' && d.loadName === row.loadName);
                if (idx === -1) return null;
                return (
                  <tr key={row.loadName} className="responsive-tr">
                    <td data-label="Load Name" style={{ padding: '1rem', fontWeight: 500, color: '#0F172A', fontSize: '0.9rem' }}>{row.loadName}</td>
                    <td data-label="Available?" style={{ padding: '0.5rem' }}>
                      <Select className="form-input" value={row.available === true ? 'true' : row.available === false ? 'false' : ''} onChange={e => handleChange(idx, 'available', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
                        <option value="">-</option><option value="true">Yes</option><option value="false">No</option>
                      </Select>
                    </td>
                    {row.available === true ? (
                      <>
                        <td data-label="Operating Time" style={{ padding: '0.5rem' }}><input type="text" className="form-input" style={{ textAlign: 'left' }} value={row.typicalOperatingTime || ''} onChange={e => handleChange(idx, 'typicalOperatingTime', e.target.value)} /></td>
                        <td data-label="Used in peak?" style={{ padding: '0.5rem' }}>
                          <Select className="form-input" value={row.operatesDuringPeak === true ? 'true' : row.operatesDuringPeak === false ? 'false' : ''} onChange={e => handleChange(idx, 'operatesDuringPeak', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
                            <option value="">-</option><option value="true">Yes</option><option value="false">No</option>
                          </Select>
                        </td>
                        <td data-label="Adjustment" style={{ padding: '0.5rem' }}><input type="text" className="form-input" style={{ textAlign: 'left' }} value={row.possibleAdjustment || ''} onChange={e => handleChange(idx, 'possibleAdjustment', e.target.value)} /></td>
                        <td data-label="Max Duration" style={{ padding: '0.5rem' }}><input type="number" className="form-input" style={{ textAlign: 'left' }} value={row.maximumDuration || ''} onChange={e => handleChange(idx, 'maximumDuration', e.target.value)} /></td>
                        <td data-label="Constraints" style={{ padding: '0.5rem' }}><input type="text" className="form-input" style={{ textAlign: 'left' }} value={row.constraints || ''} onChange={e => handleChange(idx, 'constraints', e.target.value)} /></td>
                      </>
                    ) : (
                      <td colSpan="5" className="not-applicable-td">Not applicable</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
        .table-wrapper .form-input, .table-wrapper .custom-select-trigger.form-input { width: 100%; padding: 0.5rem 0.5rem; border-radius: 6px; border: 1px solid #E2E8F0; background-color: #FFFFFF; color: #0F172A; font-size: 0.85rem; box-sizing: border-box; min-height: 38px; height: 38px; text-align: center; }
        .table-wrapper select.form-input { height: 38px; padding: 0 0.5rem; text-align: center; }
        
        @media (min-width: 769px) {
          .table-wrapper table td, .table-wrapper table th { padding: 1.25rem 0.5rem !important; vertical-align: middle !important; text-align: center !important; }
        }
        .responsive-tr { border-bottom: 1px solid #F1F5F9; }
        .not-applicable-td { padding: 0.5rem; color: #94A3B8; font-size: 0.85rem; text-align: center; background-color: #transparent; }
        
        @media (max-width: 768px) {
          .table-wrapper { overflow: visible !important; overflow-x: visible !important; overflow-y: visible !important; }
          .table-wrapper .form-input, .table-wrapper .custom-select-trigger.form-input { padding: 0.875rem 1rem; border-radius: 12px; background-color: #F8FAFC; font-size: 0.95rem; min-height: auto; height: auto; }
          .table-wrapper select.form-input { height: auto; padding: 0.875rem 1rem; }
          table, thead, tbody, th, td, tr { display: block; }
          table { min-width: unset !important; }
          thead tr { display: none; }
          
          .responsive-tr { 
            margin-bottom: 2rem; 
            border: none;
            border-bottom: 1px solid #E2E8F0;
            border-radius: 0; 
            padding: 0 0 2rem 0; 
            background: transparent;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .responsive-tr:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .table-wrapper table td { 
            display: flex !important; 
            flex-direction: column; 
            gap: 0.5rem;
            padding: 0 !important; 
            border-bottom: none !important;
            text-align: left !important;
          }
          .table-wrapper table td:before { 
            content: attr(data-label);
            font-size: 0.875rem;
            font-weight: 600;
            color: #475569;
            position: static !important;
          }
          .not-applicable-td { padding: 1rem !important; background: #F8FAFC; border-radius: 12px; margin-top: 0; }
        }
      `}</style>
    </Card>
  );
}
