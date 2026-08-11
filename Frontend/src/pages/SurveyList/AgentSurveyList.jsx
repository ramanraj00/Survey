import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';

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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Surveys</h1>
        <Button onClick={() => navigate('/agent/surveys/new')}>+ New Survey</Button>
      </div>

      <Card padding="0">
        {surveys.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't created any surveys yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Survey ID</th>
                <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem' }}>Date Created</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-glass)' }} className="animate-fade-in">
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{s.surveyNumber}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{s.consumerCategory}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
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
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate(`/agent/surveys/${s.id}`)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                      >
                        {s.status === 'DRAFT' ? 'Continue Editing' : 'View Details'}
                      </Button>
                      
                      {s.status === 'DRAFT' && (
                        <Button 
                          variant="primary" 
                          onClick={() => handleSubmitSurvey(s.id, s.version)}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', backgroundColor: '#10B981', color: 'white', border: 'none' }}
                        >
                          Submit to Admin
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 500,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
