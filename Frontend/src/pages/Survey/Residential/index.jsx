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
import LoadFlexibilitySection from './sections/LoadFlexibilitySection';
import { isFormEmpty } from '../../../utils/formUtils';

export default function ResidentialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseRoute = useBaseRoute();
  const { surveyData, loadSurvey, saveSection, isLoading: isContextLoading, error: contextError } = useSurvey();
  
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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
        ev: surveyData.residential.evCharging || {},
        backup: surveyData.residential.backupPowerSources || [],
        solar: surveyData.residential.solarInstallations || {},
        commonLoadsInfo: surveyData.residential.commonLoadsInfo || {},
        commonLoads: surveyData.residential.commonLoads || [],
        loadFlexibility: surveyData.residential.loadFlexibility || {}
      });
    }
  }, [surveyData]);

  // Generic handler for object sections
  const handleObjectChange = (sectionKey, name, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [name]: value
      }
    }));
  };

  // Generic handler for array sections
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
      await saveSection('residential', formData);
      navigate(`${baseRoute}/surveys/${id}/demand-response`);
    } catch (err) {
      setSaveError(err.message || 'Failed to save residential details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isContextLoading && !surveyData) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;
  if (contextError) return <div className="glass-card" style={{padding: '2rem', color: 'var(--error)'}}>{contextError}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Residential Survey</h1>
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {saveError && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)' }}>
            {saveError}
          </div>
        )}

        <ProfileSection data={formData.profiles} onChange={(n, v) => handleObjectChange('profiles', n, v)} />
        <OccupancySection data={formData.occupancy} onChange={(arr) => handleArrayChange('occupancy', arr)} />
        <AppliancesSection data={formData.appliances} onChange={(arr) => handleArrayChange('appliances', arr)} />
        
        {/* Pass entire ev object for conditional logic */}
        <EVChargingSection data={formData.ev} onChange={(n, v) => handleObjectChange('ev', n, v)} />
        
        <BackupPowerSection data={formData.backup} onChange={(arr) => handleArrayChange('backup', arr)} />
        <SolarSection data={formData.solar} onChange={(n, v) => handleObjectChange('solar', n, v)} />
        
        <CommonLoadsInfoSection data={formData.commonLoadsInfo} onChange={(n, v) => handleObjectChange('commonLoadsInfo', n, v)} />
        <CommonLoadsSection data={formData.commonLoads} onChange={(arr) => handleArrayChange('commonLoads', arr)} />
        
        <LoadFlexibilitySection data={formData.loadFlexibility} onChange={(n, v) => handleObjectChange('loadFlexibility', n, v)} />

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
