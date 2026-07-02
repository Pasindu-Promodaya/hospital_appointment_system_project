import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  // 🌟 Extract the validated user session details 
  const { user, logout } = useAuth(); 
  
  // 🔍 Synchronized session evaluator
  const userRole = user?.role || localStorage.getItem('role'); 

  const allMenuItems = [
    { path: '/doctor-dashboard', label: '👨‍⚕️ Doctor Portal', role: 'ROLE_DOCTOR', borderClass: 'hover:border-sky-600 active:border-sky-600', activeColor: '#0284c7' },
    { path: '/doctors', label: '⚕️ Doctors Directory', role: 'PUBLIC', borderClass: 'hover:border-sky-400 active:border-sky-400', activeColor: '#38bdf8' },
    { path: '/booking', label: '📅 Book Appointments', role: 'PUBLIC', borderClass: 'hover:border-green-400 active:border-green-400', activeColor: '#4ade80' },
    { path: '/profile', label: '🩺 Patient Records', role: 'ROLE_MEMBER3', borderClass: 'hover:border-pink-400 active:border-pink-400', activeColor: '#f472b6' },
    { path: '/admin', label: '📊 Staff Roster', role: 'ROLE_ADMIN', borderClass: 'hover:border-amber-400 active:border-amber-400', activeColor: '#fbbf24' },
    { path: '/notifications', label: '🔔 Channel Alerts', role: 'ROLE_MEMBER5', borderClass: 'hover:border-violet-400 active:border-violet-400', activeColor: '#a78bfa' }
  ];

  // 🌟 DYNAMIC FILTER ENGINE: Rules-based visibility matrix
  const visibleMenuItems = allMenuItems.filter(item => {
    if (!userRole) {
      // 👥 Scenario A: Public Guest -> Show only public exploratory entries
      return item.role === 'PUBLIC';
    } else if (userRole === 'ROLE_DOCTOR' || userRole === 'DOCTOR') {
      // 👨‍⚕️ Scenario B: Authorized Doctor -> View private management deck exclusively
      return item.role === 'ROLE_DOCTOR';
    } else if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
      // 📊 Scenario C: Hospital Administrator -> View workspace panel exclusively
      return item.role === 'ROLE_ADMIN';
    } else if (userRole === 'ROLE_PATIENT' || userRole === 'PATIENT') {
      // 🩺 Scenario D: Authenticated Patient -> Keep public channels active + append historical charts
      return item.role === 'PUBLIC' || item.role === 'ROLE_MEMBER3';
    }
    return false;
  });

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-[100] box-border font-sans">
      {/* Upper Utility segment */}
      <div className="flex justify-between items-center px-10 py-2 border-b border-slate-100 text-xs text-slate-500 bg-slate-50">
        <div className="flex gap-6 font-semibold">
          <span className="text-blue-600 border-b-2 border-blue-600 pb-2">
            {userRole ? `${userRole.replace('ROLE_', '')} Workspace` : 'Public Gateway'}
          </span>
        </div>
        
        {/* 🛠️ Top-Right Controls Container */}
        <div className="flex items-center gap-5">
          {/* 🌟 Patient Login Button (Visible only when no active user session exists) */}
          {!userRole && (
            <button 
              onClick={() => window.location.href = '/patient-auth'} // Redirects to patient login gateway
              className="bg-none border-none text-emerald-600 font-bold cursor-pointer hover:text-emerald-700 transition-colors"
            >
              Patient Login 👤
            </button>
          )}

          {userRole ? (
            <button 
              onClick={() => {
                logout();
                window.location.href = '/doctors'; // Clean flush redirection target
              }}
              className="bg-none border-none text-rose-500 font-semibold cursor-pointer hover:text-rose-600 transition-colors"
            >
              Sign Out 🚪
            </button>
          ) : (
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-none border-none text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors"
            >
              Staff Login 🔐
            </button>
          )}
        </div>
      </div>

      {/* Main Bar Navigation */}
      <div className="flex items-center justify-between px-10 h-[70px]">
        <div className="flex items-center gap-2 font-extrabold text-xl text-slate-900">
          <span className="text-2xl">🏥</span> CoreHealth
        </div>

        {/* Dynamic Links stack */}
        <nav className="flex items-center gap-1 h-full">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                borderBottom: isActive ? `4px solid ${item.activeColor}` : '4px solid transparent',
              })}
              className={({ isActive }) => 
                `px-4 h-full flex items-center no-underline text-sm transition-all duration-150 ease-in-out box-border ${
                  isActive ? 'text-slate-900 font-bold' : `text-slate-600 font-medium ${item.borderClass}`
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white border-none px-5 py-2.5 rounded-md font-bold text-xs cursor-pointer transition-colors duration-150">
            EMERGENCY LINE
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;