import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // 🌟 FIX: Updated to match your exact filename "NabBar.jsx"
import Booking from './pages/BookingPage';
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientAuth from './pages/PatientAuth';
import Login from './pages/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Gateways remain clean fullscreen */}
        <Route path="/login" element={<Login />} />

        {/* App Layout Frame: Structured vertically (Navbar top, contents bottom) */}
        <Route 
          path="/*" 
          element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
              {/* 🌟 Top Navigation Bar */}
              <Navbar /> 

              {/* Page Viewport Area Below Navbar */}
              <div style={{ flexGrow: 1, backgroundColor: '#f8fafc', padding: '24px' }}>
                <Routes>
                  <Route path="/booking" element={<Booking />} />
                  
                  <Route path="/patient-auth" element={<PatientAuth />} />
                  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                  
                  <Route path="/doctors" element={<DoctorDirectory />} />
                  
                  {/* Default fallback */}
                  <Route path="*" element={<Navigate to="/doctors" replace />} />
                </Routes>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}