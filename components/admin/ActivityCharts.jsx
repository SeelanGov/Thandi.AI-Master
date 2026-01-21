'use client';

export default function ActivityCharts({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <span className="text-4xl mb-2 block">📊</span>
        <p className="text-gray-600">No activity data available</p>
      </div>
    );
  }

  const { summary, breakdown, funnel } = data;

  return (
    <div className="space-y-6">
      {/* Active Users Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Active</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.active_users || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Registrations</p>
            <p className="text-2xl font-bold text-emerald-600">{summary?.registrations || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Assessments</p>
            <p className="text-2xl font-bold text-blue-600">{summary?.assessments || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">RAG Queries</p>
            <p className="text-2xl font-bold text-purple-600">{summary?.rag_queries || 0}</p>
          </div>
        </div>
      </div>

      {/* Funnel Metrics */}
      {funnel && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {funnel.stages?.map((stage, index) => {
              const isFirst = index === 0;
              const conversionRate = isFirst ? 100 : stage.conversion_rate;
              const dropOffRate = isFirst ? 0 : stage.drop_off_rate;
              
              return (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{stage.icon || '📊'}</span>
                      <div>
                        <p className="font-medium text-gray-900">{stage.stage}</p>
                        <p className="text-sm text-gray-600">{stage.count} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {conversionRate.toFixed(1)}%
                      </p>
                      {!isFirst && (
                        <p className="text-sm text-red-600">
                          -{dropOffRate.toFixed(1)}% drop-off
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${conversionRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {funnel.overall_conversion_rate !== undefined && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Overall Conversion Rate</p>
                <p className="text-xl font-bold text-emerald-600">
                  {funnel.overall_conversion_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {breakdown.map((item) => (
                  <tr key={item.event_type} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {item.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900">{item.count}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-600">
                        {item.percentage?.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Over Time */}
      {summary?.timeline && summary.timeline.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h3>
          <div className="space-y-2">
            {summary.timeline.slice(0, 10).map((point, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(point.timestamp).toLocaleString()}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">
                    {point.count} events
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (point.count / Math.max(...summary.timeline.map(p => p.count))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
