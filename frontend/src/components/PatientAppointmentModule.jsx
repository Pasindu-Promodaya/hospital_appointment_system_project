import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 🎯 CRITICAL
import BookAppointment from './BookAppointment';
import ManageAppointments from './ManageAppointments';

export default function PatientAppointmentModule({ patientId }) {
  const [activeTab, setActiveTab] = useState('book');
  const [activePatientId, setActivePatientId] = useState(null);
  const location = useLocation(); 

  // Authentication validation logic remains here...

  useEffect(() => {
    if (location.state?.doctor) {
      setActiveTab('book');
    }
  }, [location.state]);

  if (!activePatientId) return <div>Login required...</div>;

  return (
    <div className="w-full">
      {/* Tab toggle buttons remain here... */}

      {activeTab === 'book' ? (
        /* Explicitly pass location down as a prop */
        <BookAppointment patientId={activePatientId} location={location} />
      ) : (
        <ManageAppointments patientId={activePatientId} />
      )}
    </div>
  );
}