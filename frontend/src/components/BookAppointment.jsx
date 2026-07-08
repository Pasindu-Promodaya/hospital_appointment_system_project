import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 

export default function BookAppointment({ patientId }) {
  const { user } = useAuth(); 
  const API_BASE_URL = 'http://localhost:8080/api';
  const location = useLocation(); 

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
  const [confirmationData, setConfirmationData] = useState(null);

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
        setUiMessage({ type: 'error', text: 'The appointment service is temporarily unavailable.' });
      })
      .finally(() => setLoadingSpecializations(false));
  }, []);

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
        .catch(() => console.error("Could not fetch doctor parameters."))
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
          if (!res.ok) throw new Error('Unable to fetch doctors.');
          return res.json();
        })
        .then(data => {
          setDoctors(Array.isArray(data) ? data : []);
        })
        .catch(() => setUiMessage({ type: 'error', text: 'Unable to load doctors.' }))
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
          if (!res.ok) throw new Error('Unable to fetch slots.');
          return res.json();
        })
        .then(slots => {
          setAvailableSlots(Array.isArray(slots) ? slots : []);
        })
        .catch(() => setUiMessage({ type: 'error', text: 'Unable to load available windows.' }))
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

    let activeId = patientId || user?.patientId || user?.linkedPatientId;
    let activeEmail = user?.email || ""; 
    
    // Fallback block to scrape storage strings if variables are running asynchronous handshakes
    try {
      const storedSession = localStorage.getItem("userSession");
      const flatAuthUser = localStorage.getItem("authUser");
      
      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (!activeId) activeId = session.patientId || session.linkedPatientId;
        if (!activeEmail) activeEmail = session.email;
      } else if (flatAuthUser) {
        const authUserObj = JSON.parse(flatAuthUser);
        if (!activeId) activeId = authUserObj.patientId || authUserObj.linkedPatientId;
        if (!activeEmail) activeEmail = authUserObj.email;
      }
    } catch (err) {
      console.error("Session profile parsing lookup error:", err);
    }
    
    if (!activeId) {
      setUiMessage({ 
        type: 'error', 
        text: 'Identity Conflict: Your current account session is missing a verified Patient Profile token. Please sign out and sign back in to refresh your workspace data.' 
      });
      setSubmitLoading(false);
      return;
    }

    const formattedTime = selectedTimeSlot.length === 5 ? `${selectedTimeSlot}:00` : selectedTimeSlot;
    
    //: Included patientEmail to feed your secondary backend logic cleanly!
    const payload = {
      doctorId: parseInt(selectedDoctorId),
      patientId: parseInt(activeId),
      patientEmail: activeEmail || null, 
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
        const bookedDoctor = doctors.find(doc => String(doc.id) === String(selectedDoctorId));
        const docName = bookedDoctor ? (bookedDoctor.name || `${bookedDoctor.firstName} ${bookedDoctor.lastName}`) : `Doctor #${selectedDoctorId}`;

        setConfirmationData({
          doctor: `Dr. ${docName}`,
          date: selectedDate,
          time: formattedTime
        });

        setSelectedSpecialization('');
        setSelectedDoctorId('');
        setSelectedDate('');
        setSelectedTimeSlot('');
        setMedicalProblem('');
        setAvailableSlots([]);
        setDoctors([]);
      } else {
        setUiMessage({ type: 'error', text: responseData.message || 'The booking request was rejected by the service.' });
      }
    } catch {
      setUiMessage({ type: 'error', text: 'Booking transmission bridge lost. Check backend gateway logs.' });
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
              uiMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
              uiMessage.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' :
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
                    {specializations.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
                  </select>
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
                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      {slot.substring(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-400">
                  Select a doctor and date to view available slots.
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4"
                placeholder="Describe symptoms or concerns."
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading || !selectedTimeSlot}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400"
            >
              {submitLoading ? 'Submitting request...' : 'Confirm appointment'}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 space-y-6 text-center bg-white rounded-3xl shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto text-emerald-600 bg-emerald-50 rounded-full">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Booking Confirmed!</h3>
            </div>
            <div className="p-4 text-left bg-slate-50 rounded-2xl border space-y-3">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="font-bold text-[11px] text-slate-400 uppercase">Doctor</span>
                <span className="font-bold text-slate-800">{confirmationData.doctor}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="font-bold text-[11px] text-slate-400 uppercase">Date</span>
                <span className="font-bold text-slate-800">{confirmationData.date}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[11px] text-slate-400 uppercase">Time</span>
                <span className="font-bold text-emerald-600">{confirmationData.time.substring(0, 5)}</span>
              </div>
            </div>
            <button onClick={() => setConfirmationData(null)} className="w-full py-3 text-sm font-bold tracking-widest text-white uppercase rounded-2xl bg-slate-900">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}