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
      const dbProfiles = surveyData.industrial.profiles || {};
      const dbProcesses = surveyData.industrial.processes || [];
      const dbDeps = surveyData.industrial.processDependencies || [];
      const dbControls = surveyData.industrial.controls || {};

      setFormData({
        profiles: {
          industryType: dbProfiles.industrySector || '',
          products: dbProfiles.productsManufactured || '',
          natureOfProduction: dbProfiles.productionNature || '',
          daysOfOperationPerWeek: dbProfiles.daysPerWeek ? dbProfiles.daysPerWeek.toString() : '',
          daysClosed: dbProfiles.daysClosed || '',
          operatingHours: dbProfiles.operatingHours || '',
          numberOfShifts: dbProfiles.productionShiftCount || '',
          operates24Hours: dbProfiles.operates24Hours || '',
          highestProductionMonths: dbProfiles.highestProductionMonths || '',
          productionSchedules: dbProfiles.productionScheduleFlexibility || '',
          productionIncreaseFlexibility: dbProfiles.canIncreaseProductionBeforePeak || '',
          plannedShutdowns: dbProfiles.maintenanceSchedule || ''
        },
        shifts: surveyData.industrial.shifts || [],
        processes: dbProcesses.map(p => ({
          processName: p.processName || '',
          operatesDuringPeak: p.peakOperatingProcesses === 'Yes',
          mustOperateContinuously: p.continuousProcesses === 'Yes',
          canBeDelayed: p.delayableProcesses === 'Yes',
          canBeReduced: p.reducibleProcesses === 'Yes',
          canBeStopped: p.stoppableProcesses === 'Yes',
        })),
        processDependencies: dbDeps.map(pd => ({
          processName: pd.processName || '',
          dependencyExplanation: pd.dependencyExplanation || '',
          hasDependencies: pd.hasDependencies || '',
          interruptionImpact: pd.interruptionImpact || '',
          timeToStop: pd.timeToStop || '',
          timeToRestart: pd.timeToRestart || '',
          restartingDemandSpike: pd.restartingDemandSpike || '',
        })),
        controls: {
          automaticControlsUsed: dbControls.hasTimers || '',
          centralControlAvailable: dbControls.hasPLC || '',
          centrallyChangedSettings: dbControls.canChangeSchedulesCentrally || '',
          individualMonitoring: dbControls.individualMachineMonitoring || '',
          approvalAuthorityName: dbControls.approvalName || '',
          approvalAuthorityDesignation: dbControls.approvalDesignation || '',
          implementer: dbControls.implementationRole || ''
        }
      });
    }
    
    if (surveyData?.demandResponse?.industrialDR) {
      const dbDr = surveyData.demandResponse.industrialDR || {};
      setDrData({
        drAdjustNonCriticalLoads: dbDr.drAdjustNonCriticalLoads || '',
        drAdjustableProcesses: dbDr.drAdjustableProcesses || '',
        drAdjustmentType: dbDr.drAdjustmentType || '',
        drLoadAdjustability: dbDr.drLoadAdjustability || '',
        drAdjustmentDurationLimit: dbDr.drAdjustmentDurationLimit || '',
        drAdvanceNoticeRequired: dbDr.drAdvanceNoticeRequired || '',
        drParticipationFrequency: dbDr.drParticipationFrequency || '',
        drImpossibleParticipationPeriods: dbDr.drImpossibleParticipationPeriods || '',
        drParticipationBarriers: dbDr.drParticipationBarriers || '',
        drSeasonalPreference: dbDr.drSeasonalPreference || '',
        drIncreaseProductionBeforePeak: dbDr.drIncreaseProductionBeforePeak || '',
        drCompleteDelayedProductionAfterPeak: dbDr.drCompleteDelayedProductionAfterPeak || '',
        drDelayedProductionNewPeak: dbDr.drDelayedProductionNewPeak || '',
        drOptionToDeclineRequests: dbDr.drOptionToDeclineRequests || '',
        drPreferredNotificationMethod: dbDr.drPreferredNotificationMethod || '',
        drSavingsInfoIncreasesWillingness: dbDr.drSavingsInfoIncreasesWillingness || '',
        drIncentiveIncreasesWillingness: dbDr.drIncentiveIncreasesWillingness || '',
        drPreferredIncentiveType: dbDr.drPreferredIncentiveType || '',
        drConsiderAutomatedControls: dbDr.drConsiderAutomatedControls || '',
        drWillingToParticipateInTrial: dbDr.drWillingToParticipateInTrial || '',
        drEquipmentDataVerification: dbDr.drEquipmentDataVerification || '',
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
      const mappedProfiles = {
        industrySector: formData.profiles.industryType,
        productsManufactured: formData.profiles.products,
        productionNature: formData.profiles.natureOfProduction,
        daysPerWeek: parseInt(formData.profiles.daysOfOperationPerWeek) || null,
        daysClosed: formData.profiles.daysClosed,
        operatingHours: formData.profiles.operatingHours,
        productionShiftCount: formData.profiles.numberOfShifts,
        operates24Hours: formData.profiles.operates24Hours,
        highestProductionMonths: formData.profiles.highestProductionMonths,
        productionScheduleFlexibility: formData.profiles.productionSchedules,
        canIncreaseProductionBeforePeak: formData.profiles.productionIncreaseFlexibility,
        maintenanceSchedule: formData.profiles.plannedShutdowns
      };

      const mappedProcesses = formData.processes.map(p => ({
        processName: p.processName,
        peakOperatingProcesses: p.operatesDuringPeak ? 'Yes' : 'No',
        continuousProcesses: p.mustOperateContinuously ? 'Yes' : 'No',
        delayableProcesses: p.canBeDelayed ? 'Yes' : 'No',
        reducibleProcesses: p.canBeReduced ? 'Yes' : 'No',
        stoppableProcesses: p.canBeStopped ? 'Yes' : 'No',
      }));

      const mappedDependencies = formData.processDependencies.map(pd => ({
        processName: pd.processName,
        dependencyExplanation: pd.dependencyExplanation,
        hasDependencies: pd.hasDependencies,
        interruptionImpact: pd.interruptionImpact,
        timeToStop: pd.timeToStop,
        timeToRestart: pd.timeToRestart,
        restartingDemandSpike: pd.restartingDemandSpike,
      }));

      const mappedControls = {
        hasTimers: formData.controls.automaticControlsUsed,
        hasAutomaticControls: formData.controls.automaticControlsUsed,
        hasPLC: formData.controls.centralControlAvailable,
        hasSCADA: formData.controls.centralControlAvailable,
        hasCentralControl: formData.controls.centralControlAvailable,
        canChangeSchedulesCentrally: formData.controls.centrallyChangedSettings,
        individualMachineMonitoring: formData.controls.individualMonitoring,
        approvalName: formData.controls.approvalAuthorityName,
        approvalDesignation: formData.controls.approvalAuthorityDesignation,
        implementationRole: formData.controls.implementer
      };

      const mappedIndustrialData = {
        profiles: mappedProfiles,
        shifts: formData.shifts,
        processes: mappedProcesses,
        processDependencies: formData.processDependencies,
        controls: mappedControls
      };

      const indResult = await saveSection('industrial', mappedIndustrialData);
      
      const mappedDR = {
        drAdjustNonCriticalLoads: drData.drAdjustNonCriticalLoads,
        drAdjustableProcesses: drData.drAdjustableProcesses,
        drAdjustmentType: drData.drAdjustmentType,
        drLoadAdjustability: drData.drLoadAdjustability,
        drAdjustmentDurationLimit: drData.drAdjustmentDurationLimit,
        drAdvanceNoticeRequired: drData.drAdvanceNoticeRequired,
        drParticipationFrequency: drData.drParticipationFrequency,
        drImpossibleParticipationPeriods: drData.drImpossibleParticipationPeriods,
        drParticipationBarriers: drData.drParticipationBarriers,
        drSeasonalPreference: drData.drSeasonalPreference,
        drIncreaseProductionBeforePeak: drData.drIncreaseProductionBeforePeak,
        drCompleteDelayedProductionAfterPeak: drData.drCompleteDelayedProductionAfterPeak,
        drDelayedProductionNewPeak: drData.drDelayedProductionNewPeak,
        drOptionToDeclineRequests: drData.drOptionToDeclineRequests,
        drPreferredNotificationMethod: drData.drPreferredNotificationMethod,
        drSavingsInfoIncreasesWillingness: drData.drSavingsInfoIncreasesWillingness,
        drIncentiveIncreasesWillingness: drData.drIncentiveIncreasesWillingness,
        drPreferredIncentiveType: drData.drPreferredIncentiveType,
        drConsiderAutomatedControls: drData.drConsiderAutomatedControls,
        drWillingToParticipateInTrial: drData.drWillingToParticipateInTrial,
        drEquipmentDataVerification: drData.drEquipmentDataVerification,
      };
      
      await saveSection('demandResponse', { industrialDR: mappedDR }, indResult.newVersion);
      
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
