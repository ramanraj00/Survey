import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import { useBaseRoute } from '../../../hooks/useBaseRoute';
import Button from '../../../components/common/Button';

const STEPS = [
  { id: 1, title: 'Profile & Shifts' },
  { id: 2, title: 'Production Processes' },
  { id: 3, title: 'Controls' },
  { id: 4, title: 'DR Willingness' }
];

// Components
import ProfileSection from './sections/ProfileSection';
import ShiftsSection from './sections/ShiftsSection';
import ProductionProcessesSection from './sections/ProductionProcessesSection';
import ProcessDependenciesSection from './sections/ProcessDependenciesSection';
import ControlsSection from './sections/ControlsSection';
import IndustrialDRSection from './sections/IndustrialDRSection';
import { isFormEmpty } from '../../../utils/formUtils';

export default function IndustrialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseRoute = useBaseRoute();
  const { surveyData, loadSurvey, saveSection, isLoading, error } = useSurvey();
  
  const [formData, setFormData] = useState({
    profiles: {},
    shifts: [],
    processes: [],
    processDependencies: [],
    controls: {}
  });

  const [drData, setDrData] = useState({});

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const isReadOnly = !isAdmin && surveyData?.survey?.status !== 'DRAFT';

  useEffect(() => {
    if (!surveyData || surveyData.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  useEffect(() => {
    if (surveyData?.industrial) {
      setFormData({
        profiles: surveyData.industrial.profiles || {},
        shifts: surveyData.industrial.shifts || [],
        processes: surveyData.industrial.processes || [],
        processDependencies: surveyData.industrial.processDependencies || [],
        controls: surveyData.industrial.controls || {}
      });
    }
    if (surveyData?.demandResponse?.profiles) {
      setDrData(surveyData.demandResponse.profiles);
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

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const handlePrev = () => {
    if (currentStep === 1) {
      navigate(`${baseRoute}/surveys/${id}/common`);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleSaveAndContinue = async () => {
    if (isReadOnly) {
      if (currentStep < STEPS.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        navigate(`${baseRoute}/surveys/${id}/submit`);
      }
      return;
    }

    if (isFormEmpty(formData) && isFormEmpty(drData)) {
      if (!window.confirm("This page is completely blank. Are you sure you want to proceed without entering any data?")) {
        return;
      }
    }
    
    setIsSaving(true);
    setSaveError(null);
    try {
      // Clean up empty strings to null for strict schema matching if needed
      // 1. Save Industrial data
      const indResult = await saveSection('industrial', formData);
      
      // 2. Save DR data
      await saveSection('demandResponse', { profiles: drData }, indResult.newVersion);
      
      // Finished
      navigate(`${baseRoute}/surveys/${id}/submit`);
    } catch (err) {
      setSaveError(err.message || 'Failed to save industrial details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !surveyData) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;
  if (error) return <div className="glass-card" style={{padding: '2rem', color: 'var(--error)'}}>{error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '0.5rem', color: '#0F172A', fontSize: '1.75rem', fontWeight: 700 }}>Industrial Consumer Form</h1>
      <p style={{ color: '#64748B', marginBottom: '2rem' }}>Fill out the details for industrial consumers.</p>
      
      {/* Stepper Header */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {STEPS.map((step) => (
          <div 
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: currentStep === step.id ? '#0F172A' : '#F1F5F9',
              color: currentStep === step.id ? '#FFFFFF' : '#64748B',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              border: '1px solid',
              borderColor: currentStep === step.id ? '#0F172A' : 'transparent'
            }}
          >
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: currentStep === step.id ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem'
            }}>
              {step.id}
            </div>
            {step.title}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        {saveError && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {saveError}
          </div>
        )}

        {currentStep === 1 && (
          <>
            <ProfileSection data={formData.profiles} onChange={(n, v) => handleObjectChange('profiles', n, v)} />
            <ShiftsSection data={formData.shifts} profileData={formData.profiles} onProfileChange={(n, v) => handleObjectChange('profiles', n, v)} onChange={(arr) => handleArrayChange('shifts', arr)} />
          </>
        )}

        {currentStep === 2 && (
          <>
            <ProductionProcessesSection data={formData.processes} onChange={(arr) => handleArrayChange('processes', arr)} />
            <ProcessDependenciesSection data={formData.processDependencies} onChange={(arr) => handleArrayChange('processDependencies', arr)} />
          </>
        )}

        {currentStep === 3 && (
          <ControlsSection data={formData.controls} onChange={(n, v) => handleObjectChange('controls', n, v)} />
        )}

        {currentStep === 4 && (
          <IndustrialDRSection data={drData} onChange={(n, v) => setDrData(prev => ({...prev, [n]: v}))} />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <Button 
          variant="secondary" 
          onClick={handlePrev} 
          disabled={isSaving}
        >
          Previous
        </Button>
        
        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} style={{ background: '#000000', color: 'white' }}>
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSaveAndContinue} 
            isLoading={isSaving}
            style={{ background: '#000000', color: 'white' }}
          >
            {isReadOnly ? 'Proceed to Submit View' : 'Save & Finish Survey'}
          </Button>
        )}
      </div>
    </div>
  );
}
