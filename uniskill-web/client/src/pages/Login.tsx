import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Login: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ studentId: '', email: '', otp: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!formData.studentId || !formData.email) return alert('Please fill all fields');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: formData.studentId, email: formData.email })
      });
      if (res.ok) {
        const data = await res.json();
        setUserId(data.user.id);
        setStep(2);
      } else {
        const data = await res.json();
        alert(data.message || 'Registration Failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network Error: Ensure backend is running on port 5000');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (err) {
      alert('Verification Failed');
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return alert('Please select a file');
    
    const uploadData = new FormData();
    uploadData.append('idCard', file);
    uploadData.append('userId', userId);

    try {
      const btn = document.getElementById('uploadBtn') as HTMLButtonElement;
      if (btn) btn.innerText = 'Verifying...';

      const res = await fetch('/api/auth/upload-id', {
        method: 'POST',
        body: uploadData
      });
      
      const data = await res.json();
      if (data.success) {
        alert('ID Verified Successfully! Redirecting to Dashboard...');
        navigate('/dashboard');
      } else {
        alert(data.message || 'Verification Failed');
        if (btn) btn.innerText = 'Submit for Review';
      }
    } catch (err) {
      alert('Network Error');
    }
  };

  return (
    <div className="page-container">
      <div className="auth-card">
        <h2>Student Verification</h2>
        <div className="progress-bar">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {step === 1 && (
          <div className="form-group">
            <label>Student ID</label>
            <input 
              type="text" 
              placeholder="Enter Student ID" 
              value={formData.studentId}
              onChange={e => setFormData({...formData, studentId: e.target.value})}
            />
            <label>University Email</label>
            <input 
              type="email" 
              placeholder="student@university.edu" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <button className="btn btn-primary" onClick={handleRegister}>Send Verification Code</button>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-group">
            <p>Enter the verification code sent to <strong>{formData.email}</strong></p>
            <input 
              type="text" 
              placeholder="Enter OTP (Hint: 1234)" 
              value={formData.otp}
              onChange={e => setFormData({...formData, otp: e.target.value})}
            />
            <button className="btn btn-primary" onClick={handleVerifyOtp}>Verify OTP</button>
          </div>
        )}

        {step === 3 && (
          <div className="form-group">
            <p>Please upload your University ID Card for final verification.</p>
            <div className="file-upload-area">
              <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            </div>
            <button id="uploadBtn" className="btn btn-success" onClick={handleUpload}>Submit for Review</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
