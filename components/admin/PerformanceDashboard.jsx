/**
 * Performance Dashboard Component
 * Displays performance metrics and endpoint breakdown
 */

'use client';

export default function PerformanceDashboard({ performanceData, trendsData, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal"></div>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-thandi-brown/70 font-body">
          <p className="text-lg font-medium">No performance data available</p>
        </div>
      </div>
    );
  }

  const { summary, by_endpoint, slow_endpoints } = performanceData;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">Total Requests</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.total_requests?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">Avg Response Time</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.average_response_time || 0}ms
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">P95 Response Time</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.p95_response_time || 0}ms
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">Error Rate</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.error_rate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Slow Endpoints Alert */}
      {slow_endpoints && slow_endpoints.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-bold text-yellow-800 font-heading mb-2">
                Slow Endpoints Detected
              </h3>
              <p className="text-sm text-yellow-700 font-body mb-3">
                The following endpoints are responding slower than the 500ms threshold:
              </p>
              <div className="space-y-2">
                {slow_endpoints.map((endpoint, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm text-thandi-brown">{endpoint.endpoint}</span>
                      <span className="text-sm font-medium text-yellow-800">
                        {endpoint.avg_response_time}ms (threshold: {endpoint.threshold}ms)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Endpoint Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
          Endpoint Performance Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-thandi-brown/70 uppercase tracking-wider font-body">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-thandi-brown/70 uppercase tracking-wider font-body">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-thandi-brown/70 uppercase tracking-wider font-body">
                  Avg Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-thandi-brown/70 uppercase tracking-wider font-body">
                  Error Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-thandi-brown/70 uppercase tracking-wider font-body">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {by_endpoint && by_endpoint.length > 0 ? (
                by_endpoint.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-thandi-cream/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-thandi-brown">{endpoint.endpoint}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-thandi-brown font-body">
                        {endpoint.requests?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-thandi-brown font-body">
                        {endpoint.avg_response_time || 0}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-thandi-brown font-body">
                        {endpoint.error_rate?.toFixed(1) || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {endpoint.avg_response_time > 500 ? (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Slow
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Good
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-thandi-brown/70 font-body">
                    No endpoint data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Time Trends */}
      {trendsData && trendsData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
            Response Time Trends
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {trendsData.map((point, index) => {
              const maxValue = Math.max(...trendsData.map(p => p.avg_response_time));
              const height = (point.avg_response_time / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-thandi-teal rounded-t-lg transition-all hover:bg-thandi-teal-dark"
                    style={{ height: `${height}%` }}
                    title={`${point.avg_response_time}ms`}
                  ></div>
                  <span className="text-xs text-thandi-brown/70 mt-2 font-body">
                    {new Date(point.timestamp).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
