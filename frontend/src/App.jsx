import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Booking from './pages/BookingPage';
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientAuth from './pages/PatientAuth';
import Login from './pages/StaffLogin';
import PatientLogin from './PatientLogin';
import Register from './Register'; 
import PatientDashboard from './PatientDashboard';
import BookAppointment from './components/BookAppointment';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔐 Public Fullscreen Auth Gateways (Bypasses Layout Overlays) */}
        <Route path="/login" element={<Login />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient-auth" element={<PatientAuth />} />

        {/* 🏥 Unified System Core Frame (Navbar top, Viewport content area bottom) */}
        <Route 
          path="/*" 
          element={
            <div className="flex flex-col min-h-screen w-screen">
              {/* Global Top Shared Navigation Component */}
              <Navbar /> 

              {/* Dynamic Sub-View Content Viewport */}
              <main className="flex-1 bg-slate-50 p-6">
                <Routes>
                  {/* Doctor Dashboard Management Module Paths */}
                  <Route path="/doctors" element={<DoctorDirectory />} />
                  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                  <Route path="/booking" element={<Booking />} />
                  
                  {/* Teammate Patient Profile Module Paths */}
                  <Route path="/patient-dashboard" element={<PatientDashboard />} />
                  <Route path="/book-appointment" element={<BookAppointment />} />

                  {/* Fallback Catch-All Redirect Engine Rule */}
                  <Route path="*" element={<Navigate to="/doctors" replace />} />
                </Routes>
              </main>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}