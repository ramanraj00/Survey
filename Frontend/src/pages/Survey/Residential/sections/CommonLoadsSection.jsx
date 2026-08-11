import React from 'react';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';
import { Trash2, Plus } from 'lucide-react';

export default function CommonLoadsSection({ data = [], onChange }) {
  
  const handleAdd = () => {
    onChange([...data, { loadType: 'LIFT' }]);
  };

  const handleRemove = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <Card padding="1.5rem">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Common Loads (Lifts, Pumps, etc.)</h3>
        <Button variant="ghost" onClick={handleAdd} type="button">
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Load
        </Button>
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
          No common loads added. Click "Add Load" to start.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: '300px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Load Type</label>
                  <Select 
                    value={item.loadType || 'LIFT'} 
                    onChange={(e) => handleChange(index, 'loadType', e.target.value)}
                    options={[
                      { value: 'LIFT', label: 'Lift / Elevator' },
                      { value: 'WATER_SEWAGE_PUMP', label: 'Water / Sewage Pump' },
                      { value: 'OTHER', label: 'Other Load' }
                    ]}
                  />
                </div>
                <button type="button" onClick={() => handleRemove(index)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                
                {item.loadType === 'LIFT' && (
                  <>
                    <FormInput label="Number of Lifts" type="number" value={item.numberOfLifts || ''} onChange={(e) => handleChange(index, 'numberOfLifts', e.target.value)} />
                    <FormInput label="Rated Capacity Per Lift" type="text" value={item.ratedCapacityPerLift || ''} onChange={(e) => handleChange(index, 'ratedCapacityPerLift', e.target.value)} />
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Capacity Unit</label>
                      <Select value={item.ratedCapacityPerLiftUnit || 'kW'} onChange={(e) => handleChange(index, 'ratedCapacityPerLiftUnit', e.target.value)} options={[{ value: 'kW', label: 'kW' }, { value: 'HP', label: 'HP' }]} />
                    </div>
                    <FormInput label="Minimum Lifts Required (Peak)" type="number" value={item.minimumLiftsRequired || ''} onChange={(e) => handleChange(index, 'minimumLiftsRequired', e.target.value)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <input type="checkbox" checked={item.canReduceLiftOperation || false} onChange={(e) => handleChange(index, 'canReduceLiftOperation', e.target.checked)} />
                      <label style={{ fontSize: '0.875rem' }}>Can Reduce Operation</label>
                    </div>
                    <FormInput label="Max Acceptable Duration (mins)" type="number" value={item.maximumAcceptableDuration || ''} onChange={(e) => handleChange(index, 'maximumAcceptableDuration', e.target.value)} />
                  </>
                )}

                {item.loadType === 'WATER_SEWAGE_PUMP' && (
                  <>
                    <FormInput label="Pump Type" type="text" value={item.pumpType || ''} onChange={(e) => handleChange(index, 'pumpType', e.target.value)} />
                    <FormInput label="Number of Pumps" type="number" value={item.numberOfPumps || ''} onChange={(e) => handleChange(index, 'numberOfPumps', e.target.value)} />
                    <FormInput label="Capacity Per Pump" type="text" value={item.capacityPerPump || ''} onChange={(e) => handleChange(index, 'capacityPerPump', e.target.value)} />
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Capacity Unit</label>
                      <Select value={item.capacityPerPumpUnit || 'HP'} onChange={(e) => handleChange(index, 'capacityPerPumpUnit', e.target.value)} options={[{ value: 'HP', label: 'HP' }, { value: 'kW', label: 'kW' }]} />
                    </div>
                    <FormInput label="Typical Operating Time" type="text" value={item.typicalOperatingTime || ''} onChange={(e) => handleChange(index, 'typicalOperatingTime', e.target.value)} />
                    <FormInput label="Approx Storage Duration" type="text" value={item.approximateStorageDuration || ''} onChange={(e) => handleChange(index, 'approximateStorageDuration', e.target.value)} />
                    <FormInput label="Shiftable Pumping Window" type="text" value={item.shiftablePumpingWindow || ''} onChange={(e) => handleChange(index, 'shiftablePumpingWindow', e.target.value)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <input type="checkbox" checked={item.canMoveOutsidePeak || false} onChange={(e) => handleChange(index, 'canMoveOutsidePeak', e.target.checked)} />
                      <label style={{ fontSize: '0.875rem' }}>Can Move Outside Peak</label>
                    </div>
                  </>
                )}

                {item.loadType === 'OTHER' && (
                  <>
                    <FormInput label="Load Name" type="text" value={item.loadName || ''} onChange={(e) => handleChange(index, 'loadName', e.target.value)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <input type="checkbox" checked={item.available || false} onChange={(e) => handleChange(index, 'available', e.target.checked)} />
                      <label style={{ fontSize: '0.875rem' }}>Available</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <input type="checkbox" checked={item.operatesDuringPeak || false} onChange={(e) => handleChange(index, 'operatesDuringPeak', e.target.checked)} />
                      <label style={{ fontSize: '0.875rem' }}>Operates During Peak</label>
                    </div>
                    <FormInput label="Possible Adjustment" type="text" value={item.possibleAdjustment || ''} onChange={(e) => handleChange(index, 'possibleAdjustment', e.target.value)} />
                    <FormInput label="Max Duration (mins)" type="number" value={item.maximumDuration || ''} onChange={(e) => handleChange(index, 'maximumDuration', e.target.value)} />
                    <FormInput label="Constraints" type="text" value={item.constraints || ''} onChange={(e) => handleChange(index, 'constraints', e.target.value)} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
