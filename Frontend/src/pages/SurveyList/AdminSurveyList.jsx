import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';
import { Search, Filter, Mail, User, Hash } from 'lucide-react';
import Select from '../../components/common/Select';

export default function AdminSurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');

  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (dateSearch) params.date = dateSearch; 
      if (emailSearch) params.email = emailSearch;
      
      const res = await SurveyAPI.getAdminSurveys(params);
      setSurveys(res.data || []);
    } catch (err) {
      console.error("Failed to load admin surveys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSurveys();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, dateSearch, emailSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSurveys();
  };

  const groupedSurveys = surveys.reduce((acc, survey) => {
    const dateObj = new Date(survey.createdAt || survey.updatedAt);
    const dateKey = dateObj.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    
    // Use local time for the grouping key to prevent timezone mismatch
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const sortKey = `${year}-${month}-${day}`;
    
    if (!acc[sortKey]) {
      acc[sortKey] = {
        displayDate: dateKey,
        items: []
      };
    }
    acc[sortKey].items.push(survey);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSurveys).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ width: '100%', paddingBottom: '4rem' }}>
      
      {/* Header & Quick Status Toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontWeight: 700, color: '#000000', fontSize: '2rem' }}>All Surveys</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={() => setStatus('')}
            style={{ 
              padding: '0.5rem 1.25rem', 
              background: status === '' ? '#000000' : 'transparent', 
              color: status === '' ? '#FFFFFF' : '#475569', 
              border: status === '' ? 'none' : '1px solid #CBD5E1', 
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >All</Button>
          <Button 
            onClick={() => setStatus('SUBMITTED')}
            style={{ 
              padding: '0.5rem 1.25rem', 
              background: status === 'SUBMITTED' ? '#000000' : 'transparent', 
              color: status === 'SUBMITTED' ? '#FFFFFF' : '#475569', 
              border: status === 'SUBMITTED' ? 'none' : '1px solid #CBD5E1', 
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >Submitted</Button>
          <Button 
            onClick={() => setStatus('APPROVED')}
            style={{ 
              padding: '0.5rem 1.25rem', 
              background: status === 'APPROVED' ? '#000000' : 'transparent', 
              color: status === 'APPROVED' ? '#FFFFFF' : '#475569', 
              border: status === 'APPROVED' ? 'none' : '1px solid #CBD5E1', 
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >Approved</Button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <Card padding="1.5rem" style={{ marginBottom: '3rem', border: '1px solid var(--border-glass)', background: '#FFFFFF', borderRadius: '12px', position: 'relative', zIndex: 10 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Search by Date</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                value={dateSearch}
                onChange={e => setDateSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none',
                  fontWeight: 500
                }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Search by Email</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Agent Email..."
                value={emailSearch}
                onChange={e => setEmailSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)', color: 'var(--text-primary)', outline: 'none',
                  fontWeight: 500
                }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
            <Select 
              value={category} onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}
            >
              <option value="">All Categories</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
              <option value="INVENTORY">Inventory</option>
            </Select>
          </div>

          <Button type="submit" variant="primary" style={{ flex: '0 0 auto', padding: '0 1.5rem', height: '42px', background: '#000000', color: '#FFFFFF', border: 'none', fontWeight: 600, borderRadius: 'var(--radius-md)' }}>
            <Filter size={18} style={{ marginRight: '0.5rem' }} /> Filter
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>Loading...</div>
      ) : sortedDates.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
          No surveys found matching your criteria.
        </div>
      ) : (
        <div>
          {sortedDates.map(dateKey => {
            const group = groupedSurveys[dateKey];
            return (
              <div key={dateKey} style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700, color: '#000000' }}>
                  {group.displayDate}
                </h3>
                <Card padding="0" style={{ border: 'none', background: '#EAEFF7', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem', background: '#EAEFF7' }}>
                    {group.items.map((s) => (
                      <div key={s.id} style={{ border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.25rem', background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#000000', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                              <User size={14} color="#64748B" /> {s.consumerName || 'Unknown'}
                            </div>
                            <div style={{ color: '#64748B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                              <Hash size={12} /> {s.surveyNumber}
                            </div>
                          </div>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 600,
                            background: '#000000', color: '#FFFFFF', display: 'inline-block'
                          }}>
                            {s.status}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={12}/> Agent:</span>
                            <span style={{ fontWeight: 500 }}>{s.agentEmail || 'Unknown'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: '#64748B' }}>Category:</span>
                            <span style={{ fontWeight: 500 }}>{s.consumerCategory}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span style={{ color: '#64748B' }}>Time:</span>
                            <span style={{ fontWeight: 500 }}>{new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => navigate(`/admin/surveys/${s.id}`)}
                          style={{ 
                            padding: '0.625rem 1rem', fontSize: '0.875rem', width: '100%', 
                            background: 'transparent', color: '#111827', border: '1px solid var(--border-glass)', 
                            fontWeight: 500, borderRadius: '9999px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {s.status === 'SUBMITTED' ? 'Review & Approve' : 'View Data'}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
