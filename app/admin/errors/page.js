'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import ErrorFilters from '@/components/admin/ErrorFilters';
import ErrorsList from '@/components/admin/ErrorsList';

export default function ErrorsPage() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchErrors();
  }, [filters, pagination.page]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/admin/errors?${params}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'dev-admin-key-12345'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Error Message', 'Type', 'Feature', 'Count', 'First Occurrence', 'Last Occurrence', 'Status'];
    const rows = errors.map(error => [
      error.id,
      `"${error.error_message.replace(/"/g, '""')}"`,
      error.error_type,
      error.feature || '',
      error.occurrence_count,
      error.first_occurrence,
      error.last_occurrence,
      error.resolved ? 'Resolved' : 'Active'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Error Tracking</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor and manage system errors across all features
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Total Errors</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{pagination.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Active Errors</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {errors.filter(e => !e.resolved).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Resolved</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {errors.filter(e => e.resolved).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600">Actions</div>
            <button
              onClick={handleExportCSV}
              disabled={errors.length === 0}
              className="mt-2 w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <ErrorFilters onFilterChange={handleFilterChange} />

        {/* Errors List */}
        <ErrorsList errors={errors} loading={loading} />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total errors)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
