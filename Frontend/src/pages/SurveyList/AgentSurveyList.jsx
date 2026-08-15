import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

const getCategoryStyle = (category) => {
  switch(category) {
    case 'RESIDENTIAL': return { background: '#A855F7', color: '#FFFFFF' };
    case 'COMMERCIAL': return { background: '#10B981', color: '#FFFFFF' };
    case 'INVENTORY': return { background: '#FEEBC8', color: '#C05621' };
    case 'INDUSTRIAL': return { background: '#FF6B00', color: '#FFFFFF' };
    default: return { background: '#3B82F6', color: '#FFFFFF' };
  }
};

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

  if (isLoading) {
    return (
      <div style={{ padding: '2rem 0', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .skeleton-box {
              background: #E2E8F0;
              border-radius: 4px;
            }
          `}
        </style>
        
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <div className="skeleton-box" style={{ width: '150px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton-box" style={{ width: '120px', height: '40px', borderRadius: '8px' }} />
        </div>

        <Card padding="0" style={{ background: '#F1F5F9', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="skeleton-box" style={{ width: '120px', height: '24px' }} />
                  <div className="skeleton-box" style={{ width: '80px', height: '24px', borderRadius: '999px' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton-box" style={{ width: '70px', height: '16px' }} />
                    <div className="skeleton-box" style={{ width: '100px', height: '16px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton-box" style={{ width: '60px', height: '16px' }} />
                    <div className="skeleton-box" style={{ width: '80px', height: '16px' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="skeleton-box" style={{ flex: 1, height: '40px', borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

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
              <div key={s.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hover-lift" onClick={() => navigate(`/agent/surveys/${s.id}`)}>
                
                {/* Header Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.25rem' }}>📄</span>
                    </div>
                    <span style={{ 
                      padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.025em',
                      background: s.status === 'SUBMITTED' ? '#FFFBEB' : s.status === 'APPROVED' ? '#ECFDF5' : '#F1F5F9', 
                      color: s.status === 'SUBMITTED' ? '#B45309' : s.status === 'APPROVED' ? '#047857' : '#475569',
                      border: `1px solid ${s.status === 'SUBMITTED' ? '#FEF3C7' : s.status === 'APPROVED' ? '#D1FAE5' : '#E2E8F0'}`,
                      whiteSpace: 'nowrap', flexShrink: 0
                    }}>
                      {s.status}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 600, color: '#0F172A', fontSize: '1.25rem', wordBreak: 'break-word', lineHeight: '1.4' }}>
                      {s.consumerName || 'Unknown Contact'}
                    </h4>
                  </div>
                </div>
                
                <div style={{ height: '1px', background: '#F1F5F9', width: '100%' }} />
                
                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.025em', ...getCategoryStyle(s.consumerCategory) }}>
                        {s.consumerCategory}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created Date</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0F172A' }}>{new Date(s.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/agent/surveys/${s.id}`); }}
                    style={{ 
                      padding: '0.75rem 1rem', fontSize: '0.9rem', flex: 1, 
                      background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', 
                      fontWeight: 500, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    {s.status === 'DRAFT' ? 'Continue Editing' : 'View Details'}
                  </button>
                  
                  {s.status === 'DRAFT' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSubmitSurvey(s.id, s.version); }}
                      style={{ 
                        padding: '0.75rem 1rem', fontSize: '0.9rem', flex: 1, 
                        background: '#000000', color: '#FFFFFF', border: '1px solid #000000', 
                        fontWeight: 500, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#333333'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#000000'; }}
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
