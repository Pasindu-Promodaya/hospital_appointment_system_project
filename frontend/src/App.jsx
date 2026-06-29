import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DoctorDirectory from './pages/DoctorDirectory';
import BookingPage from './pages/BookingPage';
import PatientProfile from './pages/PatientProfile';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import MyProfile from "./pages/MyProfile";
import MedicalDashboard from "./pages/MedicalDashboard";

function App() {
    return (
        <BrowserRouter>
            {/* Removed standalone navbar from here to stop the double header bug */}
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<MyProfile />} />
                    <Route path="doctors" element={<DoctorDirectory />} />
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="profile" element={<PatientProfile />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="dashboard" element={<MedicalDashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;