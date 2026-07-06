import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 

export default function BookAppointment({ patientId }) {
  const API_BASE_URL = 'http://localhost:8080/api';
  const location = useLocation(); 

  // Extract variables from router redirect memory state fields
  const redirectedDoctor = location.state?.doctor || null;
  const initialDoctorId = redirectedDoctor?.id || '';
  const initialSpecialization = redirectedDoctor?.specialization || '';

  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedSpecialization, setSelectedSpecialization] = useState(initialSpecialization);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [medicalProblem, setMedicalProblem] = useState('');

  const [loadingSpecializations, setLoadingSpecializations] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [uiMessage, setUiMessage] = useState({ type: '', text: '' });
  
  // 🎯 NEW: State to control the confirmation popup
  const [confirmationData, setConfirmationData] = useState(null);

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

  // Hydrate form options cleanly if redirected from directory with doctor info
  useEffect(() => {
    if (initialSpecialization) {
      setSelectedSpecialization(initialSpecialization);
      setSelectedDate('');
      setAvailableSlots([]);

      setLoadingDoctors(true);
      fetch(`${API_BASE_URL}/appointments/doctors?specialization=${encodeURIComponent(initialSpecialization)}`)
        .then(async res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          const doctorList = Array.isArray(data) ? data : [];
          setDoctors(doctorList);
          
          if (initialDoctorId && doctorList.some(doc => String(doc.id) === String(initialDoctorId))) {
            setSelectedDoctorId(String(initialDoctorId));
          }
        })
        .catch(() => console.error("Could not fetch secondary doctor parameters."))
        .finally(() => setLoadingDoctors(false));
    }
  }, [initialSpecialization, initialDoctorId]);

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

  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
    setSelectedDate('');
    setAvailableSlots([]);
    setUiMessage({ type: '', text: '' });
  };

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

  const handleSlotSelection = (slot) => {
    setSelectedTimeSlot(slot);
    setUiMessage({ type: '', text: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      setUiMessage({ type: 'error', text: 'Please fulfill all booking validation criteria.' });
      return;
    }

    setSubmitLoading(true);
    setUiMessage({ type: '', text: '' });

    let activeId = patientId;
    if (!activeId) {
      try {
        const session = JSON.parse(localStorage.getItem("userSession") || "{}");
        activeId = session.id || session.userId || 1; 
      } catch (err) {
        activeId = 1;
      }
    }

    const formattedTime = selectedTimeSlot.length === 5 ? `${selectedTimeSlot}:00` : selectedTimeSlot;
    
    const payload = {
      doctorId: parseInt(selectedDoctorId),
      appointmentDate: selectedDate,
      appointmentTime: formattedTime, 
      medicalProblem: medicalProblem.trim() || null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Patient-Id': String(activeId)
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        // 🎯 NEW: Grab the doctor's name for the popup
        const bookedDoctor = doctors.find(doc => String(doc.id) === String(selectedDoctorId));
        const docName = bookedDoctor ? (bookedDoctor.name || `${bookedDoctor.firstName} ${bookedDoctor.lastName}`) : `Doctor #${selectedDoctorId}`;

        // 🎯 NEW: Trigger the popup with the booking details
        setConfirmationData({
          doctor: `Dr. ${docName}`,
          date: selectedDate,
          time: formattedTime
        });

        // Reset the form
        setSelectedSpecialization('');
        setSelectedDoctorId('');
        setSelectedDate('');
        setSelectedTimeSlot('');
        setMedicalProblem('');
        setAvailableSlots([]);
        setDoctors([]);
      } else {
        setUiMessage({ type: 'error', text: responseData.message || 'The booking request was rejected by the service. Please review your selection.' });
      }
    } catch {
      setUiMessage({ type: 'error', text: 'The booking service is unreachable right now. Please check connectivity and try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 relative">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)]">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-8 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
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
                    <option key="default-spec" value="">{loadingSpecializations ? '-- Loading specializations --' : '-- Choose Field Specialty --'}</option>
                    {specializations.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
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
                  <option key="default-doc" value="">{loadingDoctors ? '-- Loading doctors --' : '-- Select Available Doctor --'}</option>
                  {doctors.map(doc => <option key={doc.id} value={doc.id}>Dr. {doc.name || `${doc.firstName} ${doc.lastName}`}</option>)}
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
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSlotSelection(slot)}
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

      {/* 🎯 NEW: Success Confirmation Modal Popup */}
      {confirmationData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 space-y-6 text-center bg-white border border-slate-100 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-center w-16 h-16 mx-auto text-emerald-600 bg-emerald-50 rounded-full shadow-inner">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Booking Confirmed!</h3>
              <p className="px-2 mt-1.5 text-sm text-slate-500">
                Your consultation has been successfully scheduled.
              </p>
            </div>
            
            <div className="p-4 text-left bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Doctor</span>
                <span className="font-bold text-slate-800">{confirmationData.doctor}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Date</span>
                <span className="font-bold text-slate-800">{confirmationData.date}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Time</span>
                <span className="font-bold text-emerald-600">{confirmationData.time.substring(0, 5)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setConfirmationData(null)}
                className="w-full py-3 text-sm font-bold tracking-widest text-white uppercase transition rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}