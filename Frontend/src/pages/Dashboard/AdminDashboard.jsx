import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SurveyAPI } from '../../services/api';
import { PieChart, Users, CheckCircle, FileText, Activity, ChevronRight } from 'lucide-react';

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
          SurveyAPI.getAdminSurveys({ limit: 3 }).catch(() => [])
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

  if (isLoading) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#64748B', fontWeight: 500 }}>Loading Admin Overview...</div>
      </div>
    );
  }

  const totalSurveys = stats?.totalSurveys || 0;
  
  const dashboardStyle = `
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: calc(100vh - 80px);
    }
    .metric-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .recent-item:hover {
      background: #F8FAFC;
    }
    @media (max-width: 768px) {
      .dashboard-container {
        height: auto;
        overflow-y: auto;
      }
    }
  `;

  return (
    <div className="dashboard-container">
      <style>{dashboardStyle}</style>

      {/* Header Section */}
      <div style={{ marginBottom: '0.5rem', marginTop: '1rem' }}>
        <h1 style={{ color: '#0F172A', fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>
          Overview of all incoming surveys and their status.
        </p>
      </div>
      
      {/* Top Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Total Surveys Card */}
        <div className="metric-card" style={{ 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
          borderRadius: '16px', 
          color: 'white',
          boxShadow: '0 8px 12px -3px rgba(59, 130, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '120px', height: '120px', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '0.25rem' }}>Total Surveys</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{totalSurveys}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <FileText size={28} color="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Pending Approval Card */}
        <div className="metric-card" style={{ 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #78350F 0%, #F59E0B 100%)', 
          borderRadius: '16px', 
          color: 'white',
          boxShadow: '0 8px 12px -3px rgba(245, 158, 11, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '120px', height: '120px', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '0.25rem' }}>Pending Approval</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats?.submitted || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <Users size={28} color="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Approved Card */}
        <div className="metric-card" style={{ 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)', 
          borderRadius: '16px', 
          color: 'white',
          boxShadow: '0 8px 12px -3px rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '120px', height: '120px', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '0.25rem' }}>Approved</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats?.approved || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <CheckCircle size={28} color="#FFFFFF" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Category Breakdown */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '20px', 
          padding: '1.5rem', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #F1F5F9',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', padding: '0.5rem', borderRadius: '10px' }}>
              <PieChart size={20} color="#FFFFFF" />
            </div>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.1rem', fontWeight: 700 }}>Category Breakdown</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'center' }}>
            {['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'INVENTORY'].map(cat => {
              const count = stats?.byCategory?.[cat.toLowerCase()] || 0;
              const percentage = totalSurveys > 0 ? (count / totalSurveys) * 100 : 0;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{cat}</span>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: cat === 'RESIDENTIAL' ? 'linear-gradient(90deg, #A855F7, #9333EA)' : 
                                  cat === 'COMMERCIAL' ? 'linear-gradient(90deg, #34D399, #10B981)' : 
                                  cat === 'INDUSTRIAL' ? 'linear-gradient(90deg, #F97316, #EA580C)' :
                                  'linear-gradient(90deg, #FBBF24, #F59E0B)',
                      borderRadius: '999px',
                      transition: 'width 1s ease-out'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Recent */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: '20px', 
          padding: '1.5rem', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #F1F5F9',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.1rem', fontWeight: 700 }}>Recent Activity</h3>
            <button 
              onClick={() => navigate('/admin/surveys')}
              style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          {recentSurveys.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
              {recentSurveys.slice(0, 4).map(survey => (
                <div 
                  key={survey.id}
                  className="recent-item"
                  onClick={() => navigate(`/admin/surveys/${survey.id}`)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.1rem', fontSize: '0.85rem' }}>{survey.surveyNumber || 'Untitled Survey'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#F1F5F9', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>{survey.consumerCategory || 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.65rem', 
                    fontWeight: 700,
                    letterSpacing: '0.025em',
                    background: survey.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 
                               survey.status === 'SUBMITTED' ? 'rgba(245, 158, 11, 0.1)' : 
                               'rgba(226, 232, 240, 0.8)',
                    color: survey.status === 'APPROVED' ? '#059669' : 
                           survey.status === 'SUBMITTED' ? '#D97706' : 
                           '#475569'
                  }}>
                    {survey.status || 'DRAFT'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Activity size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Recent surveys will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
