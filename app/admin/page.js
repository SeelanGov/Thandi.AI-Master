'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to school claim page
    router.replace('/school/claim');
  }, [router]);

  return (
    <div className="min-h-screen bg-thandi-cream flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto mb-4"></div>
        <p className="text-thandi-brown font-body">Redirecting to school login...</p>
      </div>
    </div>
  );
}