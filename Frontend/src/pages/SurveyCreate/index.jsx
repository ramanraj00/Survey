import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SurveyAPI } from '../../services/api';
import { useSurvey } from '../../context/SurveyContext';
import Select from '../../components/common/Select';

export default function SurveyCreate() {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { setSurveyData } = useSurvey();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!category) {
      setError("Please select a Consumer Category.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // POST /api/surveys
      const newSurvey = await SurveyAPI.createSurvey({ 
        consumerCategory: category, 
        consumerSubcategory: subcategory 
      });
      
      // Initialize Context with the minimal survey returned by POST.
      // We wrap it in { survey: ... } to match the structure of fetchFullSurvey.
      // The CommonDetailsForm will load the full tree if needed.
      setSurveyData({ survey: newSurvey });
      
      // Navigate to the next logical step in the journey
      navigate(`/agent/surveys/${newSurvey.id}/common`);
    } catch (err) {
      setError(err.message || 'Failed to create survey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Create New Survey</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Start a new survey for a consumer. The category you select will determine the conditional sections shown later.
      </p>

      <Card>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Consumer Category <span style={{color: 'var(--error)'}}>*</span>
            </label>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            >
              <option value="">-- Select Category --</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
              <option value="INVENTORY">Inventory</option>
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Consumer Subcategory (Optional)
            </label>
            <input 
              type="text" 
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. IT Park, Steel Plant, etc."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit" isLoading={isLoading}>
              Create & Proceed
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
