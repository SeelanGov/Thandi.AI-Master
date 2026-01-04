import { redirect } from 'next/navigation';
import AssessmentPageClient from '../../components/AssessmentPageClient';

export default async function GradeAssessmentPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const grade = resolvedParams.grade;
  const isRegistered = resolvedSearchParams.registered === 'true';
  const isAnonymous = resolvedSearchParams.anonymous === 'true';
  
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