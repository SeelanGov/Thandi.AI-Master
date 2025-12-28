import AssessmentForm from './components/AssessmentForm';

// THANDI Assessment Page - Updated Dec 28, 2025
export const metadata = {
  title: 'THANDI Career Assessment - Discover Your Future',
  description: 'Complete your personalized career assessment with THANDI and discover the perfect career path for your South African education journey.',
};

export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-assessment-bg">
      <AssessmentForm />
    </main>
  );
}
