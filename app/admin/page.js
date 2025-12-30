'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Redirect to school claim page
    setIsRedirecting(true);
    const timer = setTimeout(() => {
      router.replace('/school/claim');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-thandi-cream flex items-center justify-center px-4 sm:px-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto mb-4"></div>
        <p className="text-thandi-brown font-body">
        {isRedirecting ? 'Redirecting to Thandi school portal...' : 'Loading...'}
      </p>
      </div>
    </div>
  );
}