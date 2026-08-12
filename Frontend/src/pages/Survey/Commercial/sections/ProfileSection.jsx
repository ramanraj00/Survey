import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../../components/common/Button';

export default function ProfileSection({ data, onChange, shifts, onShiftsChange, isReadOnly }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleSelectChange = (name, value) => {
    onChange({ [name]: value });
  };

  const addShift = () => {
    onShiftsChange([...shifts, { shiftNumber: shifts.length + 1, startTime: '', endTime: '' }]);
  };

  const removeShift = (index) => {
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    // re-number shifts
    newShifts.forEach((s, i) => { s.shiftNumber = i + 1; });
    onShiftsChange(newShifts);
  };

  const updateShift = (index, field, value) => {
    const newShifts = [...shifts];
    newShifts[index] = { ...newShifts[index], [field]: value };
    onShiftsChange(newShifts);
  };


  const SectionHeader = ({ title }) => (
    <div style={{ marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
    </div>
  );

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
        D1: Business and Operating Profile
      </h2>

      {/* Group 1: Establishment Details */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionHeader title="Establishment Details" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div>
            <label className="form-label">D1.1 Type of Business / Establishment</label>
            <input
              type="text"
              name="businessType"
              value={data.businessType || ''}
              onChange={handleChange}
              placeholder="Shop, Hotel, Office, Hospital, etc."
              className="form-input"
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="form-label">D1.2 Nature of Building</label>
            <Select
              value={data.buildingNature || ''}
              onChange={(e) => handleSelectChange('buildingNature', e.target.value)}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="Stand alone building">Stand alone building</option>
              <option value="Part of a commercial complex">Part of a commercial complex</option>
              <option value="Rented space">Rented space</option>
              <option value="Owned Space">Owned Space</option>
            </Select>
          </div>

          <div>
            <label className="form-label">D1.3 No of floors / operational areas</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="number"
                name="floorCount"
                value={data.floorCount || ''}
                onChange={handleChange}
                placeholder="Floors"
                className="form-input" style={{ flex: 1 }}
                disabled={isReadOnly}
              />
              <input
                type="text"
                name="operationalAreas"
                value={data.operationalAreas || ''}
                onChange={handleChange}
                placeholder="Areas (e.g. 5000 sq ft)"
                className="form-input" style={{ flex: 2 }}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Group 2: Operating Schedule */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionHeader title="Operating Schedule" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          
          <div>
            <label className="form-label">D1.4 Typical operating days</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="number"
                name="operatingDays"
                value={data.operatingDays || ''}
                onChange={handleChange}
                placeholder="Days open (e.g. 6)"
                className="form-input" style={{ flex: 1 }}
                disabled={isReadOnly}
              />
              <input
                type="text"
                name="daysClosed"
                value={data.daysClosed || ''}
                onChange={handleChange}
                placeholder="Days closed (e.g. Sunday)"
                className="form-input" style={{ flex: 1 }}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <label className="form-label">D1.5 Typical operating hours (Opening - Closing)</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="time"
                name="openingTime"
                value={data.openingTime || ''}
                onChange={handleChange}
                className="form-input" style={{ flex: 1 }}
                disabled={isReadOnly}
              />
              <input
                type="time"
                name="closingTime"
                value={data.closingTime || ''}
                onChange={handleChange}
                className="form-input" style={{ flex: 1 }}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <label className="form-label">D1.8 Is the establishment open 24 hours?</label>
            <Select
              value={data.isOpen24Hours !== undefined && data.isOpen24Hours !== null ? data.isOpen24Hours.toString() : ''}
              onChange={(e) => handleSelectChange('isOpen24Hours', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>

          <div>
            <label className="form-label">D1.9 Highest occupancy or business activity</label>
            <input
              type="text"
              name="highestActivityPeriod"
              value={data.highestActivityPeriod || ''}
              onChange={handleChange}
              placeholder="e.g. 6 PM - 10 PM"
              className="form-input"
              disabled={isReadOnly}
            />
          </div>

          <div>
            <label className="form-label">D1.6 Does the establishment operate in shifts?</label>
            <Select
              value={data.operatesInShifts !== undefined && data.operatesInShifts !== null ? data.operatesInShifts.toString() : ''}
              onChange={(e) => handleSelectChange('operatesInShifts', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        </div>

        {/* Shift Timings Sub-section */}
        {data.operatesInShifts && (
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>D1.7 Shift Timings</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.25rem' }}>Add all operational shifts for the establishment.</p>
              </div>
              {!isReadOnly && (
                <Button onClick={addShift} style={{ background: '#0F172A', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem', height: 'auto', flexShrink: 0 }}>
                  <Plus size={14} style={{ marginRight: '0.5rem' }} /> Add Shift
                </Button>
              )}
            </div>
            
            {shifts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-glass-hover)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No shifts added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {shifts.map((shift, index) => (
                  <div key={index} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', background: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--accent-primary)', width: '100%', marginBottom: '-0.5rem' }}>
                      Shift {shift.shiftNumber}
                    </div>
                    <div style={{ flex: '1 1 120px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Start Time</span>
                      <input
                        type="time"
                        value={shift.startTime || ''}
                        onChange={(e) => updateShift(index, 'startTime', e.target.value)}
                        className="form-input"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div style={{ flex: '1 1 120px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>End Time</span>
                      <input
                        type="time"
                        value={shift.endTime || ''}
                        onChange={(e) => updateShift(index, 'endTime', e.target.value)}
                        className="form-input"
                        disabled={isReadOnly}
                      />
                    </div>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeShift(index)}
                        style={{ flex: '0 0 auto', padding: '0.75rem', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove Shift"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group 3: Decision Maker */}
      <div>
        <SectionHeader title="Decision Maker" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">
              D1.10 Who can approve / implement a change in the operating time of use for electrical loads?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '800px' }}>
              <input
                type="text"
                name="approverName"
                value={data.approverName || ''}
                onChange={handleChange}
                placeholder="Name"
                className="form-input"
                disabled={isReadOnly}
              />
              <input
                type="text"
                name="approverDesignation"
                value={data.approverDesignation || ''}
                onChange={handleChange}
                placeholder="Designation"
                className="form-input"
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      </div>

    </Card>
  );
}
