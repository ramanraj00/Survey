import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { SurveyAPI, AdminAPI } from '../../../services/api';
import { CheckCircle, Shield, History, ArrowLeft, Edit3, Download } from 'lucide-react';

export default function AdminSurveyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await AdminAPI.exportSurvey(id);
    } catch (err) {
      alert(err.message || 'Failed to export survey');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <div className="flex-center" style={{height: '50vh', fontWeight: 500}}>Loading Admin View...</div>;
  if (error) return <div className="flex-center" style={{height: '50vh', color: '#EF4444', fontWeight: 500}}>{error}</div>;

  const isApproved = data?.survey?.status === 'APPROVED';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: '#111827', fontSize: '1.75rem', letterSpacing: '-0.01em' }}>
            Survey Details
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563', background: '#F3F4F6', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
              {data.survey.surveyNumber}
            </span>
            {isApproved && <Shield color="#3B82F6" size={22} title="Approved & Locked" />}
          </h1>
          <div style={{ color: '#6B7280', marginTop: '0.75rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            Category: <strong style={{ color: '#111827', fontWeight: 600 }}>{data.survey.consumerCategory}</strong> | 
            Status: <span style={{ 
              padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
              background: '#111827', color: '#FFFFFF', display: 'inline-block', margin: '0 0.25rem'
            }}>{data.survey.status}</span>
            {data.agentEmail && (
              <> | Agent: <strong style={{ color: '#111827', fontWeight: 600 }}>{data.agentEmail}</strong></>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button 
            onClick={() => navigate('/admin/surveys')}
            style={{ background: 'transparent', color: '#111827', border: '1px solid #D1D5DB', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.375rem' }} /> Back to List
          </Button>
          {!isApproved && data.survey.status === 'SUBMITTED' && (
            <Button onClick={handleApprove} isLoading={isApproving} style={{ background: '#111827', color: '#FFFFFF', border: 'none', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
              <CheckCircle size={16} style={{ marginRight: '0.375rem' }} /> Approve Survey
            </Button>
          )}
          {isApproved && (
            <Button onClick={handleExport} isLoading={isExporting} style={{ background: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
              <Download size={16} style={{ marginRight: '0.375rem' }} /> {isExporting ? 'Exporting...' : 'Export to Excel'}
            </Button>
          )}
        </div>
      </div>

      {isApproved && (
        <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: '#3B82F6', fontWeight: 500, marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={20} /> This survey has been approved. All fields are now read-only and locked from further edits.
        </div>
      )}

      {/* Vertical Stacking for Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Card: Editor Entry Point */}
        <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} color="#111827" strokeWidth={2.5} />
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.125rem', color: '#111827' }}>Survey Editor</h2>
          </div>

          <p style={{ color: '#4B5563', margin: 0, lineHeight: 1.5, fontWeight: 400, fontSize: '0.95rem', maxWidth: '800px' }}>
            To view the survey details in a clean, structured format with perfect visual hierarchy, 
            please open the Survey Editor. Admins have full access to review and overwrite any data 
            before final approval.
          </p>

          <div style={{ marginTop: '0.5rem' }}>
            <Button 
              onClick={() => navigate(`/admin/surveys/${id}/edit`)}
              style={{ background: '#111827', color: '#FFFFFF', border: 'none', fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.5rem', borderRadius: '6px' }}
            >
              Open Survey Editor
            </Button>
          </div>
        </div>

        {/* Bottom Card: Audit History */}
        <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="#111827" strokeWidth={2.5} />
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.125rem', color: '#111827' }}>Audit History</h2>
          </div>
          
          {(!data.auditLogs || data.auditLogs.length === 0) ? (
            <div style={{ color: '#6B7280', fontWeight: 400, fontSize: '0.875rem' }}>
              No edits have been made by admins yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem', marginTop: '0.5rem' }}>
              {data.auditLogs.map(log => (
                <div key={log.id} style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500, marginBottom: '0.25rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.125rem', color: '#111827' }}>
                    {log.section} • {log.field}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#4B5563', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ textDecoration: 'line-through', color: '#DC2626' }}>{log.oldValue || 'null'}</span>
                    <span style={{ color: '#D1D5DB' }}>→</span>
                    <span style={{ color: '#059669', fontWeight: 500 }}>{log.newValue || 'null'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
