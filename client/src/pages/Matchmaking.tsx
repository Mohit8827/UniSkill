import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Search, Loader2 } from 'lucide-react';

export const Matchmaking: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected: _isConnected } = useSocket();
  const navigate = useNavigate();
  
  const [topic, setTopic] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data: any) => {
        console.log("Match found!", data);
        setIsSearching(false);
        // Navigate to the call room with the details
        navigate(`/call/${data.roomId}`, { state: data });
    };

    socket.on('match-found', handleMatchFound);

    return () => {
      socket.off('match-found', handleMatchFound);
    };
  }, [socket, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !socket || !user) return;
    
    if (user.credits <= 0) {
        alert("You don't have enough credits to start a session!");
        return;
    }

    setIsSearching(true);
    socket.emit('join-matchmaking', { userId: user.id, topic: topic.trim() });
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem auto' }}>
           <Search size={40} color="var(--accent-primary)" />
        </div>
        
        <h2 style={{ marginBottom: '0.5rem' }}>Find a Mentor</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>What do you want to learn today?</p>
        
        {isSearching ? (
           <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader2 size={48} className="animate-pulse" color="var(--accent-primary)" />
              <p>Searching the campus network for a <strong>{topic}</strong> mentor...</p>
              <button className="btn btn-secondary" onClick={() => setIsSearching(false)}>Cancel Search</button>
           </div>
        ) : (
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. React, Organic Chemistry, Guitar" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                style={{ textAlign: 'center', fontSize: '1.125rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>
                Start Matchmaking
            </button>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                You have {user?.credits} credits. 1 credit is deducted per second during a call.
            </p>
            </form>
        )}
      </div>
    </div>
  );
};
