import { useState } from 'react';
import { getPatientAppointments, cancelAppointment } from '../services/appointmentService';

export default function MyAppointments() {
  const [email, setEmail] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(null); // { id, doctorName }

  // ─── Look up appointments by email ──────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await getPatientAppointments(email.trim());
      setAppointments(res.data);
      setSearched(true);
    } catch {
      setErrorMsg('Could not retrieve appointments. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Cancel an appointment ───────────────────────────────────────────────────
  const handleCancel = async () => {
    const { id, doctorName } = confirmCancel;
    setConfirmCancel(null);
    setCancellingId(id);
    setErrorMsg('');
    try {
      const res = await cancelAppointment(id, email);
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a)
      );
      setSuccessMsg(`Appointment with ${doctorName} has been cancelled.`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  const badgeClass = (status) => ({
    CONFIRMED: 'badge badge-confirmed',
    CANCELLED: 'badge badge-cancelled',
    COMPLETED: 'badge badge-completed',
  }[status] || 'badge');

  const activeCount = appointments.filter(a => a.status === 'CONFIRMED').length;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Enter your email address to view and manage your bookings.</p>
      </div>

      {/* ── Email Lookup Form ────────────────────────────────────────────── */}
      <form className="lookup-form" onSubmit={handleSearch}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter the email you used to book"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !email.trim()}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Searching...</> : 'Find Appointments'}
        </button>
      </form>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          ✓ {successMsg}
          <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          ✕ {errorMsg}
          <button onClick={() => setErrorMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {searched && !loading && (
        appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No appointments found</div>
            <div className="empty-msg">No bookings were found for <strong>{email}</strong>.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--clr-muted)' }}>
                Found <strong style={{ color: 'var(--clr-text)' }}>{appointments.length}</strong> appointment{appointments.length !== 1 ? 's' : ''}
                {activeCount > 0 && <> · <strong style={{ color: 'var(--clr-teal)' }}>{activeCount} confirmed</strong></>}
              </p>
            </div>

            <div className="appointments-list">
              {appointments.map(appt => {
                const d = formatDate(appt.date);
                const isCancelling = cancellingId === appt.id;
                return (
                  <div key={appt.id} className="appt-card" style={{ opacity: appt.status === 'CANCELLED' ? 0.7 : 1 }}>

                    {/* Date block */}
                    <div className="appt-date-block">
                      <div className="appt-date-day">{d.day}</div>
                      <div className="appt-date-month">{d.month}</div>
                    </div>

                    {/* Info */}
                    <div className="appt-info">
                      <div className="appt-doctor">Dr. {appt.doctorName.replace(/^Dr\.\s*/i, '')}</div>
                      <div className="appt-spec">{appt.specialization}</div>
                      <div className="appt-time">
                        📅 {d.full} &nbsp;·&nbsp; 🕐 {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                      </div>
                      {appt.reason && <div className="appt-reason">"{appt.reason}"</div>}
                    </div>

                    {/* Actions */}
                    <div className="appt-actions">
                      <span className={badgeClass(appt.status)}>{appt.status}</span>
                      {appt.status === 'CONFIRMED' && (
                        <button
                          className="btn btn-danger"
                          onClick={() => setConfirmCancel({ id: appt.id, doctorName: appt.doctorName })}
                          disabled={isCancelling}
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}

      {/* ── Cancel Confirmation Modal ────────────────────────────────────── */}
      {confirmCancel && (
        <div className="modal-overlay" onClick={() => setConfirmCancel(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Cancel Appointment?</h2>
            <div className="modal-body">
              <p style={{ color: 'var(--clr-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                Are you sure you want to cancel your appointment with <strong>{confirmCancel.doctorName}</strong>?
                <br />The time slot will be made available for other patients.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmCancel(null)}>Keep Appointment</button>
              <button className="btn btn-danger" style={{ background: 'var(--clr-danger)', color: 'white', border: 'none', padding: '0.65rem 1.25rem', fontWeight: 600 }} onClick={handleCancel}>
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
