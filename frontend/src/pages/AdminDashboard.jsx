import React, { useState, useEffect, useMemo } from 'react';

export default function AdminDashboard() {
    // Admin session and authentication states
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // State array to store doctors loaded from database
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');

    // Dynamic state trackers for live queue and metrics
    const [queueRecords, setQueueRecords] = useState([]);
    const [activeId, setActiveId] = useState(null); 
    const [activeToken, setActiveToken] = useState('None');
    const [activePatientName, setActivePatientName] = useState('None');
    const [waitingCount, setWaitingCount] = useState(0);
    const [servedTodayCount, setServedTodayCount] = useState(0);
    const [avgConsultTime, setAvgConsultTime] = useState('12 mins');
    const [systemLogs, setSystemLogs] = useState([]);
    const [doctorShiftEnd, setDoctorShiftEnd] = useState(null);

    // Set tracker to remove locally completed active patients from table instantly
    const [completedIds, setCompletedIds] = useState(new Set());

    // Input fields for onboarding new doctor profiles
    const [docFirstName, setDocFirstName] = useState('');
    const [docLastName, setDocLastName] = useState('');
    const [docEmail, setDocEmail] = useState('');
    const [docPassword, setDocPassword] = useState('');
    const [docConfirmPassword, setDocConfirmPassword] = useState(''); 
    const [docPhone, setDocPhone] = useState('');
    const [docSpecialization, setDocSpecialization] = useState(''); // Only one state needed now
    const [docLicense, setDocLicense] = useState('');
    const [regSuccess, setRegSuccess] = useState('');
    const [regError, setRegError] = useState('');

    // Fetch master list of registered practitioners from Spring Boot Backend
    const fetchRegisteredDoctors = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/doctors');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setDoctorsList(data);
                    if (data.length > 0 && !selectedDoctorId) {
                        setSelectedDoctorId(data[0].id.toString());
                    }
                }
            }
        } catch (err) {
            console.error("Error pulling doctor array:", err.message);
        }
    };

    // Fetch queue rows and metrics specific to the selected Doctor ID
    const fetchDoctorQueueData = async (docId) => {
        if (!docId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/appointments/doctor-queue/${docId}`);
            const servedResponse = await fetch(`http://localhost:8080/api/appointments/doctor-served-count/${docId}`);

            const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const scheduleResponse = await fetch(`http://localhost:8080/api/doctors/${docId}/schedule?day=${dayOfWeek}`);
            if (scheduleResponse.ok) {
                const schedData = await scheduleResponse.json();
                if (schedData && schedData.endTime) {
                    setDoctorShiftEnd(schedData.endTime);
                }
            }

            if (response.ok) {
                const data = await response.json();

                if (Array.isArray(data)) {
                    const nowStr = new Date().toTimeString().substring(0, 5);
                    const isShiftEnded = doctorShiftEnd && nowStr > doctorShiftEnd.substring(0, 5);

                    const processedData = data.map(record => {
                        const statusUpper = String(record.status).toUpperCase();
                        if (isShiftEnded && ['CONFIRMED', 'WAITING', 'PENDING'].includes(statusUpper)) {
                            return { ...record, status: 'CANCELLED' };
                        }
                        return record;
                    });

                    setQueueRecords(processedData);

                    // Check for 'CALLED' status to sync up with database states
                    const consultingPatients = processedData.filter(r => !completedIds.has(r.id) && r.status === 'CALLED');

                    if (consultingPatients.length > 0) {
                        const latestActive = consultingPatients[consultingPatients.length - 1];
                        setActiveId(latestActive.id);
                        setActiveToken(latestActive.tokenNumber);
                        setActivePatientName(latestActive.patientName);
                    } else {
                        setActiveId(null);
                        setActiveToken('None');
                        setActivePatientName('None');
                    }

                    const waiting = processedData.filter(r => 
                        ['CONFIRMED', 'WAITING', 'PENDING'].includes(String(r.status).toUpperCase())
                    ).length;
                    setWaitingCount(waiting);

                    setSystemLogs([
                        `[SYSTEM]: Core sync active for Doctor Node #${docId}`,
                        `[GATEWAY]: Fetched ${processedData.length} active row elements dynamically.`
                    ]);
                }
            }

            if (servedResponse.ok) {
                const count = await servedResponse.json();
                setServedTodayCount(Number(count));
            }

        } catch (err) {
            console.error("Error loading doctor specific queue tracking logs:", err.message);
        }
    };

    // Clear temporary local completed list when active doctor selection changes
    useEffect(() => {
        setCompletedIds(new Set());
    }, [selectedDoctorId]);

    // Check localStorage session on startup to keep system admin authorized
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role === 'ADMIN') {
                setIsAdminLoggedIn(true);
                setCurrentAdmin(parsedUser);
            }
        }
        fetchRegisteredDoctors();
    }, []);

    // Establish live queue polling loop every 3000ms for accurate real-time display
    useEffect(() => {
        if (selectedDoctorId) {
            fetchDoctorQueueData(selectedDoctorId);
            const liveInterval = setInterval(() => fetchDoctorQueueData(selectedDoctorId), 3000);
            return () => clearInterval(liveInterval);
        }
    }, [selectedDoctorId, completedIds, doctorShiftEnd]);

    // Submit system administrator authentication credentials
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('Invalid Admin Credentials');
            const data = await response.json();
            if (data.role === 'ADMIN') {
                localStorage.setItem('user', JSON.stringify(data));
                setCurrentAdmin(data);
                setIsAdminLoggedIn(true);
                fetchRegisteredDoctors();
            } else {
                throw new Error('Unauthorized.');
            }
        } catch (err) {
            setAuthError(err.message);
        }
    };

    // Process new practitioner account registration payload
    const handleDoctorRegistration = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');

        // Password confirmation validation
        if (docPassword !== docConfirmPassword) {
            setRegError('Passwords do not match. Please verify and try again.');
            return;
        }

        const payload = {
            email: docEmail, 
            password: docPassword, 
            firstName: docFirstName,
            lastName: docLastName, 
            telephoneNumber: docPhone, 
            specialization: docSpecialization,
            specialty: docSpecialization, // Passing the dropdown value to both to satisfy the backend
            licenseNumber: docLicense, 
            createdByAdminId: currentAdmin ? currentAdmin.id : null
        };

        try {
            const response = await fetch('http://localhost:8080/api/admin/register-doctor', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(currentAdmin?.token ? { 'Authorization': `Bearer ${currentAdmin.token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to register doctor.');
            setRegSuccess("Practitioner Profile Committed Successfully!");
            setDocEmail(''); setDocPassword(''); setDocConfirmPassword(''); setDocFirstName(''); setDocLastName('');
            setDocPhone(''); setDocSpecialization(''); setDocLicense('');
            fetchRegisteredDoctors();
        } catch (err) {
            setRegError(err.message);
        }
    };

    // 🎯 FIXED DYNAMIC LAYOUT SORTING MATRIX
    const visibleRecords = useMemo(() => {
        return [...queueRecords].sort((a, b) => {
            const statusA = String(a.status).toUpperCase();
            const statusB = String(b.status).toUpperCase();

            const score = (status) => {
                if (['COMPLETED', 'DONE'].includes(status)) return 1;               // 1. Completed goes to the VERY TOP
                if (['CALLED', 'SERVING'].includes(status)) return 2;               // 2. Serving is next
                if (['CONFIRMED', 'WAITING', 'PENDING'].includes(status)) return 3; // 3. All Waiting patients in one group
                if (status === 'CANCELLED') return 4;                               // 4. Cancelled at the very bottom
                return 5; 
            };

            const scoreA = score(statusA);
            const scoreB = score(statusB);

            // Group Sort (Completed -> Serving -> Waiting)
            if (scoreA !== scoreB) {
                return scoreA - scoreB; 
            }

            // 🎯 CRITICAL FIX: Sort purely by the backend's queueOrder!
            return (a.queueOrder || 0) - (b.queueOrder || 0);
        });
    }, [queueRecords]);

    // Pulling from visibleRecords ensures we start order of numbers chronologically
    const handleCallNextPatient = async () => {
        const nextPatient = visibleRecords.find(r => 
            ['CONFIRMED', 'WAITING', 'PENDING'].includes(String(r.status).toUpperCase()) && !(r.queueOrder > r.tokenNumber)
        ) || visibleRecords.find(r => ['CONFIRMED', 'WAITING', 'PENDING'].includes(String(r.status).toUpperCase()));

        if (!nextPatient) {
            alert("No patients are currently waiting in the queue.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/appointments/${nextPatient.id}/next`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(currentAdmin?.token ? { 'Authorization': `Bearer ${currentAdmin.token}` } : {})
                }
            });
            if (response.ok) {
                if (activeId) {
                    setCompletedIds(prev => new Set(prev).add(activeId));
                }
                fetchDoctorQueueData(selectedDoctorId);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    // CONTROL PANEL OVERRIDE: Global No-Show Event Action Trigger
    const handleGlobalNoShow = async () => {
        if (!activeId) return; 
        try {
            const response = await fetch(`http://localhost:8080/api/appointments/${activeId}/no-show`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(currentAdmin?.token ? { 'Authorization': `Bearer ${currentAdmin.token}` } : {})
                }
            });
            if (response.ok) {
                setActiveId(null);
                fetchDoctorQueueData(selectedDoctorId);
            }
        } catch (err) {
            console.error("Failed handling global no show state update:", err.message);
        }
    };

    const handleCompleteSession = async () => {
        if (!activeId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/appointments/${activeId}/complete`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(currentAdmin?.token ? { 'Authorization': `Bearer ${currentAdmin.token}` } : {})
                }
            });
            if (response.ok) {
                setCompletedIds(prev => new Set(prev).add(activeId));
                setActiveId(null);
                fetchDoctorQueueData(selectedDoctorId);
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    const isQueueEmpty = !queueRecords.some(r => ['CONFIRMED', 'WAITING', 'PENDING'].includes(String(r.status).toUpperCase()));
    const hasActivePatient = queueRecords.some(r => String(r.status).toUpperCase() === 'CALLED');

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-800 antialiased">
            {/* Global Top Workspace Strip */}
            <div className="flex justify-between items-center px-8 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                    <span className="text-slate-900 font-black text-xs uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200/50">
                        Admin Command Center
                    </span>
                </div>
            </div>

            {/* Title Banner */}
            <div className="relative bg-[#0b1329] bg-gradient-to-br from-[#0f172a] via-[#0b1329] to-[#1e1b4b] py-16 px-8 shadow-xl shadow-slate-950/10 border-b border-slate-800/40">
                <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border border-sky-500/20 uppercase shadow-sm">
                            Core Health Operational Node
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black mt-4 mb-2 tracking-tight text-white leading-tight">
                            Patient Queue & Admin Dashboard
                        </h1>
                        <p className="text-slate-400 text-xs md:text-sm font-medium">Welcome back, Administrator</p>
                    </div>

                    {/* Active Practitioner Selector */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col gap-2 min-w-[360px]">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Active Doctor</span>
                        <select
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            className="bg-[#0f172a] text-white border border-slate-700/60 px-4 py-3.5 rounded-xl text-base font-black outline-none cursor-pointer w-full focus:border-blue-500 transition-all shadow-inner"
                        >
                            {doctorsList.map(doc => (
                                <option key={doc.id} value={doc.id} className="text-slate-900 font-extrabold bg-white text-base">
                                    Dr. {doc.firstName} {doc.lastName} — {doc.specialization}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column Stack */}
                    <div className="lg:col-span-2 flex flex-col gap-8">

                        {/* Live Queue Container */}
                        <div className="bg-white rounded-[24px] border border-slate-200/70 p-6 shadow-sm">
                            <div className="border-b border-slate-100 pb-4 mb-5">
                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                    <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600 text-sm">👥</span>
                                    Live Patients Queue
                                </h3>
                            </div>

                            <div className="max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                                <table className="w-full border-collapse text-left">
                                    <thead className="sticky top-0 bg-white z-10 shadow-sm shadow-white">
                                        <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 bg-white">
                                            <th className="pb-3 px-3">Token sequence</th>
                                            <th className="pb-3 px-3">Patient credentials</th>
                                            <th className="pb-3 px-3 text-right">Live workflow status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-bold">
                                        {visibleRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="py-12 px-3 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                    No active patient tokens issued for this practitioner today.
                                                </td>
                                            </tr>
                                        ) : (
                                            visibleRecords.map((record, index) => {
                                                const statusUpper = String(record.status).toUpperCase();
                                                const isCompleted = ['COMPLETED', 'DONE'].includes(statusUpper);
                                                const isCalled = statusUpper === 'CALLED';
                                                const isCancelled = statusUpper === 'CANCELLED';

                                                return (
                                                    <tr key={record.id || index} className="border-b border-slate-100 last:border-none hover:bg-slate-50/70 transition-colors">
                                                        <td className="py-4 px-3 text-blue-600 font-mono text-sm">#{record.tokenNumber}</td>
                                                        <td className="py-4 px-3 text-slate-700 text-sm font-extrabold">{record.patientName}</td>
                                                        <td className="py-4 px-3 text-right">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase border ${
                                                                isCompleted ? 'bg-green-50 text-green-600 border-green-200' :
                                                                isCalled ? 'bg-sky-50 text-sky-600 border-sky-200' :
                                                                isCancelled ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' :
                                                                'bg-amber-50 text-amber-600 border-amber-200'
                                                            }`}>
                                                                {isCompleted ? 'COMPLETED' : isCalled ? 'SERVING' : isCancelled ? 'CANCELLED' : 'WAITING'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Onboarding Form Module */}
                        <div className="bg-white rounded-[24px] border border-slate-200/70 p-6 shadow-sm">
                            <div className="border-b border-slate-100 pb-4 mb-5">
                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                    <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 text-sm">🩺</span>
                                    Onboard New Medical Practitioner
                                </h3>
                            </div>

                            {regSuccess && <div className="text-emerald-600 bg-emerald-50/60 border border-emerald-100 text-xs font-bold p-3.5 rounded-xl mb-5 shadow-sm">✅ {regSuccess}</div>}
                            {regError && <div className="text-rose-600 bg-rose-50/60 border border-rose-100 text-xs font-bold p-3.5 rounded-xl mb-5 shadow-sm">⚠️ {regError}</div>}

                            <form onSubmit={handleDoctorRegistration} className="grid gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="text" placeholder="First Name" value={docFirstName} onChange={(e) => setDocFirstName(e.target.value)} required className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none bg-slate-50/40 text-slate-800" />
                                    <input type="text" placeholder="Last Name" value={docLastName} onChange={(e) => setDocLastName(e.target.value)} required className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none bg-slate-50/40 text-slate-800" />
                                </div>
                                <input type="email" placeholder="Email Address" value={docEmail} onChange={(e) => setDocEmail(e.target.value)} required className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none bg-slate-50/40 text-slate-800" />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="password" placeholder="Access Password" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} required className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none bg-slate-50/40 text-slate-800" />
                                    <input type="password" placeholder="Confirm Password" value={docConfirmPassword} onChange={(e) => setDocConfirmPassword(e.target.value)} required className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none bg-slate-50/40 text-slate-800" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Telephone Sequence" value={docPhone} onChange={(e) => setDocPhone(e.target.value)} className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none bg-slate-50/40 text-slate-800" />
                                    <input type="text" placeholder="Verified License No" value={docLicense} onChange={(e) => setDocLicense(e.target.value)} required className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none bg-slate-50/40 text-slate-800" />
                                </div>
                                
                                <select value={docSpecialization} onChange={(e) => setDocSpecialization(e.target.value)} required className="p-3.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50/40 focus:border-blue-500 outline-none text-slate-600 cursor-pointer">
                                    <option value="">-- Select Specialty Track --</option>
                                    <option value="General Practitioner">General Practitioner (OPD)</option>
                                    <option value="Cardiologist">Cardiologist</option>
                                    <option value="Pediatrician">Pediatrician</option>
                                    <option value="Neurologist">Neurologist</option>
                                </select>

                                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer mt-2">
                                    Commit Practitioner Profile
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Side Control Widgets */}
                    <div className="flex flex-col gap-6">

                        {/* Live Terminal Monitor Component */}
                        <div className="bg-[#0b1329] bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-6 rounded-[24px] text-white shadow-xl shadow-slate-950/20 border border-slate-800/60 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-[10px] tracking-widest uppercase text-sky-400">📢 Live Terminal Status</span>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase animate-pulse">
                                    Active Node
                                </span>
                            </div>

                            <div className="text-center my-6 bg-white/5 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">In Consultation Patient</span>
                                <h3 className="m-0 mt-1.5 mb-4 text-xl font-black tracking-tight text-white leading-tight">
                                    {activePatientName}
                                </h3>
                                <div className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full font-black text-xs border border-blue-400/20">
                                    Token {activeToken === 'None' ? 'None' : `#${activeToken}`}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {hasActivePatient && isQueueEmpty ? (
                                    <button
                                        onClick={handleCompleteSession}
                                        className="w-full p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 border-none flex items-center justify-center gap-2 shadow-md bg-green-600 hover:bg-green-500 text-white cursor-pointer shadow-green-500/20"
                                    >
                                        <span>✔ COMPLETE CONSULTATION</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCallNextPatient}
                                        disabled={isQueueEmpty}
                                        className={`w-full p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 border-none flex items-center justify-center gap-2 shadow-md text-white ${
                                            isQueueEmpty ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 cursor-pointer shadow-blue-500/20'
                                        }`}
                                    >
                                        <span>👤+ CALL NEXT PATIENT</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleGlobalNoShow}
                                    disabled={!hasActivePatient}
                                    className={`w-full p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 border flex items-center justify-center gap-2 ${
                                        !hasActivePatient 
                                            ? 'bg-transparent text-slate-600 border-slate-800 cursor-not-allowed' 
                                            : 'bg-transparent text-red-500 border-red-500 hover:bg-red-500/10 cursor-pointer'
                                    }`}
                                >
                                    <span>❌ MARK CURRENT NO-SHOW</span>
                                </button>
                            </div>
                        </div>

                        {/* Metrics Panel */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl text-center border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-xl inline-block p-2 bg-amber-50 rounded-xl text-amber-600">🕒</span>
                                <div className="text-[11px] text-slate-400 font-bold uppercase mt-3 mb-0.5 tracking-widest">Total Waiting</div>
                                <div className="text-sm font-black text-slate-900">{waitingCount} Patients</div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl text-center border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-xl inline-block p-2 bg-emerald-50 rounded-xl text-emerald-600">👨‍⚕️</span>
                                <div className="text-[11px] text-slate-400 font-bold uppercase mt-3 mb-0.5 tracking-widest">Served Today</div>
                                <div className="text-sm font-black text-slate-900">{servedTodayCount} Patients</div>
                            </div>
                        </div>

                        {/* Extended Operations Analytics Box */}
                        <div className="bg-white rounded-[24px] border border-slate-200/70 p-5 shadow-sm">
                            <h4 className="m-0 mb-4 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100 pb-2">
                                📈 Operational Velocity
                            </h4>
                            <div className="flex justify-between py-2.5 border-b border-slate-100/60 text-xs font-bold">
                                <span className="text-slate-400">Active Medical Staff:</span>
                                <span className="text-slate-800 font-mono">{doctorsList.length} Consultants</span>
                            </div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100/60 text-xs font-bold">
                                <span className="text-slate-400">Avg Consultation Time:</span>
                                <span className="text-emerald-600 font-mono">{avgConsultTime}</span>
                            </div>

                            {/* Live Gateway Diagnostics Monitor */}
                            <div className="mt-5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Live Diagnostic Stream</span>
                                <div className="bg-[#0f172a] p-3 rounded-xl text-[11px] text-emerald-400 max-h-[100px] overflow-y-auto font-mono border border-slate-900 shadow-inner">
                                    {systemLogs.length === 0 ? (
                                        <div className="text-slate-500 font-medium font-mono">[SYSTEM]: Awaiting gateway queue events...</div>
                                    ) : (
                                        systemLogs.map((log, i) => <div key={i} className="mb-1 last:mb-0 font-mono text-emerald-400/90">{log}</div>)
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}