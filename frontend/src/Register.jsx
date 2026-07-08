import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './context/AuthContext'; 

const Register = () => {
  const { login } = useAuth(); 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '', 
    telephoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Security verification mismatch: Passwords do not match.');
      return;
    }

    if (!formData.gender) {
      setError('Please select a gender.');
      return;
    }

    // phone number to perfect international standard (+947xxxxxxxx)
    let formattedPhone = formData.telephoneNumber.trim().replace(/\s+|-|\(|\)/g, '');

    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+94' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+940')) {
      formattedPhone = '+94' + formattedPhone.substring(4);
    } else if (formattedPhone.startsWith('940')) {
      formattedPhone = '+94' + formattedPhone.substring(3);
    } else if (formattedPhone.startsWith('94') && !formattedPhone.startsWith('+94')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+94' + formattedPhone;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender, 
        phone: formattedPhone
      };
      
      // 1. Post complete registration parameters
      await axios.post('http://localhost:8080/api/auth/register', payload);
      
      //  Route redirected to explicit patient portal authentication pipeline
      const loginResponse = await axios.post('http://localhost:8080/api/auth/login/patient', {
        email: formData.email, 
        password: formData.password
      });

      const data = loginResponse.data;

      if (data && loginResponse.status === 200) {
        //  Map identity properties directly using the layout variables sent by AuthResponse.java
        login({
          token: data.token,
          email: data.email,
          role: data.role || 'ROLE_PATIENT',
          id: data.id,                 // User Primary Key Account ID (e.g., 24)
          patientId: data.patientId,   // True Patient Profile Record row ID (e.g., 17)
          doctorId: null
        });
        navigate('/dashboard');
      } else {
        setError('Account created successfully, but profile initialization failed. Please try signing in manually.');
      }
    } catch (err) {
      console.error("Registration Error Context:", err);
      setError(err.response?.data?.message || err.response?.data || 'Registration processing anomaly. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100 p-8 sm:p-10 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
             </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Patient Account</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium uppercase tracking-wider">Initialize your secure clinical profile</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200/60 rounded-xl p-3.5 flex items-start gap-3">
            <span className="text-xs font-semibold text-red-800 leading-normal">{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
              <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full text-sm pl-10 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium" />
            </div>
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* DOB */}
            <div className="relative sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
              <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="w-full text-sm pl-10 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium text-slate-700" />
            </div>

            {/* Gender dropdown */}
            <div className="relative sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
              <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium text-slate-700 appearance-none">
                <option value="" disabled>Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Phone */}
            <div className="relative sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input type="tel" name="telephoneNumber" required value={formData.telephoneNumber} onChange={handleChange} className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium" placeholder="076 836 5307" />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full text-sm pl-10 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium" placeholder="name@example.com" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Security Password</label>
              <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full text-sm pl-10 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium" placeholder="••••••••" />
            </div>
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/30 font-medium" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition duration-150 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Processing Ledger...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link to="/patient-login" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition duration-150">
            Already have a profile? <span className="underline">Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;