import { useState, useEffect } from 'react';
import { getDoctors, getAvailableSlots, bookAppointment } from '../services/appointmentService';

const SPECIALIZATIONS = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology'];

export default function BookAppointment() {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ patientName: '', patientEmail: '', patientPhone: '', reason: '' });
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // ─── Load doctors ───────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingDoctors(true);
    getDoctors(filter === 'All' ? '' : filter)
      .then(res => setDoctors(res.data))
      .catch(() => setErrorMsg('Unable to load doctors. Please ensure the backend server is running.'))
      .finally(() => setLoadingDoctors(false));
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSlots([]);
  }, [filter]);

  // ─── Load slots when doctor + date selected ─────────────────────────────────
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailableSlots(selectedDoctor.id, selectedDate)
      .then(res => setSlots(res.data))
      .catch(() => setErrorMsg('Unable to load slots.'))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor, selectedDate]);

  // ─── Submit booking ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await bookAppointment({
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        patientPhone: form.patientPhone,
        doctorId: selectedDoctor.id,
        slotId: selectedSlot.id,
        reason: form.reason,
      });
      setSuccessMsg(`Your appointment with ${selectedDoctor.name} on ${formatDate(selectedDate)} at ${formatTime(selectedSlot.startTime)} has been confirmed!`);
      setShowModal(false);
      resetForm();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Booking failed. Please try again.');
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSlots([]);
    setSelectedDate('');
    setForm({ patientName: '', patientEmail: '', patientPhone: '', reason: '' });
  };

  const canProceed =
    selectedDoctor && selectedSlot &&
    form.patientName.trim() && form.patientEmail.trim() && form.patientPhone.trim();

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Book an Appointment</h1>
        <p className="page-subtitle">Choose a doctor, pick a date and time, and confirm your visit.</p>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          ✓ {successMsg}
          <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          ✕ {errorMsg}
          <button onClick={() => setErrorMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="step-wrapper">

        {/* ── Step 1: Choose Doctor ─────────────────────────────────────── */}
        <div className="step-section">
          <div className="step-label">
            <span className="step-num">1</span>
            <span className="step-title">Select a Doctor</span>
          </div>

          <div className="filter-bar">
            {SPECIALIZATIONS.map(s => (
              <button
                key={s}
                className={`filter-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >{s}</button>
            ))}
          </div>

          {loadingDoctors ? (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--clr-muted)' }}>
              <span className="spinner" /> Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍⚕️</div>
              <div className="empty-title">No doctors found</div>
              <div className="empty-msg">Try a different specialization or check back later.</div>
            </div>
          ) : (
            <div className="doctors-grid">
              {doctors.map(doc => (
                <div
                  key={doc.id}
                  className={`doctor-card ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedDoctor(doc); setSelectedSlot(null); setSlots([]); }}
                >
                  <img src={doc.imageUrl} alt={doc.name} className="doctor-avatar" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0B7A75&color=fff`} />
                  <div className="doctor-name">{doc.name}</div>
                  <span className="doctor-spec">{doc.specialization}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Step 2: Choose Date & Slot ────────────────────────────────── */}
        {selectedDoctor && (
          <div className="step-section">
            <div className="step-label">
              <span className="step-num">2</span>
              <span className="step-title">Pick a Date & Time Slot</span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Date</label>
              <input
                type="date"
                className="date-input"
                min={today}
                max={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            {selectedDate && (
              loadingSlots ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--clr-muted)' }}>
                  <span className="spinner" /> Loading available slots...
                </div>
              ) : slots.length === 0 ? (
                <div className="alert alert-info">No available slots for {formatDate(selectedDate)}. Try another date.</div>
              ) : (
                <>
                  <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
                    {slots.length} slots available on {formatDate(selectedDate)}
                  </div>
                  <div className="slots-grid">
                    {slots.map(slot => (
                      <button
                        key={slot.id}
                        className={`slot-btn ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                </>
              )
            )}
          </div>
        )}

        {/* ── Step 3: Patient Details ───────────────────────────────────── */}
        {selectedSlot && (
          <div className="step-section">
            <div className="step-label">
              <span className="step-num">3</span>
              <span className="step-title">Your Details</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. John Perera"
                  value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-input" placeholder="john@email.com"
                  value={form.patientEmail} onChange={e => setForm({ ...form, patientEmail: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" placeholder="+94 77 000 0000"
                  value={form.patientPhone} onChange={e => setForm({ ...form, patientPhone: e.target.value })} />
              </div>
              <div className="form-group full">
                <label className="form-label">Reason for Visit (optional)</label>
                <textarea className="form-textarea" placeholder="Brief description of your symptoms or purpose of visit..."
                  value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>
            </div>

            {/* Summary Strip */}
            <div style={{ background: 'var(--clr-teal-light)', border: '1px solid #B3DAD8', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--clr-teal)', lineHeight: 1.7 }}>
              <strong>Booking summary:</strong><br />
              👨‍⚕️ {selectedDoctor.name} · {selectedDoctor.specialization}<br />
              📅 {formatDate(selectedDate)} · {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <button
                className="btn btn-primary"
                disabled={!canProceed || submitting}
                onClick={() => setShowModal(true)}
              >
                {submitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Booking...</> : 'Review & Confirm Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ──────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Confirm Your Appointment</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--clr-muted)', marginBottom: '1.25rem' }}>
              Please review the details below before confirming.
            </p>
            <div className="modal-body">
              {[
                ['Patient', form.patientName],
                ['Email', form.patientEmail],
                ['Phone', form.patientPhone],
                ['Doctor', selectedDoctor?.name],
                ['Specialization', selectedDoctor?.specialization],
                ['Date', formatDate(selectedDate)],
                ['Time', `${formatTime(selectedSlot?.startTime)} – ${formatTime(selectedSlot?.endTime)}`],
                form.reason ? ['Reason', form.reason] : null,
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} className="confirm-row">
                  <span className="confirm-label">{label}</span>
                  <span className="confirm-value">{value}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Go Back</button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
