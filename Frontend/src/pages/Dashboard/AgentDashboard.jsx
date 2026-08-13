import React, { useEffect, useState } from 'react';
import { SurveyAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { ClipboardList, CheckCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';

export default function AgentDashboard() {
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

  if (isLoading) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#64748B', fontWeight: 500 }}>Loading your insights...</div>
      </div>
    );
  }

  // Calculate Metrics
  const totalSurveys = surveys.length;
  const approvedSurveys = surveys.filter(s => s.status === 'APPROVED').length;
  const unapprovedSurveys = surveys.filter(s => s.status !== 'APPROVED').length;

  // Prepare Chart Data
  const surveysByDate = surveys.reduce((acc, survey) => {
    const dateObj = new Date(survey.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) {
      acc[dateStr] = 0;
    }
    acc[dateStr]++;
    return acc;
  }, {});

  const chartData = Object.keys(surveysByDate).map(date => ({
    name: date,
    Surveys: surveysByDate[date]
  }));

  if (chartData.length === 0) {
    chartData.push({ name: 'No Data', Surveys: 0 });
  }

  // Common card style generator for hover effect
  const cardHoverStyle = `
    .metric-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .metric-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .chart-card {
      transition: box-shadow 0.3s ease;
    }
    .chart-card:hover {
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
    }
  `;

  return (
    <div style={{ paddingBottom: '4rem', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      <style>{cardHoverStyle}</style>

      {/* Header Section */}
      <div style={{ marginBottom: '3rem', marginTop: '1rem' }}>
        <h1 style={{ color: '#0F172A', fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Overview Dashboard
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Track your survey performance and daily generation metrics.
        </p>
      </div>
      
      {/* Premium Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Total Surveys Card */}
        <div className="metric-card" style={{ 
          padding: '2rem', 
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
          borderRadius: '20px', 
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '150px', height: '150px', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '10%', background: 'rgba(255,255,255,0.05)', width: '100px', height: '100px', borderRadius: '50%' }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '0.5rem' }}>Total Surveys Generated</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{totalSurveys}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <ClipboardList size={32} color="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Approved Card */}
        <div className="metric-card" style={{ 
          padding: '2rem', 
          background: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)', 
          borderRadius: '20px', 
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '150px', height: '150px', borderRadius: '50%' }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '0.5rem' }}>Approved by Admin</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{approvedSurveys}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <CheckCircle size={32} color="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="metric-card" style={{ 
          padding: '2rem', 
          background: 'linear-gradient(135deg, #78350F 0%, #F59E0B 100%)', 
          borderRadius: '20px', 
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '150px', height: '150px', borderRadius: '50%' }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: '0.5rem' }}>Pending Approval</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{unapprovedSurveys}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <Clock size={32} color="#FFFFFF" />
            </div>
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="chart-card" style={{ 
        background: '#FFFFFF', 
        borderRadius: '24px', 
        padding: '2.5rem 2rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #F1F5F9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)' }}>
            <BarChart3 size={28} color="#2563EB" />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>Survey Trends</h2>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 500 }}>Daily overview</p>
          </div>
        </div>
        
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorSurveys" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} 
                dy={15} 
              />
              <YAxis 
                allowDecimals={false} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.8)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  padding: '12px 20px',
                  fontWeight: 600,
                  color: '#0F172A'
                }}
                itemStyle={{ color: '#3B82F6', fontWeight: 700 }}
              />
              <Bar 
                dataKey="Surveys" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={60}
                animationDuration={1500}
              >
                {
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorSurveys)" />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
