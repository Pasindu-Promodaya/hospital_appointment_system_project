import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
 const menuItems = [
    // 🌟 Linked your exact routing target node path matching App.jsx
    { path: '/doctor/dashboard', label: '👨‍⚕️ Doctor Portal (Mine)', color: '#0284c7' },
    { path: '/doctors', label: '⚕️ Doctors Directory (M1)', color: '#38bdf8' },
    { path: '/booking', label: '📅 Book Appointments (M2)', color: '#4ade80' },
    { path: '/profile', label: '🩺 Patient Records (M3)', color: '#f472b6' },
    { path: '/admin', label: '📊 Staff Roster (M4)', color: '#fbbf24' },
    { path: '/notifications', label: '🔔 Channel Alerts (M5)', color: '#a78bfa' }
  ];

  return (
    <nav style={{
      width: '280px', // Fallback explicit size or var(--sidebar-width)
      backgroundColor: 'white',
      borderRight: '1px solid #e2e8f0',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: '100vh', // Sets full layout matching height
      position: 'sticky',
      top: 0,
      boxSizing: 'border-box',
      flexShrink: 0 // Prevents the sidebar component from compressing horizontally
    }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', paddingLeft: '16px', marginBottom: '8px', textTransform: 'uppercase' }}>
        Modules
      </div>
      
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            padding: '12px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            color: isActive ? 'white' : '#475569',
            backgroundColor: isActive ? '#2563eb' : 'transparent',
            fontWeight: isActive ? '600' : '500',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s ease-in-out',
            borderLeft: isActive ? `4px solid ${item.color}` : '4px solid transparent'
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;