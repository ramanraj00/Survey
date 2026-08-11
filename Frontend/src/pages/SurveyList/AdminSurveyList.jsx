import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';
import { Search, Filter, Mail, User, Hash } from 'lucide-react';

export default function AdminSurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      if (search) params.search = search; 
      
      const res = await SurveyAPI.getAdminSurveys(params);
      setSurveys(res.data || []);
    } catch (err) {
      console.error("Failed to load admin surveys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category]);

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
    
    const sortKey = dateObj.toISOString().split('T')[0];
    
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header & Quick Status Toggles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontWeight: 800 }}>All Surveys</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={() => setStatus('')}
            style={{ 
              padding: '0.5rem 1rem', 
              background: status === '' ? '#000000' : 'var(--bg-secondary)', 
              color: status === '' ? '#FFFFFF' : 'var(--text-primary)', 
              border: '2px solid #000000', 
              fontWeight: 700 
            }}
          >All</Button>
          <Button 
            onClick={() => setStatus('SUBMITTED')}
            style={{ 
              padding: '0.5rem 1rem', 
              background: status === 'SUBMITTED' ? '#000000' : 'var(--bg-secondary)', 
              color: status === 'SUBMITTED' ? '#FFFFFF' : 'var(--text-primary)', 
              border: '2px solid #000000', 
              fontWeight: 700 
            }}
          >Submitted</Button>
          <Button 
            onClick={() => setStatus('APPROVED')}
            style={{ 
              padding: '0.5rem 1rem', 
              background: status === 'APPROVED' ? '#000000' : 'var(--bg-secondary)', 
              color: status === 'APPROVED' ? '#FFFFFF' : 'var(--text-primary)', 
              border: '2px solid #000000', 
              fontWeight: 700 
            }}
          >Approved</Button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <Card padding="1.5rem" style={{ marginBottom: '3rem', border: '2px solid #000000', background: 'var(--bg-secondary)', boxShadow: '4px 4px 0px #000000' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#000000' }} />
              <input 
                type="text" 
                placeholder="Search Consumer Name, Survey ID, Agent..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: 'var(--radius-md)', background: '#FFFFFF',
                  border: '2px solid #000000', color: '#000000', outline: 'none',
                  fontWeight: 500
                }}
              />
            </div>
          </div>

          <div style={{ width: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Category</label>
            <select 
              value={category} onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: '#FFFFFF', border: '2px solid #000000', color: '#000000', outline: 'none', fontWeight: 600 }}
            >
              <option value="">All Categories</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </div>

          <Button type="submit" variant="primary" style={{ padding: '0.75rem 1.5rem', height: '42px', background: '#000000', color: '#FFFFFF', border: 'none', fontWeight: 'bold' }}>
            <Filter size={18} style={{ marginRight: '0.5rem' }} /> Filter
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : sortedDates.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No surveys found matching your criteria.
        </div>
      ) : (
        <div>
          {sortedDates.map(dateKey => {
            const group = groupedSurveys[dateKey];
            return (
              <div key={dateKey} style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {group.displayDate}
                </h3>
                <Card padding="0" style={{ border: '2px solid #000000', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', background: '#FFFFFF' }}>
                      <thead style={{ background: 'var(--bg-secondary)' }}>
                        <tr style={{ borderBottom: '2px solid #000000', textAlign: 'left', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 800 }}>
                          <th style={{ padding: '1rem 1.5rem' }}>Consumer & Survey ID</th>
                          <th style={{ padding: '1rem 1.5rem' }}>Agent Details</th>
                          <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                          <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                          <th style={{ padding: '1rem 1.5rem' }}>Time</th>
                          <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map(s => (
                          <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0' }} className="animate-fade-in hover-row">
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <div style={{ fontWeight: 700, color: '#000000', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                                <User size={14} /> {s.consumerName || 'Unknown Consumer'}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                                <Hash size={12} /> {s.surveyNumber}
                              </div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                                <Mail size={14} /> {s.agentEmail || 'Unknown Agent'}
                              </div>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{s.consumerCategory}</td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <span style={{ 
                                padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700,
                                background: '#000000', color: '#FFFFFF', display: 'inline-block'
                              }}>
                                {s.status}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                              <Button 
                                onClick={() => navigate(`/admin/surveys/${s.id}`)}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: '#000000', color: '#FFFFFF', border: 'none', fontWeight: 600 }}
                              >
                                {s.status === 'SUBMITTED' ? 'Review & Approve' : 'View Data'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
