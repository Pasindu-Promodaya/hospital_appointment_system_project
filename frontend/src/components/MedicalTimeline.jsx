import React from 'react';

const MedicalTimeline = ({ encounters }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-6 text-blue-800">Diagnostic Encounters</h2>
      
      <div className="space-y-6 border-l-2 border-blue-200 ml-3">
        {encounters.map((encounter) => (
          <div key={encounter.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 border-2 border-white"></div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-gray-500">{encounter.date}</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  encounter.type === 'Emergency' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {encounter.type}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">
                {encounter.notes}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalTimeline;