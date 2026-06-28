import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 Import navigate hooks
import { useAuth } from '../context/AuthContext';   // 🌟 Import your authentication framework check

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // 🧭 Initialize redirection engine
  const { user } = useAuth();     // 🔑 Read active login state metrics

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'General Medicine'];

  useEffect(() => {
    setLoading(true);
    const url = specialty && specialty !== 'All' 
      ? `http://localhost:8080/api/doctors?specialty=${specialty}`
      : 'http://localhost:8080/api/doctors';

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching clinical directory:", err);
        setLoading(false);
      });
  }, [specialty]);

  // 🌟 INTERACTIVE ROUTING ROUTINE: Evaluates session context roles
  const handleBookingClick = (doc) => {
    const userRole = user?.role || localStorage.getItem('role');

    if (userRole === 'ROLE_PATIENT' || userRole === 'PATIENT') {
      // ✅ Authenticated as patient -> Skip onboarding, launch booking form view
      navigate('/booking', { state: { doctorId: doc.id } });
    } else {
      // 🔐 Unauthenticated / Non-patient -> Forward to the dedicated onboarding split page
      navigate('/patient-auth', { 
        state: { 
          redirectTo: '/booking', 
          doctorId: doc.id 
        } 
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1e293b'
    }}>
      {/* Premium Hero Banner Segment */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '64px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <span style={{
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          color: '#38bdf8',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          ✨ CORE HEALTH HEALTHCARE GATEWAY
        </span>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '16px 0 8px 0', letterSpacing: '-0.5px' }}>
          Find & Book World-Class Specialists
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Access real-time schedules, verified clinical licenses, and instantaneous booking channels.
        </p>
      </div>

      {/* Main Layout Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Interactive Filter Pill Container */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px', 
          flexWrap: 'wrap',
          marginBottom: '40px' 
        }}>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialty(spec === 'All' ? '' : spec)}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: '1px solid',
                borderColor: (specialty === spec || (spec === 'All' && !specialty)) ? '#2563eb' : '#e2e8f0',
                backgroundColor: (specialty === spec || (spec === 'All' && !specialty)) ? '#2563eb' : 'white',
                color: (specialty === spec || (spec === 'All' && !specialty)) ? 'white' : '#475569',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Dynamic Display Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '16px' }}>
            🔄 Syncing medical database entries...
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px', 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            🍃 No clinical profiles currently listed under this discipline.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {doctors.map((doc) => (
              <div 
                key={doc.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px'
                    }}>
                      👨‍⚕️
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                        {doc.name}
                      </h3>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '4px'
                      }}>
                        {doc.specialization}
                      </span>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: '1px solid #f1f5f9', margin: '16px 0' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      📋 <strong style={{ color: '#334155' }}>License:</strong> {doc.licenseNumber || doc.license_number}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                      ✉️ <strong style={{ color: '#334155' }}>Contact:</strong> {doc.email}
                    </div>
                  </div>
                </div>

                {/* 🌟 Event Link Injection Point */}
                <button 
                  onClick={() => handleBookingClick(doc)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: 'auto',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Book Consultation Slot
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}