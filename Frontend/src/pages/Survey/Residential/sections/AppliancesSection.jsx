import React, { useEffect } from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';

const PREDEFINED_APPLIANCES = [
  "Air Conditioner (AC)",
  "Air coolers",
  "Water pump / motor",
  "Water heater/ geyser",
  "Induction stove",
  "Oven / Microwave",
  "Washing Machine",
  "Dishwasher",
  "Vacuum cleaner",
  "Other high load appliance?"
];

export default function AppliancesSection({ data = [], onChange }) {
  useEffect(() => {
    if (data.length === 0) {
      onChange(PREDEFINED_APPLIANCES.map(name => ({
        applianceType: name,
        available: null,
        numberOfUnits: '',
        capacity: '',
        capacityUnit: '',
        typicalUsageTime: '',
        usedDuringPeak: null,
        possibleAdjustment: '',
        maximumDurationOrNewTime: '',
        constraintsOrRemarks: '',
        otherApplianceName: ''
      })));
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
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C2: Major Appliance Use and Flexibility</h3>
      <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Complete rows that are applicable</p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem' }}>
              <th style={{ padding: '1rem', width: '200px' }}>Appliance</th>
              <th style={{ padding: '1rem', width: '100px' }}>Yes / No</th>
              <th style={{ padding: '1rem', width: '100px' }}>No of units</th>
              <th style={{ padding: '1rem', width: '150px' }}>Capacity / Rating</th>
              <th style={{ padding: '1rem', width: '150px' }}>Typical time of use</th>
              <th style={{ padding: '1rem', width: '120px' }}>Used during peak?</th>
              <th style={{ padding: '1rem', width: '150px' }}>What change is possible?</th>
              <th style={{ padding: '1rem', width: '150px' }}>Max Duration / New time</th>
              <th style={{ padding: '1rem' }}>Constraints / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {PREDEFINED_APPLIANCES.map((name, idx) => {
              const row = data.find(d => d.applianceType === name) || {};
              const rowIndex = data.findIndex(d => d.applianceType === name);
              
              if (rowIndex === -1) return null; // Wait for useEffect

              const isOther = name === "Other high load appliance?";

              return (
                <tr key={name} className="responsive-tr">
                  <td data-label="Appliance" style={{ padding: '1rem', fontWeight: 500, color: '#0F172A', fontSize: '0.9rem' }}>
                    {name}
                    {isOther && row.available === true && (
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ marginTop: '0.5rem', padding: '0.5rem' }} 
                        placeholder="Appliance name"
                        value={row.otherApplianceName || ''}
                        onChange={e => handleChange(rowIndex, 'otherApplianceName', e.target.value)}
                      />
                    )}
                  </td>
                  <td data-label="Yes / No" style={{ padding: '0.5rem' }}>
                    <Select className="form-input" value={row.available === true ? 'true' : row.available === false ? 'false' : ''} onChange={e => handleChange(rowIndex, 'available', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
                      <option value="">-</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </td>
                  
                  {/* Only show rest if available is Yes */}
                  {row.available === true ? (
                    <>
                      <td data-label="No of units" style={{ padding: '0.5rem' }}>
                        <input type="number" className="form-input" value={row.numberOfUnits || ''} onChange={e => handleChange(rowIndex, 'numberOfUnits', e.target.value)} />
                      </td>
                      <td data-label="Capacity / Rating" style={{ padding: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input type="text" className="form-input" style={{ width: '60%' }} value={row.capacity || ''} onChange={e => handleChange(rowIndex, 'capacity', e.target.value)} />
                          <Select className="form-input" style={{ width: '40%', padding: '0.75rem 0.2rem' }} value={row.capacityUnit || ''} onChange={e => handleChange(rowIndex, 'capacityUnit', e.target.value)}>
                            <option value="">-</option><option value="W">W</option><option value="kW">kW</option><option value="HP">HP</option>
                          </Select>
                        </div>
                      </td>
                      <td data-label="Typical time of use" style={{ padding: '0.5rem' }}>
                        <input type="text" className="form-input" value={row.typicalUsageTime || ''} onChange={e => handleChange(rowIndex, 'typicalUsageTime', e.target.value)} placeholder="e.g. 6PM-9PM" />
                      </td>
                      <td data-label="Used during peak?" style={{ padding: '0.5rem' }}>
                        <Select className="form-input" value={row.usedDuringPeak === true ? 'true' : row.usedDuringPeak === false ? 'false' : ''} onChange={e => handleChange(rowIndex, 'usedDuringPeak', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
                          <option value="">-</option><option value="true">Yes</option><option value="false">No</option>
                        </Select>
                      </td>
                      <td data-label="What change is possible?" style={{ padding: '0.5rem' }}>
                        <Select className="form-input" value={row.possibleAdjustment || ''} onChange={e => handleChange(rowIndex, 'possibleAdjustment', e.target.value)}>
                          <option value="">-</option>
                          <option value="Shift">Shift</option>
                          <option value="Reduce">Reduce</option>
                          <option value="Switch off">Switch off</option>
                        </Select>
                      </td>
                      <td data-label="Max Duration / New time" style={{ padding: '0.5rem' }}>
                        <input type="text" className="form-input" value={row.maximumDurationOrNewTime || ''} onChange={e => handleChange(rowIndex, 'maximumDurationOrNewTime', e.target.value)} />
                      </td>
                      <td data-label="Constraints / Remarks" style={{ padding: '0.5rem' }}>
                        <input type="text" className="form-input" value={row.constraintsOrRemarks || ''} onChange={e => handleChange(rowIndex, 'constraintsOrRemarks', e.target.value)} />
                      </td>
                    </>
                  ) : (
                    <td colSpan="7" className="not-applicable-td">
                      Not applicable
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        .form-input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #E2E8F0; background-color: #FFFFFF; color: #0F172A; font-size: 0.85rem; box-sizing: border-box; }
        .responsive-tr { border-bottom: 1px solid #F1F5F9; }
        .not-applicable-td { padding: 0.5rem; color: #94A3B8; font-size: 0.85rem; text-align: center; background-color: #transparent; }
        
        @media (max-width: 768px) {
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { display: none; }
          .responsive-tr { margin-bottom: 1rem; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.5rem; background: #fff; }
          td { position: relative; padding: 0.5rem !important; padding-top: 2rem !important; border-bottom: none !important; }
          td:before { position: absolute; top: 0.5rem; left: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #64748B; content: attr(data-label); }
          .not-applicable-td { padding-top: 1rem !important; background: #F8FAFC; border-radius: 4px; margin-top: 0.5rem; }
        }
      `}</style>
    </Card>
  );
}
