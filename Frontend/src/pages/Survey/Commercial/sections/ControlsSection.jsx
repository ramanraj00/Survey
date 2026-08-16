import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';
import { D2_FIXED_EQUIPMENT } from '../constants';

export default function ControlsSection({ data, onChange, isReadOnly, inventoryItems = [] }) {
  const dynamicEquipmentList = inventoryItems.map(item => item.equipmentDescription).filter(Boolean);
  const equipmentOptions = dynamicEquipmentList.length > 0 ? dynamicEquipmentList : D2_FIXED_EQUIPMENT;
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleSelectChange = (name, value) => {
    onChange({ [name]: value });
  };

  const handleMultiSelectChange = (name, value) => {
    const current = data[name] || [];
    if (current.includes(value)) {
      onChange({ [name]: current.filter(v => v !== value) });
    } else {
      onChange({ [name]: [...current, value] });
    }
  };

  const SectionHeader = ({ title }) => (
    <div style={{ marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
    </div>
  );

  return (
    <Card padding="2rem" style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
        D3: Existing Controls and Back-up Energy Resources
      </h2>

      {/* Group 1: Automatic Controls */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionHeader title="Automatic Controls" />
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">
              D3.1 Are there any timers, sensors or automatic controls currently used?
            </label>
            <Select
              value={data.hasAutomaticControls !== undefined && data.hasAutomaticControls !== null ? data.hasAutomaticControls.toString() : ''}
              onChange={(e) => handleSelectChange('hasAutomaticControls', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              disabled={isReadOnly}
              style={{ maxWidth: '300px' }}
            >
              <option value="">-- Select --</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>

          {data.hasAutomaticControls && (
            <div style={{ gridColumn: '1 / -1', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                D3.2 Which loads are controlled? (Select all that apply)
              </label>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {equipmentOptions.map((equip, idx) => {
                  // Fallback key using idx if equip is somehow duplicated
                  const isSelected = (data.controlledInventoryItemIds || []).includes(equip);
                  return (
                    <label key={`${equip}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: isReadOnly ? 'default' : 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isReadOnly && handleMultiSelectChange('controlledInventoryItemIds', equip)}
                        disabled={isReadOnly}
                      />
                      {equip}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group 2: Building Management System (BMS) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionHeader title="Building Management System (BMS)" />
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div>
            <label className="form-label">
              D3.3 Is a BMS or central control system available?
            </label>
            <Select
              value={data.hasBMS !== undefined && data.hasBMS !== null ? data.hasBMS.toString() : ''}
              onChange={(e) => handleSelectChange('hasBMS', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>

          <div>
            <label className="form-label">
              D3.4 Can equipment operating schedules or settings be changed centrally?
            </label>
            <Select
              value={data.canChangeSchedulesCentrally !== undefined && data.canChangeSchedulesCentrally !== null ? data.canChangeSchedulesCentrally.toString() : ''}
              onChange={(e) => handleSelectChange('canChangeSchedulesCentrally', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
              disabled={isReadOnly}
            >
              <option value="">-- Select --</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Group 3: Backup Energy Resources */}
      <div>
        <SectionHeader title="Backup Energy Resources" />
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div>
            <label className="form-label">
              D3.5 Is rooftop solar available?
            </label>
            <div className="flex-row-mobile" style={{ display: 'flex', gap: '1rem' }}>
              <Select
                value={data.hasSolar !== undefined && data.hasSolar !== null ? data.hasSolar.toString() : ''}
                onChange={(e) => handleSelectChange('hasSolar', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
                disabled={isReadOnly}
                style={{ flex: 1 }}
              >
                <option value="">-- Select --</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
              {data.hasSolar && (
                <input
                  type="text"
                  name="solarCapacity"
                  value={data.solarCapacity || ''}
                  onChange={handleChange}
                  placeholder="Capacity (e.g. 10kW)"
                  className="form-input" style={{ flex: 2 }}
                  disabled={isReadOnly}
                />
              )}
            </div>
          </div>

          <div>
            <label className="form-label">
              D3.6 Is a DG set available?
            </label>
            <div className="flex-row-mobile" style={{ display: 'flex', gap: '1rem' }}>
              <Select
                value={data.hasDG !== undefined && data.hasDG !== null ? data.hasDG.toString() : ''}
                onChange={(e) => handleSelectChange('hasDG', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
                disabled={isReadOnly}
                style={{ flex: 1 }}
              >
                <option value="">-- Select --</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
              {data.hasDG && (
                <input
                  type="text"
                  name="dgCapacity"
                  value={data.dgCapacity || ''}
                  onChange={handleChange}
                  placeholder="Capacity"
                  className="form-input" style={{ flex: 2 }}
                  disabled={isReadOnly}
                />
              )}
            </div>
          </div>

          <div>
            <label className="form-label">
              D3.7 Is UPS or battery storage available?
            </label>
            <div className="flex-row-mobile" style={{ display: 'flex', gap: '1rem' }}>
              <Select
                value={data.hasUPS !== undefined && data.hasUPS !== null ? data.hasUPS.toString() : ''}
                onChange={(e) => handleSelectChange('hasUPS', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
                disabled={isReadOnly}
                style={{ flex: 1 }}
              >
                <option value="">-- Select --</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
              {data.hasUPS && (
                <input
                  type="text"
                  name="upsCapacity"
                  value={data.upsCapacity || ''}
                  onChange={handleChange}
                  placeholder="Capacity"
                  className="form-input" style={{ flex: 2 }}
                  disabled={isReadOnly}
                />
              )}
            </div>
          </div>

          <div>
            <label className="form-label">
              D3.8 Is EV charging available for staff or customers?
            </label>
            <div className="flex-row-mobile" style={{ display: 'flex', gap: '1rem' }}>
              <Select
                value={data.hasEVCharging !== undefined && data.hasEVCharging !== null ? data.hasEVCharging.toString() : ''}
                onChange={(e) => handleSelectChange('hasEVCharging', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}
                disabled={isReadOnly}
                style={{ flex: 1 }}
              >
                <option value="">-- Select --</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
              {data.hasEVCharging && (
                <input
                  type="number"
                  name="chargerCount"
                  value={data.chargerCount || ''}
                  onChange={handleChange}
                  placeholder="No. of chargers"
                  className="form-input" style={{ flex: 2 }}
                  disabled={isReadOnly}
                />
              )}
            </div>
          </div>
          
        </div>
      </div>
    </Card>
  );
}
