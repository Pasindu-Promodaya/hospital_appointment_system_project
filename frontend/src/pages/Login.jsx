import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏥</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
            Provider Gateway
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Access clinical management nodes and rosters
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
              Corporate Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., doctor@corehealth.com"
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                width: '100%'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
              Secret Access Token
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                width: '100%'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#94a3b8' : '#0f172a',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1)',
              transition: 'background-color 0.2s',
              marginTop: '10px'
            }}
          >
            {loading ? 'Authenticating Credentials...' : 'Access Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}