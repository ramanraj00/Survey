import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';
import { Search, Filter } from 'lucide-react';

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
      // Note: Assuming backend supports search, else we fallback to just fetching all
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>All Surveys</h1>

      {/* Filters & Search Bar */}
      <Card padding="1rem" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search Survey ID, Consumer Name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-glass)', color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ width: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</label>
            <select 
              value={status} onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          <div style={{ width: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category</label>
            <select 
              value={category} onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
            >
              <option value="">All Categories</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </div>

          <Button type="submit" variant="secondary" style={{ padding: '0.75rem 1.5rem', height: '42px' }}>
            <Filter size={18} style={{ marginRight: '0.5rem' }} /> Filter
          </Button>
        </form>
      </Card>

      <Card padding="0">
        {isLoading ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : surveys.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No surveys found matching your criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Survey ID</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Agent ID</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Last Updated</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-glass)' }} className="animate-fade-in hover-row">
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{s.surveyNumber}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {s.agentId.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>{s.consumerCategory}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: s.status === 'SUBMITTED' ? 'rgba(16, 185, 129, 0.1)' : s.status === 'APPROVED' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: s.status === 'SUBMITTED' ? 'var(--success)' : s.status === 'APPROVED' ? 'var(--accent-primary)' : 'var(--warning)'
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {new Date(s.updatedAt || s.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <Button 
                        onClick={() => navigate(`/admin/surveys/${s.id}`)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                      >
                        {s.status === 'SUBMITTED' ? 'Review & Approve' : 'View Data'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
