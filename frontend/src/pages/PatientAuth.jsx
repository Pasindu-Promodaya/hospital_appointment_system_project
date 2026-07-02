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
    Loading(true);

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
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-[400px] bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Decorative branding wrapper header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🩹</div>
          <h2 className="text-2xl font-extrabold text-slate-950 m-0 mb-1.5">
            {isLogin ? 'Patient Login Portal' : 'Patient Registration'}
          </h2>
          <p className="m-0 text-slate-500 text-smSub text-sm leading-relaxed">
            {isLogin 
              ? 'Sign in to access your clinical scheduling view' 
              : 'Create a localized profile to finalize your session registration'}
          </p>
        </div>

        {/* Error Notification Block */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-xs font-medium mb-6 leading-relaxed">
            {error}
          </div>
        )}

        {/* Main Interface Action Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Conditional Input Rendering logic node */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 outline-none w-full box-border focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 outline-none w-full box-border focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Secure Password</label>
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
            className={`w-fullDoc w-full py-3.5 text-white font-bold text-sm border-none rounded-lg mt-2 transition-colors duration-150 shadow-sm shadow-blue-600/20 ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {loading ? 'Processing Workspace Token...' : isLogin ? 'Sign In & Process Appointment' : 'Create Account & Continue'}
          </button>
        </form>

        {/* Sliding View Toggle Option Router */}
        <div className="text-center mt-7 text-xs">
          <span className="text-slate-500">
            {isLogin ? "First time using CoreHealth services? " : "Have a digital health record already? "}
          </span>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="bg-none border-none text-blue-600 font-bold cursor-pointer px-0.5 underline hover:text-blue-700"
          >
            {isLogin ? 'Register Account' : 'Sign In Directly'}
          </button>
        </div>

      </div>
    </div>
  );
}