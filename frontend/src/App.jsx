import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-inner">
            <div className="brand">
              <span className="brand-cross">✚</span>
              <span className="brand-name">MediBook</span>
            </div>
            <nav className="main-nav">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Book Appointment
              </NavLink>
              <NavLink to="/my-appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                My Appointments
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<BookAppointment />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© 2025 MediBook Hospital System · SWST 32043 Assignment 02</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
