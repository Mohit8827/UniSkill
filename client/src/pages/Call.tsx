import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

export default function Call({ user }: any) {
  const location = useLocation();
  const navigate = useNavigate();
  const partner = location.state?.partner;
  const [_callActive, setCallActive] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!partner) {
      navigate('/dashboard');
      return;
    }

    const s = io('http://localhost:5000');
    setSocket(s);
    s.emit('register', user.id);

    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
      // Deduct 1 credit every 60 seconds (simulated)
      if (seconds > 0 && seconds % 60 === 0) {
          s.emit('deduct_credits', { userId: user.id, amount: 1 });
      }
    }, 1000);

    s.on('call_ended', () => {
      alert('The call has ended.');
      endCall();
    });

    return () => {
      clearInterval(timerRef.current);
      s.disconnect();
    };
  }, [partner, user.id, seconds]);

  const endCall = () => {
    socket?.emit('end_call', { to: partner.socketId });
    setCallActive(false);
    clearInterval(timerRef.current);
    navigate('/dashboard');
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <div className="card" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>Call with {partner?.name}</h2>
            <p style={{ color: '#22c55e', margin: 0 }}>● Live</p>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {formatTime(seconds)}
          </div>
          <div style={{ color: '#3b82f6' }}>
            Cost: 1 Credit/min
          </div>
        </div>

        <div className="video-container">
          <div className="video-box">
            <div className="video-placeholder">You (Local)</div>
            {/* Real video would go here */}
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '0.2rem' }}>
                {user.name}
            </div>
          </div>
          <div className="video-box">
            <div className="video-placeholder">{partner?.name} (Remote)</div>
             {/* Real video would go here */}
             <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '0.2rem' }}>
                {partner?.name}
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="btn" style={{ background: '#334155', color: 'white' }}>Mute</button>
          <button className="btn" style={{ background: '#334155', color: 'white' }}>Video Off</button>
          <button className="btn" style={{ background: '#334155', color: 'white' }}>Share Screen</button>
          <button className="btn btn-danger" onClick={endCall}>End Call</button>
        </div>
      </div>
    </div>
  );
}
