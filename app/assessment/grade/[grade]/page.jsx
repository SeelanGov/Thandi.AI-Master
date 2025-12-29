import { redirect } from 'next/navigation';

// Fallback page for when JavaScript isn't working
export default function GradeFallback({ params }) {
  const grade = params.grade;
  
  // Redirect to main assessment with grade in URL
  redirect(`/assessment?grade=${grade}&step=registration`);
}