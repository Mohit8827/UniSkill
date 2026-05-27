import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Star } from 'lucide-react';

const socket = io('http://localhost:5000');

const Session: React.FC = () => {
  const { id: roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      socket.emit('join-room', roomId, user?.id);

      socket.on('user-connected', (userId: string) => {
        callUser(userId, currentStream);
      });

      socket.on('signal', (data: any) => {
        if (connectionRef.current) {
          connectionRef.current.signal(data.signal);
        } else {
          answerCall(data, currentStream);
        }
      });
    });

    return () => {
      socket.off('user-connected');
      socket.off('signal');
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [roomId, user?.id]);

  const callUser = (userId: string, currentStream: MediaStream) => {
    const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

    peer.on('signal', (data: any) => {
      socket.emit('signal', { to: userId, from: socket.id, signal: data });
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      setRemoteStream(remoteStream);
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    connectionRef.current = peer;
  };

  const answerCall = (data: any, currentStream: MediaStream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

    peer.on('signal', (signal: any) => {
      socket.emit('signal', { to: data.from, from: socket.id, signal });
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      setRemoteStream(remoteStream);
      if (userVideo.current) userVideo.current.srcObject = remoteStream;
    });

    peer.signal(data.signal);
    connectionRef.current = peer;
  };

  const endCall = () => {
    setSessionEnded(true);
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (connectionRef.current) connectionRef.current.destroy();
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micActive;
      setMicActive(!micActive);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoActive;
      setVideoActive(!videoActive);
    }
  };

  const submitFeedback = async () => {
    alert('Thank you for your feedback! Credits have been released.');
    navigate('/');
  };

  if (sessionEnded) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-3xl md:rounded-[3rem] shadow-2xl p-6 md:p-12 text-center border border-gray-100">
          <div className="bg-yellow-50 h-20 w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="h-10 w-10 md:h-12 md:w-12 text-yellow-500 fill-current" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Session Completed</h2>
          <p className="text-gray-500 mb-8 font-medium">How was your peer learning experience?</p>
          
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="transform active:scale-90 transition-transform">
                <Star className={`h-10 w-10 md:h-12 md:w-12 transition-colors ${rating >= s ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Help your peer improve! (optional)"
            className="w-full p-5 bg-gray-50 border-none rounded-2xl mb-6 h-32 outline-none focus:ring-4 focus:ring-primary-50 font-medium transition-all"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>

          <button
            onClick={submitFeedback}
            className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-700 shadow-xl shadow-primary-100 active:scale-95 transition-all"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative overflow-hidden">
        {/* Remote Video */}
        <div className="bg-gray-950 rounded-3xl overflow-hidden relative shadow-2xl group border-2 border-transparent hover:border-primary-500/30 transition-all">
          {remoteStream ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white p-8">
              <div className="animate-pulse bg-white/5 p-8 rounded-full mb-4 ring-1 ring-white/10">
                <Video className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Waiting for peer...</p>
            </div>
          )}
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 text-white text-xs font-black uppercase tracking-widest">
            Peer Workspace
          </div>
        </div>

        {/* Local Video */}
        <div className="bg-gray-950 rounded-3xl overflow-hidden relative shadow-2xl group border-2 border-transparent hover:border-primary-500/30 transition-all">
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover mirror" />
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 text-white text-xs font-black uppercase tracking-widest">
            You ({user?.name})
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-100">
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-start">
          <div className="bg-primary-50 px-4 py-2 rounded-xl flex items-center space-x-2 border border-primary-100">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-primary-600 font-black text-[10px] uppercase tracking-widest">Live Now</span>
          </div>
          <span className="text-gray-400 font-mono text-[10px] uppercase tracking-tighter hidden sm:block">ID: {roomId}</span>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={toggleMic}
            className={`p-4 md:p-5 rounded-2xl transition-all active:scale-90 ${
              micActive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-50 text-white shadow-lg shadow-red-100'
            }`}
          >
            {micActive ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 md:p-5 rounded-2xl transition-all active:scale-90 ${
              videoActive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-50 text-white shadow-lg shadow-red-100'
            }`}
          >
            {videoActive ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>
          <button
            onClick={endCall}
            className="bg-red-600 text-white p-4 md:p-5 rounded-2xl hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-95"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          <button className="bg-gray-50 p-4 rounded-2xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
            <MessageSquare className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Session;
