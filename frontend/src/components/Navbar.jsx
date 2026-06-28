import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
      <nav style={{ padding: '15px', background: '#1e293b', color: '#fff', display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🏠 CareFlow</Link>
        <Link to="/doctors" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Doctors</Link>
        <Link to="/booking" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Booking</Link>
        <Link to="/admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Admin Dashboard</Link>
        <Link to="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Medical Portal</Link>
      </nav>
  );
}