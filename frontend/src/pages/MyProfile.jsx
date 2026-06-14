import { useState } from "react";

export default function MyProfile() {
  const [patient, setPatient] = useState({
    phone: "",
    dob: "",
    bloodType: "",
    emergencyContact: ""
  });

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const updateProfile = () => {
    alert("Profile Updated (UI only)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Patient Profile</h1>
          <p className="text-sm opacity-80">Manage your personal health information</p>
        </div>

        {/* Form */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            name="phone"
            value={patient.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            name="dob"
            value={patient.dob}
            onChange={handleChange}
            placeholder="Date of Birth"
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            name="bloodType"
            value={patient.bloodType}
            onChange={handleChange}
            placeholder="Blood Type (A+, O+)"
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            name="emergencyContact"
            value={patient.emergencyContact}
            onChange={handleChange}
            placeholder="Emergency Contact"
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
          />

        </div>

        {/* Button */}
        <div className="p-6">
          <button
            onClick={updateProfile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
}