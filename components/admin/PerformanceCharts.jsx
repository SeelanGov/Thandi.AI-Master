'use client';

export default function PerformanceCharts({ summary, endpoints, slowEndpoints }) {
  if (!summary) {
    return null;
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Average Response Time</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {formatDuration(summary.avg_response_time)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Median Response Time</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {formatDuration(summary.median_response_time)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">95th Percentile</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {formatDuration(summary.p95_response_time)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">99th Percentile</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {formatDuration(summary.p99_response_time)}
          </div>
        </div>
      </div>

      {/* Slow Endpoints */}
      {slowEndpoints && slowEndpoints.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Slow Endpoints (&gt;500ms)
          </h3>
          <div className="space-y-3">
            {slowEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{endpoint.endpoint}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {endpoint.request_count} requests
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {formatDuration(endpoint.avg_response_time)}
                  </div>
                  <div className="text-xs text-gray-600">avg response</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoint Breakdown */}
      {endpoints && endpoints.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Endpoint Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {endpoints.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {endpoint.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {endpoint.request_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatDuration(endpoint.avg_response_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDuration(endpoint.min_response_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDuration(endpoint.max_response_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {endpoint.avg_response_time > 500 ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Slow
                        </span>
                      ) : endpoint.avg_response_time > 200 ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Moderate
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Fast
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
