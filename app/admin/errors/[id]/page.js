/**
 * Admin Error Details Page
 * Displays full error context and resolution options
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ErrorDetails from '@/components/admin/ErrorDetails';

export default function ErrorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch error details
  useEffect(() => {
    const fetchError = async () => {
      try {
        const response = await fetch(`/api/admin/errors/${params.id}`, {
          headers: {
            'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin/login');
            return;
          }
          throw new Error('Failed to fetch error');
        }

        const data = await response.json();
        setError(data.data);
      } catch (error) {
        console.error('Error fetching error details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchError();
    }
  }, [params.id, router]);

  // Mark error as resolved
  const handleResolve = async () => {
    try {
      const response = await fetch(`/api/admin/errors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        },
        body: JSON.stringify({ resolved: true })
      });

      if (!response.ok) throw new Error('Failed to resolve error');

      // Refresh error details
      const data = await response.json();
      setError(data.data);
    } catch (error) {
      console.error('Error resolving error:', error);
      alert('Failed to mark error as resolved');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-thandi-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-thandi-gradient rounded-full flex items-center justify-center ring-2 ring-thandi-gold">
                <span className="text-white font-bold text-lg font-heading">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading text-thandi-brown">
                  Error Details
                </h1>
                <p className="text-sm text-thandi-brown/70 font-body">
                  View full error context and resolution options
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/errors')}
                className="px-4 py-2 text-thandi-teal hover:text-thandi-teal-dark transition-colors font-body"
              >
                ← Back to Errors
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-dark transition-colors font-body"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorDetails
          error={error}
          loading={loading}
          onResolve={handleResolve}
        />
      </main>
    </div>
  );
}
