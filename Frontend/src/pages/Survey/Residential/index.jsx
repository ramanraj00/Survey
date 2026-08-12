import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import { useBaseRoute } from '../../../hooks/useBaseRoute';
import Button from '../../../components/common/Button';

// Import all sections
import ProfileSection from './sections/ProfileSection';
import OccupancySection from './sections/OccupancySection';
import AppliancesSection from './sections/AppliancesSection';
import EVChargingSection from './sections/EVChargingSection';
import BackupPowerSection from './sections/BackupPowerSection';
import SolarSection from './sections/SolarSection';
import CommonLoadsInfoSection from './sections/CommonLoadsInfoSection';
import CommonLoadsSection from './sections/CommonLoadsSection';
import FlexibilitySection from './sections/FlexibilitySection';
import Toast from '../../../components/common/Toast';
import { isFormEmpty } from '../../../utils/formUtils';

const STEPS = [
  { id: 1, title: 'Household & Routine' },
  { id: 2, title: 'Major Appliances' },
  { id: 3, title: 'EV, Backup & Solar' },
  { id: 4, title: 'Flexibility & Common Loads' }
];

export default function ResidentialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseRoute = useBaseRoute();
  const { surveyData, loadSurvey, saveSection, isLoading: isContextLoading, error: contextError } = useSurvey();
  
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    profiles: {},
    occupancy: [],
    appliances: [],
    ev: {},
    backup: [],
    solar: {},
    commonLoadsInfo: {},
    commonLoads: [],
    loadFlexibility: {}
  });

  // Specifically for C4.1 to C4.10 which goes to Demand Response endpoint
  const [drData, setDrData] = useState({
    willingness: '',
    constraints: '', // used for appliances to adjust
    estimatedAdjustmentDuration: '',
    requiredAdvanceNotice: '',
    participationFrequency: '',
    notificationMethod: '',
    billSavingsInfluence: '',
    incentiveInfluence: '',
    preferredIncentive: '',
    automationInterest: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isReadOnly = surveyData?.survey?.status !== 'DRAFT' && localStorage.getItem('userRole') === 'agent';
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  useEffect(() => {
    if (!surveyData || surveyData.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  useEffect(() => {
    if (surveyData?.residential) {
      setFormData({
        profiles: surveyData.residential.profiles || {},
        occupancy: surveyData.residential.occupancy || [],
        appliances: surveyData.residential.appliances || [],
        ev: surveyData.residential.ev || {},
        backup: surveyData.residential.backup || [],
        solar: surveyData.residential.solar || {},
        commonLoadsInfo: surveyData.residential.commonLoadsInfo || {},
        commonLoads: surveyData.residential.commonLoads || [],
        loadFlexibility: surveyData.residential.loadFlexibility || {}
      });
    }
    if (surveyData?.demandResponse?.profiles) {
      setDrData(surveyData.demandResponse.profiles);
    }
  }, [surveyData]);

  // Generic handlers
  const handleObjectChange = (sectionKey, name, value) => {
    setFormData(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [name]: value } }));
  };
  const handleArrayChange = (sectionKey, newArray) => {
    setFormData(prev => ({ ...prev, [sectionKey]: newArray }));
  };
  const handleDrChange = (name, value) => {
    setDrData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSave = async (e) => {
    e.preventDefault();
    if (isReadOnly) {
      navigate(`${baseRoute}/surveys`);
      return;
    }
    if (isFormEmpty(formData) && isFormEmpty(drData)) {
      if (!window.confirm("This page is completely blank. Are you sure you want to proceed without entering any data?")) {
        return;
      }
    }
    setIsSaving(true);
    try {
      // 1. Save Residential Data
      const resResult = await saveSection('residential', formData);
      
      // 2. Save DR Data (C4 willingness part)
      // Pass the newVersion from the first call to avoid OCC conflicts!
      await saveSection('demandResponse', { profiles: drData }, resResult.newVersion);
      
      // Since this is the agent flow, redirect back to Agent Survey List
      navigate(`${baseRoute}/surveys`);
    } catch (err) {
      setToastMessage(err.message || 'Failed to save residential details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isContextLoading && !surveyData) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;
  if (contextError) return <div className="glass-card" style={{padding: '2rem', color: 'var(--error)'}}>{contextError}</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '0.5rem', color: '#0F172A', fontSize: '1.75rem', fontWeight: 700 }}>Residential Consumer Form</h1>
      <p style={{ color: '#64748B', marginBottom: '2rem' }}>Fill out the details for residential consumers.</p>
      
      {/* Stepper Header */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {STEPS.map((step) => (
          <div 
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            style={{
              flex: 1, minWidth: '180px',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: currentStep === step.id ? '#0F172A' : '#F1F5F9',
              color: currentStep === step.id ? '#FFFFFF' : '#64748B',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
              fontWeight: 600, fontSize: '0.9rem'
            }}
          >
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '12px', 
              backgroundColor: currentStep === step.id ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
            }}>
              {step.id}
            </div>
            {step.title}
          </div>
        ))}
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <form onSubmit={currentStep === 4 ? handleSave : (e) => { e.preventDefault(); handleNext(); }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <fieldset disabled={isReadOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
          {currentStep === 1 && (
            <>
              <ProfileSection data={formData.profiles} onChange={(n, v) => handleObjectChange('profiles', n, v)} />
            <OccupancySection data={formData.occupancy} onChange={(arr) => handleArrayChange('occupancy', arr)} />
          </>
        )}

        {currentStep === 2 && (
          <AppliancesSection data={formData.appliances} onChange={(arr) => handleArrayChange('appliances', arr)} />
        )}

        {currentStep === 3 && (
          <>
            <EVChargingSection data={formData.ev} onChange={(n, v) => handleObjectChange('ev', n, v)} />
            <BackupPowerSection data={formData.backup} onChange={(arr) => handleArrayChange('backup', arr)} />
            <SolarSection data={formData.solar} onChange={(n, v) => handleObjectChange('solar', n, v)} />
          </>
        )}

        {currentStep === 4 && (
          <>
            <FlexibilitySection drData={drData} onChangeDR={handleDrChange} flexData={formData.loadFlexibility} onChangeFlex={(n, v) => handleObjectChange('loadFlexibility', n, v)} />
            <CommonLoadsInfoSection data={formData.commonLoadsInfo} onChange={(n, v) => handleObjectChange('commonLoadsInfo', n, v)} />
            <CommonLoadsSection data={formData.commonLoads} onChange={(arr) => handleArrayChange('commonLoads', arr)} />
          </>
        )}
        </fieldset>

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
          <div>
            {currentStep === 1 ? (
              <Button type="button" variant="secondary" onClick={() => navigate(`${baseRoute}/surveys/${id}/common`)}>
                Back to Common Details
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={handlePrev}>
                Previous Step
              </Button>
            )}
          </div>
          
          <div>
            {currentStep < 4 ? (
              <Button type="submit" variant="primary">
                Next Step
              </Button>
            ) : (
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isSaving} 
                onClick={handleSave}
                disabled={isSaving || isReadOnly}
                style={isReadOnly ? { backgroundColor: '#94A3B8', cursor: 'not-allowed' } : {}}
              >
                {isReadOnly ? 'Close View' : 'Save & Finish Survey'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
