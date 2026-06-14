import { useState } from "react";

export default function MedicalDashboard() {
  const [history] = useState([
    { date: "2025-01-10", note: "General Checkup - All good" },
    { date: "2025-03-15", note: "Fever treatment completed" },
    { date: "2025-06-01", note: "Blood test normal results" }
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Medical History Timeline
      </h1>

      <div className="relative border-l-4 border-blue-500 ml-4">

        {history.map((item, index) => (
          <div key={index} className="mb-8 ml-6">

            {/* Dot */}
            <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-2"></div>

            {/* Card */}
            <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <span className="text-sm text-blue-500 font-semibold">
                {item.date}
              </span>
              <p className="text-gray-700 mt-1">{item.note}</p>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}