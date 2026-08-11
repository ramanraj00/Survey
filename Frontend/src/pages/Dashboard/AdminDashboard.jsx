import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import { SurveyAPI } from '../../services/api';
import { PieChart, Users, CheckCircle, FileText, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSurveys, setRecentSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      try {
        const [statsData, surveysData] = await Promise.all([
          SurveyAPI.getAdminStats().catch(() => null),
          SurveyAPI.getAdminSurveys({ limit: 5 }).catch(() => [])
        ]);
        
        if (mounted) {
          setStats(statsData);
          setRecentSurveys(Array.isArray(surveysData) ? surveysData : (surveysData?.data || []));
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchDashboardData();
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <div className="flex-center" style={{height: '50vh'}}>Loading Admin Dashboard...</div>;

  const totalSurveys = stats?.total || 0;
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      {/* Top Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <Card padding="1.5rem" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
            <FileText size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalSurveys}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Surveys</div>
          </div>
        </Card>

        <Card padding="1.5rem" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--warning)' }}>
            <Activity size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.byStatus?.DRAFT || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Drafts</div>
          </div>
        </Card>

        <Card padding="1.5rem" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.byStatus?.SUBMITTED || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending Approval</div>
          </div>
        </Card>

        <Card padding="1.5rem" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#818cf8' }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.byStatus?.APPROVED || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Approved</div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Category Breakdown */}
        <Card padding="1.5rem">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PieChart size={20} color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>Category Breakdown</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'].map(cat => {
              const count = stats?.byCategory?.[cat] || 0;
              const percentage = totalSurveys > 0 ? (count / totalSurveys) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 500 }}>{cat}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: cat === 'RESIDENTIAL' ? 'var(--accent-primary)' : cat === 'COMMERCIAL' ? 'var(--success)' : '#818cf8' 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions & Recent */}
        <Card padding="1.5rem">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Activity</h3>
            <button 
              onClick={() => navigate('/admin/surveys')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              View All Surveys →
            </button>
          </div>
          
          {recentSurveys.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentSurveys.map(survey => (
                <div 
                  key={survey.id}
                  onClick={() => navigate(`/admin/surveys/${survey.id}`)}
                  style={{ 
                    padding: '1rem', 
                    border: '1px solid var(--border-glass)', 
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                >
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{survey.title || 'Untitled Survey'}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{survey.category || 'N/A'} • Submitted by {survey.createdBy?.name || 'Agent'}</div>
                  </div>
                  <div style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 500,
                    background: survey.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 
                               survey.status === 'SUBMITTED' ? 'rgba(99, 102, 241, 0.1)' : 
                               'rgba(245, 158, 11, 0.1)',
                    color: survey.status === 'APPROVED' ? 'var(--success)' : 
                           survey.status === 'SUBMITTED' ? '#818cf8' : 
                           'var(--warning)'
                  }}>
                    {survey.status || 'DRAFT'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 1rem' }}>
              <Activity size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Recent surveys will appear here.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
