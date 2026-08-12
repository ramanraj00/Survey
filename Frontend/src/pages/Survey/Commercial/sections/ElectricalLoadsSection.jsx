import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';
import { D2_FIXED_EQUIPMENT } from '../constants';

export default function ElectricalLoadsSection({ items, onUpdateItem, isReadOnly }) {

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        D2: Electrical Loads / Systems
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Please select all the systems available in the establishment, then provide their details below.
      </p>

      {/* Equipment Selection */}
      <div style={{ marginBottom: '3rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Available Equipment</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {items.map((item, index) => {
            const isEnabled = item.hasItem === true || item.hasItem === 'true';
            return (
              <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: isReadOnly ? 'default' : 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: isEnabled ? '#FFFFFF' : 'transparent', border: isEnabled ? '1px solid var(--accent-primary)' : '1px solid transparent', transition: 'all 0.2s' }}>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => !isReadOnly && onUpdateItem(index, 'hasItem', e.target.checked)}
                  disabled={isReadOnly}
                  style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: isEnabled ? 600 : 400, color: isEnabled ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {item.equipmentDescription}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Details Cards for Selected Equipment */}
      {items.some(item => item.hasItem === true || item.hasItem === 'true') && (
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-glass)' }}>
            Equipment Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {items.map((item, index) => {
              const isEnabled = item.hasItem === true || item.hasItem === 'true';
              if (!isEnabled) return null;

              return (
                <div 
                  key={index} 
                  style={{ 
                    border: '1px solid var(--border-glass)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '1.75rem', 
                    background: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <h4 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                    {item.equipmentDescription}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    
                    <div>
                      <label className="form-label">Number of Units</label>
                      <input
                        type="number"
                        value={item.numberOfUnits || ''}
                        onChange={(e) => onUpdateItem(index, 'numberOfUnits', e.target.value)}
                        disabled={isReadOnly}
                        className="form-input"
                        placeholder="e.g. 5"
                      />
                    </div>

                    <div>
                      <label className="form-label">Rated Capacity</label>
                      <input
                        type="text"
                        value={item.ratedCapacity || ''}
                        onChange={(e) => onUpdateItem(index, 'ratedCapacity', e.target.value)}
                        disabled={isReadOnly}
                        className="form-input"
                        placeholder="e.g. 5kW"
                      />
                    </div>

                    <div>
                      <label className="form-label">Typical Operating Time (Start - End)</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="time"
                          value={item.typicalStartTime || ''}
                          onChange={(e) => onUpdateItem(index, 'typicalStartTime', e.target.value)}
                          disabled={isReadOnly}
                          className="form-input" 
                          style={{ padding: '0.5rem', flex: 1 }}
                        />
                        <input
                          type="time"
                          value={item.typicalEndTime || ''}
                          onChange={(e) => onUpdateItem(index, 'typicalEndTime', e.target.value)}
                          disabled={isReadOnly}
                          className="form-input" 
                          style={{ padding: '0.5rem', flex: 1 }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Used in Peak?</label>
                      <Select
                        value={item.operatesDuringPeak || ''}
                        onChange={(e) => onUpdateItem(index, 'operatesDuringPeak', e.target.value)}
                        disabled={isReadOnly}
                      >
                        <option value="">-</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Select>
                    </div>

                    <div>
                      <label className="form-label">Change Possible?</label>
                      <Select
                        value={item.shiftable || ''}
                        onChange={(e) => onUpdateItem(index, 'shiftable', e.target.value)}
                        disabled={isReadOnly}
                      >
                        <option value="">-</option>
                        <option value="Shift">Shift</option>
                        <option value="Reduce">Reduce</option>
                        <option value="Both">Both</option>
                        <option value="None">None</option>
                      </Select>
                    </div>

                    <div>
                      <label className="form-label">Max Duration (min)</label>
                      <input
                        type="number"
                        value={item.maximumShiftableDuration || ''}
                        onChange={(e) => onUpdateItem(index, 'maximumShiftableDuration', e.target.value)}
                        disabled={isReadOnly}
                        className="form-input"
                        placeholder="e.g. 60"
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Remarks</label>
                      <input
                        type="text"
                        value={item.remarks || ''}
                        onChange={(e) => onUpdateItem(index, 'remarks', e.target.value)}
                        disabled={isReadOnly}
                        className="form-input"
                        placeholder="Any additional remarks..."
                      />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
