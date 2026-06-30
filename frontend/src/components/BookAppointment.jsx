import React, { useState, useEffect } from 'react';

export default function BookAppointment({ patientId }) {
  const API_BASE_URL = '/api';

  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [medicalProblem, setMedicalProblem] = useState('');

  const [loadingSpecializations, setLoadingSpecializations] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState({ type: '', text: '' });

  // Load the initial list of specializations when the component mounts.
  useEffect(() => {
    setLoadingSpecializations(true);
    fetch(`${API_BASE_URL}/appointments/specializations`)
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Unable to reach appointment service.');
        }
        return res.json();
      })
      .then(data => {
        setSpecializations(Array.isArray(data) ? data : []);
        setUiMessage({ type: '', text: '' });
      })
      .catch(() => {
        setSpecializations([]);
        setUiMessage({ type: 'error', text: 'The appointment service is temporarily unavailable. Please verify backend connectivity and try again.' });
      })
      .finally(() => setLoadingSpecializations(false));
  }, []);

  // Fetch doctors whenever the selected specialty changes.
  const handleSpecializationChange = (e) => {
    const spec = e.target.value;
    setSelectedSpecialization(spec);
    setSelectedDoctorId('');
    setSelectedDate('');
    setAvailableSlots([]);
    setDoctors([]);
    setUiMessage({ type: '', text: '' });

    if (spec) {
      setLoadingDoctors(true);
      fetch(`${API_BASE_URL}/appointments/doctors?specialization=${encodeURIComponent(spec)}`)
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Unable to fetch doctors.');
          }
          return res.json();
        })
        .then(data => {
          setDoctors(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length === 0) {
            setUiMessage({ type: 'info', text: 'No active medical personnel found registered under this specialization.' });
          }
        })
        .catch(() => setUiMessage({ type: 'error', text: 'Unable to load doctors for this specialty at the moment.' }))
        .finally(() => setLoadingDoctors(false));
    }
  };

  // Reset the selected date and slot when the doctor changes.
  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
    setSelectedDate('');
    setAvailableSlots([]);
    setUiMessage({ type: '', text: '' });
  };

  // Load the available time slots when the doctor and date are selected.
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedTimeSlot('');
    setAvailableSlots([]);
    
    if (selectedDoctorId && date) {
      setLoadingSlots(true);
      setUiMessage({ type: '', text: '' });
      
      fetch(`${API_BASE_URL}/appointments/available-slots?doctorId=${selectedDoctorId}&date=${date}`)
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Unable to fetch available slots.');
          }
          return res.json();
        })
        .then(slots => {
          setAvailableSlots(Array.isArray(slots) ? slots : []);
          if (Array.isArray(slots) && slots.length === 0) {
            setUiMessage({ type: 'warning', text: 'This doctor has no available scheduling slots left on the selected date.' });
          }
        })
        .catch(() => setUiMessage({ type: 'error', text: 'Unable to refresh available appointment slots right now.' }))
        .finally(() => setLoadingSlots(false));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      setUiMessage({ type: 'error', text: 'Please fulfill all booking validation criteria.' });
      return;
    }

    setSubmitLoading(true);
    setUiMessage({ type: '', text: '' });

    const payload = {
      doctorId: parseInt(selectedDoctorId),
      appointmentDate: selectedDate,
      timeSlot: selectedTimeSlot.length === 5 ? `${selectedTimeSlot}:00` : selectedTimeSlot,
      medicalProblem: medicalProblem.trim() || null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Patient-Id': patientId
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        setUiMessage({ type: 'success', text: responseData.message || 'Your clinical reservation has been confirmed and logged.' });
        setSelectedSpecialization('');
        setSelectedDoctorId('');
        setSelectedDate('');
        setSelectedTimeSlot('');
        setMedicalProblem('');
        setAvailableSlots([]);
        setDoctors([]);
      } else {
        setUiMessage({ type: 'error', text: responseData.message || 'The booking request was rejected by the service. Please review your selection and try again.' });
      }
    } catch {
      setUiMessage({ type: 'error', text: 'The booking service is unreachable right now. Please check connectivity and try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-8 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <svg className="h-7 w-7 text-blue-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s8-4.35 8-10a4 4 0 0 0-7-2.2A4 4 0 0 0 4 11c0 5.65 8 10 8 10Z" />
                <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/80">Care Coordination</p>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Book an appointment</h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {uiMessage.text && (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
              uiMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
              uiMessage.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' :
              uiMessage.type === 'info' ? 'border-sky-200 bg-sky-50 text-sky-800' :
              'border-rose-200 bg-rose-50 text-rose-800'
            }`}>
              {uiMessage.text}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  1. Select specialization
                </label>
                <div className="relative">
                  <select
                    value={selectedSpecialization}
                    onChange={handleSpecializationChange}
                    disabled={loadingSpecializations}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">{loadingSpecializations ? '-- Loading specializations --' : '-- Choose Field Specialty --'}</option>
                    {specializations.map((spec, i) => <option key={i} value={spec}>{spec}</option>)}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-0 mr-4 flex items-center text-slate-400">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"/></svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  2. Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={handleDoctorChange}
                  disabled={!selectedSpecialization || doctors.length === 0 || loadingDoctors}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{loadingDoctors ? '-- Loading doctors --' : '-- Select Available Doctor --'}</option>
                  {doctors.map(doc => <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  3. Appointment date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  disabled={!selectedDoctorId}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  4. Available slots
                </label>
                {loadingSlots && <span className="text-xs font-semibold text-blue-600">Refreshing availability…</span>}
              </div>

              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`rounded-2xl border px-3 py-3 text-xs font-semibold transition ${
                        selectedTimeSlot === slot
                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {slot.substring(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-400">
                  Select a doctor and date to view the available appointment windows.
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
                5. Medical notes <span className="font-normal tracking-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={medicalProblem}
                onChange={(e) => setMedicalProblem(e.target.value)}
                rows="4"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                placeholder="Describe symptoms, concerns, or any special instructions for your visit."
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading || !selectedTimeSlot}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {submitLoading ? 'Submitting request...' : 'Confirm appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}