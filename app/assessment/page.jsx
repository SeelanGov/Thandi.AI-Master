'use client';

import { useState } from 'react';
import BulletproofStudentRegistration from '../../components/BulletproofStudentRegistration';

export default function AssessmentPage() {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  const handleRegistrationComplete = (data) => {
    console.log('Registration completed:', data);
    setRegistrationComplete(true);
    
    // Redirect to assessment questions
    if (data.type === 'registered') {
      window.location.href = `/assessment/grade/${data.grade}?registered=true`;
    } else {
      window.location.href = `/assessment/grade/${data.grade}?anonymous=true`;
    }
  };
  
  if (registrationComplete) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Redirecting...</h2>
          <p className="text-gray-600">Taking you to your assessment...</p>
        </div>
      </main>
    );
  }
  
  // CRITICAL: Always show registration form first - never show grade selector
  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <BulletproofStudentRegistration onComplete={handleRegistrationComplete} />
    </main>
  );
}