import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

export default function AgentSurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    let mounted = true;
    const fetchSurveys = async () => {
      try {
        const data = await SurveyAPI.getSurveys();
        if (mounted) setSurveys(data);
      } catch (err) {
        console.error("Failed to load surveys:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchSurveys();
    return () => { mounted = false; };
  }, []);

  const handleSubmitSurvey = async (id, version) => {
    try {
      await SurveyAPI.submitSurvey(id, version);
      showToast('Survey submitted successfully to Admin!');
      // Refresh list
      const data = await SurveyAPI.getSurveys();
      setSurveys(data);
    } catch (err) {
      showToast('Failed to submit survey: ' + err.message);
    }
  };

  if (isLoading) return <div className="flex-center" style={{height: '50vh'}}>Loading your surveys...</div>;

  const statusOrder = { 'DRAFT': 1, 'SUBMITTED': 2, 'APPROVED': 3 };
  const sortedSurveys = [...surveys].sort((a, b) => {
    const diff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    if (diff !== 0) return diff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div style={{ width: '100%', paddingBottom: '4rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Surveys</h1>
        <Button onClick={() => navigate('/agent/surveys/new')}>+ New Survey</Button>
      </div>

      <Card padding="0" style={{ background: '#F1F5F9', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
        {sortedSurveys.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't created any surveys yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
            {sortedSurveys.map(s => (
              <div key={s.id} style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem', background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem', color: '#111827' }}>{s.surveyNumber}</span>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: s.status === 'SUBMITTED' ? 'rgba(16, 185, 129, 0.1)' : 
                                s.status === 'APPROVED' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: s.status === 'SUBMITTED' ? '#10B981' : 
                           s.status === 'APPROVED' ? '#3B82F6' : '#F59E0B'
                  }}>
                    {s.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
                    <span style={{ fontWeight: 500 }}>{s.consumerCategory}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                    <span style={{ fontWeight: 500 }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    onClick={() => navigate(`/agent/surveys/${s.id}`)}
                    style={{ 
                      padding: '0.625rem 1rem', fontSize: '0.875rem', flex: 1, textAlign: 'center', 
                      background: 'transparent', color: '#111827', border: '1px solid var(--border-glass)', 
                      borderRadius: '9999px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                      width: '100%'
                    }}
                  >
                    {s.status === 'DRAFT' ? 'Continue Editing' : 'View Details'}
                  </button>
                  
                  {s.status === 'DRAFT' && (
                    <button 
                      onClick={() => handleSubmitSurvey(s.id, s.version)}
                      style={{ 
                        padding: '0.625rem 1rem', fontSize: '0.875rem', flex: 1, textAlign: 'center', 
                        backgroundColor: '#10B981', color: 'white', border: 'none', 
                        borderRadius: '9999px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                        width: '100%'
                      }}
                    >
                      Submit to Admin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
