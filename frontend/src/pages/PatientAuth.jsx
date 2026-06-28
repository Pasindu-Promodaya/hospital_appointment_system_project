import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PatientAuth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🧭 Extract booking redirection paths and target doctor selection forwarded from the directory card
  const targetDoctorId = location.state?.doctorId || null;
  const redirectTo = location.state?.redirectTo || '/booking';

  // State configurations
  const [isLogin, setIsLogin] = useState(false); // Default to register view based on workflow requirements
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Dynamic configuration matching target action loop
    const endpoint = isLogin 
      ? 'http://localhost:8080/api/auth/login' 
      : 'http://localhost:8080/api/auth/register-patient';

    const payload = isLogin 
      ? { email, password } 
      : { name, email, password, role: 'ROLE_PATIENT' };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // 🔑 Store user into global state context memory engine
        login({
          token: data.token,
          email: data.email,
          role: data.role || 'ROLE_PATIENT',
          id: data.id || null,
          doctorId: null // Patients don't have a corporate doctor operational ID record
        });

        // 🚀 Forward directly to the booking form while maintaining context
        navigate(redirectTo, { state: { doctorId: targetDoctorId } });
      } else {
        setError(data.message || 'Authentication processing anomaly. Check payload configurations.');
      }
    } catch (err) {
      console.error("Network sync error:", err);
      setError('❌ Server unreachable: Verify your Spring Boot backend instance is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
      }}>
        
        {/* Decorative branding wrapper header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🩹</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            {isLogin ? 'Patient Login Portal' : 'Patient Registration'}
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.4' }}>
            {isLogin 
              ? 'Sign in to access your clinical scheduling view' 
              : 'Create a localized profile to finalize your session registration'}
          </p>
        </div>

        {/* Error Notification Block */}
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

        {/* Main Interface Action Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Conditional Input Rendering logic node */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
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
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
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
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Secure Password</label>
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
              backgroundColor: loading ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              marginTop: '8px',
              transition: 'background-color 0.15s ease'
            }}
          >
            {loading ? 'Processing Workspace Token...' : isLogin ? 'Sign In & Process Appointment' : 'Create Account & Continue'}
          </button>
        </form>

        {/* Sliding View Toggle Option Router */}
        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px' }}>
          <span style={{ color: '#64748b' }}>
            {isLogin ? "First time using CoreHealth services? " : "Have a digital health record already? "}
          </span>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontWeight: '700',
              cursor: 'pointer',
              padding: '0 2px',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Register Account' : 'Sign In Directly'}
          </button>
        </div>

      </div>
    </div>
  );
}