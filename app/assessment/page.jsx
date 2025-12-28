// THANDI Assessment Page - Professional Implementation
import { Suspense } from 'react';
import AssessmentForm from './components/AssessmentForm';

// Metadata for SEO and proper page structure
export const metadata = {
  title: 'THANDI Career Assessment - Discover Your Future',
  description: 'Complete your personalized career assessment with THANDI and discover the perfect career path for your South African education journey.',
  robots: {
    index: true,
    follow: true,
  },
};

// Loading component for proper user experience
function AssessmentLoading() {
  return (
    <div className="min-h-screen bg-assessment-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto mb-4"></div>
        <p className="text-thandi-teal font-medium">Loading your career assessment...</p>
      </div>
    </div>
  );
}

// Main assessment page component
export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-assessment-bg">
      <Suspense fallback={<AssessmentLoading />}>
        <AssessmentForm />
      </Suspense>
    </main>
  );
}
