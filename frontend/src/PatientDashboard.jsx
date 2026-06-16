import React, { useState } from 'react';
import PatientProfileCard from './components/PatientProfileCard';
import MedicalTimeline from './components/MedicalTimeline';
import UpdateContactModal from './components/UpdateContactModal';

const PatientDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock Data
  const [patient, setPatient] = useState({
    name: "John Doe",
    dob: "1985-04-12",
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    chronicConditions: ["Hypertension", "Asthma"],
    emergencyContact: { name: "Jane Doe", phone: "555-0198", relation: "Spouse" },
    encounters: [
      { id: 2, date: "2024-05-10", type: "Routine Checkup", notes: "Blood pressure stable. Refilled asthma inhaler prescription." },
      { id: 1, date: "2023-11-15", type: "Emergency", notes: "Patient admitted for mild concussion after fall. Monitored for 24 hours. Discharged." }
    ]
  });

  const handleUpdateContact = (newContactData) => {
    // Update local state (later this runs after a successful Spring Boot API call)
    setPatient(prev => ({
      ...prev,
      emergencyContact: newContactData
    }));
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex justify-between items-end border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Patient EHR Dashboard</h1>
            <p className="text-gray-500 mt-1">Viewing records for: <span className="font-semibold text-gray-700">{patient.name}</span></p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PatientProfileCard 
              patient={patient} 
              onOpenContactModal={() => setIsModalOpen(true)} 
            />
          </div>

          <div className="md:col-span-2">
            <MedicalTimeline 
              encounters={patient.encounters} 
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <UpdateContactModal 
          currentContact={patient.emergencyContact} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleUpdateContact}
        />
      )}
    </div>
  );
};

export default PatientDashboard;