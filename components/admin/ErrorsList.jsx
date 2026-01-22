/**
 * Errors List Component
 * Displays list of errors with pagination
 */

'use client';

import { useRouter } from 'next/navigation';

export default function ErrorsList({ errors, loading, pagination, onPageChange }) {
  const router = useRouter();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal"></div>
        </div>
      </div>
    );
  }

  if (errors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-thandi-brown/70 font-body">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">No errors found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Errors List */}
      <div className="divide-y divide-gray-200">
        {errors.map((error) => (
          <div
            key={error.id}
            className="p-6 hover:bg-thandi-cream/30 transition-colors cursor-pointer"
            onClick={() => router.push(`/admin/errors/${error.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(error.severity)}`}>
                    {error.severity?.toUpperCase() || 'ERROR'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {error.error_type}
                  </span>
                  {error.feature_area && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      {error.feature_area}
                    </span>
                  )}
                  {error.resolved && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      ✓ Resolved
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-thandi-brown font-heading mb-1">
                  {error.message}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-thandi-brown/70 font-body">
                  <span>{formatDate(error.created_at)}</span>
                  {error.school_id && <span>School: {error.school_id}</span>}
                  {error.student_grade && <span>Grade: {error.student_grade}</span>}
                  {error.url && <span className="truncate max-w-xs">{error.url}</span>}
                </div>
              </div>
              <div className="ml-4">
                <svg className="h-5 w-5 text-thandi-brown/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-thandi-brown/70 font-body">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total errors)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
