import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import { useBaseRoute } from '../../../hooks/useBaseRoute';
import { Plus, Trash2 } from 'lucide-react';
import Select from '../../../components/common/Select';
import Card from '../../../components/common/Card';

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

  // Removed inline styles in favor of global CSS classes .form-input and .form-label

  return (
    <div className="inventory-container">
      <style>{`
        .inventory-container {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem 4rem;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .inventory-container {
            padding: 2rem 1rem;
          }
        }
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
        
        /* Table Layout Styles */
        .inventory-table-container {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
        }
        .table-row, .table-header-row {
          display: flex;
          border-bottom: 1px solid var(--border-glass);
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .table-header-row {
          background: #dcfce7; /* Light green to match reference */
          font-weight: 700;
          color: #166534;
        }
        .col-id {
          width: 50px;
          min-width: 50px;
          padding: 1rem;
          border-right: 1px solid var(--border-glass);
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        .col-desc {
          width: 300px;
          min-width: 300px;
          padding: 1rem;
          border-right: 1px solid var(--border-glass);
          font-weight: 500;
          display: flex;
          align-items: center;
        }
        .col-val {
          flex: 1;
        }
        .table-input {
          width: 100%;
          height: 100%;
          border: none;
          padding: 1rem;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
        }
        .table-input:focus {
          background: rgba(0,0,0,0.01);
        }
        .col-options {
          flex: 1;
          display: flex;
        }
        .radio-cell {
          flex: 1;
          padding: 1rem;
          border-right: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .radio-cell:last-child {
          border-right: none;
        }
        
        @media (max-width: 768px) {
          .inventory-container {
            padding: 1rem 0.5rem;
          }
          .table-row, .table-header-row {
            flex-direction: column;
            width: 100%;
          }
          .col-id {
            display: none; /* Hide ID column on mobile to save space */
          }
          .col-desc {
            width: 100%;
            min-width: unset;
            box-sizing: border-box;
            border-right: none;
            border-bottom: 1px solid var(--border-glass);
            background: #f8fafc;
            padding: 0.75rem 1rem;
            font-weight: 600;
          }
          .col-val, .table-input {
            width: 100%;
            box-sizing: border-box;
          }
          .col-options {
            flex-direction: column;
            width: 100%;
          }
          .radio-cell {
            border-right: none;
            border-bottom: 1px solid var(--border-glass);
            padding: 0.75rem 1rem;
            width: 100%;
            box-sizing: border-box;
          }
          .radio-cell:last-child {
            border-bottom: none;
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
          <Card key={index} className="card-enter" style={{
            position: 'relative', marginBottom: '2rem'
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

            <div className="inventory-table-container">
              {/* Header Row */}
              <div className="table-header-row">
                <div className="col-id">B</div>
                <div className="col-desc">Equipment and Flexible Load Inventory</div>
                <div className="col-val"></div>
              </div>

              {/* B1 */}
              <div className="table-row">
                <div className="col-id">B1</div>
                <div className="col-desc">Consumer Category</div>
                <div className="col-val">
                  <input className="table-input" value={item.consumerCategory || ''} onChange={e => handleChange(index, 'consumerCategory', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B2 */}
              <div className="table-row">
                <div className="col-id">B2</div>
                <div className="col-desc">Process / Use</div>
                <div className="col-val">
                  <input className="table-input" value={item.processOrUse || ''} onChange={e => handleChange(index, 'processOrUse', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B3 */}
              <div className="table-row">
                <div className="col-id">B3</div>
                <div className="col-desc">Equipment / Load Description</div>
                <div className="col-val">
                  <input className="table-input" value={item.equipmentDescription || ''} onChange={e => handleChange(index, 'equipmentDescription', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B4 */}
              <div className="table-row">
                <div className="col-id">B4</div>
                <div className="col-desc">Number of units</div>
                <div className="col-val">
                  <input type="number" className="table-input" value={item.numberOfUnits || ''} onChange={e => handleChange(index, 'numberOfUnits', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B5 */}
              <div className="table-row">
                <div className="col-id">B5</div>
                <div className="col-desc">Rated capacity per unit (kW, kVA, HP, TR)</div>
                <div className="col-val" style={{ display: 'flex' }}>
                  <input className="table-input" style={{ flex: 2, borderRight: '1px solid var(--border-glass)' }} value={item.ratedCapacity || ''} onChange={e => handleChange(index, 'ratedCapacity', e.target.value)} placeholder="e.g. 100" disabled={isReadOnly} />
                  <select className="table-input" style={{ flex: 1, backgroundColor: 'transparent' }} value={item.capacityUnit || ''} onChange={e => handleChange(index, 'capacityUnit', e.target.value)} disabled={isReadOnly}>
                    <option value="">Unit</option>
                    <option value="kW">kW</option>
                    <option value="kVA">kVA</option>
                    <option value="HP">HP</option>
                    <option value="TR">TR</option>
                  </select>
                </div>
              </div>

              {/* B6 */}
              <div className="table-row">
                <div className="col-id">B6</div>
                <div className="col-desc">Typical Start Time</div>
                <div className="col-val">
                  <input type="time" className="table-input" value={item.typicalStartTime || ''} onChange={e => handleChange(index, 'typicalStartTime', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B7 */}
              <div className="table-row">
                <div className="col-id">B7</div>
                <div className="col-desc">Typical End Time</div>
                <div className="col-val">
                  <input type="time" className="table-input" value={item.typicalEndTime || ''} onChange={e => handleChange(index, 'typicalEndTime', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B8 */}
              <div className="table-row multi-options">
                <div className="col-id">B8</div>
                <div className="col-desc">Operates during peak hours? (Yes / No)</div>
                <div className="col-options">
                  <label className="radio-cell">
                    <input type="radio" name={`b8-${index}`} checked={item.operatesDuringPeak === 'Yes'} onChange={() => handleChange(index, 'operatesDuringPeak', 'Yes')} disabled={isReadOnly} /> Yes
                  </label>
                  <label className="radio-cell">
                    <input type="radio" name={`b8-${index}`} checked={item.operatesDuringPeak === 'No'} onChange={() => handleChange(index, 'operatesDuringPeak', 'No')} disabled={isReadOnly} /> No
                  </label>
                  <label className="radio-cell">
                    <input type="radio" name={`b8-${index}`} checked={item.operatesDuringPeak === 'Sometimes'} onChange={() => handleChange(index, 'operatesDuringPeak', 'Sometimes')} disabled={isReadOnly} /> Sometimes
                  </label>
                </div>
              </div>

              {/* B9 */}
              <div className="table-row multi-options">
                <div className="col-id">B9</div>
                <div className="col-desc">Load Criticality</div>
                <div className="col-options">
                  <label className="radio-cell">
                    <input type="radio" name={`b9-${index}`} checked={item.loadCriticality === 'Critical'} onChange={() => handleChange(index, 'loadCriticality', 'Critical')} disabled={isReadOnly} /> Critical
                  </label>
                  <label className="radio-cell">
                    <input type="radio" name={`b9-${index}`} checked={item.loadCriticality === 'Essential'} onChange={() => handleChange(index, 'loadCriticality', 'Essential')} disabled={isReadOnly} /> Essential
                  </label>
                  <label className="radio-cell">
                    <input type="radio" name={`b9-${index}`} checked={item.loadCriticality === 'Non-critical'} onChange={() => handleChange(index, 'loadCriticality', 'Non-critical')} disabled={isReadOnly} /> Non-critical
                  </label>
                </div>
              </div>

              {/* B10 */}
              <div className="table-row multi-options">
                <div className="col-id">B10</div>
                <div className="col-desc">Can operations be shifted outside peak hours? (Yes/Partly/No)</div>
                <div className="col-options">
                  <label className="radio-cell">
                    <input type="radio" name={`b10-${index}`} checked={item.shiftable === 'Yes'} onChange={() => handleChange(index, 'shiftable', 'Yes')} disabled={isReadOnly} /> Yes
                  </label>
                  <label className="radio-cell">
                    <input type="radio" name={`b10-${index}`} checked={item.shiftable === 'No'} onChange={() => handleChange(index, 'shiftable', 'No')} disabled={isReadOnly} /> No
                  </label>
                  <label className="radio-cell">
                    <input type="radio" name={`b10-${index}`} checked={item.shiftable === 'Partly'} onChange={() => handleChange(index, 'shiftable', 'Partly')} disabled={isReadOnly} /> Partly
                  </label>
                </div>
              </div>

              {/* B11 */}
              <div className="table-row">
                <div className="col-id">B11</div>
                <div className="col-desc">Maximum shiftable duration</div>
                <div className="col-val">
                  <input type="number" className="table-input" value={item.maximumShiftableDuration || ''} onChange={e => handleChange(index, 'maximumShiftableDuration', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B12 */}
              <div className="table-row">
                <div className="col-id">B12</div>
                <div className="col-desc">Operational Constraints</div>
                <div className="col-val">
                  <textarea className="table-input" style={{ minHeight: '60px', resize: 'vertical' }} value={item.operationalConstraints || ''} onChange={e => handleChange(index, 'operationalConstraints', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>

              {/* B13 */}
              <div className="table-row">
                <div className="col-id">B13</div>
                <div className="col-desc">Remarks (if any)</div>
                <div className="col-val">
                  <textarea className="table-input" style={{ minHeight: '60px', resize: 'vertical' }} value={item.remarks || ''} onChange={e => handleChange(index, 'remarks', e.target.value)} disabled={isReadOnly} />
                </div>
              </div>
            </div>
            </Card>
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
