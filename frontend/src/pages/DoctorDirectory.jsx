import React, { useState } from 'react';

const DoctorDirectory = () => {
  // 💡 Mock Data: This represents what your backend controller will send to this page later!
  const [doctors, setDoctors] = useState([
    { id: 1, name: "Dr. Sanduni Perera", specialization: "Cardiology", licenseNumber: "MC-98432", isActive: true },
    { id: 2, name: "Dr. Himal Samarawickrama", specialization: "Neurology", licenseNumber: "MC-12743", isActive: true },
    { id: 3, name: "Dr. Kanishka Silva", specialization: "Pediatrics", licenseNumber: "MC-45321", isActive: true }
  ]);

  const [searchSpecialty, setSearchSpecialty] = useState("");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header & Summary Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', color: 'var(--primary-dark)', fontSize: '24px', fontWeight: '700' }}>
            Medical Practitioners Directory
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Manage active hospital doctors, review medical licenses, and monitor channel schedules.
          </p>
        </div>
        <button style={{
          backgroundColor: 'var(--primary-blue)',
          color: 'white',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
        }}>
          ➕ Add New Practitioner
        </button>
      </div>

      {/* 2. Advanced Filter Toolbar */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>🔍 Search Specialty:</span>
        <input 
          type="text" 
          placeholder="e.g., Cardiology, Neurology..." 
          value={searchSpecialty}
          onChange={(e) => setSearchSpecialty(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* 3. Dynamic Interactive Grid Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {doctors
          .filter(doc => doc.specialization.toLowerCase().includes(searchSpecialty.toLowerCase()))
          .map((doctor) => (
            <div 
              key={doctor.id} 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}
            >
              {/* Active Duty Green Badge */}
              <span style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                fontSize: '12px',
                fontWeight: '600',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                ● Active Duty
              </span>

              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContents: 'center', fontSize: '24px' }}>
                👨‍⚕️
              </div>

              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--primary-dark)' }}>{doctor.name}</h4>
                <span style={{ 
                  backgroundColor: '#f1f5f9', 
                  color: '#475569', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  padding: '4px 8px', 
                  borderRadius: '6px' 
                }}>
                  {doctor.specialization}
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
                <span>📜 License: <strong>{doctor.licenseNumber}</strong></span>
                <button style={{
                  backgroundColor: 'transparent',
                  color: 'var(--primary-blue)',
                  border: '1px solid var(--primary-blue)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  View Slots
                </button>
              </div>
            </div>
          ))}
      </div>

    </div>
  );
};

export default DoctorDirectory;