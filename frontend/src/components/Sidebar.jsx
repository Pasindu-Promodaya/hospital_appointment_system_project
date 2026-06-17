import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { path: '/doctors', label: '⚕️ Doctors Directory (M1)', color: '#38bdf8' },
    { path: '/booking', label: '📅 Book Appointments (M2)', color: '#4ade80' },
    { path: '/profile', label: '🩺 Patient Records (M3)', color: '#f472b6' },
    { path: '/admin', label: '📊 Staff Roster (M4)', color: '#fbbf24' },
    { path: '/notifications', label: '🔔 Channel Alerts (M5)', color: '#a78bfa' }
  ];

  return (
    <nav style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'white',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: 'calc(100vh - 60px)',
      boxSizing: 'border-box'
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
            color: isActive ? 'white' : 'var(--text-main)',
            backgroundColor: isActive ? 'var(--primary-blue)' : 'transparent',
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