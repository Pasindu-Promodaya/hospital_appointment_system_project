import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    // 🌟 Extract the validated user session details
    const { user, logout } = useAuth();

    // 🔍 Synchronized session evaluator
    const userRole = user?.role || localStorage.getItem('role');

    const allMenuItems = [
        { path: '/doctor-dashboard', label: '👨‍⚕️ Doctor Portal', role: 'ROLE_DOCTOR', color: '#0284c7' },
        { path: '/doctors', label: '⚕️ Doctors Directory', role: 'PUBLIC', color: '#38bdf8' },
        { path: '/booking', label: '📅 Book Appointments', role: 'PUBLIC', color: '#4ade80' },
        { path: '/profile', label: '🩺 Patient Records', role: 'ROLE_MEMBER3', color: '#f472b6' },
        { path: '/admin', label: '📊 Staff Roster', role: 'ROLE_ADMIN', color: '#fbbf24' },
        { path: '/notifications', label: '🔔 Channel Alerts', role: 'ROLE_MEMBER5', color: '#a78bfa' },
        { path: '/dashboard', label: '🏥 Medical Dashboard', role: 'ROLE_MEMBER3', color: '#10b981' } // Added your dashboard route seamlessly
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
        <header style={{
            width: '100%',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxSizing: 'border-box',
            fontFamily: 'system-ui, sans-serif'
        }}>
            {/* Upper Utility segment */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 40px',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '12px',
                color: '#64748b',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{ display: 'flex', gap: '24px', fontWeight: '600' }}>
          <span style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '8px' }}>
            {userRole ? `${userRole.replace('ROLE_', '')} Workspace` : 'Public Gateway'}
          </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {userRole ? (
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = '/doctors'; // Clean flush redirection target
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Sign Out 🚪
                        </button>
                    ) : (
                        <button
                            onClick={() => window.location.href = '/login'}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Staff Login 🔐
                        </button>
                    )}
                </div>
            </div>

            {/* Main Bar Navigation */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                height: '70px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '20px', color: '#0f172a' }}>
                    <span style={{ fontSize: '24px' }}>🏥</span> CoreHealth
                </div>

                {/* Dynamic Links stack */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '100%' }}>
                    {visibleMenuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                padding: '0 16px',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: isActive ? '#0f172a' : '#475569',
                                fontWeight: isActive ? '700' : '500',
                                fontSize: '14px',
                                transition: 'all 0.15s ease',
                                borderBottom: isActive ? `4px solid ${item.color}` : '4px solid transparent',
                                boxSizing: 'border-box'
                            })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div>
                    <button style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                    }}>
                        EMERGENCY LINE
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;