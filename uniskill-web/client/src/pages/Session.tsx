import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Settings, Maximize, Shield } from 'lucide-react';
import '../index.css';

const Session: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="session-page" style={{ background: '#0f172a', position: 'relative' }}>
      <header className="session-header" style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, animation: 'pulse 2s infinite' }}>REC</div>
          <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 600 }}>Advanced Calculus • Session #{sessionId}</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            <Shield size={16} color="#10b981" /> End-to-end Encrypted
          </div>
          <button className="btn-secondary btn-sm" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
            <Settings size={16} />
          </button>
        </div>
      </header>

      <div className="video-area" style={{ flex: 1, padding: '2rem', display: 'flex', gap: '1.5rem' }}>
        <div className="remote-feed" style={{ flex: 1, background: '#1e293b', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="feed-placeholder" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '120px', height: '120px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)' }}>T</div>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Tutor: Alex Johnson</p>
            <p style={{ margin: '0.5rem 0 0', color: '#94a3b8' }}>Waiting for tutor to join...</p>
          </div>
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', fontSize: '0.875rem' }}>
            Alex Johnson
          </div>
          <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
            <Maximize size={18} />
          </button>
        </div>

        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="local-feed" style={{ position: 'relative', height: '220px', background: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
            {!camOn ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                <VideoOff size={48} color="#475569" />
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>Y</div>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', fontSize: '0.75rem' }}>
              You (Preview)
            </div>
          </div>
          
          <div style={{ flex: 1, background: '#1e293b', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participants</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>T</div>
                  <span style={{ fontSize: '0.875rem' }}>Alex Johnson (Host)</span>
                </div>
                <Mic size={14} color="#10b981" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>Y</div>
                  <span style={{ fontSize: '0.875rem' }}>You</span>
                </div>
                {micOn ? <Mic size={14} color="#10b981" /> : <MicOff size={14} color="#ef4444" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="controls-dock" style={{ background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', gap: '1rem' }}>
        <button className={`control-btn ${!micOn ? 'btn-danger' : ''}`} onClick={() => setMicOn(!micOn)} style={{ background: micOn ? '#334155' : '#ef4444' }}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button className={`control-btn ${!camOn ? 'btn-danger' : ''}`} onClick={() => setCamOn(!camOn)} style={{ background: camOn ? '#334155' : '#ef4444' }}>
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}></div>
        <button className="control-btn" style={{ background: '#334155' }}>
          <MessageSquare size={20} />
        </button>
        <button className="control-btn" style={{ background: '#334155' }}>
          <Users size={20} />
        </button>
        <button className="control-btn btn-danger" onClick={() => navigate('/dashboard')} style={{ background: '#ef4444', marginLeft: '1rem', width: 'auto', padding: '0 2rem', borderRadius: '12px' }}>
          <PhoneOff size={20} style={{ marginRight: '0.75rem' }} /> End Session
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .control-btn {
          transition: all 0.2s;
        }
        .control-btn:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
};

export default Session;
