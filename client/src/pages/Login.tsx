import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 md:py-12">
      <div className="bg-white rounded-3xl shadow-2xl shadow-primary-100 overflow-hidden">
        <div className="bg-primary-600 p-8 text-center text-white">
          <GraduationCap className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-black tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-primary-100 font-medium">Login to UniSkill</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="you@university.edu"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-medium transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Login to Account'}
          </button>

          <p className="text-center text-gray-500 font-medium">
            New here? <Link to="/register" className="text-primary-600 font-black hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
