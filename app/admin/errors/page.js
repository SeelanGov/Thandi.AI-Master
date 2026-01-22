/**
 * Admin Errors Page
 * Displays system errors with filtering, search, and pagination
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorsList from '@/components/admin/ErrorsList';
import ErrorFilters from '@/components/admin/ErrorFilters';

export default function ErrorsPage() {
  const router = useRouter();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    school_id: '',
    feature_area: '',
    start_date: '',
    end_date: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Fetch errors
  const fetchErrors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });

      const response = await fetch(`/api/admin/errors?${params}`, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch errors');
      }

      const data = await response.json();
      setErrors(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching errors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch errors on mount and when filters/pagination change
  useEffect(() => {
    fetchErrors();
  }, [filters, pagination.page]);

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to page 1
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });

      const response = await fetch(`/api/admin/errors/export?${params}`, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `errors-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export errors');
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
                  System Errors
                </h1>
                <p className="text-sm text-thandi-brown/70 font-body">
                  Monitor and resolve system errors
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-thandi-teal hover:text-thandi-teal-dark transition-colors font-body"
              >
                ← Back to Dashboard
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
        {/* Filters */}
        <ErrorFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
        />

        {/* Errors List */}
        <ErrorsList
          errors={errors}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
