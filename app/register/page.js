'use client';

import { useRouter } from 'next/navigation';
import BulletproofStudentRegistration from '../../components/BulletproofStudentRegistration';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationComplete = (data) => {
    console.log('✅ Registration complete:', data);
    
    // Redirect to grade-specific assessment
    if (data.type === 'registered') {
      // Token already stored in localStorage by the component
      console.log('🎓 Registered user - redirecting to assessment');
      router.push(`/assessment/grade/${data.grade}?registered=true`);
    } else if (data.type === 'anonymous') {
      // Session token already stored in localStorage by the component
      console.log('👤 Anonymous user - redirecting to assessment');
      router.push(`/assessment/grade/${data.grade}?anonymous=true`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Student Registration</h1>
        <BulletproofStudentRegistration onComplete={handleRegistrationComplete} />
      </div>
    </div>
  );
}