'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SchoolDashboardPlaceholder() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to school claim page for now
    // When full School Dashboard is built (see .kiro/specs/school-dashboard-upgrade/),
    // this placeholder will be replaced with the actual dashboard
    router.push('/school/claim');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to School Portal...</p>
      </div>
    </div>
  );
}
