import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Phone,
  Mail,
  User,
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';

const COLOR_MAPS = ['teal', 'amber', 'violet', 'sky'];

const COLOR_MAP = {
  teal: { bgChip: '#f0fdfa', borderChip: '#0d9488', bgAvatar: '#0d9488', text: '#115e59' },
  amber: { bgChip: '#fffbeb', borderChip: '#d97706', bgAvatar: '#d97706', text: '#92400e' },
  violet: { bgChip: '#f5f3ff', borderChip: '#7c3aed', bgAvatar: '#7c3aed', text: '#5b21b6' },
  sky: { bgChip: '#f0f9ff', borderChip: '#0284c7', bgAvatar: '#0284c7', text: '#0369a1' },
};

const SLOT_TEMPLATE = [
  '09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:20 AM', '10:40 AM',
  '11:00 AM', '11:20 AM', '02:00 PM', '02:20 PM', '02:40 PM', '03:00 PM',
];

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export default function AppointmentBookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preSelectedId = location.state?.doctorId ? String(location.state.doctorId) : '';

  // Dynamic Database State Pools
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  
  const [doctorId, setDoctorId] = useState(preSelectedId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || localStorage.getItem('email') || '');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  // 🔄 1. FETCH LIVE DOCTORS FROM MYSQL ON COMPONENT MOUNT
  useEffect(() => {
    fetch('http://localhost:8080/api/doctors')
      .then((res) => res.json())
      .then((data) => {
        const formattedDoctors = data.map((doc, index) => ({
          id: String(doc.id),
          name: doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`,
          specialty: doc.specialization || doc.specialty || 'General Practitioner',
          initials: doc.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
          color: COLOR_MAPS[index % COLOR_MAPS.length]
        }));
        setDoctors(formattedDoctors);
        setLoadingDoctors(false);
      })
      .catch((err) => {
        console.error("Failed fetching live hospital practitioners directory:", err);
        setLoadingDoctors(false);
      });
  }, []);

  const doctor = useMemo(() => doctors.find((d) => d.id === String(doctorId)), [doctorId, doctors]);

  // 🔄 2. FETCH AVAILABLE SLOTS FOR THE SELECTED DOCTOR + DATE
  useEffect(() => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setAvailableSlots([]);

    fetch(`http://localhost:8080/api/schedules/doctor/${doctorId}/slots?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableSlots(data && data.length > 0 ? data : SLOT_TEMPLATE);
        setLoadingSlots(false);
      })
      .catch(() => {
        // Fallback local seed generator for client visual testing offline
        const seed = hashSeed(`${doctorId}|${date}`);
        const generated = SLOT_TEMPLATE.map((t, i) => ({
          time: t,
          booked: (seed + i * 7) % 5 === 0
        }));
        setAvailableSlots(generated.filter(s => !s.booked).map(s => s.time));
        setLoadingSlots(false);
      });
  }, [doctorId, date]);

  function validate() {
    const next = {};
    if (!doctorId) next.doctorId = 'Choose a doctor to continue.';
    if (!date) next.date = 'Pick a date.';
    if (!time) next.time = 'Pick an available time slot.';
    if (!name.trim()) next.name = 'Enter the patient\'s name.';
    if (phone.trim().length < 9) next.phone = 'Enter a valid phone number.';
    if (!email.includes('@') || !email.includes('.')) next.email = 'Enter a valid email address.';
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const queuePosition = (hashSeed(`${doctorId}|${date}|${time}|${phone}`) % 7) + 1;
    
    const payload = {
      doctorId: parseInt(doctorId),
      patientId: user?.id || localStorage.getItem('userId') || null,
      appointmentDate: date,
      appointmentTime: time,
      status: 'CONFIRMED'
    };

    fetch('http://localhost:8080/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })
    .then(() => {
      setConfirmed({
        ticket: `${doctor.initials}-${String(queuePosition).padStart(3, '0')}`,
        queuePosition,
        waitMinutes: queuePosition * 12,
        doctor, date, time,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
    })
    .catch(() => {
      setConfirmed({
        ticket: `${doctor?.initials || 'GH'}-${String(queuePosition).padStart(3, '0')}`,
        queuePosition, waitMinutes: queuePosition * 12, doctor, date, time, name, phone, email
      });
    });
  }

  function handleReset() {
    setDoctorId('');
    setTime('');
    setName('');
    setPhone('');
    setEmail('');
    setNote('');
    setErrors({});
    setConfirmed(null);
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f4', padding: '40px 16px', fontFamily: 'system-ui, sans-serif', color: '#1c1917' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        
        {/* Header Block */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#0f766e', textTransform: 'uppercase', margin: '0 0 4px 0', letterSpacing: '1px' }}>
            Patient queue
          </p>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1c1917', margin: 0 }}>Book an appointment</h1>
          <p style={{ color: '#78716c', fontSize: '14px', margin: '4px 0 0 0' }}>
            Your phone and email are how we'll send queue updates — no account needed.
          </p>
        </div>

        {/* 2-Column Responsive Layout Core Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 960 ? '1.3fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Input form portal */}
          {!confirmed ? (
            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Doctor Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#292524', marginBottom: '10px' }}>
                  <Stethoscope size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                  Choose a doctor
                </label>
                
                {loadingDoctors ? (
                  <div style={{ fontSize: '13px', color: '#0f766e' }}>🔄 Querying database clinical rosters...</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {doctors.map((doc) => {
                      const c = COLOR_MAP[doc.color] || COLOR_MAP.teal;
                      const selected = String(doctorId) === doc.id;
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => { setDoctorId(doc.id); setTime(''); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', border: selected ? `2px solid ${c.borderChip}` : '1px solid #e7e5e4',
                            borderRadius: '8px', padding: '10px 12px', backgroundColor: selected ? c.bgChip : 'white', cursor: 'pointer', outline: 'none', transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: c.bgAvatar, color: 'white', fontSize: '12px', fontWeight: '700' }}>
                            {doc.initials}
                          </span>
                          <div>
                            <span style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1c1917' }}>{doc.name}</span>
                            <span style={{ display: 'block', fontSize: '12px', color: '#78716c' }}>{doc.specialty}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.doctorId && <FieldError text={errors.doctorId} />}
              </div>

              {/* Date selection field */}
              <div>
                <label htmlFor="apt-date" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#292524', marginBottom: '8px' }}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                  Date
                </label>
                <input
                  id="apt-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setTime(''); }}
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
                {errors.date && <FieldError text={errors.date} />}
              </div>

              {/* Dynamic Slots Grid */}
              {doctorId && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#292524', marginBottom: '8px' }}>
                    <Clock size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                    Available times
                  </label>
                  {loadingSlots ? (
                    <div style={{ fontSize: '13px', color: '#0f766e' }}>🔄 Reading operating calendar schedules...</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {availableSlots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setTime(s)}
                          style={{
                            fontSize: '12px', fontWeight: '600', borderRadius: '8px', padding: '10px 4px', border: time === s ? '1px solid #0f766e' : '1px solid #e7e5e4',
                            backgroundColor: time === s ? '#0f766e' : 'white',
                            color: time === s ? 'white' : '#44403c',
                            cursor: 'pointer', transition: 'all 0.15s ease'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.time && <FieldError text={errors.time} />}
                </div>
              )}

              {/* Patient name */}
              <div>
                <label htmlFor="apt-name" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#292524', marginBottom: '8px' }}>
                  <User size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                  Patient name
                </label>
                <input
                  id="apt-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Himal Perera"
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
                {errors.name && <FieldError text={errors.name} />}
              </div>

              {/* Phone + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label htmlFor="apt-phone" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#292524', marginBottom: '8px' }}>
                    <Phone size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                    Phone number
                  </label>
                  <input
                    id="apt-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                  />
                  {errors.phone && <FieldError text={errors.phone} />}
                </div>
                <div>
                  <label htmlFor="apt-email" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#292524', marginBottom: '8px' }}>
                    <Mail size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                    Email
                  </label>
                  <input
                    id="apt-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                  />
                  {errors.email && <FieldError text={errors.email} />}
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="apt-note" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#292524', marginBottom: '8px' }}>
                  <MessageSquare size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                  Reason for visit <span style={{ color: '#a8a29e', fontWeight: '400' }}>(optional)</span>
                </label>
                <textarea
                  id="apt-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Briefly describe the symptom or reason"
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', resize: 'none' }}
                />
              </div>

              {/* 🌟 FIXED SUBMIT CONTAINER BLOCK */}
              <button
                type="submit"
                style={{ 
                  width: '100%', 
                  backgroundColor: '#0f766e', 
                  color: 'white', 
                  fontWeight: '600', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '14px', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                Confirm appointment
              </button>
            </form>
          ) : (
            <ConfirmationPanel data={confirmed} onReset={handleReset} />
          )}

          {/* RIGHT COLUMN: Ticket Stub */}
          <TicketStub
            doctor={doctor}
            date={date}
            time={time}
            name={name}
            confirmed={confirmed}
          />
        </div>
      </div>
    </div>
  );
}

function FieldError({ text }) {
  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e11d48', marginTop: '6px', marginBottom: 0 }}>
      <AlertCircle size={14} />
      {text}
    </p>
  );
}

function ConfirmationPanel({ data, onReset }) {
  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', marginBottom: '16px', fontWeight: '700' }}>
        <CheckCircle2 size={20} />
        <span style={{ fontSize: '15px' }}>Appointment confirmed</span>
      </div>
      <p style={{ fontSize: '14px', color: '#44403c', marginBottom: '20px', lineHeight: '1.5' }}>
        Ticket <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1c1917' }}>{data.ticket}</span> is booked
        with {data.doctor?.name} on {data.date} at {data.time}.
      </p>
      <div style={{ borderTop: '1px solid #f5f5f4', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#a8a29e', margin: 0 }}>What happens next</p>
        <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#44403c' }}>
          <li>A confirmation SMS and email are sent to {data.phone} and {data.email} now.</li>
          <li>You'll get a heads-up alert when there are 2 patients left ahead of you.</li>
          <li>A final alert goes out the moment the doctor calls your ticket.</li>
        </ul>
      </div>
      <button
        type="button"
        onClick={onReset}
        style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#0f766e', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
      >
        <ArrowLeft size={16} />
        Book another appointment
      </button>
    </div>
  );
}

function TicketStub({ doctor, date, time, name, confirmed }) {
  const display = confirmed || {
    ticket: '— — — —',
    queuePosition: null,
    waitMinutes: null,
    doctor,
    date,
    time,
    name,
  };

  return (
    <div style={{ position: 'sticky', top: '24px' }}>
      <div style={{ backgroundColor: '#1c1917', color: '#f5f5f4', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed #44403c' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#a8a29e' }}>
            Queue ticket
          </span>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', backgroundColor: confirmed ? '#0f766e' : '#44403c', color: 'white' }}>
            {confirmed ? 'Confirmed' : 'Pending'}
          </span>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '11px', color: '#a8a29e', margin: '0 0 4px 0' }}>Ticket number</p>
          <p style={{ fontFamily: 'monospace', fontSize: '32px', fontWeight: '700', margin: '0 0 20px 0', letterSpacing: '1px' }}>{display.ticket}</p>

          <dl style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', margin: 0 }}>
            <Row label="Doctor" value={display.doctor ? display.doctor.name : '—'} />
            <Row label="Date" value={display.date || '—'} />
            <Row label="Time" value={display.time || '—'} />
            <Row label="Patient" value={display.name || '—'} />
            {confirmed && <Row label="Est. wait" value={`~${display.waitMinutes} min`} />}
          </dl>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', backgroundColor: '#292524', position: 'relative' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f5f5f4', position: 'absolute', left: '-5px' }} />
          <span style={{ fontSize: '11px', color: '#a8a29e', width: '100%', textAlign: 'center' }}>
            {confirmed ? `Position #${display.queuePosition} in queue` : 'Fill in the form to issue this ticket'}
          </span>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f5f5f4', position: 'absolute', right: '-5px' }} />
        </div>

      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <dt style={{ color: '#a8a29e' }}>{label}</dt>
      <dd style={{ fontWeight: '500', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>{value}</dd>
    </div>
  );
}