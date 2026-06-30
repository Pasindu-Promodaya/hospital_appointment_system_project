import React, { useState, useEffect } from 'react';
import BookAppointment from './BookAppointment';
import ManageAppointments from './ManageAppointments';

export default function PatientAppointmentModule({ patientId }) {
  const [activeTab, setActiveTab] = useState('book');
  const [activePatientId, setActivePatientId] = useState(null);

  useEffect(() => {
    if (patientId) {
      setActivePatientId(patientId);
      return;
    }

    const session = localStorage.getItem("userSession");
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const activeId = sessionData.userId || sessionData.id;

        if (activeId) {
          setActivePatientId(activeId);
        } else {
          setActivePatientId(null);
        }
      } catch (error) {
        console.error("Failed to parse user session layout context:", error);
        setActivePatientId(null);
      }
    } else {
      setActivePatientId(null);
    }
  }, [patientId]);

  if (!activePatientId) {
    return (
      <div className="mx-auto flex min-h-[320px] max-w-lg items-center justify-center px-4">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m-5 4h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2ZM9 10V7a3 3 0 0 1 6 0v3" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Patient login required</h3>
          <p className="mt-2 text-sm text-slate-500">Please sign in to access your appointment bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <div className="inline-flex gap-1 rounded-lg border bg-slate-100 p-1">
          <button 
            onClick={() => setActiveTab('my-bookings')} 
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'my-bookings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            My Bookings
          </button>
          <button 
            onClick={() => setActiveTab('book')} 
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'book' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Book Appointment
          </button>
        </div>
      </div>

      {activeTab === 'book' ? (
        <BookAppointment patientId={activePatientId} />
      ) : (
        <ManageAppointments patientId={activePatientId} />
      )}
    </div>
  );
}