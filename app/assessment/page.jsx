import AssessmentForm from './components/AssessmentForm';

// THANDI Assessment Page - Updated Dec 28, 2025 - EMERGENCY FIX
'use client';

import { useEffect } from 'react';
import AssessmentForm from './components/AssessmentForm';

export default function AssessmentPage() {
  // Emergency: Force client-side rendering detection
  useEffect(() => {
    console.log('🔧 Assessment page hydrated successfully');
  }, []);

  return (
    <main className="min-h-screen bg-assessment-bg">
      <AssessmentForm />
    </main>
  );
}
