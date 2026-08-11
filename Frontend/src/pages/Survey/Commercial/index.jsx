import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import { useBaseRoute } from '../../../hooks/useBaseRoute';
import Button from '../../../components/common/Button';

// Dummy imports for now, we will create these in the sections folder
import ProfileSection from './sections/ProfileSection';
import ShiftsSection from './sections/ShiftsSection';
import ControlsSection from './sections/ControlsSection';
import { isFormEmpty } from '../../../utils/formUtils';

export default function CommercialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseRoute = useBaseRoute();
  const { surveyData, loadSurvey, saveSection, isLoading, error } = useSurvey();
  
  const [formData, setFormData] = useState({
    profiles: {},
    shifts: [],
    controls: {}
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!surveyData || surveyData.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  useEffect(() => {
    if (surveyData?.commercial) {
      setFormData({
        profiles: surveyData.commercial.profiles || {},
        shifts: surveyData.commercial.shifts || [],
        controls: surveyData.commercial.controls || {}
      });
    }
  }, [surveyData]);

  const handleObjectChange = (sectionKey, name, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [name]: value
      }
    }));
  };

  const handleArrayChange = (sectionKey, newArray) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: newArray
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
      await saveSection('commercial', formData);
      navigate(`${baseRoute}/surveys/${id}/demand-response`);
    } catch (err) {
      setSaveError(err.message || 'Failed to save commercial details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !surveyData) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;
  if (error) return <div className="glass-card" style={{padding: '2rem', color: 'var(--error)'}}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Commercial Survey</h1>
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {saveError && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)' }}>
            {saveError}
          </div>
        )}

        <ProfileSection data={formData.profiles} onChange={(n, v) => handleObjectChange('profiles', n, v)} />
        <ShiftsSection data={formData.shifts} onChange={(arr) => handleArrayChange('shifts', arr)} />
        <ControlsSection data={formData.controls} onChange={(n, v) => handleObjectChange('controls', n, v)} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
          <Button type="button" variant="secondary" onClick={() => navigate(`${baseRoute}/surveys/${id}/common`)}>
            Back to Common Details
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Save & Continue to Demand Response
          </Button>
        </div>
      </form>
    </div>
  );
}
