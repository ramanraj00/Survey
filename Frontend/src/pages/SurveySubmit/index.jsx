import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../context/SurveyContext';
import { SurveyAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SurveySubmit({ isAdmin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { surveyData, loadSurvey, currentVersion } = useSurvey();
  
  const [warnings, setWarnings] = useState([]);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!surveyData || surveyData.survey?.id !== id) {
      loadSurvey(id);
    }
  }, [id, surveyData, loadSurvey]);

  useEffect(() => {
    let mounted = true;
    const validate = async () => {
      try {
        const res = await SurveyAPI.validateSurvey(id);
        if (mounted) {
          setWarnings(res.warnings || []);
        }
      } catch (err) {
        if (mounted) setSubmitError("Failed to run validation.");
      } finally {
        if (mounted) setIsValidating(false);
      }
    };
    if (surveyData?.survey?.id === id) {
      validate();
    }
    return () => { mounted = false; };
  }, [id, surveyData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await SurveyAPI.submitSurvey(id, currentVersion);
      // Reload survey to reflect SUBMITTED status
      await loadSurvey(id);
      navigate(isAdmin ? `/admin/surveys/${id}` : '/agent/surveys');
    } catch (err) {
      if (err.status === 409) {
        setSubmitError("Conflict: Survey was modified elsewhere. Please refresh.");
      } else {
        setSubmitError(err.message || 'Failed to submit survey');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) return <div className="flex-center" style={{height: '50vh'}}>Running final validation checks...</div>;

  const isSubmitted = surveyData?.survey?.status === 'SUBMITTED';
  const isApproved = surveyData?.survey?.status === 'APPROVED';

  if (isSubmitted || isApproved) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
        <Card padding="3rem" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h2>Survey Submitted Successfully</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
            This survey is now locked for agent editing and pending admin approval.
          </p>
          <Button onClick={() => navigate('/agent/surveys')}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Review & Submit</h1>
      
      <Card>
        {submitError && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={18} /> {submitError}
          </div>
        )}

        {warnings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle size={32} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--success)' }}>All Checks Passed</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No missing fields or soft validation issues were found. You are ready to submit!
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--warning)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0 }}>Validation Warnings ({warnings.length})</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              The following soft warnings were found. You can go back and fix them, or choose to submit anyway.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {warnings.map((w, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  borderLeft: `4px solid ${w.severity === 'error' ? 'var(--error)' : 'var(--warning)'}`,
                  padding: '1rem',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {w.section.replace(/_/g, ' ').toUpperCase()} • {w.field}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {w.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Back to Editing
          </Button>
          
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
            {warnings.length > 0 ? 'Submit Anyway' : 'Submit Survey'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
