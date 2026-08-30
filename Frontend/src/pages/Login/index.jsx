import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, #F5E6D3 0%, #EACFCF 20%, #D4A9B0 40%, #C9A0C9 60%, #B89ED4 80%, #9B8EC2 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Smooth Vertical Column Gradient Overlay - Morning Haze style */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(90deg, 
            rgba(245, 230, 213, 0.6) 0%, 
            rgba(234, 207, 207, 0.3) 15%, 
            transparent 30%, 
            rgba(212, 169, 176, 0.2) 45%, 
            transparent 55%, 
            rgba(201, 160, 201, 0.3) 70%, 
            transparent 80%, 
            rgba(155, 142, 194, 0.4) 100%
          )
        `,
        zIndex: 1,
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }} />
      {/* Neumorphic 3D Embossed Title */}
      <h1 style={{
        position: 'relative',
        zIndex: 10,
        fontSize: 'clamp(2.5rem, 10vw, 4.5rem)', // Scales down automatically on mobile
        fontWeight: 900,
        color: '#c4a0b8',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        marginBottom: 'clamp(1rem, 4vw, 2rem)', // Responsive margin
        // Layered shadows for depth, with reduced white glow:
        // 1. Sharp white edge, 2. Subtle soft white glow, 3. Sharp dark edge, 4. Deep dark shadow
        textShadow: '-2px -2px 3px rgba(255,255,255,0.7), -4px -4px 10px rgba(255,255,255,0.3), 2px 2px 3px rgba(0,0,0,0.08), 8px 8px 20px rgba(0,0,0,0.25)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none'
      }}>
        Survey
      </h1>

      <div style={{
        position: 'relative',
        zIndex: 10,
        pointerEvents: 'auto',
        width: '100%',
        maxWidth: '400px',
        backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.45)' : 'transparent',
        backdropFilter: isExpanded ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: isExpanded ? 'blur(20px)' : 'none',
        borderColor: isExpanded ? 'rgba(255, 255, 255, 0.6)' : 'transparent',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '24px',
        padding: isExpanded ? '2.5rem 2rem' : '0',
        boxShadow: isExpanded ? '0 25px 50px -12px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)' : 'none',
        transition: isExpanded 
          ? 'padding 0.4s ease 0.4s, background-color 0.4s ease 0.55s, border-color 0.4s ease 0.55s, box-shadow 0.4s ease 0.55s, backdrop-filter 0.4s ease 0.55s, -webkit-backdrop-filter 0.4s ease 0.55s' 
          : 'all 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        
        {/* Collapsible Logo & Text */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxHeight: isExpanded ? '150px' : '0',
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: isExpanded 
            ? 'max-height 0.4s ease 0.4s, opacity 0.4s ease 0.4s' 
            : 'all 0.4s ease',
        }}>
          <div style={{ 
            paddingBottom: isExpanded ? '1.5rem' : '0', 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(25px) scale(0.85)',
            transition: isExpanded 
              ? 'padding 0.4s ease 0.4s, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s' 
              : 'all 0.4s ease'
          }}>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #C9A0C9 0%, #9B7EA8 100%)',
                boxShadow: '0 8px 16px rgba(155, 126, 168, 0.25), inset 0 2px 2px rgba(255, 255, 255, 0.2)',
                marginBottom: '1.25rem',
              }}>
                {/* Premium Abstract SaaS Logo for "Survey" */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="12" height="12" rx="3" fill="white" fillOpacity="0.9" />
                  <rect x="9" y="9" width="12" height="12" rx="3" fill="white" fillOpacity="0.4" />
                </svg>
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
          </div>
        </div>

        {/* Collapsible Input Area */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxHeight: isExpanded ? '250px' : '0',
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: isExpanded 
            ? 'max-height 0.4s ease 0.4s, opacity 0.4s ease 0.8s' 
            : 'all 0.4s ease',
        }}>
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            paddingBottom: isExpanded ? '1.5rem' : '0', 
            transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
            transition: isExpanded 
              ? 'padding 0.4s ease 0.4s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s' 
              : 'all 0.4s ease'
          }}>

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
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '12px',
                    color: '#0F172A',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.borderColor = '#B890B8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 144, 184, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
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
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      borderRadius: '12px',
                      color: '#0F172A',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      letterSpacing: '2px',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.borderColor = '#749CB4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(116, 156, 180, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
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

        {/* Button Wrapper */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: isExpanded ? '100%' : 'auto' }}>
          
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
            background: 'linear-gradient(180deg, #B890B8 0%, #9B7EA8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.3px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: isExpanded 
              ? 'width 0.4s ease 0s, box-shadow 0.3s ease, transform 0.3s ease' 
              : 'all 0.4s ease',
            boxShadow: isHovered && !isLoading
              ? '0 8px 20px rgba(155, 126, 168, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.25)' 
              : '0 4px 12px rgba(155, 126, 168, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            transform: isHovered && !isLoading ? 'translateY(-2px)' : 'translateY(0)',
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
    </div>
  );
}
