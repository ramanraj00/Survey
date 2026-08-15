import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import IsometricCubes from '../../components/common/IsometricCubes';
import { SurveyAPI } from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('START'); // 'START' | 'EMAIL' | 'LOADING_EMAIL' | 'PASSWORD' | 'LOADING_PASS'
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    setStep('EMAIL');
  };

  const handleContinueEmail = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setError(null);
    setStep('PASSWORD'); // Transition instantly without fake loading
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setError(null);
    setStep('LOADING_PASS');
    
    try {
      const res = await SurveyAPI.signIn(email, password);
      const user = res?.user;
      
      if (user?.role === 'admin') {
        localStorage.setItem('userRole', 'admin');
        navigate('/admin/dashboard');
      } else {
        localStorage.setItem('userRole', 'agent');
        navigate('/agent/dashboard');
      }
    } catch (err) {
      setError(err.message || "Invalid credentials.");
      setStep('PASSWORD'); // Go back to password state on error
    }
  };

  const isExpanded = step !== 'START';
  const isLoading = step === 'LOADING_PASS';
  const isPasswordPhase = step === 'PASSWORD' || step === 'LOADING_PASS';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* 3D Background */}
      <IsometricCubes />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '400px',
        background: isExpanded ? 'var(--bg-secondary)' : 'transparent',
        border: isExpanded ? '1px solid var(--border-glass)' : '1px solid transparent',
        borderRadius: '24px',
        padding: isExpanded ? '2.5rem 2rem' : '0',
        boxShadow: isExpanded ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' : 'none',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        
        {/* Collapsible Top Content */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxHeight: isExpanded ? '400px' : '0',
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ paddingBottom: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--accent-glow)',
                marginBottom: '1.25rem',
              }}>
                <Activity size={20} color="white" />
              </div>
              
              <h1 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                margin: isPasswordPhase ? '0 0 0.25rem' : '0 0 1.5rem', 
                color: 'var(--text-primary)',
                transition: 'margin 0.3s'
              }}>
                {isPasswordPhase ? 'Enter your password' : 'Log in to Survey'}
              </h1>

              {isPasswordPhase && (
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  margin: '0 0 1.5rem',
                  opacity: 1,
                  animation: 'fadeIn 0.5s ease'
                }}>
                  For {email}
                </p>
              )}

              {error && (
                <div style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  {error}
                </div>
              )}

              {!isPasswordPhase ? (
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@acme.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-glass)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleContinueEmail(e);
                  }}
                />
              ) : (
                <>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      textAlign: 'center',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      letterSpacing: '2px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-glass)';
                      e.target.style.boxShadow = 'none';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin(e);
                    }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => { 
                      setStep('EMAIL'); 
                      setPassword(''); 
                      setError(null); 
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem',
                      marginTop: '1.25rem',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      padding: '4px'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    Use a different email
                  </button>
                </>
              )}

          </div>
        </div>

        {/* The Animated Button */}
        <button 
          onClick={
            step === 'START' ? handleStart 
            : (step === 'EMAIL' ? handleContinueEmail : handleLogin)
          }
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isLoading}
          style={{
            width: isExpanded ? '100%' : '124px',
            height: '46px',
            background: 'linear-gradient(180deg, #4275F4 0%, #2954D1 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '1.05rem',
            fontWeight: 500,
            letterSpacing: '0.3px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isHovered && !isLoading
              ? '0 6px 16px rgba(41, 84, 209, 0.3), inset 0 3px 6px rgba(0, 0, 0, 0.12), inset 0 -1.5px 1px rgba(0, 0, 0, 0.15)' 
              : '0 2px 6px rgba(41, 84, 209, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -1.5px 1px rgba(0, 0, 0, 0.15)',
            transform: isHovered && !isLoading ? 'translateY(-1px)' : 'translateY(0)',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {isLoading ? (
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid rgba(255,255,255,0.3)', 
              borderTopColor: 'white', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
          ) : (
            <>
              {/* Log in text (visible initially or in password step) */}
              <span style={{ 
                position: 'absolute',
                transition: 'opacity 0.3s ease',
                opacity: step === 'START' || step === 'PASSWORD' ? 1 : 0,
                pointerEvents: step === 'START' || step === 'PASSWORD' ? 'auto' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}>
                Log in
              </span>
              
              {/* Continue text (visible after expansion, in email step) */}
              <span style={{ 
                position: 'absolute',
                transition: 'opacity 0.4s ease',
                opacity: step === 'EMAIL' ? 1 : 0,
                pointerEvents: step === 'EMAIL' ? 'auto' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}>
                Continue
              </span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
