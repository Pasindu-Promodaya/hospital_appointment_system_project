import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';    

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState('All'); // Defaulting to 'All'
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); 
  const { user } = useAuth();     

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'General Medicine'];

  useEffect(() => {
    setLoading(true);
    
    // 🎯 If specialty is 'All', do NOT append a query param so Spring Boot falls back to findByIsActiveTrue()
    const url = (specialty && specialty !== 'All') 
      ? `http://localhost:8080/api/doctors?specialty=${specialty}`
      : 'http://localhost:8080/api/doctors';

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching clinical directory:", err);
        setLoading(false);
      });
  }, [specialty]);

  const handleBookingClick = (doc) => {
    const userRole = user?.role || localStorage.getItem('role');

    if (userRole === 'ROLE_PATIENT' || userRole === 'PATIENT') {
      navigate('/booking', { state: { doctorId: doc.id } });
    } else {
      navigate('/patient-auth', { 
        state: { 
          redirectTo: '/booking', 
          doctorId: doc.id 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Hero Banner Segment */}
      <div className="relative bg-gradient-to-br from-slate-900 to-blue-950 color-white py-16 px-6 text-center shadow-lg shadow-black/5">
        <span className="inline-block bg-sky-500/20 text-sky-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider">
          ✨ CORE HEALTH HEALTHCARE GATEWAY
        </span>
        <h1 className="text-4xl font-extrabold mt-4 mb-2 tracking-tight text-white">
          Find & Book World-Class Specialists
        </h1>
        <p className="text-slate-400 text-base max-w-2xl mx-auto">
          Access real-time schedules, verified clinical licenses, and instantaneous booking channels.
        </p>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-[1200px] mx-auto py-10 px-6">
        
        {/* Interactive Filter Pill Container */}
        <div className="flex justify-center gap-3 flex-wrap mb-10">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialty(spec)}
              className={`px-6 py-2.5 rounded-full border font-semibold text-sm cursor-pointer transition-all duration-200 ease-in-out shadow-sm shadow-black/[0.02] ${
                specialty === spec 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Dynamic Display Grid */}
        {loading ? (
          <div className="text-center py-10 text-slate-500 text-base">
            🔄 Syncing medical database entries...
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            🍃 No clinical profiles currently listed under this discipline.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">👨‍⚕️</div>
                    <div>
                      <h3 className="m-0 text-lg font-bold text-slate-900">
                        {doc.name || `Dr. ${doc.firstName} ${doc.lastName}`}
                      </h3>
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded mt-1">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                  <hr className="border-0 border-t border-slate-100 my-4" />
                  <div className="flex flex-col gap-2 mb-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      📋 <span className="text-slate-700 font-bold">License:</span> {doc.licenseNumber || doc.license_number}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      ✉️ <span className="text-slate-700 font-bold">Contact:</span> {doc.email}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleBookingClick(doc)} 
                  className="w-100 w-full py-3 rounded-xl border-none bg-slate-900 text-white font-semibold text-sm cursor-pointer text-center mt-auto transition-colors duration-200 hover:bg-slate-800"
                >
                  Book Consultation Slot
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}