'use client';

/**
 * Activity Charts Component
 * Displays user activity visualizations
 */

export default function ActivityCharts({ data }) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No activity data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Type Distribution */}
      {data.by_event_type && data.by_event_type.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity by Event Type
          </h3>
          
          <div className="space-y-3">
            {data.by_event_type.map((event, index) => {
              const maxCount = Math.max(...data.by_event_type.map(e => e.count));
              const percentage = (event.count / maxCount) * 100;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium capitalize">
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {event.count} events
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Funnel Visualization */}
      {data.funnel && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Funnel
          </h3>
          
          <div className="space-y-4">
            {data.funnel.steps && data.funnel.steps.map((step, index) => {
              const isFirst = index === 0;
              const conversionRate = isFirst 
                ? 100 
                : ((step.count / data.funnel.steps[0].count) * 100).toFixed(1);
              
              return (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={
                        `w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                          conversionRate > 50 ? 'bg-green-500' : conversionRate > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`
                      }>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {step.step_name.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {step.count} users • {conversionRate}% conversion
                        </p>
                      </div>
                    </div>
                    
                    {!isFirst && step.drop_off_rate && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">
                          -{step.drop_off_rate}%
                        </p>
                        <p className="text-xs text-gray-500">drop-off</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Funnel bar */}
                  <div className="w-full bg-gray-200 rounded h-3">
                    <div
                      className={`h-3 rounded ${conversionRate > 50 ? 'bg-green-500' : conversionRate > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                  
                  {/* Connector line */}
                  {index < data.funnel.steps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-4 bg-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {data.funnel.overall_conversion_rate && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Overall Conversion Rate
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {data.funnel.overall_conversion_rate}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {data.summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.summary.total_events && (
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.total_events.toLocaleString()}
                </p>
              </div>
            )}
            
            {data.summary.unique_users && (
              <div>
                <p className="text-sm text-gray-500">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.unique_users.toLocaleString()}
                </p>
              </div>
            )}
            
            {data.summary.active_schools && (
              <div>
                <p className="text-sm text-gray-500">Active Schools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.active_schools.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
