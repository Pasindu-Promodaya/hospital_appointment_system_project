import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    // Safely extract role parameters from global state or browser session caching objects
    const getActiveRole = () => {
        if (user?.role) return user.role;
        const cachedSession = localStorage.getItem('userSession');
        if (cachedSession) {
            try {
                return JSON.parse(cachedSession)?.role || null;
            } catch (e) {
                return null;
            }
        }
        return localStorage.getItem('role');
    };

    const userRole = getActiveRole();
    const sanitizedRole = String(userRole || '').trim().toUpperCase();

    // 🎯 REMOVED: Channel Alerts item has been cleanly excised from the schema list
    const allMenuItems = [
        { path: '/doctor-dashboard', label: '👨‍⚕️ Doctor Portal', role: 'ROLE_DOCTOR', borderClass: 'hover:border-sky-600 active:border-sky-600', activeColor: '#0284c7' },
        { path: '/doctors', label: '⚕️ Doctors Directory', role: 'PUBLIC', borderClass: 'hover:border-sky-400 active:border-sky-400', activeColor: '#38bdf8' },
        { path: '/book-appointment', label: '📅 Book Appointments', role: 'ROLE_PATIENT', borderClass: 'hover:border-green-400 active:border-green-400', activeColor: '#4ade80' },
        { path: '/patient-dashboard', label: '🩺 Patient Portal', role: 'ROLE_PATIENT', borderClass: 'hover:border-pink-400 active:border-pink-400', activeColor: '#f472b6' },
        { path: '/admin', label: '📊 Staff Roster', role: 'ROLE_ADMIN', borderClass: 'hover:border-amber-400 active:border-amber-400', activeColor: '#fbbf24' }
    ];

    // 🌟 DYNAMIC FILTER ENGINE: Rules-based visibility matrix
    const visibleMenuItems = allMenuItems.filter(item => {
        // Rule 1: If no active user session exists, show ONLY public items
        if (!userRole || sanitizedRole === 'NULL' || sanitizedRole === '') {
            return item.role === 'PUBLIC';
        }

        // Scenario A: Authorized Doctor Deck -> Display Doctor specific + Public Directory
        if (sanitizedRole === 'ROLE_DOCTOR' || sanitizedRole === 'DOCTOR') {
            return item.role === 'ROLE_DOCTOR' || item.role === 'PUBLIC';
        }

        // Scenario B: Hospital Administrator Panel -> Display Admin specific + Public Directory
        if (sanitizedRole === 'ROLE_ADMIN' || sanitizedRole === 'ADMIN') {
            return item.role === 'ROLE_ADMIN' || item.role === 'PUBLIC';
        }

        // Scenario C: Authenticated Patient Context -> Display Patient items + Public directory
        if (sanitizedRole === 'ROLE_PATIENT' || sanitizedRole === 'PATIENT') {
            return item.role === 'ROLE_PATIENT' || item.role === 'PUBLIC';
        }

        return false;
    });

    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-[100] box-border font-sans">
            {/* Upper Utility segment */}
            <div className="flex justify-between items-center px-10 py-2 border-b border-slate-100 text-xs text-slate-500 bg-slate-50">
                <div className="flex gap-6 font-semibold">
                    <span className="text-blue-600 border-b-2 border-blue-600 pb-2">
                        {userRole && sanitizedRole !== 'NULL' && sanitizedRole !== ''
                            ? `${sanitizedRole.replace('ROLE_', '')} Workspace`
                            : 'Public Gateway'}
                    </span>
                </div>

                {/* Top-Right Controls Container */}
                <div className="flex items-center gap-5">
                    {(!userRole || sanitizedRole === 'NULL' || sanitizedRole === '') && (
                        <button
                            onClick={() => window.location.href = '/patient-login'}
                            className="bg-none border-none text-emerald-600 font-bold cursor-pointer hover:text-emerald-700 transition-colors border-r border-slate-200 pr-5 last:border-none"
                        >
                            Patient Login 👤
                        </button>
                    )}

                    {userRole && sanitizedRole !== 'NULL' && sanitizedRole !== '' ? (
                        <button
                            onClick={() => {
                                logout();
                                localStorage.clear();
                                window.location.href = '/doctors';
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