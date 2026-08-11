import { useBaseRoute } from '../../../hooks/useBaseRoute';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import FormInput from '../../../components/common/FormInput';
import { isFormEmpty } from '../../../utils/formUtils';

export default function CommonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseRoute = useBaseRoute();
  const { surveyData, loadSurvey, saveSection, isLoading: isContextLoading, error: contextError } = useSurvey();
  
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Initialize Data
  useEffect(() => {
    if (!surveyData || surveyData.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  // Sync formData when surveyData changes
  useEffect(() => {
    if (surveyData?.commonDetails) {
      setFormData(surveyData.commonDetails);
    } else {
      setFormData({}); // default empty if none exists yet
    }
  }, [surveyData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'number') parsedValue = value === '' ? null : Number(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isFormEmpty(formData)) {
      if (!window.confirm("This page is completely blank. Are you sure you want to proceed without entering any data?")) {
        return;
      }
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveSection('common', formData);
      // Navigate to next section based on consumerCategory
      const cat = surveyData?.survey?.consumerCategory;
      if (cat === 'RESIDENTIAL') navigate(`${baseRoute}/surveys/${id}/residential`);
      else if (cat === 'COMMERCIAL') navigate(`${baseRoute}/surveys/${id}/commercial`);
      else if (cat === 'INDUSTRIAL') navigate(`${baseRoute}/surveys/${id}/industrial`);
      else navigate(`${baseRoute}/surveys/${id}/inventory`); // fallback
    } catch (err) {
      setSaveError(err.message || 'Failed to save common details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isContextLoading && !surveyData) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;
  if (contextError) return <div className="glass-card" style={{padding: '2rem', color: 'var(--error)'}}>{contextError}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Common Details</h1>
      
      <Card>
        <form onSubmit={handleSave}>
          {saveError && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              {saveError}
            </div>
          )}

          <div className="grid-cols-2">
            <FormInput 
              label="Consumer Number" 
              name="consumerNumber" 
              value={formData.consumerNumber || ''} 
              onChange={handleChange} 
            />
            <FormInput 
              label="Consumer Name" 
              name="consumerName" 
              value={formData.consumerName || ''} 
              onChange={handleChange} 
            />
            <FormInput 
              label="Contact Number" 
              name="contactNumber" 
              value={formData.contactNumber || ''} 
              onChange={handleChange} 
            />
            <FormInput 
              label="District" 
              name="district" 
              value={formData.district || ''} 
              onChange={handleChange} 
            />
            <FormInput 
              label="PIN Code" 
              name="pinCode" 
              value={formData.pinCode || ''} 
              onChange={handleChange} 
            />
            <FormInput 
              label="Sanctioned Load (kW)" 
              name="sanctionedLoad" 
              type="number"
              step="any"
              value={formData.sanctionedLoad || ''} 
              onChange={handleChange} 
            />
            <FormInput 
              label="Connected Load (kW)" 
              name="connectedLoad" 
              type="number"
              step="any"
              value={formData.connectedLoad || ''} 
              onChange={handleChange} 
            />
            <FormInput 
              label="Voltage Level" 
              name="voltageLevel" 
              value={formData.voltageLevel || ''} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <FormInput 
              label="Address" 
              name="address" 
              value={formData.address || ''} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
            <Button type="button" variant="secondary" onClick={() => navigate(`${baseRoute}/surveys`)}>
              Back to Surveys
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save & Continue
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
