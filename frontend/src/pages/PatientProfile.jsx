import React from 'react';

const PatientProfile = () => {
  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-dark)' }}>🩺 Patient Profile & History</h3>
      <p style={{ color: '#64748b', margin: 0 }}>Workspace container reserved for medical diagnostic history and personal check-in data charts.</p>
    </div>
  );
};

export default PatientProfile; // 👈 MAKE SURE THIS IS HERE