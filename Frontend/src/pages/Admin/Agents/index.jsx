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

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await SurveyAPI.getAdminInvitations();
      setInvitations(data);
    } catch (err) {
      setError(err.message || 'Failed to load invitations');
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
      await fetchInvitations(); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to generate invitation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (copiedToken) {
      const inviteLink = `${window.location.origin}/signup?token=${copiedToken}`;
      try {
        await navigator.clipboard.writeText(inviteLink);
        alert('Copied to clipboard!'); // Small feedback
      } catch (err) {
        console.warn('Could not copy');
      }
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading agents...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="gradient-text" style={{ margin: '0 0 0.5rem 0' }}>Manage Agents</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Generate invitation links to onboard new field agents securely.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Generate Invite Form */}
        <div>
          <Card>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Invite New Agent
            </h3>
            <form onSubmit={handleGenerateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
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
                    color: 'white',
                  }}
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isGenerating || !newEmail}
                style={{ width: '100%' }}
              >
                {isGenerating ? 'Generating...' : 'Generate Invite Link'}
              </Button>
            </form>

            {copiedToken && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(54, 179, 126, 0.1)',
                border: '1px solid rgba(54, 179, 126, 0.2)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#36B37E', fontWeight: 600, marginBottom: '0.5rem' }}>
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
                      padding: '0.5rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Button variant="secondary" onClick={handleCopy} style={{ padding: '0.5rem 1rem' }}>
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Invitations List */}
        <div>
          <Card>
            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> Sent Invitations
            </h3>

            {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

            {invitations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No invitations sent yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {invitations.map((invite) => (
                  <div key={invite.id} style={{ 
                    padding: '1rem', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-glass)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Mail size={18} color="var(--text-secondary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'white' }}>{invite.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Sent: {new Date(invite.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {invite.status === 'PENDING' ? (
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: 'rgba(255, 171, 0, 0.1)', 
                          color: '#FFAB00',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Clock size={12} /> Pending
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: 'rgba(54, 179, 126, 0.1)', 
                          color: '#36B37E',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <CheckCircle size={12} /> Accepted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Inline dummy to prevent import errors if Users is not exported from lucide above
function Users(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
}
