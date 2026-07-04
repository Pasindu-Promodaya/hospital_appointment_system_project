import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientDashboard = () => {
    const [userId, setUserId] = useState(null);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        sex: "",
        email: "",
        telephoneNumber: "",
        dateOfBirth: "",
        bloodType: "",
        knownDrugAllergies: "",
        chronicConditions: "",
        emergencyContactDetails: "",
    });

    // Check for a valid user authentication session on mount
    useEffect(() => {
        const session = localStorage.getItem("userSession");
        if (session) {
            const sessionData = JSON.parse(session);
            const activeId = sessionData.userId || sessionData.id;

            if (activeId) {
                setUserId(activeId);
                if (sessionData.email) {
                    setPatient(sessionData);
                    setFormData({
                        firstName: sessionData.firstName || "",
                        lastName: sessionData.lastName || "",
                        sex: sessionData.sex || "",
                        email: sessionData.email || "",
                        telephoneNumber:
                            sessionData.phone || sessionData.telephoneNumber || "",
                        dateOfBirth: sessionData.dateOfBirth || "",
                        bloodType: sessionData.bloodType || "",
                        knownDrugAllergies: sessionData.knownDrugAllergies || "",
                        chronicConditions: sessionData.chronicConditions || "",
                        emergencyContactDetails: sessionData.emergencyContactDetails || "",
                    });
                }
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    // Fetch patient records dynamically
    useEffect(() => {
        if (!userId) return;

        const fetchPatientData = async () => {
            try {
                const { data } = await axios.get(`/api/patients/${userId}`);
                setPatient(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    sex: data.sex || "",
                    email: data.email || "",
                    telephoneNumber: data.phone || "",
                    dateOfBirth: data.dateOfBirth || "",
                    bloodType: data.bloodType || "",
                    knownDrugAllergies: data.knownDrugAllergies || "",
                    chronicConditions: data.chronicConditions || "",
                    emergencyContactDetails: data.emergencyContactDetails || "",
                });
                setLoading(false);
            } catch (err) {
                console.warn("Real-time profiling lookup tracking note:", err.message);
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const { telephoneNumber, ...rest } = formData;
        const payload = {
            ...rest,
            phone: telephoneNumber,
        };

        try {
            const { data } = await axios.put(`/api/patients/${userId}`, payload);
            setPatient(data);
            const unifiedSession = { userId, ...data };
            localStorage.setItem("userSession", JSON.stringify(unifiedSession));
            setIsEditing(false);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update profile");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userSession");
        navigate("/login");
    };

    const getInitials = (first, last) => {
        if (!first && !last) return "P";
        return ((first ? first[0] : "") + (last ? last[0] : "")).toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-sm font-semibold text-slate-600 tracking-wide">
                        Syncing Secure EHR Ledger...
                    </div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                            className="w-6 h-6 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                        Database Record Missing
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                        No synchronized patient data matches system locator reference key
                        ID: {userId}.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="text-xs font-semibold text-red-600 hover:underline"
                    >
                        Log out from session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm shadow-blue-500/20">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                />
                            </svg>
                        </div>
                        <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block -mb-0.5">
                My Health Dashboard
              </span>
                            <h1 className="text-lg font-black tracking-tight text-slate-800">
                                HealthNode{" "}
                                <span className="text-blue-600 font-medium text-base">
                  Medical Records
                </span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/book-appointment")}
                            className="text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition duration-150"
                        >
                            Book Appointment
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-xs font-bold uppercase tracking-wider bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 px-3 py-1.5 rounded-lg transition duration-150"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {!isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm shadow-slate-100 sticky lg:top-24">
                            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/10 mb-4 tracking-wider">
                                    {getInitials(patient.firstName, patient.lastName)}
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
                                    {patient.firstName || patient.lastName
                                        ? `${patient.firstName} ${patient.lastName}`
                                        : "Anonymous Profile"}
                                </h2>
                                <span className="text-xs font-medium text-slate-400 mt-0.5">
                  UID System Identifier: #{patient.id || "Pending"}
                </span>
                                <div className="inline-flex gap-1.5 mt-3.5">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/40">
                    {patient.sex || "N/A"}
                  </span>
                                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {patient.bloodType || "Type Unset"}
                  </span>
                                </div>
                            </div>

                            <div className="pt-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="overflow-hidden">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Primary Email
                    </span>
                                        <span className="text-sm font-medium text-slate-700 block truncate">
                      {patient.email || "None Registered"}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2.5"
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Contact Number
                    </span>
                                        <span className="text-sm font-medium text-slate-700 block">
                      {patient.phone ||
                          patient.telephoneNumber ||
                          "Not Provided"}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Date of Birth
                    </span>
                                        <span className="text-sm font-medium text-slate-700 block">
                      {patient.dateOfBirth || "Not Provided"}
                    </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-150 ease-in-out shadow-sm text-sm flex items-center justify-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                Modify patients profile
                            </button>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div
                                className={`bg-white border rounded-2xl shadow-sm transition-all overflow-hidden ${patient.knownDrugAllergies ? "border-red-200/80 shadow-red-50/50" : "border-slate-200/70"}`}
                            >
                                <div
                                    className={`px-5 py-4 flex items-center gap-3 border-b ${patient.knownDrugAllergies ? "bg-red-50/30 border-red-100" : "bg-slate-50/50 border-slate-100"}`}
                                >
                                    <div
                                        className={`p-1.5 rounded-lg ${patient.knownDrugAllergies ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"}`}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2.5"
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    </div>
                                    <h3
                                        className={`text-xs font-bold uppercase tracking-wider ${patient.knownDrugAllergies ? "text-red-800" : "text-slate-500"}`}
                                    >
                                        Known Drug Allergies
                                    </h3>
                                </div>
                                <div className="p-5">
                                    <p
                                        className={`text-sm leading-relaxed whitespace-pre-line font-medium ${patient.knownDrugAllergies ? "text-slate-800" : "text-slate-400 italic"}`}
                                    >
                                        {patient.knownDrugAllergies ||
                                            "No known clinical pharmaceutical or compound responses recorded."}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2.5"
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Chronic Morbidities & Conditions
                                    </h3>
                                </div>
                                <div className="p-5">
                                    <p
                                        className={`text-sm leading-relaxed whitespace-pre-line font-medium ${patient.chronicConditions ? "text-slate-800" : "text-slate-400 italic"}`}
                                    >
                                        {patient.chronicConditions ||
                                            "No active long-term pathogenetic mappings or chronic constraints recorded."}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2.5"
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Emergency Proxy Contact Safeguard
                                    </h3>
                                </div>
                                <div className="p-5">
                                    <p
                                        className={`text-sm font-semibold tracking-tight ${patient.emergencyContactDetails ? "text-slate-800" : "text-slate-400 italic"}`}
                                    >
                                        {patient.emergencyContactDetails ||
                                            "No priority designated proxy contact array configured."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                    Update Personal Information
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Keep your profile accurate to ensure seamless care with your
                                    healthcare team.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/40 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-slate-50/40 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>