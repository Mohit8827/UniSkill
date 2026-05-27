import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

export const CallRoom: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const matchData = location.state;
  
  const { user, setUser } = useAuth();
  const { socket } = useSocket();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [_remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  const [currentCredits, setCurrentCredits] = useState(user?.credits || 0);
  const [isCallActive, setIsCallActive] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Determine role
  const isMentor = matchData?.mentorId === user?.id;

  useEffect(() => {
    if (!socket || !user || !roomId) {
        navigate('/');
        return;
    }

    const initWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        stream.getTracks().forEach(track => {
          if (peerConnection.current) {
            peerConnection.current.addTrack(track, stream);
          }
        });

        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
          
          // Start call logic once remote track is received
          if (!isCallActive) {
            setIsCallActive(true);
            socket.emit('call-started', { roomId, mentorId: matchData.mentorId, learnerId: matchData.learnerId });
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', { roomId, candidate: event.candidate });
          }
        };

        // If Learner, create offer
        if (!isMentor) {
           const offer = await peerConnection.current.createOffer();
           await peerConnection.current.setLocalDescription(offer);
           socket.emit('offer', { roomId, offer });
        }

      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    initWebRTC();

    // Socket Event Listeners for WebRTC
    socket.on('offer', async (offer) => {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer });
    });

    socket.on('answer', async (answer) => {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async (candidate) => {
        if (!peerConnection.current) return;
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Credit & Call Lifecycle Listeners
    socket.on('credit-update', (data) => {
        const { learnerCredits, mentorCredits } = data;
        const newCredits = isMentor ? mentorCredits : learnerCredits;
        setCurrentCredits(newCredits);
        // Sync with global context
        if (user) {
            setUser({ ...user, credits: newCredits });
        }
    });

    socket.on('call-ended', () => {
        handleEndCall(false); // don't emit again
    });

    return () => {
       handleEndCall(true);
       socket.off('offer');
       socket.off('answer');
       socket.off('ice-candidate');
       socket.off('credit-update');
       socket.off('call-ended');
    };
  }, [socket, roomId, user, navigate, isMentor, isCallActive, matchData]);

  const handleEndCall = (emit = true) => {
      if (emit && socket && isCallActive) {
          socket.emit('end-call', { roomId });
      }
      
      if (localStream) {
          localStream.getTracks().forEach(t => t.stop());
      }
      if (peerConnection.current) {
          peerConnection.current.close();
      }
      navigate('/dashboard');
  };

  const toggleAudio = () => {
      if (localStream) {
          const audioTrack = localStream.getAudioTracks()[0];
          audioTrack.enabled = !audioTrack.enabled;
          setIsAudioMuted(!audioTrack.enabled);
      }
  };

  const toggleVideo = () => {
      if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          videoTrack.enabled = !videoTrack.enabled;
          setIsVideoMuted(!videoTrack.enabled);
      }
  };

  return (
    <div className="app-container" style={{ background: '#000', padding: 0 }}>
      {/* Top Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
         <div style={{ color: 'white' }}>
            <h3 style={{ margin: 0 }}>{matchData?.topic} Session</h3>
            <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                {isMentor ? 'Teaching' : 'Learning'} Mode
            </span>
         </div>
         <div className="badge" style={{ fontSize: '1.25rem', padding: '0.5rem 1rem' }}>
             {currentCredits} Credits
         </div>
      </div>

      <div className="video-grid" style={{ margin: 0, height: '100vh', borderRadius: 0, border: 'none' }}>
        <div className="video-container" style={{ borderRadius: 0, border: 'none' }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ objectFit: 'cover' }} />
            <div className="video-label">Peer {isCallActive ? '' : '(Connecting...)'}</div>
        </div>
        <div className="video-container" style={{ borderRadius: 0, border: 'none' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <div className="video-label">You ({user?.name})</div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem', background: 'rgba(22, 22, 30, 0.8)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
          <button onClick={toggleAudio} className={`btn ${isAudioMuted ? 'btn-danger' : 'btn-secondary'}`} style={{ borderRadius: '50%', padding: '1rem' }}>
              {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={toggleVideo} className={`btn ${isVideoMuted ? 'btn-danger' : 'btn-secondary'}`} style={{ borderRadius: '50%', padding: '1rem' }}>
              {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button onClick={() => handleEndCall(true)} className="btn btn-danger" style={{ borderRadius: '50%', padding: '1rem' }}>
              <PhoneOff size={24} />
          </button>
      </div>
    </div>
  );
};

export default CallRoom;
