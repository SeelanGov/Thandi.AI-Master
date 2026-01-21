'use client';

import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import RecentErrorsList from './RecentErrorsList';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [recentErrors, setRecentErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/overview', {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date(result.timestamp));
        setError(null);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent errors
  const fetchRecentErrors = async () => {
    try {
      const response = await fetch('/api/admin/errors?limit=10&resolved=false', {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRecentErrors(result.data);
        }
      }
    } catch (err) {
      console.error('Recent errors fetch error:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
    fetchRecentErrors();
  }, []);

  // Set up polling (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchRecentErrors();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdated) / 1000);
    
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    return lastUpdated.toLocaleTimeString();
  };

  // Error state
  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <span className="text-4xl mb-2 block">⚠️</span>
        <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchDashboardData();
          }}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time system monitoring and analytics
          </p>
        </div>
        {lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {formatLastUpdated()}
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Errors */}
        <MetricCard
          label="Total Errors"
          value={data?.errors?.count ?? 0}
          trend={data?.errors?.trend}
          status={data?.errors?.status || 'unknown'}
          icon="🐛"
          loading={loading}
        />

        {/* Average Response Time */}
        <MetricCard
          label="Avg Response Time"
          value={data?.performance?.avgResponseTime ?? 0}
          unit="ms"
          trend={data?.performance?.trend}
          status={data?.performance?.status || 'unknown'}
          icon="⚡"
          loading={loading}
        />

        {/* Active Users */}
        <MetricCard
          label="Active Users"
          value={data?.activity?.activeUsers ?? 0}
          trend={data?.activity?.trend}
          status={data?.activity?.status || 'unknown'}
          icon="👥"
          subtitle="Last 24 hours"
          loading={loading}
        />

        {/* System Health */}
        <MetricCard
          label="System Health"
          value={data?.health?.uptime ?? 0}
          unit="%"
          trend={null}
          status={data?.health?.status === 'healthy' ? 'good' : 'critical'}
          icon="💚"
          subtitle={data?.health?.status || 'Unknown'}
          loading={loading}
        />

        {/* Pending Alerts */}
        <MetricCard
          label="Pending Alerts"
          value={data?.alerts?.active ?? 0}
          trend={null}
          status={data?.alerts?.status || 'unknown'}
          icon="🔔"
          subtitle={`${data?.alerts?.critical || 0} critical, ${data?.alerts?.warning || 0} warning`}
          loading={loading}
        />

        {/* API Success Rate */}
        <MetricCard
          label="API Success Rate"
          value={data?.apiSuccessRate?.rate ?? 0}
          unit="%"
          trend={null}
          status={data?.apiSuccessRate?.status || 'unknown'}
          icon="✅"
          subtitle="Last 24 hours"
          loading={loading}
        />
      </div>

      {/* Recent Errors */}
      <RecentErrorsList errors={recentErrors} loading={loading} />
    </div>
  );
}
