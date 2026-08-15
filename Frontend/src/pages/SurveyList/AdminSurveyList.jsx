import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';
import { Search, Filter, Mail, User, Hash } from 'lucide-react';
import Select from '../../components/common/Select';

const getCategoryStyle = (category) => {
  switch(category) {
    case 'RESIDENTIAL': return { background: '#A855F7', color: '#FFFFFF' };
    case 'COMMERCIAL': return { background: '#10B981', color: '#FFFFFF' };
    case 'INVENTORY': return { background: '#FEEBC8', color: '#C05621' };
    case 'INDUSTRIAL': return { background: '#FF6B00', color: '#FFFFFF' };
    default: return { background: '#3B82F6', color: '#FFFFFF' };
  }
};

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
    const isInitial = !status && !category && !dateSearch && !emailSearch;
    const delay = isInitial ? 0 : 400; // Load instantly on first visit

    const timer = setTimeout(() => {
      fetchSurveys();
    }, delay);
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

          <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 200px', minWidth: '200px' }}>
            <Button type="button" onClick={() => { setDateSearch(''); setEmailSearch(''); setCategory(''); setStatus(''); }} style={{ flex: 1, padding: '0 1.25rem', height: '42px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', fontWeight: 600, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Clear
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1, padding: '0 1.5rem', height: '42px', background: '#000000', color: '#FFFFFF', border: 'none', fontWeight: 600, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Filter size={18} style={{ marginRight: '0.5rem' }} /> Filter
            </Button>
          </div>
        </form>
      </Card>

      {isLoading ? (
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
          
          <div style={{ marginBottom: '3rem' }}>
            {/* Skeleton Date Header */}
            <div className="skeleton-box" style={{ width: '150px', height: '24px', marginBottom: '1rem', borderRadius: '6px' }} />
            
            <Card padding="0" style={{ border: 'none', background: '#EAEFF7', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem', background: '#EAEFF7' }}>
                
                {/* 3 Skeleton Cards */}
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ border: '1px solid #CBD5E1', borderRadius: '12px', padding: '1.25rem', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        {/* Name & ID Skeleton */}
                        <div className="skeleton-box" style={{ width: '120px', height: '16px', marginBottom: '0.5rem' }} />
                        <div className="skeleton-box" style={{ width: '100px', height: '12px' }} />
                      </div>
                      {/* Status Badge Skeleton */}
                      <div className="skeleton-box" style={{ width: '70px', height: '20px', borderRadius: '1rem' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="skeleton-box" style={{ width: '60px', height: '12px' }} />
                        <div className="skeleton-box" style={{ width: '140px', height: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="skeleton-box" style={{ width: '70px', height: '12px' }} />
                        <div className="skeleton-box" style={{ width: '90px', height: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="skeleton-box" style={{ width: '40px', height: '12px' }} />
                        <div className="skeleton-box" style={{ width: '60px', height: '12px' }} />
                      </div>
                    </div>
                    
                    {/* Button Skeleton */}
                    <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '9999px' }} />
                  </div>
                ))}
                
              </div>
            </Card>
          </div>
        </div>
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
                      <div key={s.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hover-lift" onClick={() => navigate(`/admin/surveys/${s.id}`)}>
                        
                        {/* Header Row */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={20} color="#475569" />
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
                        
                        {/* Info Grid (Responsive) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
                          
                          {/* Agent */}
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent Email</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Mail size={14} color="#94A3B8" />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.agentEmail || 'Unknown'}</span>
                            </div>
                          </div>

                          {/* Category */}
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.025em', ...getCategoryStyle(s.consumerCategory) }}>
                                {s.consumerCategory}
                              </span>
                            </div>
                          </div>

                          {/* Time */}
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0F172A' }}>{new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div style={{ marginTop: '0.5rem' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/surveys/${s.id}`); }}
                            style={{ 
                              padding: '0.75rem 1rem', fontSize: '0.9rem', width: '100%', 
                              background: s.status === 'SUBMITTED' ? '#000000' : '#FFFFFF', 
                              color: s.status === 'SUBMITTED' ? '#FFFFFF' : '#0F172A', 
                              border: s.status === 'SUBMITTED' ? '1px solid #000000' : '1px solid #E2E8F0', 
                              fontWeight: 500, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { if(s.status === 'SUBMITTED') { e.currentTarget.style.background = '#333333'; } else { e.currentTarget.style.background = '#F8FAFC'; } }}
                            onMouseOut={(e) => { if(s.status === 'SUBMITTED') { e.currentTarget.style.background = '#000000'; } else { e.currentTarget.style.background = '#FFFFFF'; } }}
                          >
                            {s.status === 'SUBMITTED' ? 'Review & Approve' : 'View Data'}
                          </button>
                        </div>
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
