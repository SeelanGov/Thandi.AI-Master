'use client';

export default function ErrorDetails({ error, onResolve, resolving }) {
  if (!error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600">Error not found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSeverityColor = (type) => {
    const colors = {
      database_error: 'bg-red-100 text-red-800 border-red-200',
      api_error: 'bg-orange-100 text-orange-800 border-orange-200',
      validation_error: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      authentication_error: 'bg-purple-100 text-purple-800 border-purple-200',
      external_service_error: 'bg-blue-100 text-blue-800 border-blue-200',
      unknown_error: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${getSeverityColor(error.error_type)}`}>
                {error.error_type.replace('_', ' ')}
              </span>
              {error.resolved ? (
                <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                  Resolved
                </span>
              ) : (
                <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                  Active
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error.error_message}
            </h2>
            {error.endpoint && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Endpoint:</span> {error.endpoint}
              </p>
            )}
          </div>
          {!error.resolved && (
            <button
              onClick={onResolve}
              disabled={resolving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {resolving ? 'Resolving...' : 'Mark Resolved'}
            </button>
          )}
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-600">Occurrence Count</div>
            <div className="mt-1 text-3xl font-bold text-gray-900">{error.occurrence_count}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">First Occurrence</div>
            <div className="mt-1 text-sm text-gray-900">{formatDate(error.first_occurrence)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Last Occurrence</div>
            <div className="mt-1 text-sm text-gray-900">{formatDate(error.last_occurrence)}</div>
          </div>
        </div>
      </div>

      {/* Context Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600">Feature</div>
            <div className="mt-1 text-sm text-gray-900">{error.feature || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">School ID</div>
            <div className="mt-1 text-sm text-gray-900">{error.school_id || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">User ID</div>
            <div className="mt-1 text-sm text-gray-900">{error.user_id || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Session ID</div>
            <div className="mt-1 text-sm text-gray-900 font-mono text-xs">{error.session_id || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Stack Trace Card */}
      {error.stack_trace && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stack Trace</h3>
          <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
            <pre className="text-xs text-gray-100 font-mono whitespace-pre-wrap">
              {error.stack_trace}
            </pre>
          </div>
        </div>
      )}

      {/* Additional Context Card */}
      {error.context && Object.keys(error.context).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Context</h3>
          <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
            <pre className="text-xs text-gray-900 font-mono whitespace-pre-wrap">
              {JSON.stringify(error.context, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
