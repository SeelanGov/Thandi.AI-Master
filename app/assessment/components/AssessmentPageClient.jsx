'use client';

import { useState, useEffect } from 'react';
import AssessmentForm from './AssessmentForm';

export default function AssessmentPageClient({ initialGrade, initialStep }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState(null);
  
  // Data persistence - load saved assessment data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('Thandi_assessment_progress');
      if (savedData) {
        setAssessmentData(JSON.parse(savedData));
      }
    } catch (err) {
      console.error('Error loading saved assessment data:', err);
      setError('Failed to load saved progress. Starting fresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Error boundary
  const handleError = (error) => {
    console.error('Assessment error:', error);
    setError('Something went wrong. Please refresh the page and try again.');
  };
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Assessment</h2>
            <p className="text-gray-600">Preparing your career assessment...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <AssessmentForm 
      initialGrade={initialGrade} 
      initialStep={initialStep}
      savedData={assessmentData}
      onError={handleError}
    />
  );
}
