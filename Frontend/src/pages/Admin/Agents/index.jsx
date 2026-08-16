import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { SurveyAPI } from '../../../services/api';
import { Mail, CheckCircle, Clock, Plus, Copy, Check } from 'lucide-react';

export default function AdminAgentsList() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvitations = invitations.filter(invite => 
    invite.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async (showMainLoader = true) => {
    try {
      if (showMainLoader) setLoading(true);
      const data = await SurveyAPI.getAdminInvitations();
      setInvitations(data);
    } catch (err) {
      setError(err.message || 'Failed to load invitations');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    try {
      setIsGenerating(true);
      const res = await SurveyAPI.createAdminInvitation(newEmail, 'agent');
      
      const inviteLink = `${window.location.origin}/signup?token=${res.token}`;
      setCopiedToken(res.token);
      
      setNewEmail('');
      await fetchInvitations(false); // Background refresh
    } catch (err) {
      setError(err.message || 'Failed to generate invitation');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!copiedToken) return;
    const inviteLink = `${window.location.origin}/signup?token=${copiedToken}`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        // Fallback for browsers that block clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error('Fallback copy failed', error);
        } finally {
          textArea.remove();
        }
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.warn('Could not copy', err);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading agents...</div>;
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 4rem)' }}>
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontWeight: '800' }}>Manage Agents</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Generate invitation links to onboard new field agents securely.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Left Column: Generate Invite Form */}
        <div style={{ flexShrink: 0 }}>
          <Card>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Invite New Agent
            </h3>
            <form onSubmit={handleGenerateInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Agent Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="agent@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isGenerating || !newEmail}
                style={{ 
                  flex: '1 1 150px', 
                  background: '#000000', 
                  color: '#FFFFFF', 
                  fontWeight: 'bold', 
                  boxShadow: 'none',
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Invite Link'}
              </Button>
            </form>

            {isGenerating && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-md)',
                animation: 'pulse 1.5s infinite ease-in-out'
              }}>
                <div style={{ height: '20px', width: '150px', background: '#CBD5E1', borderRadius: '4px', marginBottom: '1rem' }}></div>
                <div style={{ height: '16px', width: '250px', background: '#CBD5E1', borderRadius: '4px', marginBottom: '1rem', maxWidth: '100%' }}></div>
                <div style={{ height: '40px', width: '100%', background: '#CBD5E1', borderRadius: 'var(--radius-md)' }}></div>
              </div>
            )}

            {!isGenerating && copiedToken && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'transparent',
                border: '1px solid #000000',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000000', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <CheckCircle size={16} /> Invite Generated!
                </div>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Send this unique link to the agent. It expires in 7 days.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/signup?token=${copiedToken}`}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '0.5rem',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Button variant="secondary" onClick={handleCopy} style={{ padding: '0.5rem 1rem', background: '#000000', color: '#FFFFFF', border: 'none' }}>
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Invitations List */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '1.5rem' }}>
          <h3 className="hide-on-mobile" style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <Users size={18} /> Sent Invitations
          </h3>

          <div style={{ flexShrink: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="search-text-desktop" style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              Enter email for finding agent:
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {filteredInvitations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No invitations found.
            </div>
          ) : (
            <div className="hide-scrollbar" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              paddingRight: '0'
            }}>
              {filteredInvitations.map((invite) => (
                  <div key={invite.id} style={{ 
                    padding: '1rem 0', 
                    background: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    borderTop: '1px solid #CBD5E1',
                    borderBottom: '1px solid #CBD5E1',
                    minWidth: 0
                  }}>
                    {/* Row 1: Email */}
                    <div style={{ 
                      fontWeight: 600, 
                      color: 'var(--text-primary)', 
                      wordBreak: 'break-word',
                      lineHeight: 1.2
                    }}>
                      {invite.email}
                    </div>
                    
                    {/* Row 2: Icon + Sent + Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Mail size={12} />
                      <span>Sent: {new Date(invite.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Row 3: Badge */}
                    <div style={{ marginTop: '0.25rem' }}>
                      {invite.status === 'PENDING' ? (
                        <span style={{ 
                          padding: '0.15rem 0.5rem', 
                          background: '#000000', 
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '1rem',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          width: 'fit-content'
                        }}>
                          <Clock size={10} /> Pending
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '0.15rem 0.5rem', 
                          background: '#000000', 
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '1rem',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          width: 'fit-content'
                        }}>
                          <CheckCircle size={10} /> Accepted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'black',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 500,
          animation: 'fadeIn 0.3s ease'
        }}>
          Copied to clipboard!
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'black',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 500,
          animation: 'fadeIn 0.3s ease'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

// Inline dummy to prevent import errors if Users is not exported from lucide above
function Users(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
}
