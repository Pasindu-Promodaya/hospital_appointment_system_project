import React, { useEffect, useState } from 'react';

export default function ManageAppointments({ patientId }) {
  const API_BASE_URL = 'http://localhost:8080/api';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State to hold our Doctor ID -> Doctor Name mapping
  const [doctorDirectory, setDoctorDirectory] = useState({});

  // State for in-page confirmation and notifications.
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState(null);
  const [customNotification, setCustomNotification] = useState({ visible: false, type: '', text: '' });

  // Fetch all doctors on mount so we can match their IDs to their real names
  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/doctors`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapping = {};
          data.forEach(doc => {
            // Adjust field names if your backend uses 'name' instead of 'firstName'
            mapping[doc.id] = `Dr. ${doc.firstName} ${doc.lastName}`;
          });
          setDoctorDirectory(mapping);
        }
      })
      .catch(err => console.error("Could not fetch doctor directory mapping", err));
  }, []);

  const fetchAppointments = () => {
    setLoading(true);
    
    let activeId = patientId;
    if (!activeId) {
      try {
        const session = JSON.parse(localStorage.getItem("userSession") || "{}");
        activeId = session.userId || session.id;
      } catch (err) {
        console.error("Failed to resolve session parameters:", err);
      }
    }

    if (!activeId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/appointments/my-appointments`, {
      headers: { 'X-Patient-Id': String(activeId) }
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(data => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAppointments([]);
        setLoading(false);
        showPopupMessage('error', 'Unable to load your appointments.');
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const showPopupMessage = (type, text) => {
    setCustomNotification({ visible: true, type, text });
  };

  const triggerCancelModal = (appointmentId) => {
    setApptToCancel(appointmentId);
    setCancelModalOpen(true);
  };

  const executeCancel = () => {
    if (!apptToCancel) return;

    let activeId = patientId || JSON.parse(localStorage.getItem("userSession") || "{}").id;

    fetch(`${API_BASE_URL}/appointments/${apptToCancel}/cancel`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-Patient-Id': String(activeId) 
      }
    })
      .then(async res => {
        setCancelModalOpen(false);
        setApptToCancel(null);
        if (res.ok) {
          showPopupMessage('success', 'Your appointment slot has been successfully cancelled.');
          fetchAppointments(); // Refresh the list to show the "Cancelled" badge
        } else {
          showPopupMessage('error', await res.text() || 'Could not process cancellation.');
        }
      })
      .catch(() => showPopupMessage('error', 'The cancellation service is currently unavailable.'));
  };

  // Replaced "Pending Approval" with a single "Confirmed" state for all active bookings
  const getStatusBadge = (status) => {
    if (status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Cancelled
        </span>
      );
    }
    
    // Everything else (PENDING, CONFIRMED, etc.) shows as Confirmed to the patient
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Appointment Confirmed
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-500">Loading your appointments…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)]">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-8 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <svg className="h-7 w-7 text-blue-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                <path d="M12 16v-4m0 0H8m4 0 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/80">Appointments</p>
              <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Your scheduled visits</h3>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {appointments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-400">No appointment records found on file.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(appt => (
                <div
                  key={appt.id}
                  className={`rounded-3xl border p-5 transition-all duration-200 ${
                    appt.status === 'CANCELLED'
                      ? 'border-slate-200 bg-slate-50 opacity-70'
                      : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
                          </svg>
                        </div>
                        <div>
                          {/* Looks up the real name from our directory map! */}
                          <h4 className="text-base font-bold text-slate-900">
                            {appt.doctorName || doctorDirectory[appt.doctorId] || `Doctor #${appt.doctorId}`}
                          </h4>
                          {appt.specialization && (
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">{appt.specialization}</p>
                          )}
                        </div>
                        <div className="ml-auto md:ml-2">
                          {getStatusBadge(appt.status)}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Doctor ID</span>
                          <span className="font-mono text-sm font-bold text-slate-700">#{appt.doctorId}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                          </svg>
                          <span className="font-semibold text-slate-700">{appt.appointmentDate}</span>
                          <span className="text-slate-300">•</span>
                          <strong>{appt.timeSlot ? appt.timeSlot.substring(0, 5) : ''}</strong>
                        </div>
                      </div>

                      {appt.status !== 'CANCELLED' && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                            Token {appt.tokenNumber || 0}
                          </span>
                          <span className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-purple-700">
                            Queue {appt.queueOrder || 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Always allow cancelling unless it's already cancelled! */}
                    {appt.status !== 'CANCELLED' && (
                      <div className="flex w-full md:w-auto mt-4 md:mt-0">
                        <button
                          onClick={() => triggerCancelModal(appt.id)}
                          className="w-full rounded-2xl border border-rose-200 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 md:w-auto"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation confirmation modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 text-center space-y-5 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Cancel Appointment Slot?</h4>
              <p className="text-xs text-slate-500 mt-1.5 px-2 leading-relaxed">This operational action cannot be reversed. Are you sure you want to release your consultation line allocation?</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => { setCancelModalOpen(false); setApptToCancel(null); }}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                No, Keep It
              </button>
              <button 
                onClick={executeCancel}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-lg shadow-rose-600/10"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification dialog */}
      {customNotification.visible && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 text-center space-y-5 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-150">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
              customNotification.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
              customNotification.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {customNotification.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 capitalize">{customNotification.type} Alert</h4>
              <p className="text-xs text-slate-500 mt-1.5 px-2 leading-relaxed">{customNotification.text}</p>
            </div>
            <div className="pt-2">
              <button 
                onClick={() => setCustomNotification({ visible: false, type: '', text: '' })}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-md"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}