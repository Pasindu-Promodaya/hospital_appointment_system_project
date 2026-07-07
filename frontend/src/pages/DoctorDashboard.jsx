import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLING = {
  PENDING: { label: 'Waiting', bg: 'bg-amber-100', color: 'text-amber-700' },
  CONFIRMED: { label: 'Waiting', bg: 'bg-amber-100', color: 'text-amber-700' }, 
  WAITING: { label: 'Waiting', bg: 'bg-amber-100', color: 'text-amber-700' },
  CALLED: { label: 'Serving', bg: 'bg-sky-100', color: 'text-sky-600' }, 
  SERVING: { label: 'Serving', bg: 'bg-sky-100', color: 'text-sky-600' },
  COMPLETED: { label: 'Completed', bg: 'bg-green-100', color: 'text-green-600' },
  DONE: { label: 'Completed', bg: 'bg-green-100', color: 'text-green-600' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-100', color: 'text-rose-600' },
};

function initials(fullName) {
  if (!fullName) return 'DR';
  const parts = fullName.replace(/^Dr\.\s*/i, '').split(' ').filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function DoctorDashboard() {
  const { user } = useAuth();

  const sessionCtx = useMemo(() => {
    const session = { token: null, doctorId: null, email: null };
    try {
      if (user?.token) {
        session.token = user.token;
        session.doctorId = user.doctorId || user.id || user.linkedDoctorId;
        session.email = user.email || user.username;
        return session;
      }
      const flatToken = localStorage.getItem('token');
      if (flatToken) {
        session.token = flatToken;
        session.doctorId = localStorage.getItem('doctorId') || localStorage.getItem('userId');
        session.email = localStorage.getItem('email') || localStorage.getItem('username');
        return session;
      }
      const userSessionStr = localStorage.getItem('userSession');
      if (userSessionStr) {
        const parsed = JSON.parse(userSessionStr);
        session.token = parsed.token;
        session.doctorId = parsed.doctorId || parsed.id || parsed.userId;
        session.email = parsed.email || parsed.username;
        return session;
      }
    } catch (e) {
      console.error("Session lookup exception context:", e);
    }
    return session;
  }, [user]);

  const token = sessionCtx.token;
  const loggedInEmail = sessionCtx.email;

  const [currentDoctorId, setCurrentDoctorId] = useState(sessionCtx.doctorId || null);
  const [profileMeta, setProfileMeta] = useState({ 
    name: "Medical Professional",
    specialization: "Cardiology", 
    licenseNumber: "Verified" 
  });

  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isSaving, setIsSaving] = useState(false);

  const [queue, setQueue] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);

  useEffect(() => {
    if (sessionCtx.doctorId && !currentDoctorId) {
      setCurrentDoctorId(sessionCtx.doctorId);
    }
  }, [sessionCtx.doctorId, currentDoctorId]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    fetch('http://localhost:8080/api/doctors')
      .then(res => res.json())
      .then(doctorsList => {
        if (!isMounted) return;
        if (Array.isArray(doctorsList) && loggedInEmail) {
          const matchedDoc = doctorsList.find(
            doc => String(doc.email).toLowerCase().trim() === String(loggedInEmail).toLowerCase().trim()
          );

          if (matchedDoc) {
            setCurrentDoctorId(matchedDoc.id);
            setProfileMeta({
              name: matchedDoc.name || `Dr. ${matchedDoc.firstName} ${matchedDoc.lastName}`,
              specialization: matchedDoc.specialization || matchedDoc.specialty || 'Cardiology',
              licenseNumber: matchedDoc.licenseNumber || matchedDoc.license_number || 'Verified'
            });
            return;
          }
        }
        
        const fallbackId = currentDoctorId || 1;
        fetch(`http://localhost:8080/api/doctors/${fallbackId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (!isMounted || !data) return;
            setProfileMeta({
              name: data.name || `Dr. ${data.firstName} ${data.lastName}`,
              specialization: data.specialization || data.specialty || 'General Medicine',
              licenseNumber: data.licenseNumber || data.license_number || 'MC-12743'
            });
            if (!currentDoctorId) setCurrentDoctorId(data.id);
          });
      })
      .catch(err => console.error("Could not sync real database profile markers:", err));

    return () => { isMounted = false; };
  }, [token, loggedInEmail, currentDoctorId]);

  const getStatus = useCallback((p) => String(p?.status || '').toUpperCase(), []);
  const getTime = useCallback((p) => p?.appointmentTime || p?.timeSlot || '—', []);
  const getToken = useCallback((p) => p?.tokenNumber || '—', []);

  const fetchTodayQueue = useCallback(async () => {
    const activeDoctorId = currentDoctorId || sessionCtx.doctorId || 1;

    try {
      const response = await fetch(`http://localhost:8080/api/appointments/doctor-queue/${activeDoctorId}`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const recordsList = await response.json();
        const verifiedList = Array.isArray(recordsList) ? recordsList : [];
        setQueue(verifiedList);
        
        const currentlyServing = verifiedList.find(
          (p) => ['CALLED', 'SERVING'].includes(getStatus(p))
        );
        if (currentlyServing && !selectedId) {
          setSelectedId(currentlyServing.id);
        }
      }
    } catch (error) {
      console.error('Queue synchronization network exception:', error);
    } finally {
      setIsLoadingQueue(false);
    }
  }, [token, currentDoctorId, selectedId, sessionCtx.doctorId, getStatus]);

  useEffect(() => {
    fetchTodayQueue();
    const interval = setInterval(fetchTodayQueue, 10000); 
    return () => clearInterval(interval);
  }, [fetchTodayQueue]);

  const serving = useMemo(() => queue.find((p) => ['CALLED', 'SERVING'].includes(getStatus(p))), [queue, getStatus]);
  const waitingList = useMemo(() => queue.filter((p) => ['CONFIRMED', 'WAITING'].includes(getStatus(p))), [queue, getStatus]);
  const seenToday = useMemo(() => queue.filter((p) => ['COMPLETED', 'DONE'].includes(getStatus(p))).length, [queue, getStatus]);
  
  const selectedPatient = queue.find((p) => p.id === selectedId) || serving;

  const visibleQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      const statusA = getStatus(a);
      const statusB = getStatus(b);

      const score = (status) => {
        if (['COMPLETED', 'DONE'].includes(status)) return 1;
        if (['CALLED', 'SERVING'].includes(status)) return 2;
        if (['CONFIRMED', 'WAITING'].includes(status)) return 3;
        if (status === 'PENDING') return 4; 
        return 5; 
      };

      if (score(statusA) !== score(statusB)) {
        return score(statusA) - score(statusB);
      }
      
      return (a.queueOrder || 0) - (b.queueOrder || 0);
    });
  }, [queue, getStatus]);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (isSaving || !currentDoctorId) return;

    if (endTime <= startTime) {
      alert(' End time must be after start time.');
      return;
    }

    const scheduleData = {
      doctor: { id: currentDoctorId },
      dayOfWeek: dayOfWeek,
      startTime: startTime + ":00", 
      endTime: endTime + ":00",
      slotDurationMinutes: 15
    };

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8080/api/doctors/schedules', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData),
      });

      if (response.ok) {
        alert(`🎯 Roster published successfully for ${dayOfWeek}!`);
      } else {
        alert('⚠️ Configuration rejected. Check backend terminal for parsing limits.');
      }
    } catch (error) {
      console.error('Handshake error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  async function handleCallNext() {
    const nextPatient = waitingList[0] || queue.find(p => getStatus(p) === 'PENDING');
    if (!nextPatient) return;
    try {
      const response = await fetch(`http://localhost:8080/api/appointments/${nextPatient.id}/next`, {
        method: 'PUT',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (response.ok) {
        setSelectedId(nextPatient.id);
        fetchTodayQueue();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCompleteSession() {
    if (!serving) return;
    try {
      const response = await fetch(`http://localhost:8080/api/appointments/${serving.id}/complete`, {
        method: 'PUT',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (response.ok) {
        setSelectedId(null);
        fetchTodayQueue();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleNoShow() {
    if (!serving) return;
    try {
      const response = await fetch(`http://localhost:8080/api/appointments/${serving.id}/no-show`, {
        method: 'PUT',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (response.ok) {
        setSelectedId(null);
        fetchTodayQueue(); 
      }
    } catch (error) {
      console.error(error);
    }
  }

  const today = useMemo(() => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }), []);

  const isQueueEmpty = waitingList.length === 0 && !queue.some(p => getStatus(p) === 'PENDING');

  return (
    <div className="flex flex-col gap-6">
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-xl font-bold text-sky-600">
            {initials(profileMeta.name)}
          </div>
          <div>
            <h2 className="m-0 text-slate-800 text-2xl font-bold">Welcome Back, {profileMeta.name}</h2>
            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-md mt-1">
              🔬 {profileMeta.specialization} &middot; Registry: {profileMeta.licenseNumber} (ID: {currentDoctorId || 'Syncing...'})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 font-medium">📆 {today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="m-0 mb-4 text-slate-800 text-base font-bold">📅 Configure Weekly Work Roster</h3>
          <form onSubmit={handleSaveSchedule} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-600">Select Operating Day:</label>
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none bg-slate-50 text-slate-800 focus:border-blue-500">
                <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1.5 text-xs font-semibold text-slate-600">Start Shift:</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none bg-slate-50 text-slate-800 focus:border-blue-500" />
              </div>
              <div className="flex-1">
                <label className="block mb-1.5 text-xs font-semibold text-slate-600">End Shift:</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none bg-slate-50 text-slate-800 focus:border-blue-500" />
              </div>
            </div>
            <button type="submit" disabled={isSaving || !currentDoctorId} className={`w-full py-3 rounded-lg font-semibold text-sm mt-2 text-center transition-colors ${isSaving || !currentDoctorId ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'}`}>
              {isSaving ? '⏳ Publishing...' : 'Publish Active Roster'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-semibold mb-1">Waiting Now</div>
              <div className="text-2xl font-bold text-slate-800">{waitingList.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-semibold mb-1">Seen Today</div>
              <div className="text-2xl font-bold text-green-600">{seenToday}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-400 font-semibold mb-1">Now Serving</div>
              <div className="text-xl font-bold font-mono text-sky-600">
                {serving ? getToken(serving) : '—'}
              </div>
            </div>
          </div>

          <div className="bg-slate-800 text-white p-5 rounded-xl flex flex-col justify-between flex-1">
            <div className="flex justify-between items-center border-b border-dashed border-slate-700 pb-2.5 mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Current In-Room Token</span>
              {serving && <span className="text-[11px] bg-green-600 text-white px-2 py-0.5 rounded font-semibold animate-pulse">● Live</span>}
            </div>
            <div className="my-2">
              {serving ? (
                <>
                  <div className="font-mono text-3xl font-bold text-sky-400 tracking-wider">
                    {getToken(serving)}
                  </div>
                  <div className="text-base font-semibold mt-1">
                    {serving.patientName || 'Registered Patient'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ⏱️ Time: {getTime(serving)} &middot; Symptoms: {serving.medicalProblem || 'General Consultation'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400">No clinical patient in treatment room.</div>
              )}
            </div>
            
            <div className="flex gap-3 border-t border-slate-700 pt-3 mt-2.5">
              {serving && isQueueEmpty ? (
                <button 
                  type="button" 
                  onClick={handleCompleteSession} 
                  className="flex-1 py-2.5 rounded-md font-semibold text-xs border-none bg-green-600 hover:bg-green-700 text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  ✔ Complete Consultation
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleCallNext} 
                  disabled={isQueueEmpty} 
                  className={`flex-1 py-2.5 rounded-md font-semibold text-xs border-none flex items-center justify-center gap-1.5 ${isQueueEmpty ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'}`}
                >
                  📢 Call Next
                </button>
              )}
              <button type="button" onClick={handleNoShow} disabled={!serving} className={`bg-transparent px-4 py-2.5 rounded-md font-semibold text-xs border ${!serving ? 'text-slate-600 border-slate-700 cursor-not-allowed' : 'text-red-500 border-red-500 hover:bg-red-500/10 cursor-pointer'}`}>❌ No-Show</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">📋 Active Operations Queue Streams</span>
          </div>
          <div className="flex flex-col">
            {isLoadingQueue ? (
              <div className="py-6 text-slate-400 text-sm text-center">⏳ Synchronizing data stream...</div>
            ) : visibleQueue.length === 0 ? (
              <div className="py-6 text-slate-400 text-sm text-center">No appointments booked today.</div>
            ) : (
              visibleQueue.map((patient) => {
                const normalizedStatus = getStatus(patient);
                const config = STATUS_STYLING[normalizedStatus] || STATUS_STYLING.PENDING;
                return (
                  <button key={patient.id} type="button" onClick={() => setSelectedId(patient.id)} className={`w-full flex items-center gap-4 px-5 py-3.5 text-left border-none border-b border-slate-50 cursor-pointer transition-colors ${patient.id === selectedId ? 'bg-green-50' : 'bg-transparent hover:bg-slate-50'}`}>
                    <span className="font-mono text-xs font-bold text-slate-600 w-[70px]">
                      {getToken(patient)}
                    </span>
                    <div className="flex-1">
                      {/* 🎯 FIXED: Replaced fallback indicators to explicitly load the patientName text value */}
                      <span className="block text-sm font-semibold text-slate-800">
                        {patient.patientName || 'Unknown Patient'}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        🕒 {getTime(patient)}
                      </span>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md min-w-[65px] text-center ${config.bg} ${config.color}`}>{config.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-6">
          <p className="m-0 mb-4 text-xs font-bold text-slate-500 uppercase tracking-wide">👤 Patient Medical Record Card</p>
          {selectedPatient ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
                <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                  {initials(selectedPatient.patientName)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {selectedPatient.patientName || 'Unknown Patient'}
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${(STATUS_STYLING[getStatus(selectedPatient)] || STATUS_STYLING.PENDING).bg} ${(STATUS_STYLING[getStatus(selectedPatient)] || STATUS_STYLING.PENDING).color}`}>
                    {(STATUS_STYLING[getStatus(selectedPatient)] || STATUS_STYLING.PENDING).label}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400">Roster Ticket:</span><strong className="font-mono text-slate-700">{getToken(selectedPatient)}</strong></div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400">Time Allocation:</span><span className="text-slate-700 font-medium">{getTime(selectedPatient)}</span></div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400">Contact Number:</span><span className="text-sky-600 font-medium">{selectedPatient.patientPhone || 'Not Provided'}</span></div>
                <div className="flex justify-between pb-1"><span className="text-slate-400">Email Address:</span><span className="text-sky-600 font-medium">{selectedPatient.patientEmail || 'Not Provided'}</span></div>
              </div>
              <div className="border-t border-slate-100 pt-3.5 mt-1">
                <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Primary Symptoms</span>
                <p className="m-0 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{selectedPatient.medicalProblem || 'No clinical remarks recorded.'}"
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs m-0">Select a patient card to inspect records.</p>
          )}
        </div>
      </div>
    </div>
  );
}