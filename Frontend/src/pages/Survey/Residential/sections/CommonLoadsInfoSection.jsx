import React from 'react';
import Card from '../../../../components/common/Card';
import Select from '../../../../components/common/Select';

export default function CommonLoadsInfoSection({ data = {}, onChange }) {
  const handleChange = (e) => onChange(e.target.name, e.target.value);
  const handleCheckbox = (name, val) => onChange(name, val);

  return (
    <Card padding="1.5rem" style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.25rem' }}>Specific for Apartments</h3>
      
      <div className="form-grid">
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Does the apartment have a separate electricity connection for common-area loads? (C4.11)</label>
          <Select className="form-input" name="hasSeparateConnection" value={data.hasSeparateConnection === true ? 'true' : data.hasSeparateConnection === false ? 'false' : ''} onChange={e => handleCheckbox('hasSeparateConnection', e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)}>
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </div>
        
        {data.hasSeparateConnection && (
          <>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Who manages these common electrical loads? (C4.12)</label>
              <Select className="form-input" name="managementEntity" value={data.managementEntity || ''} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Facility Manager">Facility Manager</option>
                <option value="Maintenance Team/Manager">Maintenance Team/Manager</option>
                <option value="Developer">Developer</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <label className="form-label">Who is authorised to approve temporary changes? (Name) (C4.13)</label>
              <input className="form-input" name="approvalAuthorityName" value={data.approvalAuthorityName || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Role</label>
              <input className="form-input" name="approvalAuthorityRole" value={data.approvalAuthorityRole || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="form-input" name="approvalAuthorityPhone" value={data.approvalAuthorityPhone || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Time for approval? (C4.14)</label>
              <input className="form-input" name="approvalTime" value={data.approvalTime || ''} onChange={handleChange} />
            </div>
          </>
        )}
      </div>
      <style>{`
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.875rem 1rem; border-radius: 12px; border: 1px solid #E2E8F0; background-color: #F8FAFC; color: #0F172A; font-size: 0.95rem; box-sizing: border-box; }
      `}</style>
    </Card>
  );
}
