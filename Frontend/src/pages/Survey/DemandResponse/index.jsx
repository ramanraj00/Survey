import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import { useBaseRoute } from '../../../hooks/useBaseRoute';
import Button from '../../../components/common/Button';

import DRProfilesSection from './sections/DRProfilesSection';
import DRLoadSelectionsSection from './sections/DRLoadSelectionsSection';
import { isFormEmpty } from '../../../utils/formUtils';

export default function DemandResponseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseRoute = useBaseRoute();
  const { surveyData, loadSurvey, saveSection, isLoading, error } = useSurvey();
  
  const [formData, setFormData] = useState({
    profiles: {},
    loadSelections: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const surveyStatus = surveyData?.survey?.status;
  const isReadOnly = (!isAdmin && surveyStatus !== 'DRAFT') || (isAdmin && surveyStatus === 'APPROVED');

  useEffect(() => {
    if (!surveyData || surveyData.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  useEffect(() => {
    if (surveyData?.demandResponse) {
      setFormData({
        profiles: surveyData.demandResponse.profiles || {},
        loadSelections: surveyData.demandResponse.loadSelections || []
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
    if (isReadOnly) {
      navigate(`${baseRoute}/surveys/${id}${isAdmin ? '/edit' : ''}/submit`);
      return;
    }
    if (isFormEmpty(formData)) {
      if (!window.confirm("This page is completely blank. Are you sure you want to proceed without entering any data?")) {
        return;
      }
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveSection('demandResponse', formData);
      navigate(`${baseRoute}/surveys/${id}${isAdmin ? '/edit' : ''}/submit`);
    } catch (err) {
      setSaveError(err.message || 'Failed to save demand response details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !surveyData) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;
  if (error) return <div className="glass-card" style={{padding: '2rem', color: 'var(--error)'}}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Demand Response Survey</h1>
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {saveError && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)' }}>
            {saveError}
          </div>
        )}

        <DRProfilesSection data={formData.profiles} onChange={(n, v) => handleObjectChange('profiles', n, v)} />
        <DRLoadSelectionsSection data={formData.loadSelections} onChange={(arr) => handleArrayChange('loadSelections', arr)} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isReadOnly ? 'Proceed to Submit View' : 'Save & Proceed to Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
