import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';

export default function AgentSurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
                      color: s.status === 'SUBMITTED' ? 'var(--success)' : 
                             s.status === 'APPROVED' ? 'var(--accent-primary)' : 'var(--warning)'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate(`/agent/surveys/${s.id}`)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      {s.status === 'DRAFT' ? 'Continue Editing' : 'View Details'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
