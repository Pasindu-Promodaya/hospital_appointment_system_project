import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import PatientDashboard from './PatientDashboard';
import Login from './Login';       // Path to your Login component
import Register from './Register'; // Path to your Register component
import BookAppointment from './components/BookAppointment';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col">
        
        {/* Shared Universal EHR System Navigation Header */}
        <nav className="bg-slate-900 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-90 transition-all">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                H
              </div>
              <span className="text-xl font-bold tracking-wider text-blue-400">
                Hospital Appointment <span className="text-white font-light">System</span>
              </span>
            </Link>
            
            <div className="flex space-x-6 text-sm font-medium text-gray-300">
              <Link 
                to="/dashboard" 
                className="text-white border-b-2 border-blue-400 pb-1 cursor-pointer transition-all hover:text-white"
              >
                Patient Profile Module
              </Link>
            </div>
          </div>
        </nav>

        {/* Dynamic Route Container Box */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <Routes>
            {/* 🔐 Public Auth Gateways */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🏥 Protected Patient Ledger View */}
            <Route path="/dashboard" element={<PatientDashboard />} />

            {/* 🔄 Fallback Routing Rules */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;