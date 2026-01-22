'use client';

/**
 * Performance Charts Component
 * Displays performance metrics visualizations
 */

export default function PerformanceCharts({ data }) {
  if (!data || !data.by_endpoint || data.by_endpoint.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Response Time Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Response Time by Endpoint
        </h3>
        
        <div className="space-y-3">
          {data.by_endpoint.map((endpoint, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium truncate max-w-xs">
                  {endpoint.endpoint}
                </span>
                <span className="text-gray-900 font-semibold">
                  {endpoint.avg_response_time}ms
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    endpoint.avg_response_time > 500
                      ? 'bg-red-500'
                      : endpoint.avg_response_time > 300
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((endpoint.avg_response_time / 1000) * 100, 100)}%`
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{endpoint.requests} requests</span>
                <span>{endpoint.error_rate}% errors</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {data.summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.average_response_time}ms
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Median</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.median_response_time}ms
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">P95</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.p95_response_time}ms
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">P99</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary.p99_response_time}ms
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Slow Endpoints Alert */}
      {data.slow_endpoints && data.slow_endpoints.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-900 mb-2">
            ⚠️ Slow Endpoints Detected
          </h4>
          <ul className="space-y-1">
            {data.slow_endpoints.map((endpoint, index) => (
              <li key={index} className="text-sm text-red-700">
                {endpoint.endpoint}: {endpoint.avg_response_time}ms 
                (threshold: {endpoint.threshold}ms)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
