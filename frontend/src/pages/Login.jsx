import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        data = rawText; 
      }

      if (response.ok) {
        // 🔑 Store token and roles into local global state memory context
        login({
          token: data.token,
          email: data.email,
          role: data.role, 
          doctorId: data.doctorId
        });

        // 🧭 🌟 FIX: Targets updated to match your App.jsx routes perfectly!
        if (data.role === 'ROLE_DOCTOR' || data.role === 'DOCTOR') {
          navigate('/doctor-dashboard'); // Clean slash matching
        } else if (data.role === 'ROLE_ADMIN' || data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/doctors');
        }
      } else {
        setError(typeof data === 'object' ? (data.message || '⚠️ Invalid email or password.') : data);
      }
    } catch (err) {
      console.error('Handshake routing exception:', err);
      setError('❌ Connection refused: Unable to reach the Spring Boot server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center font-sans bg-slate-50 relative">
      
      {/* 🌟 Patient Login Gateway Trigger (Positioned at the absolute top right corner of the outer viewport) */}
      <button 
        onClick={() => navigate('/patient-auth')}
        className="absolute top-6 right-6 px-[18px] py-2 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm rounded-lg text-slate-800 font-semibold text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
      >
        👤 Patient Login
      </button>

      <div className="w-full max-w-[420px] bg-white p-10 rounded-2xl border border-slate-200 shadow-sm shadow-black/[0.05]">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏥</div>
          <h2 className="text-2xl font-extrabold text-slate-900 m-0 mb-2">
            Provider Gateway
          </h2>
          <p className="m-0 text-slate-500 text-sm">
            Access clinical management nodes and rosters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-xs font-medium mb-6 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Corporate Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., doctor@corehealth.com"
              className="px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 outline-none w-full box-border focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Secret Access Token
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 outline-none w-full box-border focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-white font-bold text-sm border-none rounded-lg mt-2.5 transition-colors duration-200 shadow-sm shadow-slate-900/10 ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
            }`}
          >
            {loading ? 'Authenticating Credentials...' : 'Access Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}