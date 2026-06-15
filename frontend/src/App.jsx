import React from 'react';
import PatientDashboard from './PatientDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {/* Optional: Shared Group Project Navigation Bar */}
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-wider text-blue-400">MediCare EHR</span>
          </div>
          <div className="flex space-x-6 text-sm font-medium text-gray-300">
            <span className="text-white border-b-2 border-blue-400 pb-1 cursor-pointer">Patient Profile</span>
            
          </div>
        </div>
      </nav>

      {/* Renders your Patient Profile & EHR Module */}
      <main>
        <PatientDashboard />
      </main>

      
    </div>
  );
}

export default App;