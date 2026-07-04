import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
    // Admin session states
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Dynamic Database Dropdown Array
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');

    // Live Queue Metrics
    const [queueRecords, setQueueRecords] = useState([]);
    const [activeToken, setActiveToken] = useState('None');
    const [activePatientName, setActivePatientName] = useState('None');
    const [waitingCount, setWaitingCount] = useState(0);
    const [servedTodayCount, setServedTodayCount] = useState(0);
    const [avgConsultTime, setAvgConsultTime] = useState('0 mins');
    const [systemLogs, setSystemLogs] = useState([]);

    // Doctor Registration Fields
    const [docEmail, setDocEmail] = useState('');
    const [docPassword, setDocPassword] = useState('');
    const [docFirstName, setDocFirstName] = useState('');
    const [docLastName, setDocLastName] = useState('');
    const [docPhone, setDocPhone] = useState('');
    const [docSpecialization, setDocSpecialization] = useState('');
    const [docLicense, setDocLicense] = useState('');
    const [regSuccess, setRegSuccess] = useState('');
    const [regError, setRegError] = useState('');

    // Fetch master list of registered practitioners
    const fetchRegisteredDoctors = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/doctors');
            if (response.ok) {
                const data = await response.json();
                setDoctorsList(data);
                if (data.length > 0 && !selectedDoctorId) {
                    setSelectedDoctorId(data[0].id.toString());
                }
            }
        } catch (err) {
            console.error("Error pulling doctor array:", err.message);
            const fallback = [
                { id: 1, firstName: "Kasun", lastName: "Rathnayaka", specialization: "General Practitioner (OPD)" },
                { id: 2, firstName: "Nimal", lastName: "Ekanayaka", specialization: "Dental" },
                { id: 3, firstName: "Amal", lastName: "Perera", specialization: "Pediatric" }
            ];
            setDoctorsList(fallback);
            if (!selectedDoctorId) setSelectedDoctorId('1');
        }
    };

    // Fetch metrics and table rows specific to the selected Doctor ID
    const fetchDoctorQueueData = async (docId) => {
        if (!docId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/queue/status/${docId}`);
            if (response.ok) {
                const data = await response.json();
                setQueueRecords(data.tableRecords || []);
                setActiveToken(data.activeToken || 'None');
                setActivePatientName(data.activePatientName || 'None');
                setWaitingCount(data.waitingCount || 0);
                setServedTodayCount(data.servedTodayCount || 0);
                setAvgConsultTime(data.averageConsultationTime || '12 mins');
                setSystemLogs(data.recentAuditLogs || []);
            }
        } catch (err) {
            console.error("Error loading doctor specific queue tracking logs:", err.message);
        }
    };

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

    useEffect(() => {
        if (selectedDoctorId) {
            fetchDoctorQueueData(selectedDoctorId);
            const liveInterval = setInterval(() => fetchDoctorQueueData(selectedDoctorId), 3000);
            return () => clearInterval(liveInterval);
        }
    }, [selectedDoctorId]);

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

    const handleDoctorRegistration = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');
        const payload = {
            email: docEmail, password: docPassword, firstName: docFirstName,
            lastName: docLastName, telephoneNumber: docPhone, specialization: docSpecialization,
            licenseNumber: docLicense, createdByAdminId: currentAdmin ? currentAdmin.id : null
        };
        try {
            const response = await fetch('http://localhost:8080/api/admin/register-doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const resultText = await response.text();
            if (!response.ok) throw new Error(resultText || 'Failed to register doctor.');
            setRegSuccess(resultText);
            setDocEmail(''); setDocPassword(''); setDocFirstName(''); setDocLastName('');
            setDocPhone(''); setDocSpecialization(''); setDocLicense('');
            fetchRegisteredDoctors();
        } catch (err) {
            setRegError(err.message);
        }
    };

    const handleCallNextPatient = async () => {
        if (!isAdminLoggedIn || !currentAdmin || waitingCount === 0) return;
        try {
            const response = await fetch(`http://localhost:8080/api/queue/call-next/${selectedDoctorId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Admin-Id': currentAdmin.id }
            });
            if (!response.ok) throw new Error('Failed to forward token stack pointer.');
            fetchDoctorQueueData(selectedDoctorId);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsAdminLoggedIn(false);
        setCurrentAdmin(null);
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Top Workspace Bar Strip */}
            <div className="flex justify-between items-center px-10 py-3.5 border-b border-slate-200 bg-white">
                <span className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 text-sm tracking-wide">
                    ADMIN WORKSPACE
                </span>
                <div>
                    {isAdminLoggedIn ? (
                        <button onClick={handleLogout} className="border border-rose-500 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-md font-semibold cursor-pointer text-xs transition-colors hover:bg-rose-100">
                            Sign Out 🚪
                        </button>
                    ) : (
                        <button className="border border-blue-600 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-semibold text-xs">
                            Staff Login 🔐
                        </button>
                    )}
                </div>
            </div>

            <div className="p-10 max-w-[1400px] mx-auto">
                {/* Title Segment */}
                <div className="mb-8">
                    <h1 className="m-0 text-3xl font-extrabold text-slate-900 tracking-tight">Patient Queue & Admin Dashboard</h1>
                    <p className="m-0 mt-1.5 text-slate-500 text-sm font-medium">
                        {isAdminLoggedIn ? `Welcome back, Admin (ID: ${currentAdmin?.id})` : "Welcome back, Mahima"}
                    </p>
                </div>

                {/* Dashboard Core Interface Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Panel Set (Spans 2 columns) */}
                    <div className="lg:col-span-2 flex flex-col gap-8">

                        {/* Live Patient Queue Container with Dropdown */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                                <h3 className="m-0 text-lg font-bold text-slate-900 flex items-center gap-2">
                                    👥 Live Patient Queue
                                </h3>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Select Practitioner:</span>
                                    <select
                                        value={selectedDoctorId}
                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                        className="bg-slate-100 text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer"
                                    >
                                        {doctorsList.map(doc => (
                                            <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName} ({doc.specialization?.split(' ')[0]})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                    <tr className="text-slate-400 text-xs font-bold uppercase border-b border-slate-100">
                                        <th className="py-3 px-2">Token No</th>
                                        <th className="py-3 px-2">Patient Name</th>
                                        <th className="py-3 px-2">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="text-sm font-semibold">
                                    {queueRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-6 px-2 text-center text-slate-400 font-medium">
                                                No active patient tokens issued for this practitioner today.
                                            </td>
                                        </tr>
                                    ) : (
                                        queueRecords.map((record, index) => (
                                            <tr key={index} className="border-b border-slate-100 last:border-none">
                                                <td className="py-4 px-2 text-blue-600">#{record.tokenNumber}</td>
                                                <td className="py-4 px-2 text-slate-700">{record.patientName}</td>
                                                <td className="py-4 px-2">
                                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                            record.status === 'IN_CONSULTATION'
                                                                ? 'bg-green-50 text-green-600'
                                                                : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                            {record.status.replace('_', ' ')}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Onboarding Input Container Form */}
                        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
                            {!isAdminLoggedIn ? (
                                <div className="text-center py-5">
                                    <h3 className="text-slate-900 font-bold mb-2 text-base">🔒 Protected Registration Space</h3>
                                    <p className="text-slate-500 text-sm mb-5">Please authenticate as an admin to register doctors.</p>
                                    {authError && <div className="text-rose-600 bg-rose-50 text-xs font-semibold p-3 rounded-lg mb-4">{authError}</div>}
                                    <form onSubmit={handleAdminLogin} className="max-w-[360px] mx-auto flex flex-col gap-3">
                                        <input type="email" placeholder="admin@careflow.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                        <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg font-bold text-sm cursor-pointer transition-colors hover:bg-blue-700">Login as Admin</button>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <h3 className="m-0 mb-5 text-slate-900 text-lg font-bold border-b border-slate-100 pb-3">🩺 Register New Medical Practitioner</h3>
                                    {regSuccess && <div className="text-green-600 bg-green-50 text-xs font-semibold p-3 rounded-lg mb-4">{regSuccess}</div>}
                                    {regError && <div className="text-rose-600 bg-rose-50 text-xs font-semibold p-3 rounded-lg mb-4">{regError}</div>}
                                    <form onSubmit={handleDoctorRegistration} className="grid gap-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input type="text" placeholder="First Name" value={docFirstName} onChange={(e) => setDocFirstName(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                            <input type="text" placeholder="Last Name" value={docLastName} onChange={(e) => setDocLastName(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                        <input type="email" placeholder="Email Address" value={docEmail} onChange={(e) => setDocEmail(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                        <input type="password" placeholder="Access Password" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Telephone" value={docPhone} onChange={(e) => setDocPhone(e.target.value)} className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                            <input type="text" placeholder="License No" value={docLicense} onChange={(e) => setDocLicense(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                        <select value={docSpecialization} onChange={(e) => setDocSpecialization(e.target.value)} required className="p-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:border-blue-500 outline-none text-slate-700 font-medium">
                                            <option value="">-- Select Specialization --</option>
                                            <option value="General Practitioner">General Practitioner (OPD)</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Pediatrician">Pediatrician</option>
                                            <option value="Neurologist">Neurologist</option>
                                        </select>
                                        <button type="submit" className="bg-green-600 text-white p-3 rounded-lg font-bold text-sm cursor-pointer transition-colors hover:bg-green-700 mt-2">Add Practitioner Profile</button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column Core Side Widgets (Spans 1 column) */}
                    <div className="flex flex-col gap-5">

                        {/* Streamlined Live Terminal Monitor Deck */}
                        <div className="bg-blue-600 p-6 rounded-2xl color text-white shadow-md shadow-blue-600/10">
                            <div className="flex justify-between items-center mb-5">
                                <span className="font-bold text-xs tracking-wider opacity-90 uppercase">📢 Live Terminal Status</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">Active Node</span>
                            </div>

                            <div className="text-center my-6">
                                <span className="text-[10px] opacity-75 tracking-wider font-bold uppercase">In Consultation Patient</span>
                                <h3 className="m-0 mt-1 mb-3.5 text-2xl font-black tracking-tight">{activePatientName}</h3>
                                <div className="inline-block bg-white text-blue-600 px-5 py-1.5 rounded-full font-extrabold text-sm shadow-sm">
                                    Token {activeToken === 'None' ? 'None' : `#${activeToken}`}
                                </div>
                            </div>

                            <button
                                onClick={handleCallNextPatient}
                                disabled={!isAdminLoggedIn || waitingCount === 0}
                                className={`w-full p-3.5 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-200 border-none ${
                                    (isAdminLoggedIn && waitingCount > 0)
                                        ? 'bg-white text-blue-600 cursor-pointer hover:bg-slate-50'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                👤+ CALL NEXT PATIENT
                            </button>
                        </div>

                        {/* Summary Analytics Deck Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl text-center border border-slate-200 shadow-sm">
                                <span className="text-2xl">🕒</span>
                                <div className="text-[10px] color text-slate-400 font-bold uppercase mt-1.5 mb-0.5 tracking-wider">Total Waiting</div>
                                <div className="text-base font-extrabold text-slate-900">{waitingCount} Patients</div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl text-center border border-slate-200 shadow-sm">
                                <span className="text-2xl">👨‍⚕️</span>
                                <div className="text-[10px] color text-slate-400 font-bold uppercase mt-1.5 mb-0.5 tracking-wider">Served Today</div>
                                <div className="text-base font-extrabold text-slate-900">{servedTodayCount} Patients</div>
                            </div>
                        </div>

                        {/* Extended Operations Analytics Box */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="m-0 mb-3 text-xs text-slate-500 uppercase font-bold tracking-wider">📈 Operational Velocity</h4>
                            <div className="flex justify-between py-2.5 border-b border-slate-100 text-xs">
                                <span className="text-slate-400 font-medium">Active Medical Staff:</span>
                                <span className="text-slate-800 font-bold">{doctorsList.length} Consultants</span>
                            </div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100 text-xs">
                                <span className="text-slate-400 font-medium">Avg Consultation Time:</span>
                                <span className="text-green-600 font-bold">{avgConsultTime}</span>
                            </div>

                            {/* Live System Operation Logs */}
                            <div className="mt-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live System Logs</span>
                                <div className="bg-slate-50 p-2.5 rounded-lg mt-1.5 text-xs text-slate-600 max-h-[80px] overflow-y-auto font-mono leading-relaxed border border-slate-100">
                                    {systemLogs.length === 0 ? (
                                        <div className="text-slate-400 font-medium">[SYSTEM]: Awaiting queue events...</div>
                                    ) : (
                                        systemLogs.map((log, i) => <div key={i} className="mb-1 last:mb-0">{log}</div>)
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