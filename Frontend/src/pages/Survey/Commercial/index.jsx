import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import { useBaseRoute } from '../../../hooks/useBaseRoute';
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import { isFormEmpty } from '../../../utils/formUtils';

// Sections
import ProfileSection from './sections/ProfileSection';
import ElectricalLoadsSection from './sections/ElectricalLoadsSection';
import { D2_FIXED_EQUIPMENT } from './constants';
import ControlsSection from './sections/ControlsSection';
import FlexibilitySection from './sections/FlexibilitySection';

const STEPS = [
  { id: 1, title: 'Business Profile' },
  { id: 2, title: 'Electrical Loads' },
  { id: 3, title: 'Controls & Backup' },
  { id: 4, title: 'DR Flexibility' }
];

export default function CommercialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseRoute = useBaseRoute();
  const { surveyData, loadSurvey, saveSection, isLoading: isContextLoading, error: contextError } = useSurvey();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 1. Commercial Data (D1 & D3)
  const [profiles, setProfiles] = useState({});
  const [shifts, setShifts] = useState([]);
  const [controls, setControls] = useState({});

  // 2. Inventory Data (D2)
  const [inventoryItems, setInventoryItems] = useState([]);

  // 3. Demand Response Data (D4)
  const [drData, setDrData] = useState({});

  useEffect(() => {
    if (surveyData?.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  // Hydrate states when surveyData loads
  useEffect(() => {
    if (surveyData) {
      // D1
      if (surveyData.commercial?.profiles) setProfiles(surveyData.commercial.profiles);
      if (surveyData.commercial?.shifts) setShifts(surveyData.commercial.shifts);
      
      // D3
      if (surveyData.commercial?.controls) setControls(surveyData.commercial.controls);
      
      // D2
      const existingItems = surveyData.inventoryItems || [];
      const populatedItems = D2_FIXED_EQUIPMENT.map(equip => {
        const found = existingItems.find(item => item.equipmentDescription === equip);
        if (found) {
          // If it exists in DB, it implies hasItem is true, unless we saved it with hasItem=false previously
          return { ...found, hasItem: true };
        }
        return { equipmentDescription: equip, hasItem: '' };
      });
      setInventoryItems(populatedItems);

      // D4 (merge from demandResponse profiles and commercialDR)
      const mergedDr = {
        ...(surveyData.demandResponse?.profiles || {}),
        ...(surveyData.demandResponse?.commercialDR || {})
      };
      
      // Handle the boolean to string conversion for UI
      if (mergedDr.trialEventWillingness === true) mergedDr.trialEventWillingnessText = 'Yes';
      else if (mergedDr.trialEventWillingness === false) mergedDr.trialEventWillingnessText = 'No';
      else mergedDr.trialEventWillingnessText = mergedDr.trialEventWillingness;
      
      setDrData(mergedDr);
    }
  }, [surveyData]);

  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const isReadOnly = !isAdmin && surveyData?.survey?.status !== 'DRAFT';

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
    
    setIsSaving(true);
    setToastMessage('');
    try {
      let version = surveyData.survey.version;

      // Clean empty strings to null and parse numbers
      const cleanData = (obj) => {
        const cleaned = { ...obj };
        for (const [k, v] of Object.entries(cleaned)) {
          if (v === '') {
            cleaned[k] = null;
          } else if (v === 'true') {
            cleaned[k] = true;
          } else if (v === 'false') {
            cleaned[k] = false;
          } else if (['floorCount', 'operatingDays', 'shiftCount', 'chargerCount', 'numberOfUnits', 'maximumShiftableDuration'].includes(k) && v !== null && v !== undefined) {
            cleaned[k] = parseInt(v, 10);
            if (isNaN(cleaned[k])) cleaned[k] = null;
          }
        }
        return cleaned;
      };

      // 1. Save Commercial Data (D1 & D3)
      const cleanedShifts = shifts.map(s => cleanData(s));
      
      const commResult = await saveSection('commercial', {
        profiles: cleanData(profiles),
        shifts: cleanedShifts,
        controls: cleanData(controls)
      }, version);
      
      version = commResult.newVersion; // update version for next request

      // 2. Save Inventory Data (D2)
      // Only save items marked as Yes
      const itemsToSave = inventoryItems
        .filter(item => item.hasItem === true || item.hasItem === 'true')
        .map(item => cleanData(item));
      
      const invResult = await saveSection('inventory', { items: itemsToSave }, version);
      version = invResult.newVersion;

      // 3. Save Demand Response Data (D4)
      const cleanedDrData = cleanData(drData);
      
      // Parse trialEventWillingnessText back to boolean
      let trialEventWillingness = null;
      if (cleanedDrData.trialEventWillingnessText === 'Yes') trialEventWillingness = true;
      if (cleanedDrData.trialEventWillingnessText === 'No') trialEventWillingness = false;
      
      const drProfilesPayload = {
        willingness: cleanedDrData.willingness,
        estimatedAdjustmentDuration: cleanedDrData.estimatedAdjustmentDuration,
        requiredAdvanceNotice: cleanedDrData.requiredAdvanceNotice,
        participationFrequency: cleanedDrData.participationFrequency,
        notificationMethod: cleanedDrData.notificationMethod,
        billSavingsInfluence: cleanedDrData.billSavingsInfluence,
        incentiveInfluence: cleanedDrData.incentiveInfluence,
        preferredIncentive: cleanedDrData.preferredIncentive,
        automationInterest: cleanedDrData.automationInterest,
        trialEventWillingness,
        constraints: cleanedDrData.constraints
      };

      const commercialDrPayload = {
        shiftedLoadTiming: cleanedDrData.shiftedLoadTiming,
        participationBarriers: cleanedDrData.participationBarriers,
        adjustmentType: cleanedDrData.adjustmentType // stored here or in profiles
      };

      await saveSection('demandResponse', {
        profiles: drProfilesPayload,
        commercialDR: commercialDrPayload
      }, version);

      // Successfully saved all sections, navigate to submit
      navigate(`${baseRoute}/surveys/${id}/submit`);

    } catch (err) {
      console.error(err);
      setToastMessage(err.message || 'Failed to save commercial details');
    } finally {
      setIsSaving(false);
    }
  };

  if (isContextLoading && !surveyData) return <div className="flex-center" style={{height: '50vh'}}>Loading...</div>;
  if (contextError) return <div className="glass-card" style={{padding: '2rem', color: 'var(--error)'}}>{contextError}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '0.5rem', color: '#0F172A', fontSize: '1.75rem', fontWeight: 700 }}>Commercial Consumer Form</h1>
      <p style={{ color: '#64748B', marginBottom: '2rem' }}>Fill out the details for commercial consumers.</p>
      
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
        {currentStep === 1 && (
          <ProfileSection 
            data={profiles} 
            onChange={(updates) => setProfiles(prev => ({...prev, ...updates}))} 
            shifts={shifts}
            onShiftsChange={setShifts}
            isReadOnly={isReadOnly} 
          />
        )}
        {currentStep === 2 && (
          <ElectricalLoadsSection 
            items={inventoryItems} 
            onUpdateItem={(index, field, value) => {
              const newItems = [...inventoryItems];
              newItems[index] = { ...newItems[index], [field]: value };
              setInventoryItems(newItems);
            }} 
            isReadOnly={isReadOnly} 
          />
        )}
        {currentStep === 3 && (
          <ControlsSection 
            data={controls} 
            onChange={(updates) => setControls(prev => ({...prev, ...updates}))} 
            isReadOnly={isReadOnly} 
          />
        )}
        {currentStep === 4 && (
          <FlexibilitySection 
            data={drData} 
            onChange={(updates) => setDrData(prev => ({...prev, ...updates}))} 
            isReadOnly={isReadOnly} 
          />
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
            {isReadOnly ? 'Proceed to Submit View' : 'Save & Finish'}
          </Button>
        )}
      </div>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="error" 
          onClose={() => setToastMessage('')} 
        />
      )}
    </div>
  );
}
