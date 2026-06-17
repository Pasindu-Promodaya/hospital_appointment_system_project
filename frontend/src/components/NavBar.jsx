import React from 'react';

const NavBar = () => {
  return (
    <header style={{
      height: '60px',
      backgroundColor: 'var(--primary-dark)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '24px' }}>🏥</span>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.5px' }}>
          CareFlow Pro
        </h2>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Hospital Admin</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Session Active</div>
        </div>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          HA
        </div>
      </div>
    </header>
  );
};

export default NavBar;