'use client';

import Link from 'next/link';

export default function RecentErrorsList({ errors, loading = false }) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!errors || errors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h2>
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block">✅</span>
          <p className="text-gray-500">No errors in the last 24 hours</p>
        </div>
      </div>
    );
  }

  // Severity colors
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

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Errors</h2>
        <Link 
          href="/admin/errors"
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View all →
        </Link>
      </div>

      {/* Error list */}
      <div className="space-y-3">
        {errors.map((error) => (
          <Link
            key={error.id}
            href={`/admin/errors/${error.id}`}
            className="block p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            {/* Error header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span 
                  className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(error.severity)}`}
                >
                  {error.severity?.toUpperCase() || 'ERROR'}
                </span>
                <span className="text-xs text-gray-500">{formatTime(error.created_at)}</span>
              </div>
            </div>

            {/* Error message */}
            <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
              {error.error_type}: {error.message}
            </p>

            {/* Error metadata */}
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {error.feature_area && (
                <span className="flex items-center">
                  <span className="mr-1">📍</span>
                  {error.feature_area}
                </span>
              )}
              {error.school_id && (
                <span className="flex items-center">
                  <span className="mr-1">🏫</span>
                  {error.school_id}
                </span>
              )}
              {error.student_grade && (
                <span className="flex items-center">
                  <span className="mr-1">🎓</span>
                  Grade {error.student_grade}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
