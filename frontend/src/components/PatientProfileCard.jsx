import React from "react";

const PatientProfileCard = ({ patient, onOpenContactModal }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold text-blue-900">
            🏥 Patient EHR Profile
          </h2>
          <p className="text-xs text-gray-500">Core medical information</p>
        </div>

        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
          ACTIVE
        </span>
      </div>

      {/* Grid Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500 text-xs">Date of Birth</p>
          <p className="font-semibold">{patient.dob}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500 text-xs">Blood Type</p>
          <p className="font-bold text-red-600">{patient.bloodType}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg col-span-2">
          <p className="text-gray-500 text-xs">Age (Auto)</p>
          <p className="font-semibold">
            {new Date().getFullYear() - new Date(patient.dob).getFullYear()} years
          </p>
        </div>
      </div>

      {/* Allergies */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">ALLERGIES</p>
        <div className="flex flex-wrap gap-2">
          {patient.allergies.map((a, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
            >
              ⚠ {a}
            </span>
          ))}
        </div>
      </div>

      {/* Chronic Conditions */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">CHRONIC CONDITIONS</p>
        <div className="flex flex-wrap gap-2">
          {patient.chronicConditions.map((c, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
            >
              🫁 {c}
            </span>
          ))}
        </div>
      </div>

      {/* Emergency Section */}
      <div className="mt-5 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">

        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-red-700">🚨 Emergency Contact</p>

          <button
            onClick={onOpenContactModal}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition"
          >
            Update
          </button>
        </div>

        <p className="text-sm text-gray-700">
          <b>{patient.emergencyContact.name}</b> ({patient.emergencyContact.relation})
        </p>
        <p className="text-sm text-gray-700">
          📞 {patient.emergencyContact.phone}
        </p>
      </div>
    </div>
  );
};

export default PatientProfileCard;