import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DoctorDirectory from './pages/DoctorDirectory'; // Your Module
import BookingPage from './pages/BookingPage';       // Member 2
import PatientProfile from './pages/PatientProfile';   // Member 3
import AdminDashboard from './pages/AdminDashboard';   // Member 4
import Notifications from './pages/Notifications';     // Member 5

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* The Master Frame encapsulates all paths underneath it */}
                <Route path="/" element={<Layout />}>
                    <Route path="doctors" element={<DoctorDirectory />} />
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="profile" element={<PatientProfile />} />
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="notifications" element={<Notifications />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;