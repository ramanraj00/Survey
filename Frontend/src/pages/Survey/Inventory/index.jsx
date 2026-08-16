import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import { useBaseRoute } from '../../../hooks/useBaseRoute';
import { Plus, Trash2 } from 'lucide-react';
import Select from '../../../components/common/Select';

export default function InventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const baseRoute = useBaseRoute();
  const { surveyData, saveSection, isLoading: contextLoading, error: contextError } = useSurvey();
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (surveyData?.inventoryItems && surveyData.inventoryItems.length > 0) {
      setItems(surveyData.inventoryItems);
    } else if (surveyData) {
      setItems([createEmptyItem()]);
    }
  }, [surveyData]);

  const createEmptyItem = () => ({
    consumerCategory: '',
    processOrUse: '',
    equipmentDescription: '',
    numberOfUnits: '',
    ratedCapacity: '',
    capacityUnit: '',
    typicalStartTime: '',
    typicalEndTime: '',
    operatesDuringPeak: '',
    loadCriticality: '',
    shiftable: '',
    maximumShiftableDuration: '',
    operationalConstraints: '',
    remarks: ''
  });

  const handleAddItem = () => setItems([...items, createEmptyItem()]);

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const surveyStatus = surveyData?.survey?.status;
  const isReadOnly = (!isAdmin && surveyStatus !== 'DRAFT') || (isAdmin && surveyStatus === 'APPROVED');


  const handleSaveAndContinue = async () => {
    const cat = surveyData?.survey?.consumerCategory?.toLowerCase();
    const editSegment = isAdmin ? '/edit' : '';
    const nextPath = `${baseRoute}/surveys/${id}${editSegment}/${cat}`;

    if (isReadOnly) {
      navigate(nextPath);
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedItems = items.map(item => {
        const sanitized = { ...item };
        
        // Remove system fields to prevent Drizzle bulk insert errors when mixing existing and new items
        delete sanitized.id;
        delete sanitized.surveyId;
        delete sanitized.createdAt;
        delete sanitized.updatedAt;

        for (const [key, value] of Object.entries(sanitized)) {
          if (value === '') sanitized[key] = null;
        }
        if (sanitized.numberOfUnits !== null && sanitized.numberOfUnits !== undefined) {
            sanitized.numberOfUnits = parseInt(sanitized.numberOfUnits, 10);
            if (isNaN(sanitized.numberOfUnits)) sanitized.numberOfUnits = null;
        }
        if (sanitized.maximumShiftableDuration !== null && sanitized.maximumShiftableDuration !== undefined) {
            sanitized.maximumShiftableDuration = parseInt(sanitized.maximumShiftableDuration, 10);
            if (isNaN(sanitized.maximumShiftableDuration)) sanitized.maximumShiftableDuration = null;
        }
        return sanitized;
      });

      await saveSection('inventory', sanitizedItems);
      navigate(nextPath);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (contextError) return <div style={{ color: 'red', padding: '2rem' }}>Error loading survey: {contextError}</div>;
  if (!surveyData || contextLoading) return <div style={{ padding: '2rem', color: '#64748B' }}>Loading inventory data...</div>;

  const inputStyle = {
    width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: '0.95rem',
    transition: 'all 0.2s ease', outline: 'none', boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <style>{`
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .card-enter { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .footer-actions {
            flex-direction: column-reverse !important;
            gap: 1rem;
          }
          .footer-actions button {
            width: 100%;
          }
        }
      `}</style>
      
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Equipment Inventory
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Section B: Equipment and Flexible Load Inventory
        </p>
      </div>

      <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0 }}>
        {items.map((item, index) => (
          <div key={index} className="card-enter" style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '2rem', marginBottom: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid #E2E8F0', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0F172A' }}>Equipment #{index + 1}</h3>
              {items.length > 1 && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  style={{
                    background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '0.5rem', borderRadius: '8px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                  }}
                  title="Remove Equipment"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="form-grid">
              <div>
                <label style={labelStyle}>Consumer Category (B1)</label>
                <input style={inputStyle} value={item.consumerCategory || ''} onChange={e => handleChange(index, 'consumerCategory', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Process / Use (B2)</label>
                <input style={inputStyle} value={item.processOrUse || ''} onChange={e => handleChange(index, 'processOrUse', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Equipment / Load Description (B3)</label>
                <input style={inputStyle} value={item.equipmentDescription || ''} onChange={e => handleChange(index, 'equipmentDescription', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Number of Units (B4)</label>
                <input type="number" style={inputStyle} value={item.numberOfUnits || ''} onChange={e => handleChange(index, 'numberOfUnits', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Rated Capacity (B5)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input style={{ ...inputStyle, flex: 2 }} value={item.ratedCapacity || ''} onChange={e => handleChange(index, 'ratedCapacity', e.target.value)} placeholder="e.g. 100" />
                  <Select style={{ ...inputStyle, flex: 1 }} value={item.capacityUnit || ''} onChange={e => handleChange(index, 'capacityUnit', e.target.value)}>
                    <option value="">Unit</option>
                    <option value="kW">kW</option>
                    <option value="kVA">kVA</option>
                    <option value="HP">HP</option>
                    <option value="TR">TR</option>
                  </Select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Typical Start Time (B6)</label>
                <input type="time" style={inputStyle} value={item.typicalStartTime || ''} onChange={e => handleChange(index, 'typicalStartTime', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Typical End Time (B7)</label>
                <input type="time" style={inputStyle} value={item.typicalEndTime || ''} onChange={e => handleChange(index, 'typicalEndTime', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Operates during peak hours? (B8)</label>
                <Select style={inputStyle} value={item.operatesDuringPeak || ''} onChange={e => handleChange(index, 'operatesDuringPeak', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Sometimes">Sometimes</option>
                </Select>
              </div>
              <div>
                <label style={labelStyle}>Load Criticality (B9)</label>
                <Select style={inputStyle} value={item.loadCriticality || ''} onChange={e => handleChange(index, 'loadCriticality', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Critical">Critical</option>
                  <option value="Essential">Essential</option>
                  <option value="Non-critical">Non-critical</option>
                </Select>
              </div>
              <div>
                <label style={labelStyle}>Can be shifted outside peak? (B10)</label>
                <Select style={inputStyle} value={item.shiftable || ''} onChange={e => handleChange(index, 'shiftable', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Partly">Partly</option>
                </Select>
              </div>
              <div>
                <label style={labelStyle}>Max shiftable duration (mins) (B11)</label>
                <input type="number" style={inputStyle} value={item.maximumShiftableDuration || ''} onChange={e => handleChange(index, 'maximumShiftableDuration', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Operational Constraints (B12)</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={item.operationalConstraints || ''} onChange={e => handleChange(index, 'operationalConstraints', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Remarks (B13)</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={item.remarks || ''} onChange={e => handleChange(index, 'remarks', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </fieldset>

      {!isReadOnly && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <button
            type="button"
            onClick={handleAddItem}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 1.5rem', background: '#F1F5F9', color: '#0F172A',
              border: '2px dashed #CBD5E1', borderRadius: '12px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.borderColor = '#94A3B8'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
          >
            <Plus size={20} />
            Add Another Equipment
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="footer-actions" style={{
        marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #E2E8F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', bottom: 0, backgroundColor: '#F8FAFC', paddingBottom: '1rem', zIndex: 10
      }}>
        <button
          onClick={() => {
            const editSegment = isAdmin ? '/edit' : '';
            navigate(`${baseRoute}/surveys/${id}${editSegment}/common`);
          }}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF', color: '#475569', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          Back
        </button>
        
        <button
          onClick={handleSaveAndContinue}
          disabled={isSaving}
          style={{
            padding: '0.75rem 2rem', borderRadius: '100px', border: 'none',
            backgroundColor: isSaving ? '#94A3B8' : '#0F172A', color: '#FFFFFF',
            fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap'
          }}
        >
          {isSaving ? 'Saving...' : (isReadOnly ? 'Next' : 'Save & Continue')}
        </button>
      </div>
    </div>
  );
}
