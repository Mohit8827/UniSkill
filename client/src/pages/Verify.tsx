import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Upload, MessageSquare, Video, Camera, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Verify: React.FC = () => {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const [step, setStep] = useState(user?.verificationStep || 2);
  const [otp, setOtp] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (user?.isVerified) navigate('/');
    if (user) setStep(user.verificationStep);
  }, [user, authLoading, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/verify-otp', {
        collegeEmail: user?.collegeEmail,
        otp
      });
      setStep(res.data.verificationStep);
      await refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadID = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('idCard', idFile);

    try {
      const res = await axios.post('/auth/verify-id', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStep(res.data.verificationStep);
      await refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Ensure ID matches profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const res = await axios.post('/auth/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStep(res.data.verificationStep);
      await refreshUser();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Video upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <div className="bg-primary-50 h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Step 2: Email OTP</h3>
              <p className="text-gray-500 mt-2 text-sm md:text-base px-4">Check your college inbox: <br/><span className="font-bold text-primary-600">{user?.collegeEmail}</span></p>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-4 md:py-5 border-none bg-gray-50 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:ring-4 focus:ring-primary-50 outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button disabled={loading} className="w-full bg-primary-600 text-white py-4 md:py-5 rounded-2xl font-black text-lg shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">
                {loading ? 'Verifying...' : 'Verify Email OTP'}
              </button>
            </form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <div className="bg-primary-50 h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Camera className="h-8 w-8 md:h-10 md:w-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Step 3: College ID OCR</h3>
              <p className="text-gray-500 mt-2 text-sm md:text-base px-4">Upload a clear photo of your ID card for automated verification.</p>
            </div>
            <form onSubmit={handleUploadID} className="space-y-4">
              <label className="block w-full cursor-pointer border-2 border-dashed border-primary-200 rounded-3xl p-8 md:p-12 hover:bg-primary-50 transition-all group">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-primary-400 mb-4 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-sm md:text-base font-bold text-gray-500 text-center">{idFile ? idFile.name : 'Choose ID Photo'}</span>
                  <span className="text-xs text-gray-400 mt-2">JPG, PNG up to 5MB</span>
                </div>
              </label>
              <button disabled={loading || !idFile} className="w-full bg-primary-600 text-white py-4 md:py-5 rounded-2xl font-black text-lg shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">
                {loading ? 'Scanning ID...' : 'Verify ID Card'}
              </button>
            </form>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <div className="bg-primary-50 h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="h-8 w-8 md:h-10 md:w-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Step 4: Intro Video</h3>
              <p className="text-gray-500 mt-2 text-sm md:text-base px-4">Briefly introduce yourself and your skills (max 3 mins).</p>
            </div>
            <form onSubmit={handleUploadVideo} className="space-y-4">
              <label className="block w-full cursor-pointer border-2 border-dashed border-primary-200 rounded-3xl p-8 md:p-12 hover:bg-primary-50 transition-all group">
                <input type="file" className="hidden" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-primary-400 mb-4 group-hover:-translate-y-1 transition-transform" />
                  <span className="text-sm md:text-base font-bold text-gray-500 text-center">{videoFile ? videoFile.name : 'Choose Video File'}</span>
                  <span className="text-xs text-gray-400 mt-2">MP4, MOV up to 50MB</span>
                </div>
              </label>
              <button disabled={loading || !videoFile} className="w-full bg-primary-600 text-white py-4 md:py-5 rounded-2xl font-black text-lg shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">
                {loading ? 'Uploading...' : 'Complete Verification'}
              </button>
            </form>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 md:py-12">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden p-6 md:p-10 border border-gray-50">
        <div className="flex justify-between items-center mb-8 px-4">
          {[2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black transition-all ${step >= s ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'bg-gray-100 text-gray-400'}`}>
                {step > s ? <CheckCircle className="h-5 w-5 md:h-6 md:w-6" /> : s - 1}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-red-100">
              {error}
            </motion.div>
          )}
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Verify;
