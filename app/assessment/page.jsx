'use client';

import { useState, useEffect } from 'react';
import BulletproofStudentRegistration from '../../components/BulletproofStudentRegistration';

export default function AssessmentPage() {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isRegistrationRedirect, setIsRegistrationRedirect] = useState(false);
  
  useEffect(() => {
    // Check if this is a registration redirect from results page
    const urlParams = new URLSearchParams(window.location.search);
    const registerParam = urlParams.get('register');
    
    if (registerParam === 'true') {
      setIsRegistrationRedirect(true);
    }
  }, []);
  
  const handleRegistrationComplete = (data) => {
    console.log('Registration completed:', data);
    setRegistrationComplete(true);
    
    // If this was a registration redirect, restore results and go back
    if (isRegistrationRedirect && data.type === 'registered') {
      const backupResults = localStorage.getItem('thandi_results_backup');
      if (backupResults) {
        localStorage.setItem('thandi_results', backupResults);
        localStorage.removeItem('thandi_results_backup');
        
        // Show success message and redirect to results
        setTimeout(() => {
          window.location.href = '/results?registered=true';
        }, 1500);
        
        return;
      }
    }
    
    // Normal flow - redirect to assessment questions
    if (data.type === 'registered') {
      window.location.href = `/assessment/grade/${data.grade}?registered=true`;
    } else {
      window.location.href = `/assessment/grade/${data.grade}?anonymous=true`;
    }
  };
  
  if (registrationComplete) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isRegistrationRedirect ? 'Registration Complete!' : 'Redirecting...'}
          </h2>
          <p className="text-gray-600">
            {isRegistrationRedirect 
              ? 'Taking you back to your results with your new dashboard access...' 
              : 'Taking you to your assessment...'}
          </p>
        </div>
      </main>
    );
  }
  
  // CRITICAL: Always show registration form first - never show grade selector
  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      {isRegistrationRedirect && (
        <div className="max-w-2xl mx-auto pt-8 pb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-500 text-xl mr-3">✅</div>
              <div>
                <h3 className="font-semibold text-green-900">Complete Your Registration</h3>
                <p className="text-green-800 text-sm">Register now to save your career results and get access to your student dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <BulletproofStudentRegistration onComplete={handleRegistrationComplete} />
    </main>
  );
}