/**
 * Activity Dashboard Component
 * Displays user activity metrics and funnel analysis
 */

'use client';

export default function ActivityDashboard({ activityData, funnelData, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal"></div>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center text-thandi-brown/70 font-body">
          <p className="text-lg font-medium">No activity data available</p>
        </div>
      </div>
    );
  }

  const { summary, by_event_type, recent_events } = activityData;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">Active Users (24h)</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.active_users_24h || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">Registrations</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.registrations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">Assessments</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.assessments_completed || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-thandi-brown/70 font-body">RAG Queries</p>
              <p className="text-3xl font-bold font-heading text-thandi-teal mt-1">
                {summary?.rag_queries || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Analysis */}
      {funnelData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
            User Funnel Analysis
          </h3>
          <div className="space-y-4">
            {funnelData.funnel_steps && funnelData.funnel_steps.map((step, index) => {
              const isDropOff = step.drop_off_rate > 20;
              return (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-thandi-brown/30 font-heading">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-thandi-brown font-body">
                          {step.step_name}
                        </h4>
                        <p className="text-sm text-thandi-brown/70 font-body">
                          {step.count} users • {step.conversion_rate?.toFixed(1)}% conversion
                        </p>
                      </div>
                    </div>
                    {isDropOff && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        High Drop-off: {step.drop_off_rate?.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isDropOff ? 'bg-red-500' : 'bg-thandi-teal'
                      }`}
                      style={{ width: `${step.conversion_rate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          {funnelData.overall_conversion_rate !== undefined && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-thandi-brown/70 font-body">
                  Overall Conversion Rate
                </span>
                <span className="text-2xl font-bold text-thandi-teal font-heading">
                  {funnelData.overall_conversion_rate?.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
          Event Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {by_event_type && by_event_type.length > 0 ? (
            by_event_type.map((event, index) => (
              <div key={index} className="bg-thandi-cream rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-thandi-brown/70 font-body">
                    {event.event_type}
                  </span>
                  <span className="text-2xl font-bold text-thandi-teal font-heading">
                    {event.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-thandi-teal h-2 rounded-full"
                    style={{
                      width: `${(event.count / Math.max(...by_event_type.map(e => e.count))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-thandi-brown/70 font-body py-8">
              No event data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      {recent_events && recent_events.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-thandi-brown font-heading mb-4">
            Recent Events
          </h3>
          <div className="space-y-3">
            {recent_events.slice(0, 10).map((event, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {event.event_type}
                  </span>
                  {event.school_id && (
                    <span className="text-sm text-thandi-brown/70 font-body">
                      School: {event.school_id}
                    </span>
                  )}
                  {event.student_grade && (
                    <span className="text-sm text-thandi-brown/70 font-body">
                      Grade: {event.student_grade}
                    </span>
                  )}
                </div>
                <span className="text-xs text-thandi-brown/50 font-body">
                  {new Date(event.created_at).toLocaleString('en-ZA', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
