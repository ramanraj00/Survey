import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SurveyAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, Lock, Mail, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function InviteSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await SurveyAPI.acceptInvite(token, name, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to sign up. The link may have expired or been used already.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ margin: '0 0 0.5rem 0' }}>SmartMeter</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Agent Registration</p>
        </div>
        
        <Card>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle size={48} color="#36B37E" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ margin: '0 0 1rem 0' }}>Registration Successful!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your account has been created. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(255, 86, 48, 0.1)', 
                  color: 'var(--error)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={!token || isLoading}
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 'var(--radius-md)',
                      color: '#0F172A'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={!token || isLoading}
                    placeholder="Create a password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 'var(--radius-md)',
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={!token || isLoading}
                    placeholder="Confirm your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 'var(--radius-md)',
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!token || isLoading}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  padding: '0.875rem 2rem',
                  borderRadius: '9999px',
                  fontWeight: '600',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  transition: 'all 0.2s ease',
                  cursor: (!token || isLoading) ? 'not-allowed' : 'pointer',
                  opacity: (!token || isLoading) ? 0.7 : 1,
                  fontSize: '0.95rem'
                }}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
