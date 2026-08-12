import React, { useEffect } from 'react';
import Card from '../../../../components/common/Card';

const TIME_PERIODS = [
  { id: 'Morning', label: 'Morning: 6:00AM - 10:00AM' },
  { id: 'Daytime', label: 'Daytime: 10:00AM - 6:00PM' },
  { id: 'Evening', label: 'Evening: 6:00PM - 10:00PM' },
  { id: 'Night', label: 'Night: 10:00PM - 6:00AM' }
];

export default function OccupancySection({ data = [], onChange }) {
  useEffect(() => {
    // Initialize if empty
    if (data.length === 0) {
      onChange(TIME_PERIODS.map(tp => ({
        timePeriod: tp.id,
        weekdayOccupancy: '',
        weekendOccupancy: ''
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
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>C1.9 Household occupancy by time-period</h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem' }}>Time Period</th>
              <th style={{ padding: '1rem' }}>Approx no of people at home - weekday</th>
              <th style={{ padding: '1rem' }}>Approx no of people at home - weekend/holidays</th>
            </tr>
          </thead>
          <tbody>
            {TIME_PERIODS.map((tp, idx) => {
              const row = data.find(d => d.timePeriod === tp.id) || {};
              const rowIndex = data.findIndex(d => d.timePeriod === tp.id);
              
              return (
                <tr key={tp.id} className="responsive-tr">
                  <td data-label="Time Period" style={{ padding: '1rem', fontWeight: 500, color: '#0F172A', fontSize: '0.9rem' }}>{tp.label}</td>
                  <td data-label="Weekday Occupancy" style={{ padding: '0.5rem 1rem' }}>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={row.weekdayOccupancy || ''} 
                      onChange={e => handleChange(rowIndex, 'weekdayOccupancy', e.target.value)} 
                    />
                  </td>
                  <td data-label="Weekend Occupancy" style={{ padding: '0.5rem 1rem' }}>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={row.weekendOccupancy || ''} 
                      onChange={e => handleChange(rowIndex, 'weekendOccupancy', e.target.value)} 
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        .form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #E2E8F0; background-color: #F8FAFC; color: #0F172A; font-size: 0.95rem; box-sizing: border-box; }
        .responsive-tr { border-bottom: 1px solid #F1F5F9; }
        @media (max-width: 768px) {
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { display: none; }
          .responsive-tr { margin-bottom: 1rem; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.5rem; background: #fff; }
          td { position: relative; padding: 0.5rem !important; padding-top: 2rem !important; border-bottom: none !important; }
          td:before { position: absolute; top: 0.5rem; left: 0.5rem; font-size: 0.75rem; font-weight: 600; color: #64748B; content: attr(data-label); }
        }
      `}</style>
    </Card>
  );
}
