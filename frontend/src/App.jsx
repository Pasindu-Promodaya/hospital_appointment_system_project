import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

// Import the unified appointment module used by the application.
import PatientAppointmentModule from './components/PatientAppointmentModule';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col">
        {/* Navigation header for the appointment system. */}
        <nav className="bg-slate-900 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/appointments" className="flex items-center space-x-2 hover:opacity-90 transition-all">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                H
              </div>
              <span className="text-xl font-bold tracking-wider text-blue-400">
                Hospital Appointment <span className="text-white font-light">System</span>
              </span>
            </Link>
            
            <div className="flex items-center text-sm font-medium text-gray-300">
              <Link 
                to="/appointments" 
                className="text-white border-b-2 border-blue-400 pb-1 cursor-pointer transition-all hover:text-white"
              >
                My Appointments & Booking
              </Link>
            </div>
          </div>
        </nav>

        {/* Main route container for the application views. */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <Routes>
            {/* Main appointments view for patients. */}
            <Route path="/appointments" element={<PatientAppointmentModule />} />

            {/* Redirect to the primary appointments route when needed. */}
            <Route path="/" element={<Navigate to="/appointments" replace />} />
            <Route path="*" element={<Navigate to="/appointments" replace />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;