import React from 'react';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';
import FormInput from '../../../../components/common/FormInput';
import Select from '../../../../components/common/Select';
import { Trash2, Plus } from 'lucide-react';

export default function DRLoadSelectionsSection({ data = [], onChange }) {
  
  const handleAdd = () => {
    onChange([...data, { adjustmentType: '', adjustmentDuration: null, remarks: '' }]);
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
        <h3>DR Load Selections</h3>
        <Button variant="ghost" onClick={handleAdd} type="button">
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Load Selection
        </Button>
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
          No DR load selections added yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: '300px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Adjustment Type</label>
                  <Select 
                    value={item.adjustmentType || ''} 
                    onChange={(e) => handleChange(index, 'adjustmentType', e.target.value)}
                    options={[
                      { value: 'REDUCE', label: 'Reduce' },
                      { value: 'SHIFT', label: 'Shift' },
                      { value: 'INTERRUPT', label: 'Interrupt' }
                    ]}
                  />
                </div>
                <button type="button" onClick={() => handleRemove(index)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <FormInput 
                  label="Adjustment Duration (mins)" 
                  type="number" 
                  value={item.adjustmentDuration || ''} 
                  onChange={(e) => handleChange(index, 'adjustmentDuration', e.target.value === '' ? null : Number(e.target.value))} 
                />
                
                <FormInput 
                  label="Remarks" 
                  type="text" 
                  value={item.remarks || ''} 
                  onChange={(e) => handleChange(index, 'remarks', e.target.value)} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
