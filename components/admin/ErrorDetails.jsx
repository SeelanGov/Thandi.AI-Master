/**
 * Error Details Component
 * Displays full error context and resolution options
 */

'use client';

export default function ErrorDetails({ error, loading, onResolve }) {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  if (!error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-thandi-brown/70 font-body">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-medium">Error not found</p>
          <p className="text-sm mt-1">The error you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(error.severity)}`}>
                {error.severity?.toUpperCase() || 'ERROR'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {error.error_type}
              </span>
              {error.feature_area && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  {error.feature_area}
                </span>
              )}
              {error.resolved && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  ✓ Resolved
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-thandi-brown font-heading mb-2">
              {error.message}
            </h2>
            <p className="text-thandi-brown/70 font-body">
              Occurred on {formatDate(error.created_at)}
            </p>
          </div>
          {!error.resolved && (
            <button
              onClick={onResolve}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-body"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Error Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
            Basic Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                Error ID
              </label>
              <p className="text-thandi-brown font-mono text-sm">{error.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                Error Type
              </label>
              <p className="text-thandi-brown font-body">{error.error_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                Severity
              </label>
              <p className="text-thandi-brown font-body">{error.severity || 'error'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                Feature Area
              </label>
              <p className="text-thandi-brown font-body">{error.feature_area || 'Unknown'}</p>
            </div>
            {error.url && (
              <div>
                <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                  URL
                </label>
                <p className="text-thandi-brown font-mono text-sm break-all">{error.url}</p>
              </div>
            )}
          </div>
        </div>

        {/* User Context */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
            User Context
          </h3>
          <div className="space-y-3">
            {error.user_id && (
              <div>
                <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                  User ID
                </label>
                <p className="text-thandi-brown font-mono text-sm">{error.user_id}</p>
              </div>
            )}
            {error.school_id && (
              <div>
                <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                  School ID
                </label>
                <p className="text-thandi-brown font-body">{error.school_id}</p>
              </div>
            )}
            {error.student_grade && (
              <div>
                <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                  Student Grade
                </label>
                <p className="text-thandi-brown font-body">Grade {error.student_grade}</p>
              </div>
            )}
            {error.user_agent && (
              <div>
                <label className="block text-sm font-medium text-thandi-brown/70 font-body">
                  User Agent
                </label>
                <p className="text-thandi-brown font-mono text-xs break-all">{error.user_agent}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stack Trace */}
      {error.stack_trace && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
            Stack Trace
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
              {error.stack_trace}
            </pre>
          </div>
        </div>
      )}

      {/* Metadata */}
      {error.metadata && Object.keys(error.metadata).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
            Additional Metadata
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-thandi-brown font-mono text-sm">
              {JSON.stringify(error.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Resolution Information */}
      {error.resolved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-800 font-heading mb-2">
            Resolution Information
          </h3>
          <div className="space-y-2">
            <p className="text-green-700 font-body">
              This error was marked as resolved on {formatDate(error.resolved_at)}
            </p>
            {error.resolved_by && (
              <p className="text-green-700 font-body">
                Resolved by: {error.resolved_by}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}