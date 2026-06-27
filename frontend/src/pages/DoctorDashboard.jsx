import React, { useState, useMemo } from 'react';

const DOCTOR = {
  name: 'Dr. Himal Samarawickrama',
  specialty: 'Neurology',
  reg: 'MC-12743',
  initials: 'HS',
};

const INITIAL_QUEUE = [
  { id: 1, ticket: 'HS-001', name: 'Saman Kumara', phone: '071 234 5678', email: 'saman.k@gmail.com', time: '09:00 AM', reason: 'Fever and body ache', status: 'done' },
  { id: 2, ticket: 'HS-002', name: 'Dilani Wijesinghe', phone: '077 345 6781', email: 'dilani.w@gmail.com', time: '09:20 AM', reason: 'Follow-up: blood pressure', status: 'done' },
  { id: 3, ticket: 'HS-003', name: 'Ruwan Senanayake', phone: '070 456 7812', email: 'ruwan.s@yahoo.com', time: '09:40 AM', reason: 'Persistent cough', status: 'serving' },
  { id: 4, ticket: 'HS-004', name: 'Achini Madushani', phone: '076 567 8123', email: 'achini.m@gmail.com', time: '10:00 AM', reason: 'Routine checkup', status: 'waiting' },
  { id: 5, ticket: 'HS-005', name: 'Kasun Bandara', phone: '072 678 1234', email: 'kasun.b@gmail.com', time: '10:20 AM', reason: 'Skin rash', status: 'waiting' },
  { id: 6, ticket: 'HS-006', name: 'Nimesha Rathnayake', phone: '075 781 2345', email: 'nimesha.r@gmail.com', time: '10:40 AM', reason: 'Headache, dizziness', status: 'waiting' },
];

const STATUS_STYLING = {
  waiting: { label: 'Waiting', bg: '#f1f5f9', color: '#475569' },
  serving: { label: 'In Room', bg: '#e0f2fe', color: 'var(--primary-blue)' },
  done: { label: 'Done', bg: '#f0fdf4', color: '#16a34a' },
  'no-show': { label: 'No-show', bg: '#fef2f2', color: '#ef4444' },
};

function initials(fullName) {
  const parts = fullName.split(' ').filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function DoctorDashboard() {
  // Roster Form States
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isSaving, setIsSaving] = useState(false);

  // Queue Management States
  const [onDuty, setOnDuty] = useState(true);
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedId, setSelectedId] = useState(3);

  // Memoized Metrics Calculations
  const serving = useMemo(() => queue.find((p) => p.status === 'serving'), [queue]);
  const waitingList = useMemo(() => queue.filter((p) => p.status === 'waiting'), [queue]);
  const seenToday = useMemo(() => queue.filter((p) => p.status === 'done').length, [queue]);
  const selectedPatient = queue.find((p) => p.id === selectedId) || serving;

  // Full-Stack API Save Handler
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    if (endTime <= startTime) {
      alert('⚠️ End time must be after start time.');
      return;
    }

    const scheduleData = {
      doctorId: 1, 
      dayOfWeek: dayOfWeek,
      startTime: startTime + ":00", 
      endTime: endTime + ":00",
      slotDurationMinutes: 15
    };

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8080/api/doctors/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      if (response.ok) {
        alert(`🎯 Roster published! 15-minute slot allocations initialized for ${dayOfWeek}.`);
      } else {
        alert('⚠️ Remote server rejected configuration. Check backend console outputs.');
      }
    } catch (error) {
      console.error('Network handshake error:', error);
      alert('❌ Cannot connect to backend server. Make sure Spring Boot is running!');
    } finally {
      setIsSaving(false);
    }
  };

  // Queue Control Methods
  function handleCallNext() {
    const servingIdx = queue.findIndex((p) => p.status === 'serving');
    const nextIdx = queue.findIndex((p) => p.status === 'waiting');
    if (nextIdx === -1) return;
    setQueue((prev) =>
      prev.map((p, i) => {
        if (i === servingIdx) return { ...p, status: 'done' };
        if (i === nextIdx) return { ...p, status: 'serving' };
        return p;
      })
    );
    setSelectedId(queue[nextIdx].id);
  }

  function handleNoShow() {
    const servingIdx = queue.findIndex((p) => p.status === 'serving');
    if (servingIdx === -1) return;
    setQueue((prev) => prev.map((p, i) => (i === servingIdx ? { ...p, status: 'no-show' } : p)));
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: 'var(--primary-blue)' }}>
            {DOCTOR.initials}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', color: 'var(--primary-dark)', fontSize: '22px', fontWeight: '700' }}>
              Welcome Back, {DOCTOR.name}
            </h2>
            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px' }}>
              🔬 {DOCTOR.specialty} &middot; Registry: {DOCTOR.reg}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>📆 {today}</span>
          <button
            type="button"
            onClick={() => setOnDuty((v) => !v)}
            style={{
              backgroundColor: onDuty ? '#f0fdf4' : '#f1f5f9',
              color: onDuty ? '#16a34a' : '#475569',
              border: `1px solid ${onDuty ? '#16a34a' : '#cbd5e1'}`,
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ color: onDuty ? '#16a34a' : '#94a3b8' }}>●</span> {onDuty ? 'On Duty' : 'Off Duty'}
          </button>
        </div>
      </div>

      {/* Main Top Grid Split: Configuration Roster Form & Live Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Roster Configuration Form Card */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '16px', fontWeight: '700' }}>
            📅 Configure Weekly Work Roster
          </h3>
          <form onSubmit={handleSaveSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Select Operating Day:</label>
              <select 
                value={dayOfWeek} 
                onChange={(e) => setDayOfWeek(e.target.value)} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Start Shift:</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>End Shift:</label>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }} 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSaving}
              style={{ 
                backgroundColor: isSaving ? '#cbd5e1' : 'var(--primary-blue)', 
                color: 'white', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '8px', 
                fontWeight: '600', 
                fontSize: '14px',
                cursor: isSaving ? 'not-allowed' : 'pointer', 
                marginTop: '8px',
                textAlign: 'center'
              }}
            >
              {isSaving ? '⏳ Publishing Stream...' : 'Publish Active Roster'}
            </button>
          </form>
        </div>

        {/* Live Operational Metrics & Active Serving Module */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Waiting Now</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-dark)' }}>{waitingList.length}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Seen Today</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{seenToday}</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Now Serving</div>
              <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary-blue)' }}>
                {serving ? serving.ticket : '—'}
              </div>
            </div>
          </div>

          {/* Dark Active Patient Status Control Room */}
          <div style={{ backgroundColor: 'var(--primary-dark)', color: 'white', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #334155', paddingBottom: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', tracking: 'wide', color: '#94a3b8', textTransform: 'uppercase' }}>Current In-Room Token</span>
              {serving && <span style={{ fontSize: '11px', backgroundColor: '#16a34a', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>● Live</span>}
            </div>
            
            <div style={{ margin: '8px 0' }}>
              {serving ? (
                <>
                  <div style={{ fontFamily: 'monospace', fontSize: '32px', fontWeight: '700', color: '#38bdf8', letterSpacing: '1px' }}>{serving.ticket}</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{serving.name}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>⏱️ {serving.time} &middot; {serving.reason}</div>
                </>
              ) : (
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>No clinical patient currently initialized in treatment room.</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleCallNext}
                disabled={!onDuty || waitingList.length === 0}
                style={{
                  flex: 1,
                  backgroundColor: (!onDuty || waitingList.length === 0) ? '#334155' : '#16a34a',
                  color: (!onDuty || waitingList.length === 0) ? '#64748b' : 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: (!onDuty || waitingList.length === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                📢 Call Next
              </button>
              <button
                type="button"
                onClick={handleNoShow}
                disabled={!serving}
                style={{
                  backgroundColor: 'transparent',
                  color: !serving ? '#475569' : '#ef4444',
                  border: `1px solid ${!serving ? '#334155' : '#ef4444'}`,
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: !serving ? 'not-allowed' : 'pointer'
                }}
              >
                ❌ No-Show
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Main Bottom Grid Split: Active Queue Stream List & Detailed Records Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Active System Queue Registry */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📋 Active Operations Queue Streams
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {queue.map((patient) => {
              const config = STATUS_STYLING[patient.status];
              const isSelected = patient.id === selectedId;
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedId(patient.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 20px',
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid #f8fafc',
                    backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    outline: 'none'
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#475569', width: '70px' }}>
                    {patient.ticket}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--primary-dark)' }}>{patient.name}</span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>🕒 {patient.time}</span>
                  </div>
                  <span style={{ backgroundColor: config.bg, color: config.color, fontSize: '11px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', minWidth: '65px', textAlign: 'center' }}>
                    {config.label}
                  </span>
                  <span style={{ color: '#cbd5e1', fontWeight: '700' }}>›</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Patient Records Dashboard Sidebar */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: '24px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👤 Patient Medical Record Card
          </p>
          
          {selectedPatient ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                  {initials(selectedPatient.name)}
                </div>
                <div>
                  <div style={{ fontRequirements: 'semibold', fontSize: '16px', fontWeight: '700', color: 'var(--primary-dark)' }}>{selectedPatient.name}</div>
                  <span style={{ display: 'inline-block', backgroundColor: STATUS_STYLING[selectedPatient.status].bg, color: STATUS_STYLING[selectedPatient.status].color, fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                    {STATUS_STYLING[selectedPatient.status].label}
                  </span>
                </div>
              </div>

              {/* Data Layout Metadata Grid Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fafafa', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>📜 Roster Ticket:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#334155' }}>{selectedPatient.ticket}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fafafa', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>🕒 Time Allocation:</span>
                  <span style={{ color: '#334155', fontWeight: '500' }}>{selectedPatient.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fafafa', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>📞 Contact Number:</span>
                  <a href={`tel:${selectedPatient.phone.replace(/\s/g, '')}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                    {selectedPatient.phone}
                  </a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>✉️ Email Address:</span>
                  <a href={`mailto:${selectedPatient.email}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                    {selectedPatient.email}
                  </a>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '4px' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Primary Consultation Symptoms
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontStyle: 'italic' }}>
                  "{selectedPatient.reason}"
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Select a pointer card on the active queue stream to inspect data layout records.</p>
          )}
        </div>

      </div>
    </div>
  );
}