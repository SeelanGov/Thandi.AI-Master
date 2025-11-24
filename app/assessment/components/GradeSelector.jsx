'use client';

export default function GradeSelector({ onSelect }) {
  return (
    <div className="grade-selector max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        What grade are you in?
      </h2>
      
      <div className="space-y-4">
        <button 
          onClick={() => onSelect(10)}
          className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
        >
          Grade 10
        </button>
        
        <button 
          onClick={() => onSelect(11)}
          className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
        >
          Grade 11
        </button>
        
        <button 
          onClick={() => onSelect(12)}
          className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
        >
          Grade 12
        </button>
      </div>
      
      <p className="text-sm text-gray-600 text-center mt-4">
        This helps us customize your career guidance
      </p>
    </div>
  );
}
