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
            const response = await fetch('http://localhost:8080/api/admin/doctors'); // Ensure this route is open in your SecurityConfig
            if (response.ok) {
                const data = await response.json();
                setDoctorsList(data);
                if (data.length > 0 && !selectedDoctorId) {
                    setSelectedDoctorId(data[0].id.toString());
                }
            }
        } catch (err) {
            console.error("Error pulling doctor array:", err.message);
            // Fallback mock array if database records are empty
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

    // Polling effect loops automatically every 3 seconds to keep counters synchronized live
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
            fetchRegisteredDoctors(); // Refresh top dropdown array list instantly
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
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
            {/* Top Workspace Bar Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                <span style={{ color: '#2563eb', fontWeight: '700', borderBottom: '2px solid #2563eb', paddingBottom: '4px', fontSize: '14px' }}>
                    ADMIN Workspace
                </span>
                <div>
                    {isAdminLoggedIn ? (
                        <button onClick={handleLogout} style={{ border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                            Sign Out 🚪
                        </button>
                    ) : (
                        <button style={{ border: '1px solid #2563eb', backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}>
                            Staff Login 🔐
                        </button>
                    )}
                </div>
            </div>

            <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Title Segment */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>Patient Queue & Admin Dashboard</h1>
                    <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '15px' }}>
                        {isAdminLoggedIn ? `Welcome back, Admin (ID: ${currentAdmin?.id})` : "Welcome back, Mahima"}
                    </p>
                </div>

                {/* Dashboard Core Interface Layout Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>

                    {/* Left Panel Set */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                        {/* Live Patient Queue Container with Built-in filtering Dropdown */}
                        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    👥 Live Patient Queue
                                </h3>
                                {/* Integrated Action Filter Dropdown */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Select Practitioner:</span>
                                    <select
                                        value={selectedDoctorId}
                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                        style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                                    >
                                        {doctorsList.map(doc => (
                                            <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName} ({doc.specialization?.split(' ')[0]})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                <tr style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '12px 8px' }}>Token No</th>
                                    <th style={{ padding: '12px 8px' }}>Patient Name</th>
                                    <th style={{ padding: '12px 8px' }}>Status</th>
                                </tr>
                                </thead>
                                <tbody style={{ fontSize: '14px', fontWeight: '600' }}>
                                {queueRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '24px 8px', textalign: 'center', color: '#94a3b8', fontWeight: '500' }}>
                                            No active patient tokens issued for this practitioner today.
                                        </td>
                                    </tr>
                                ) : (
                                    queueRecords.map((record, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px 8px', color: '#2563eb' }}>#{record.tokenNumber}</td>
                                            <td style={{ padding: '16px 8px', color: '#334155' }}>{record.patientName}</td>
                                            <td style={{ padding: '16px 8px' }}>
                                                    <span style={{
                                                        backgroundColor: record.status === 'IN_CONSULTATION' ? '#dcfce7' : '#fef9c3',
                                                        color: record.status === 'IN_CONSULTATION' ? '#16a34a' : '#ca8a04',
                                                        padding: '4px 8px', borderRadius: '6px', fontSize: '12px'
                                                    }}>
                                                        {record.status.replace('_', ' ')}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Onboarding Input Container Form */}
                        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            {!isAdminLoggedIn ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>🔒 Protected Registration Space</h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Please authenticate as an admin to register doctors.</p>
                                    {authError && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>{authError}</div>}
                                    <form onSubmit={handleAdminLogin} style={{ maxWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input type="email" placeholder="admin@careflow.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Login as Admin</button>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>🩺 Register New Medical Practitioner</h3>
                                    {regSuccess && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>{regSuccess}</div>}
                                    {regError && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>{regError}</div>}
                                    <form onSubmit={handleDoctorRegistration} style={{ display: 'grid', gap: '16px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <input type="text" placeholder="First Name" value={docFirstName} onChange={(e) => setDocFirstName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            <input type="text" placeholder="Last Name" value={docLastName} onChange={(e) => setDocLastName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <input type="email" placeholder="Email Address" value={docEmail} onChange={(e) => setDocEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        <input type="password" placeholder="Access Password" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <input type="text" placeholder="Telephone" value={docPhone} onChange={(e) => setDocPhone(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            <input type="text" placeholder="License No" value={docLicense} onChange={(e) => setDocLicense(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <select value={docSpecialization} onChange={(e) => setDocSpecialization(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}>
                                            <option value="">-- Select Specialization --</option>
                                            <option value="General Practitioner">General Practitioner (OPD)</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Pediatrician">Pediatrician</option>
                                            <option value="Neurologist">Neurologist</option>
                                        </select>
                                        <button type="submit" style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Add Practitioner Profile</button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column Core Side Widgets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Streamlined Live Terminal Monitor Deck */}
                        <div style={{ backgroundColor: '#2563eb', padding: '24px', borderRadius: '16px', color: '#ffffff', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <span style={{ fontWeight: '700', fontSize: '14px', letterSpacing: '0.5px', opacity: 0.9 }}>📢 Live Terminal Status</span>
                                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Active Node</span>
                            </div>

                            <div style={{ textAlign: 'center', margin: '24px 0' }}>
                                <span style={{ fontSize: '11px', opacity: 0.75, letterSpacing: '1px', fontWeight: '700', textTransform: 'uppercase' }}>In Consultation Patient</span>
                                <h3 style={{ margin: '6px 0 14px 0', fontSize: '26px', fontWeight: '800' }}>{activePatientName}</h3>
                                <div style={{ display: 'inline-block', backgroundColor: '#ffffff', color: '#2563eb', padding: '6px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '16px' }}>
                                    Token {activeToken === 'None' ? 'None' : `#${activeToken}`}
                                </div>
                            </div>

                            {/* Guard-rail: Button becomes fully disabled if waiting count reaches absolute zero */}
                            <button
                                onClick={handleCallNextPatient}
                                disabled={!isAdminLoggedIn || waitingCount === 0}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: (isAdminLoggedIn && waitingCount > 0) ? '#ffffff' : '#cbd5e1',
                                    color: (isAdminLoggedIn && waitingCount > 0) ? '#2563eb' : '#94a3b8',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    cursor: (isAdminLoggedIn && waitingCount > 0) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                👤+ CALL NEXT PATIENT
                            </button>
                        </div>

                        {/* Summary Analytics Deck Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '24px' }}>🕒</span>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', margin: '6px 0 2px 0' }}>Total Waiting</div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{waitingCount} Patients</div>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', margin: '6px 0 2px 0' }}>Served Today</div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{servedTodayCount} Patients</div>
                            </div>
                        </div>

                        {/* Extended Operations Analytics Box */}
                        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>📈 Operational Velocity Metrics</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500' }}>Active Medical Staff:</span>
                                <span style={{ color: '#0f172a', fontWeight: '700' }}>{doctorsList.length} Consultants</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500' }}>Avg Consultation Time:</span>
                                <span style={{ color: '#16a34a', fontWeight: '700' }}>{avgConsultTime}</span>
                            </div>

                            {/* Live System Operation Logs */}
                            <div style={{ marginTop: '16px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Live System Logs</span>
                                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '6px', fontSize: '12px', color: '#475569', maxHeight: '80px', overflowY: 'auto', fontFamily: 'monospace' }}>
                                    {systemLogs.length === 0 ? (
                                        <div>[SYSTEM]: Awaiting queue events...</div>
                                    ) : (
                                        systemLogs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)
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