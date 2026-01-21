'use client';

import { useState, useEffect } from 'react';
import ActivityCharts from './ActivityCharts';

export default function ActivityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    event_type: '',
  });

  // Fetch activity data
  const fetchActivityData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary and breakdown
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.event_type) params.append('event_type', filters.event_type);
      params.append('include_stats', 'true');
      params.append('limit', '10');

      const [activityResponse, funnelResponse] = await Promise.all([
        fetch(`/api/admin/activity?${params}`, {
          headers: {
            'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
          },
        }),
        fetch(`/api/admin/activity/funnel?${new URLSearchParams({ 
          start_date: filters.start_date, 
          end_date: filters.end_date 
        })}`, {
          headers: {
            'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
          },
        }),
      ]);

      if (!activityResponse.ok || !funnelResponse.ok) {
        throw new Error('Failed to fetch activity data');
      }

      const activityResult = await activityResponse.json();
      const funnelResult = await funnelResponse.json();
      
      if (activityResult.success && funnelResult.success) {
        setData({
          summary: activityResult.summary,
          breakdown: activityResult.breakdown,
          timeline: activityResult.timeline,
          funnel: funnelResult.data,
        });
        setError(null);
      } else {
        throw new Error(activityResult.error || funnelResult.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Activity fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActivityData();
  }, [filters]);

  // Set up polling (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivityData();
    }, 30000);

    return () => clearInterval(interval);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Error state
  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <span className="text-4xl mb-2 block">⚠️</span>
        <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Activity Data</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchActivityData}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          User activity tracking and funnel analysis
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={filters.event_type}
              onChange={(e) => handleFilterChange('event_type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Events</option>
              <option value="registration">Registration</option>
              <option value="assessment_start">Assessment Start</option>
              <option value="assessment_complete">Assessment Complete</option>
              <option value="school_login">School Login</option>
              <option value="rag_query">RAG Query</option>
            </select>
          </div>

          <button
            onClick={fetchActivityData}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Activity Charts */}
      <ActivityCharts data={data} loading={loading} />
    </div>
  );
}
