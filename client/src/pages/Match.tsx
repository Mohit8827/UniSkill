import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function Match({ user }: any) {
  const [topic, setTopic] = useState('');
  const [searching, setSearching] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchStatus, setMatchStatus] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = io('http://localhost:3001');
    setSocket(s);
    s.emit('register', user.id);

    s.on('match_found', (data) => {
      setMatchStatus('Match Found!');
      setPartner(data.partner);
      setSearching(false);
    });

    s.on('no_match_found', () => {
      setMatchStatus('No match found. Keep waiting or try another topic.');
      setSearching(false);
    });

    return () => { s.disconnect(); };
  }, [user.id]);

  const findMatch = () => {
    if (!topic) return;
    setSearching(true);
    setMatchStatus('Searching for the best match...');
    setPartner(null);
    socket?.emit('find_match', { userId: user.id, topic });
  };

  const handleStartCall = () => {
      if (!partner) return;
      // Navigate to call page with partner info
      navigate(`/call/${partner.id}`, { state: { partner } });
  };

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1>Matching Engine</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Enter the topic you want to learn or teach.</p>
        
        <input 
          className="input" 
          value={topic} 
          onChange={e => setTopic(e.target.value)} 
          placeholder="e.g. React, UI/UX, Economics..."
          disabled={searching}
          style={{ fontSize: '1.2rem', padding: '1rem' }}
        />
        
        {!partner ? (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '1.2rem' }} 
            onClick={findMatch}
            disabled={searching}
          >
            {searching ? 'Finding Match...' : 'Find Match'}
          </button>
        ) : (
          <div style={{ marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
            <h2 style={{ color: '#22c55e' }}>{matchStatus}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{partner.name}</div>
              <div style={{ color: '#94a3b8' }}>Skills: {partner.skills.join(', ')}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleStartCall}>Start Call</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setPartner(null)}>Decline</button>
            </div>
          </div>
        )}

        {matchStatus && !partner && (
          <p style={{ marginTop: '1rem', color: '#3b82f6' }}>{matchStatus}</p>
        )}
      </div>
    </div>
  );
}
