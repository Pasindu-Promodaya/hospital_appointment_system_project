import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
    // admin session states
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // queue details states
    const [activeToken, setActiveToken] = useState('None');
    const [nextToken, setNextToken] = useState('None');
    const [waitingCount, setWaitingCount] = useState(0);

    // doctor reg form fields
    const [docEmail, setDocEmail] = useState('');
    const [docPassword, setDocPassword] = useState('');
    const [docFirstName, setDocFirstName] = useState('');
    const [docLastName, setDocLastName] = useState('');
    const [docPhone, setDocPhone] = useState('');
    const [docSpecialization, setDocSpecialization] = useState('');
    const [docLicense, setDocLicense] = useState('');
    const [regSuccess, setRegSuccess] = useState('');
    const [regError, setRegError] = useState('');

    // get live data from backend api
    const fetchLiveQueueStatus = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/queue/status');
            if (response.ok) {
                const data = await response.json();
                setActiveToken(data.activeToken || 'None');
                setNextToken(data.nextToken || 'None');
                setWaitingCount(data.waitingCount || 0);
            }
        } catch (err) {
            console.error("Error fetching live queue data:", err.message);
        }
    };

    // run when page loads
    useEffect(() => {
        // check local storage to keep admin logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role === 'ADMIN') {
                setIsAdminLoggedIn(true);
                setCurrentAdmin(parsedUser);
            }
        }

        // load data first time
        fetchLiveQueueStatus();

        // auto refresh queue every 5 seconds
        const queueInterval = setInterval(fetchLiveQueueStatus, 5000);

        return () => clearInterval(queueInterval);
    }, []);

    // handle admin login form submission
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || 'Invalid Admin Credentials');
            }

            const data = await response.json();
            if (data.role === 'ADMIN') {
                localStorage.setItem('user', JSON.stringify(data));
                setCurrentAdmin(data);
                setIsAdminLoggedIn(true);
            } else {
                throw new Error('Unauthorized: Access restricted to Administrators only.');
            }
        } catch (err) {
            setAuthError(err.message);
        }
    };

    // handle doctor registration form submission
    const handleDoctorRegistration = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');

        const registrationPayload = {
            email: docEmail,
            password: docPassword,
            firstName: docFirstName,
            lastName: docLastName,
            telephoneNumber: docPhone,
            specialization: docSpecialization,
            licenseNumber: docLicense,
            createdByAdminId: currentAdmin ? currentAdmin.id : null
        };

        try {
            const response = await fetch('http://localhost:8080/api/admin/register-doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationPayload)
            });

            const resultText = await response.text();
            if (!response.ok) throw new Error(resultText || 'Failed to register doctor profile.');

            setRegSuccess(resultText);
            setDocEmail(''); setDocPassword(''); setDocFirstName(''); setDocLastName('');
            setDocPhone(''); setDocSpecialization(''); setDocLicense('');
        } catch (err) {
            setRegError(err.message);
        }
    };

    // button function to call next patient
    const handleCallNextPatient = async () => {
        if (!isAdminLoggedIn || !currentAdmin) return;

        try {
            const response = await fetch('http://localhost:8080/api/queue/call-next/1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Admin-Id': currentAdmin.id
                }
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Failed to update queue status');
            }

            // get updated queue details immediately
            fetchLiveQueueStatus();

        } catch (err) {
            alert(err.message);
        }
    };

    // logout function
    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsAdminLoggedIn(false);
        setCurrentAdmin(null);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>

            {/* main header section */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>📊 Hospital Administration Panel</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                        {isAdminLoggedIn ? `✓ Secure Administrator Session Active (ID: ${currentAdmin?.id})` : "Workspace container reserved for global HR onboarding and metrics."}
                    </p>
                </div>
                {isAdminLoggedIn && (
                    <button onClick={handleLogout} style={{ padding: '10px 18px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Exit Admin Mode
                    </button>
                )}
            </div>

            {/* grid split layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* doctor registration left box */}
                <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>

                    {!isAdminLoggedIn ? (
                        /* login form card */
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>🔒 Protected Registration Space</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Please authenticate as an admin to register doctors.</p>

                            {authError && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{authError}</div>}

                            <form onSubmit={handleAdminLogin}>
                                <input type="email" placeholder="admin@careflow.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '14px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Login as Admin</button>
                            </form>
                        </div>
                    ) : (
                        /* register doctor input form */
                        <>
                            <h3 style={{ marginTop: 0, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>🩺 Register New Medical Practitioner</h3>
                            {regSuccess && <div style={{ color: '#16a34a', background: '#dcfce7', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>{regSuccess}</div>}
                            {regError && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{regError}</div>}

                            <form onSubmit={handleDoctorRegistration} style={{ display: 'grid', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>First Name</label>
                                        <input type="text" value={docFirstName} onChange={(e) => setDocFirstName(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Last Name</label>
                                        <input type="text" value={docLastName} onChange={(e) => setDocLastName(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Email Address</label>
                                    <input type="email" value={docEmail} onChange={(e) => setDocEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Portal Access Password</label>
                                    <input type="password" value={docPassword} onChange={(e) => setDocPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Telephone</label>
                                        <input type="text" value={docPhone} onChange={(e) => setDocPhone(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Medical License No</label>
                                        <input type="text" value={docLicense} onChange={(e) => setDocLicense(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Area of Specialization</label>
                                    <select value={docSpecialization} onChange={(e) => setDocSpecialization(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                                        <option value="">-- Select Specialization --</option>
                                        <option value="General Practitioner">General Practitioner (OPD)</option>
                                        <option value="Cardiologist">Cardiologist</option>
                                        <option value="Pediatrician">Pediatrician</option>
                                        <option value="Neurologist">Neurologist</option>
                                    </select>
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}>Add Practitioner Profile</button>
                            </form>
                        </>
                    )}
                </div>

                {/* queue info display board right box */}
                <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>📊 Patient Flow Overview (M4)</h3>
                    <div style={{ display: 'grid', gap: '15px', margin: '20px 0' }}>
                        <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>CURRENT ACTIVE TOKEN</span>
                            <h2 style={{ margin: '5px 0 0 0', color: '#1e3a8a', fontSize: '28px' }}>{activeToken}</h2>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>NEXT IN LINE</span>
                            <h2 style={{ margin: '5px 0 0 0', color: '#14532d', fontSize: '28px' }}>{nextToken}</h2>
                        </div>
                        <div style={{ background: '#fefce8', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #fef08a' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ca8a04' }}>PATIENTS WAITING</span>
                            <h2 style={{ margin: '5px 0 0 0', color: '#713f12', fontSize: '28px' }}>{waitingCount}</h2>
                        </div>
                    </div>

                    {/* action buttons section */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {isAdminLoggedIn ? (
                            <button
                                onClick={handleCallNextPatient}
                                disabled={waitingCount === 0}
                                style={{
                                    padding: '12px 20px',
                                    background: waitingCount > 0 ? '#2563eb' : '#cbd5e1',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: waitingCount > 0 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Call Next Patient ➡️
                            </button>
                        ) : (
                            <button
                                disabled
                                style={{
                                    padding: '12px 20px',
                                    background: '#f1f5f9',
                                    color: '#94a3b8',
                                    border: '1px dashed #cbd5e1',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: 'not-allowed'
                                }}
                            >
                                🔒 Staff Login Required
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}