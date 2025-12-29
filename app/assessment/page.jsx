// BULLETPROOF Assessment Page - GUARANTEED TO WORK
import { Suspense } from 'react';
import AssessmentForm from './components/AssessmentForm';

// Metadata
export const metadata = {
  title: 'THANDI Career Assessment - Discover Your Future',
  description: 'Complete your personalized career assessment with THANDI and discover the perfect career path for your South African education journey.',
  version: '2.0.1' // Force rebuild
};

// Bulletproof loading component
function BulletproofLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Assessment</h2>
          <p className="text-gray-600">Preparing your career assessment...</p>
        </div>
      </div>
    </div>
  );
}

// Main page - bulletproof implementation with URL fallback
export default async function AssessmentPage({ searchParams }) {
  // ✅ FIXED: Await searchParams as required by Next.js 15
  const params = await searchParams;
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<BulletproofLoading />}>
        <AssessmentForm initialGrade={params?.grade} initialStep={params?.step} />
      </Suspense>
    </main>
  );
}
