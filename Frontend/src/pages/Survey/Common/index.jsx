import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../../context/SurveyContext';
import Toast from '../../../components/common/Toast';
import Select from '../../../components/common/Select';

export default function CommonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { surveyData, loadSurvey, saveSection, contextError } = useSurvey();
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const totalSteps = 3;

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const surveyStatus = surveyData?.survey?.status;
  const isReadOnly = (!isAdmin && surveyStatus !== 'DRAFT') || (isAdmin && surveyStatus === 'APPROVED');

  useEffect(() => {
    if (!surveyData || surveyData.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  useEffect(() => {
    if (surveyData?.commonDetails) {
      setFormData(surveyData.commonDetails);
    } else {
      setFormData({});
    }
  }, [surveyData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };



  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleSaveAndContinue = async () => {
    // If agent and the survey is submitted, just navigate
    if (isReadOnly) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        const cat = surveyData?.survey?.consumerCategory?.toLowerCase();
        if (cat) {
          const basePath = window.location.pathname.split('/common')[0];
          navigate(`${basePath}/${cat}`);
        } else {
          navigate(-1);
        }
      }
      return;
    }

    // If Admin and not the final step, just navigate (defer save until end)
    if (isAdmin && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setIsSaving(true);
    try {
      // Sanitize data: convert empty strings to null, and "true"/"false" strings to booleans
      const sanitizedData = { ...formData };
      for (const [key, value] of Object.entries(sanitizedData)) {
        if (value === '') {
          sanitizedData[key] = null;
        } else if (value === 'true') {
          sanitizedData[key] = true;
        } else if (value === 'false') {
          sanitizedData[key] = false;
        } else if (key === 'meterCount' && value !== null) {
          sanitizedData[key] = parseInt(value, 10);
        }
      }

      await saveSection('common', sanitizedData);
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        const cat = surveyData?.survey?.consumerCategory?.toLowerCase();
        if (cat) {
          const basePath = window.location.pathname.split('/common')[0];
          navigate(`${basePath}/${cat}`);
        } else {
          navigate(-1);
        }
      }
    } catch (error) {
      console.error("Save failed:", error);
      setToastMessage(error.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (contextError) {
    return <div style={{ color: 'red', padding: '2rem' }}>Error loading survey: {contextError}</div>;
  }
  if (!surveyData) {
    return <div style={{ padding: '2rem', color: '#64748B' }}>Loading survey data...</div>;
  }

  // Common styles
  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.5rem',
    letterSpacing: '0.01em'
  };

  const stepContainerStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2.5rem'
  };

  const renderStepIndicator = () => (
    <div style={stepContainerStyle}>
      {[1, 2, 3].map((step) => (
        <div key={step} style={{
          flex: 1,
          height: '6px',
          borderRadius: '4px',
          backgroundColor: step <= currentStep ? '#2563EB' : '#E2E8F0',
          transition: 'background-color 0.3s ease'
        }} />
      ))}
    </div>
  );

  const renderA1 = () => (
    <div className="form-grid">
      <div><label style={labelStyle}>Survey Date</label><input type="date" name="surveyDate" value={formData.surveyDate || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Survey Time</label><input type="time" name="surveyTime" value={formData.surveyTime || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Name of Enumerator</label><input name="enumeratorName" value={formData.enumeratorName || ''} onChange={handleChange} style={inputStyle} placeholder="Ex: John Doe" /></div>
      
      {/* DISCOM Rep */}
      <div><label style={labelStyle}>DISCOM Rep Present?</label>
        <Select name="discomRepresentativePresent" value={formData.discomRepresentativePresent || ''} onChange={handleChange} style={inputStyle}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>
      <div><label style={labelStyle}>DISCOM Rep Name</label><input name="discomRepresentativeName" value={formData.discomRepresentativeName || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>DISCOM Rep Designation</label><input name="discomRepresentativeDesignation" value={formData.discomRepresentativeDesignation || ''} onChange={handleChange} style={inputStyle} /></div>

      {/* Address */}
      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Address & Location</label><input name="address" value={formData.address || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Latitude</label><input name="latitude" value={formData.latitude || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Longitude</label><input name="longitude" value={formData.longitude || ''} onChange={handleChange} style={inputStyle} /></div>
      
      {/* Respondent */}
      <div><label style={labelStyle}>Respondent Name</label><input name="respondentName" value={formData.respondentName || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Respondent Phone</label><input name="respondentPhone" value={formData.respondentPhone || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Respondent Designation</label><input name="respondentDesignation" value={formData.respondentDesignation || ''} onChange={handleChange} style={inputStyle} /></div>

      {/* Consent */}
      <div><label style={labelStyle}>Consent to Collect Info</label>
        <Select name="consentToCollect" value={formData.consentToCollect || ''} onChange={handleChange} style={inputStyle}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>
      <div><label style={labelStyle}>Consent to Photos</label>
        <Select name="consentToPhotos" value={formData.consentToPhotos || ''} onChange={handleChange} style={inputStyle}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>
    </div>
  );

  const renderA2 = () => (
    <div className="form-grid">
      <div><label style={labelStyle}>Service Connection Number</label><input name="serviceConnectionNumber" value={formData.serviceConnectionNumber || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Meter Number</label><input name="meterNumber" value={formData.meterNumber || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Metering Type</label><input name="meteringType" value={formData.meteringType || ''} onChange={handleChange} style={inputStyle} /></div>
      
      <div><label style={labelStyle}>Supply Classification</label><input name="supplyClassification" value={formData.supplyClassification || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Supply Phase</label><input name="supplyPhase" value={formData.supplyPhase || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Tariff Category</label><input name="tariffCategory" value={formData.tariffCategory || ''} onChange={handleChange} style={inputStyle} /></div>

      <div><label style={labelStyle}>Circle</label><input name="circle" value={formData.circle || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Division</label><input name="division" value={formData.division || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Subdivision</label><input name="subdivision" value={formData.subdivision || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Section</label><input name="section" value={formData.section || ''} onChange={handleChange} style={inputStyle} /></div>
      
      <div><label style={labelStyle}>Substation</label><input name="substation" value={formData.substation || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Feeder Name/Code</label><input name="feederName" value={formData.feederName || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>DTR Name/Code</label><input name="dtrName" value={formData.dtrName || ''} onChange={handleChange} style={inputStyle} /></div>

      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>More than one electricity connection/meter?</label>
        <Select name="hasMultipleConnections" value={formData.hasMultipleConnections || ''} onChange={handleChange} style={inputStyle}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>
      {formData.hasMultipleConnections === 'true' && (
        <>
          <div><label style={labelStyle}>No. of Meters</label><input type="number" name="meterCount" value={formData.meterCount || ''} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Type of Supply</label><input name="multipleConnectionSupplyType" value={formData.multipleConnectionSupplyType || ''} onChange={handleChange} style={inputStyle} /></div>
        </>
      )}
    </div>
  );

  const renderA3 = () => (
    <div className="form-grid">
      <div><label style={labelStyle}>Sanctioned Load</label><input name="sanctionedLoad" value={formData.sanctionedLoad || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Contracted Demand</label><input name="contractedDemand" value={formData.contractedDemand || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Highest Billed Demand (last 12m)</label><input name="highestBilledDemand" value={formData.highestBilledDemand || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Avg Monthly Consumption (kWh)</label><input name="averageMonthlyConsumption" value={formData.averageMonthlyConsumption || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Typical Monthly Bill</label><input name="typicalMonthlyBill" value={formData.typicalMonthlyBill || ''} onChange={handleChange} style={inputStyle} /></div>
      
      <div><label style={labelStyle}>Operating Days</label><input name="operatingDays" value={formData.operatingDays || ''} onChange={handleChange} style={inputStyle} /></div>
      <div><label style={labelStyle}>Operating Timings</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="time" name="operatingStartTime" value={formData.operatingStartTime || ''} onChange={handleChange} style={inputStyle} />
          <input type="time" name="operatingEndTime" value={formData.operatingEndTime || ''} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
      <div><label style={labelStyle}>Occupancy</label><input name="occupancy" value={formData.occupancy || ''} onChange={handleChange} style={inputStyle} /></div>
      
      <div><label style={labelStyle}>Seasonality</label>
        <Select name="seasonality" value={formData.seasonality || ''} onChange={handleChange} style={inputStyle}>
          <option value="">Select</option>
          <option value="Higher in summer">Higher in summer</option>
          <option value="Higher in winter">Higher in winter</option>
          <option value="Higher in monsoon">Higher in monsoon</option>
          <option value="No Major Variation">No Major Variation</option>
        </Select>
      </div>

      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>On Site Alternative Sources</label></div>
      <div><label style={{...labelStyle, fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
        <input type="checkbox" name="hasRooftopSolar" checked={formData.hasRooftopSolar || false} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }} /> Rooftop Solar
      </label></div>
      <div><label style={{...labelStyle, fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
        <input type="checkbox" name="hasDGSet" checked={formData.hasDGSet || false} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }} /> DG Set
      </label></div>
      <div><label style={{...labelStyle, fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
        <input type="checkbox" name="hasBatteryInverter" checked={formData.hasBatteryInverter || false} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }} /> Battery / Inverter
      </label></div>
      <div><label style={{...labelStyle, fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
        <input type="checkbox" name="hasNoAlternativeSource" checked={formData.hasNoAlternativeSource || false} onChange={handleChange} style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }} /> None
      </label></div>

      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Frequent power outages?</label>
        <Select name="frequentPowerOutages" value={formData.frequentPowerOutages || ''} onChange={handleChange} style={inputStyle}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>
      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Outage Remarks</label><input name="outageRemarks" value={formData.outageRemarks || ''} onChange={handleChange} style={inputStyle} /></div>
    </div>
  );

  return (
    <>
      <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem 1rem;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        @media (max-width: 1200px) {
          .form-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .main-container {
            padding: 1rem !important;
          }
          .card-container {
            padding: 1.5rem !important;
          }
          .footer-actions {
            flex-direction: column-reverse;
            gap: 1rem;
          }
          .footer-actions button {
            width: 100%;
          }
        }
      `}</style>
      <div className="main-container" style={{
        padding: '1.5rem 2rem',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        <div className="card-container" style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
        }}>
        <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '0.25rem',
            letterSpacing: '-0.02em'
          }}>
            {currentStep === 1 ? 'A1. Survey Details' : currentStep === 2 ? 'A2. Electricity Connection Details' : 'A3. Consumption Profile'}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Please fill in the {currentStep === 1 ? 'survey introduction' : currentStep === 2 ? 'connection' : 'consumption'} details. Fields are optional.
          </p>
        </div>

        {renderStepIndicator()}

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
            {currentStep === 1 && renderA1()}
            {currentStep === 2 && renderA2()}
            {currentStep === 3 && renderA3()}
        </div>
        </fieldset>

        {/* Footer Actions */}
        <div className="footer-actions" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1rem',
          marginTop: 'auto',
          borderTop: '1px solid #E2E8F0'
        }}>
          <button 
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(prev => prev - 1);
              } else {
                navigate(-1);
              }
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              fontWeight: '600',
              color: '#64748B',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <button 
            type="button"
            onClick={handleSaveAndContinue} 
            disabled={isSaving}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              fontWeight: '600',
              backgroundColor: isReadOnly ? '#94A3B8' : '#2563EB',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.2s ease',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!isSaving && !isReadOnly) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              if (!isSaving) e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isSaving ? 'Saving...' : currentStep === totalSteps ? (isReadOnly ? 'Next' : 'Save & Finish') : (isReadOnly || isAdmin ? 'Next' : 'Save & Continue')}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
