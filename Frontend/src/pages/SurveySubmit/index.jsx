import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey } from '../../context/SurveyContext';
import { SurveyAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const formatFieldName = (field) => {
  if (!field) return '';
  let cleanField = field.replace(/^(industrial|commercial|residential|ev|demandResponse|commonDetails)\./, '');
  
  const arrayMatch = cleanField.match(/(\w+)\[(\d+)\]\.(.+)/);
  if (arrayMatch) {
    const [, arrayName, indexStr, property] = arrayMatch;
    const index = parseInt(indexStr, 10) + 1;
    const parts = property.split('.');
    const lastPart = parts[parts.length - 1];
    const humanProperty = lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const humanArrayName = arrayName.replace(/s$/, '').replace(/^./, str => str.toUpperCase());
    return `${humanArrayName} ${index} • ${humanProperty}`;
  }
  
  const parts = cleanField.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

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
    navigate(isAdmin ? `/admin/surveys` : '/agent/surveys');
  };

  if (isValidating) return <div className="flex-center" style={{height: '50vh'}}>Running final validation checks...</div>;

  const isSubmitted = surveyData?.survey?.status === 'SUBMITTED';
  const isApproved = surveyData?.survey?.status === 'APPROVED';

  if (isSubmitted || isApproved) {
    return (
      <div className="review-container">
        <style>{`
          .review-container {
            width: 100%;
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem 4rem;
            box-sizing: border-box;
          }
          @media (max-width: 768px) {
            .review-container {
              padding: 2rem 1rem;
            }
          }
          
        `}</style>
        <Card padding="3rem" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h2>Survey Submitted Successfully</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
            This survey is now locked for agent editing and pending admin approval.
          </p>
          <Button onClick={() => navigate('/agent/surveys')} style={{ background: '#0F172A', color: '#fff', border: 'none' }}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="review-container">
      <style>{`
        .review-container {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem 4rem;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .review-container {
            padding: 2rem 1rem;
          }
        }
        
        /* Dashboard Warnings Table Styles */
        .warnings-table-container {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
          max-height: 500px;
          overflow-y: auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .warnings-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .warnings-table th {
          position: sticky;
          top: 0;
          background: #f1f5f9;
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #334155;
          border-bottom: 2px solid #cbd5e1;
          z-index: 10;
        }
        .warnings-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.95rem;
          color: #1e293b;
          vertical-align: middle;
        }
        .warnings-table tr:last-child td {
          border-bottom: none;
        }
        .warnings-table tr:hover {
          background-color: #f8fafc;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge.error {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fca5a5;
        }
        .badge.warning {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fcd34d;
        }
      `}</style>
      <h1 style={{ marginBottom: '1.5rem', color: '#0F172A', fontSize: '1.75rem', fontWeight: 700 }}>Review Survey Data</h1>
      
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
              No missing fields or soft validation issues were found. Your survey data looks complete!
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--warning)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, color: '#0F172A' }}>Validation Warnings ({warnings.length})</h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Some fields were left blank or need your attention. You can go back and complete them, or choose to finish editing anyway.
            </p>
            
            <div className="warnings-table-container">
              <table className="warnings-table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Severity</th>
                    <th style={{ width: '20%' }}>Section</th>
                    <th style={{ width: '35%' }}>Field</th>
                    <th style={{ width: '35%' }}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.map((w, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`badge ${w.severity || 'warning'}`}>
                          {w.severity === 'error' ? 'Error' : 'Warning'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{w.section.replace(/_/g, ' ').toUpperCase()}</td>
                      <td style={{ color: '#334155' }}>{formatFieldName(w.field)}</td>
                      <td style={{ color: '#475569' }}>{w.message.replace(/^[a-zA-Z0-9_]+(\[[0-9]+\])?/, "This field")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)' }}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} style={{ flex: 1, minWidth: '200px' }}>
            Back to Editing
          </Button>
          
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} style={{ flex: 1, minWidth: '200px', background: '#0F172A', color: '#fff', border: 'none' }}>
            Finish Editing & Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
