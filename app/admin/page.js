'use client';

/**
 * Admin Dashboard Page
 * /admin
 * Protected route - requires authentication
 * Created: January 20, 2026
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardOverview from '@/components/admin/DashboardOverview';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify');
      const data = await response.json();

      if (data.success) {
        setAuthenticated(true);
        setLoading(false);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  return <DashboardOverview />;
}
