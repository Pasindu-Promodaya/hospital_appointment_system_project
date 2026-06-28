import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, RefreshCw, UserPlus } from 'lucide-react';
import axios from 'axios';

function QueueDashboard() {
    const [queue, setQueue] = useState([]);
    const [servedCount, setServedCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Default selection is set to doctor 1
    const [selectedDoctorId, setSelectedDoctorId] = useState(1);

    // List of doctors with their specialties to display dynamically on the cards
    const doctorsList = {
        1: { name: "Dr. Kasun Rathnayaka", dept: "OPD" },
        2: { name: "Dr. Nimal Ekanayaka", dept: "Dental" },
        3: { name: "Dr. Amal Perera", dept: "Pediatric" },
        4: { name: "Dr. Kamal Bandara", dept: "Cardiology" },
        5: { name: "Dr. Sunil Silva", dept: "Neurology" }
    };

    // Get active queue data and daily statistics based on the selected doctor ID
    const fetchQueueData = async (doctorId) => {
        const idToSend = doctorId || selectedDoctorId;
        setLoading(true);
        try {
            // Fetching active patients list for the doctor
            const queueResponse = await axios.get(`http://localhost:8080/api/queue/doctor/${idToSend}`, { withCredentials: true });
            setQueue(queueResponse.data);

            // Fetching total served analytics count for the doctor
            const analyticsResponse = await axios.get(`http://localhost:8080/api/queue/analytics/${idToSend}`, { withCredentials: true });
            if (analyticsResponse.data && analyticsResponse.data.totalServed !== undefined) {
                setServedCount(analyticsResponse.data.totalServed);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handler to call the next patient in the queue sequentially
    const handleCallNextSequential = async () => {
        try {
            await axios.post(`http://localhost:8080/api/queue/next/${selectedDoctorId}`, {}, { withCredentials: true });
            await fetchQueueData(selectedDoctorId); // Instantly refresh UI state after updating the backend
        } catch (error) {
            console.error("Error calling next patient:", error);
            alert("Failed to call next patient.");
        }
    };

    // Update doctor selection state and trigger a fresh data fetch immediately
    const handleDoctorChange = (e) => {
        const newDoctorId = Number(e.target.value);
        setSelectedDoctorId(newDoctorId);
        fetchQueueData(newDoctorId); // Explicitly passing the new ID to prevent stale state issues
    };

    // Load initial queue state for Doctor 1 on initial component mount
    useEffect(() => {
        fetchQueueData(1);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">

            {/* Upper Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Queue & Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Welcome back, Mahima</p>
                </div>

                {/* Control Actions Area */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Doctor Selection Dropdown */}
                    <select
                        value={selectedDoctorId}
                        onChange={handleDoctorChange}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    >
                        <option value={1}>Dr. Kasun Rathnayaka (OPD)</option>
                        <option value={2}>Dr. Nimal Ekanayaka (Dental)</option>
                        <option value={3}>Dr. Amal Perera (Pediatric)</option>
                        <option value={4}>Dr. Kamal Bandara (Cardiology)</option>
                        <option value={5}>Dr. Sunil Silva (Neurology)</option>
                    </select>

                    <button
                        onClick={() => fetchQueueData(selectedDoctorId)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-200 text-sm"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left/Middle: Patient Queue Table Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-3">
                        <Users className="text-blue-600" size={22} />
                        <h2 className="text-xl font-bold text-slate-800">Live Patient Queue</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="pb-3">Token No</th>
                                <th className="pb-3">Patient Name</th>
                                <th className="pb-3">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {queue.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="py-12 text-center text-slate-400 font-medium">
                                        No patients currently in the waiting queue.
                                    </td>
                                </tr>
                            ) : (
                                queue.map((patient) => (
                                    <tr key={patient.id} className="text-sm hover:bg-slate-50/80 transition-colors duration-150">
                                        <td className="py-4 font-bold text-blue-600">#{patient.tokenNumber}</td>
                                        <td className="py-4 font-semibold text-slate-700">{patient.patientName}</td>
                                        <td className="py-4">
                                            {patient.status === 'IN_CONSULTATION' ? (
                                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide animate-pulse">
                                                        In Consultation
                                                    </span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-600 border border-amber-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                        Waiting
                                                    </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Section: Now Serving & Analytics */}
                <div className="space-y-6">

                    {/* Main Now Serving Card with Main Call Next Button */}
                    <div className="bg-blue-600 rounded-2xl p-6 shadow-md shadow-blue-100 text-white relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>

                        <div>
                            <div className="flex items-center justify-between border-b border-blue-500/40 pb-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <UserCheck size={22} />
                                    <h2 className="text-xl font-bold">Now Serving</h2>
                                </div>
                                <span className="bg-blue-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border border-blue-400/30 tracking-wider">
                                    {doctorsList[selectedDoctorId]?.dept || "General"}
                                </span>
                            </div>

                            <div className="text-center py-2 relative z-10">
                                <p className="text-[11px] text-blue-200 uppercase font-bold tracking-widest opacity-90">
                                    {doctorsList[selectedDoctorId]?.name || "Doctor"}
                                </p>
                                <h3 className="text-2xl font-black mt-1.5 drop-shadow-sm w-full max-w-[240px] mx-auto block truncate">
                                    {queue.length > 0 && queue[0].status === 'IN_CONSULTATION' ? queue[0].patientName : "No Active Patient"}
                                </h3>
                                <div className="inline-block bg-white text-blue-600 rounded-xl px-4 py-1.5 mt-3 text-lg font-black shadow-sm">
                                    Token {queue.length > 0 && queue[0].status === 'IN_CONSULTATION' ? `#${queue[0].tokenNumber}` : "--"}
                                </div>
                            </div>
                        </div>

                        {/* Centralized Call Next Button */}
                        <div className="mt-4 pt-2 border-t border-blue-500/30 relative z-10">
                            <button
                                onClick={handleCallNextSequential}
                                className="w-full bg-white hover:bg-slate-100 text-blue-600 font-bold py-3 px-4 rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                            >
                                <UserPlus size={18} />
                                Call Next Patient
                            </button>
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Total Waiting */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
                            <div className="inline-flex p-3 bg-amber-50 rounded-xl mb-3">
                                <Clock className="text-amber-500" size={24} />
                            </div>
                            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Waiting</span>
                            <span className="text-xl font-black text-slate-800 mt-1 block">
                                {queue.filter(q => q.status === 'WAITING').length} Patients
                            </span>
                        </div>

                        {/* Served Today */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
                            <div className="inline-flex p-3 bg-emerald-50 rounded-xl mb-3">
                                <UserCheck className="text-emerald-500" size={24} />
                            </div>
                            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Served Today</span>
                            <span className="text-xl font-black text-slate-800 mt-1 block">{servedCount} Patients</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default QueueDashboard;