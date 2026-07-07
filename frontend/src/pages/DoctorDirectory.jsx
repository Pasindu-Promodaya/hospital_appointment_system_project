import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DoctorDirectory() {
    const [doctors, setDoctors] = useState([]);
    const [specialty, setSpecialty] = useState('All');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const { user } = useAuth();

    // saved by the AdminDashboard's registration dropdown.
    const specialties = ['All', 'Cardiologist', 'Neurologist', 'Pediatrician', 'General Practitioner', 'Dermatology'];

    useEffect(() => {
        setLoading(true);

        const url = (specialty && specialty !== 'All')
            ? `http://localhost:8080/api/doctors?specialty=${specialty}`
            : 'http://localhost:8080/api/doctors';

        fetch(url)
            .then(res => res.json())
            .then(data => {
                //  Safety Check: Only set doctors if data is a valid array
                if (Array.isArray(data)) {
                    setDoctors(data);
                } else {
                    console.error("Expected array but received:", data);
                    setDoctors([]); // Fallback to empty array to prevent filtering crash
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching clinical directory:", err);
                setDoctors([]); // Fallback to empty array on network failure
                setLoading(false);
            });
    }, [specialty]);

    const handleBookingClick = (doc) => {
        const userRole = user?.role || localStorage.getItem('role');
        
        // 🎯 FIXED: Direct prefix normalization rules tracking for booking data context passing
        const resolvedDoctorName = doc.firstName && doc.lastName 
            ? `Dr. ${doc.firstName} ${doc.lastName}` 
            : (doc.name?.startsWith('Dr.') ? doc.name : `Dr. ${doc.name || 'Specialist'}`);

        const bookingContext = {
            doctor: {
                id: doc.id,
                name: resolvedDoctorName,
                specialization: doc.specialization
            }
        };

        if (userRole === 'ROLE_PATIENT' || userRole === 'PATIENT') {
            navigate('/book-appointment', { state: bookingContext });
        } else {
            navigate('/patient-login', {
                state: {
                    fromBooking: true,
                    redirectTo: '/book-appointment',
                    ...bookingContext
                }
            });
        }
    };

    // Safety Check: Safely filter only if doctors state is a valid array
    const filteredDoctors = Array.isArray(doctors)
        ? doctors.filter(doc => {
            const fullName = (doc.firstName && doc.lastName 
                ? `${doc.firstName} ${doc.lastName}` 
                : (doc.name || '')).toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        })
        : [];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased">

            {/* Premium Hero Banner Segment */}
            <div className="relative bg-[#0b1329] bg-gradient-to-br from-[#0f172a] via-[#0b1329] to-[#1e1b4b] py-20 px-6 text-center shadow-xl shadow-slate-950/20">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider border border-sky-500/20 shadow-sm">
                        Core Health Healthcare Gateway
                    </span>

                    <h1 className="text-4xl md:text-5xl font-black mt-5 mb-3 tracking-tight text-white leading-[1.15]">
                        Find & Book World-Class Specialists
                    </h1>

                    <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
                        Search verified physicians, compare specialties, and reserve clinical consultation slots through one enterprise-grade healthcare gateway.
                    </p>

                    {/* Streamlined Search Input Bar */}
                    <div className="mt-10 w-full max-w-2xl bg-white p-2 rounded-full shadow-2xl shadow-black/40 flex items-center border border-slate-200/50">
                        <div className="flex items-center gap-3 pl-4 flex-1">
                            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search Doctor by Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none"
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-7 py-3.5 rounded-full transition duration-150 ease-in-out shadow-lg shadow-blue-500/20">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Layout Container */}
            <div className="max-w-[1240px] mx-auto py-16 px-6">

                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                        Verified clinical specialists, ready to see you
                    </h2>
                    <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-2 leading-relaxed font-medium">
                        Every profile is license-checked, clinic-affiliated, and supported by Core Health's secure appointment gateway.
                    </p>
                </div>

                {/* Specialty Filter Tabs */}
                <div className="flex justify-center gap-2 flex-wrap mb-12 bg-white border border-slate-200/60 p-1.5 rounded-full max-w-3xl mx-auto shadow-sm shadow-slate-100">
                    {specialties.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => { setSpecialty(spec); setSearchTerm(''); }}
                            className={`px-5 py-2 rounded-full font-bold text-xs tracking-wide transition-all duration-200 ease-in-out ${
                                specialty === spec
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                            }`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>

                {/* Grid Display */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse animate-spin"></div>
                        <div className="text-sm font-bold text-slate-400 tracking-wide">Syncing medical database entries...</div>
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 max-w-xl mx-auto p-8 shadow-sm">
                        <div className="text-4xl mb-3">🍃</div>
                        <h4 className="text-base font-bold text-slate-800">No Specialists Found</h4>
                        <p className="text-xs text-slate-400 mt-1">No clinical profiles match your active specialty filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doc) => (
                            <div key={doc.id} className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-slate-300/80 transition-all duration-300 flex flex-col justify-between group">
                                <div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-2xl shrink-0 transition duration-200 group-hover:scale-105">
                                            👨‍⚕️
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                                                   
                                                    {doc.firstName && doc.lastName ? `Dr. ${doc.firstName} ${doc.lastName}` : (doc.name || "Specialist Profile")}
                                                </h3>
                                                <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 shadow-sm shrink-0">
                                                    🛡️ Verified License
                                                </span>
                                            </div>
                                            <div className="pt-1">
                                                <span className="inline-block bg-blue-50/50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-blue-100/40">
                                                    {doc.specialization}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid bg-[#f8fafc] border border-slate-100 p-4 rounded-xl space-y-2.5 mb-6">
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">License Number</span>
                                            <span className="text-slate-800 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200/60">
                                                {doc.licenseNumber || doc.license_number || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500 overflow-hidden">
                                            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">Contact Email</span>
                                            <span className="text-slate-700 font-medium truncate pl-4 max-w-[180px]">
                                                {doc.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBookingClick(doc)}
                                    className="w-full py-3.5 rounded-xl border-none bg-[#0f172a] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 shadow-slate-950/10 cursor-pointer"
                                >
                                    Book Consultation Slot
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Metrics Banner */}
                <div className="mt-16 bg-[#0f172a] bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] rounded-3xl p-8 shadow-xl text-white grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-slate-800/40">
                    <div>
                        <h4 className="text-2xl md:text-3xl font-black tracking-tight text-white">+15</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Verified Doctors</p>
                    </div>
                    <div>
                        <h4 className="text-2xl md:text-3xl font-black tracking-tight text-white">99.4%</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Patient Satisfaction</p>
                    </div>
                    <div>
                        <h4 className="text-2xl md:text-3xl font-black tracking-tight text-white">24/7</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Care Support</p>
                    </div>
                    <div>
                        <h4 className="text-2xl md:text-3xl font-black tracking-tight text-white">1</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">Clinical Branches</p>
                    </div>
                </div>

            </div>
        </div>
    );
}