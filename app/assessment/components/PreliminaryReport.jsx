'use client';

export default function PreliminaryReport({ careers, onDeepDive, onSkip }) {
  return (
    <div className="preliminary-report max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        📊 Your Quick Career Matches
      </h2>
      
      <p className="text-gray-600 text-center mb-6">
        Based on your interests, here are 3 careers to explore:
      </p>
      
      <div className="space-y-4 mb-8">
        {careers.slice(0, 3).map((career, i) => (
          <div key={i} className="career-preview p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {i + 1}. {career.title} ({career.match}% match)
            </h3>
            <p className="text-gray-600">{career.reason}</p>
            {career.bursaries && career.bursaries.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-green-600 font-medium">
                  💰 Bursaries: {career.bursaries.join(', ')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="deep-dive-cta bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          💰 See Your 3-Year Success Plan
        </h3>
        
        <p className="text-lg text-gray-700 mb-4">
          Worth <strong className="text-green-600">R50,000+ in bursaries</strong> & clear steps
        </p>
        
        <ul className="space-y-2 mb-6 text-gray-700">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            How to improve marks year-by-year
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Bursary deadlines and amounts
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Backup plans if things change
          </li>
        </ul>
        
        <p className="text-sm text-gray-600 mb-6">
          ⏱️ Takes 5 more minutes
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={onDeepDive}
            className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
          >
            Build My Plan →
          </button>
          
          <button 
            onClick={onSkip}
            className="w-full py-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}
