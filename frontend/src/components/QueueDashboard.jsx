import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';

function QueueDashboard() {
    const [queue, setQueue] = useState([]);
    const [servedCount, setServedCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // get all queue details and doctor status from backend
    const fetchQueueData = async () => {
        setLoading(true);
        try {
            // load active patient list
            const queueResponse = await axios.get('http://localhost:8080/api/queue', { withCredentials: true });
            setQueue(queueResponse.data);

            // get today served count for doctor 1
            const analyticsResponse = await axios.get('http://localhost:8080/api/queue/analytics/1', { withCredentials: true });
            if (analyticsResponse.data && analyticsResponse.data.totalServed !== undefined) {
                setServedCount(analyticsResponse.data.totalServed);
            }
        } catch (error) {
            console.error("Error fetching queue or analytics data:", error);
        } finally {
            setLoading(false);
        }
    };

    // call next patient and refresh dashboard lists
    const handleCallNext = async (patientId) => {
        try {
            await axios.put(`http://localhost:8080/api/queue/${patientId}/serve`, {}, { withCredentials: true });
            await fetchQueueData();
        } catch (error) {
            console.error("Error calling next patient:", error);
            alert("Failed to call the next patient. Please try again.");
        }
    };

    // initial data load when page opens
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await fetchQueueData();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Queue & Admin Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Welcome back, Mahima</p>
                </div>
                <button
                    onClick={fetchQueueData}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-200"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    {loading ? "Refreshing..." : "Refresh Queue"}
                </button>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Patient Table */}
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
                                <th className="pb-3 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {queue.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                                        No patients currently in the waiting queue.
                                    </td>
                                </tr>
                            ) : (
                                queue.map((patient) => (
                                    <tr key={patient.id} className="text-sm hover:bg-slate-50/80 transition-colors duration-150">
                                        <td className="py-4 font-bold text-blue-600">#{patient.tokenNumber}</td>
                                        <td className="py-4 font-semibold text-slate-700">{patient.patientName}</td>

                                        {/* status check - show green for active consultation */}
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

                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => handleCallNext(patient.id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition duration-150"
                                            >
                                                Call Next
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side Cards */}
                <div className="space-y-6">

                    {/* Current Patient Card */}
                    <div className="bg-blue-600 rounded-2xl p-6 shadow-md shadow-blue-100 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>
                        <div className="flex items-center gap-2.5 mb-5 border-b border-blue-500/40 pb-3">
                            <UserCheck size={22} />
                            <h2 className="text-xl font-bold">Now Serving</h2>
                        </div>
                        <div className="text-center py-4 relative z-10">
                            <p className="text-xs text-blue-100 uppercase font-bold tracking-widest opacity-90">Current Patient</p>
                            <h3 className="text-3xl font-black mt-1.5 drop-shadow-sm">
                                {queue.length > 0 ? queue[0].patientName : "No Active Patient"}
                            </h3>
                            <div className="inline-block bg-white text-blue-600 rounded-xl px-5 py-2 mt-5 text-xl font-black shadow-sm">
                                Token #{queue.length > 0 ? queue[0].tokenNumber : "--"}
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* Total Waiting */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
                            <div className="inline-flex p-3 bg-amber-50 rounded-xl mb-3">
                                <Clock className="text-amber-500" size={24} />
                            </div>
                            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Waiting</span>
                            <span className="text-2xl font-black text-slate-800 mt-1 block">{queue.length} Patients</span>
                        </div>

                        {/* Served Today */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
                            <div className="inline-flex p-3 bg-emerald-50 rounded-xl mb-3">
                                <UserCheck className="text-emerald-500" size={24} />
                            </div>
                            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Served Today</span>
                            <span className="text-2xl font-black text-slate-800 mt-1 block">{servedCount} Patients</span>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default QueueDashboard;