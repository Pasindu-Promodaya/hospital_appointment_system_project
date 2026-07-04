import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Shared Components
import Layout from './components/Layout';

import Login from './pages/StaffLogin';
import PatientLogin from './PatientLogin';
import Register from './Register';
import PatientAuth from './pages/PatientAuth';

// Core Sub-View Pages
import DoctorDirectory from './pages/DoctorDirectory';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './PatientDashboard';
import Notifications from './pages/Notifications';

// Appointment Module Components
import Booking from './pages/BookingPage';
import BookAppointment from './components/BookAppointment';
import PatientAppointmentModule from './components/PatientAppointmentModule';
import ManageAppointments from './components/ManageAppointments';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* 🔐 Public Fullscreen Auth Gateways (Bypasses Layout Overlays) */}
                <Route path="/login" element={<Login />} />
                <Route path="/patient-login" element={<PatientLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/patient-auth" element={<PatientAuth />} />

                {/* 🏥 Unified System Core Frame inside our clean Layout Component */}
                <Route path="/" element={<Layout />}>
                    {/* Default fallback route inside layout */}
                    <Route index element={<Navigate to="/doctors" replace />} />

                    {/* 🩺 Doctor & Admin Management Module Paths */}
                    <Route path="doctors" element={<DoctorDirectory />} />
                    <Route path="doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="admin" element={<AdminDashboard />} />

                    {/* 👤 Patient Profile Module Paths */}
                    <Route path="patient-dashboard" element={<PatientDashboard />} />
                    <Route path="notifications" element={<Notifications />} />

                    {/* 📅 Appointment Engine Module Paths */}
                    <Route path="booking" element={<Booking />} />
                    <Route path="book-appointment" element={<BookAppointment />} />
                    <Route path="appointments" element={<PatientAppointmentModule />} />
                    <Route path="manage-appointments" element={<ManageAppointments />} />
                </Route>

                {/* 🔄 Fallback Catch-All Redirect Engine Rule */}
                <Route path="*" element={<Navigate to="/doctors" replace />} />
            </Routes>
        </Router>
    );
}