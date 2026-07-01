import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import PatientAppointmentModule from "./components/PatientAppointmentModule";

import BookingPage from "./pages/BookingPage";
import DoctorDirectory from "./pages/DoctorDirectory";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientAuth from "./pages/PatientAuth";
import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Main Application */}
        <Route
          path="/*"
          element={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                width: "100vw",
              }}
            >
              <NavBar />

              <div
                style={{
                  flexGrow: 1,
                  backgroundColor: "#f8fafc",
                  padding: "24px",
                }}
              >
                <Routes>
                  {/* Doctor Module */}
                  <Route path="/doctors" element={<DoctorDirectory />} />
                  <Route
                    path="/doctor-dashboard"
                    element={<DoctorDashboard />}
                  />

                  {/* Patient Module */}
                  <Route path="/patient-auth" element={<PatientAuth />} />
                  <Route path="/booking" element={<BookingPage />} />

                  {/* Your Appointment Module */}
                  <Route
                    path="/appointments"
                    element={<PatientAppointmentModule />}
                  />

                  {/* Default */}
                  <Route
                    path="*"
                    element={<Navigate to="/doctors" replace />}
                  />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}