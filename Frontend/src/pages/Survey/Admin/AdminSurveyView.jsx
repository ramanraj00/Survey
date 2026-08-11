import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { SurveyAPI } from '../../../services/api';
import { CheckCircle, Shield, History } from 'lucide-react';
import DataViewer from '../../../components/common/DataViewer';

export default function AdminSurveyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSurvey = async () => {
    try {
      const res = await SurveyAPI.getAdminSurvey(id);
      setData(res);
    } catch (err) {
      setError("Failed to load survey data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
    // eslint-disable-next-line
  }, [id]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await SurveyAPI.approveSurvey(id, data.survey.version);
      await fetchSurvey(); // refresh to get APPROVED status
    } catch (err) {
      if (err.status === 409) {
        alert("Conflict: The survey has been modified. Please refresh and review the latest changes before approving.");
      } else {
        alert("Failed to approve survey.");
      }
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) return <div className="flex-center" style={{height: '50vh'}}>Loading Admin View...</div>;
  if (error) return <div className="flex-center" style={{height: '50vh', color: 'var(--error)'}}>{error}</div>;

  const isApproved = data?.survey?.status === 'APPROVED';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Survey {data.survey.surveyNumber}
            {isApproved && <Shield color="var(--accent-primary)" size={24} title="Approved & Locked" />}
          </h1>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Category: <strong>{data.survey.consumerCategory}</strong> | 
            Status: <strong style={{ color: isApproved ? 'var(--accent-primary)' : 'var(--warning)' }}>{data.survey.status}</strong>
            {data.agentEmail && (
              <> | Agent: <strong style={{ color: 'var(--text-primary)' }}>{data.agentEmail}</strong></>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => navigate('/admin/surveys')}>Back to List</Button>
          {!isApproved && data.survey.status === 'SUBMITTED' && (
            <Button onClick={handleApprove} isLoading={isApproving} style={{ background: 'var(--accent-primary)' }}>
              <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> Approve Survey
            </Button>
          )}
        </div>
      </div>

      {isApproved && (
        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} /> This survey has been approved. All fields are now read-only and locked from further edits.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Editor Entry Point */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card padding="2rem" style={{ textAlign: 'center', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Survey Editor</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              To view the survey details in a clean, structured format with perfect visual hierarchy, 
              please open the Survey Editor. Admins have full access to review and overwrite any data 
              before final approval.
            </p>
            <Button 
              onClick={() => navigate(`/admin/surveys/${id}/edit`)}
              style={{ background: 'var(--accent-primary)', fontSize: '1.1rem', padding: '0.75rem 2rem' }}
            >
              Open Survey Editor
            </Button>
          </Card>
        </div>

        {/* Right Column: Audit History & Metadata */}
        <div>
          <Card padding="1.5rem" style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <History size={20} color="var(--text-primary)" />
              <h3 style={{ margin: 0 }}>Audit History</h3>
            </div>
            
            {(!data.auditLogs || data.auditLogs.length === 0) ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                No edits have been made by admins yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
                {data.auditLogs.map(log => (
                  <div key={log.id} style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--accent-primary)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {new Date(log.changedAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {log.section} • {log.field}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <span style={{ textDecoration: 'line-through', color: 'var(--error)', marginRight: '0.5rem' }}>{log.oldValue || 'null'}</span>
                      →
                      <span style={{ color: 'var(--success)', marginLeft: '0.5rem' }}>{log.newValue || 'null'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
