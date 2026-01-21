'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import ErrorDetails from '@/components/admin/ErrorDetails';

export default function ErrorDetailsPage({ params }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchErrorDetails();
  }, [params.id]);

  const fetchErrorDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/errors/${params.id}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'dev-admin-key-12345'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setError(data);
      } else {
        console.error('Failed to fetch error details');
      }
    } catch (error) {
      console.error('Failed to fetch error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const response = await fetch(`/api/admin/errors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'dev-admin-key-12345'
        },
        body: JSON.stringify({ resolved: true })
      });

      if (response.ok) {
        // Refresh error details
        await fetchErrorDetails();
      } else {
        console.error('Failed to resolve error');
      }
    } catch (error) {
      console.error('Failed to resolve error:', error);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin/errors"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Errors
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Error Details</h1>
          <p className="mt-2 text-sm text-gray-600">
            View complete error information and context
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading error details...</p>
          </div>
        )}

        {/* Error Details */}
        {!loading && <ErrorDetails error={error} onResolve={handleResolve} resolving={resolving} />}
      </div>
    </div>
  );
}
