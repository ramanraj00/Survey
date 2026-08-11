import React from 'react';
import Card from '../../../../components/common/Card';
import FormInput from '../../../../components/common/FormInput';

export default function ProfileSection({ data = {}, onChange }) {
  const handleChange = (e) => onChange(e.target.name, e.target.value);
  return (
    <Card padding="1.5rem">
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Profile</h3>
      <div className="grid-cols-2">
        <FormInput label="Adult Count" type="number" name="adultCount" value={data.adultCount || ''} onChange={handleChange} />
        <FormInput label="Children Count" type="number" name="childrenCount" value={data.childrenCount || ''} onChange={handleChange} />
      </div>
    </Card>
  );
}
