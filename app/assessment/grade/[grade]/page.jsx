import { redirect } from 'next/navigation';
import AssessmentPageClient from '../../components/AssessmentPageClient';

export default function GradeAssessmentPage({ params, searchParams }) {
  const grade = params.grade;
  const isRegistered = searchParams.registered === 'true';
  const isAnonymous = searchParams.anonymous === 'true';
  
  // Validate grade
  if (!['10', '11', '12'].includes(grade)) {
    redirect('/assessment');
  }
  
  return (
    <AssessmentPageClient 
      grade={grade}
      isRegistered={isRegistered}
      isAnonymous={isAnonymous}
    />
  );
}