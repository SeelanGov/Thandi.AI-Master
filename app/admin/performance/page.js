/**
 * Admin Performance Page
 * Displays API performance metrics and trends
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PerformanceDashboard from '@/components/admin/PerformanceDashboard';

export default function PerformancePage() {
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d

  // Fetch performance data
  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ time_range: timeRange });
      
      const [perfResponse, trendsResponse] = await Promise.all([
        fetch(`/api/admin/performance?${params}`, {
          headers: {
            'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
          }
        }),
        fetch(`/api/admin/performance/trends?${params}`, {
          headers: {
            'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
          }
        })
      ]);

      if (!perfResponse.ok || !trendsResponse.ok) {
        if (perfResponse.status === 401 || trendsResponse.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch performance data');
      }

      const perfData = await perfResponse.json();
      const trendsData = await trendsResponse.json();

      setPerformanceData(perfData.data);
      setTrendsData(trendsData.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when time range changes
  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-thandi-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-thandi-gradient rounded-full flex items-center justify-center ring-2 ring-thandi-gold">
                <span className="text-white font-bold text-lg font-heading">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading text-thandi-brown">
                  Performance Monitoring
                </h1>
                <p className="text-sm text-thandi-brown/70 font-body">
                  Track API response times and identify slow endpoints
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-thandi-teal hover:text-thandi-teal-dark transition-colors font-body"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-dark transition-colors font-body"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Selector */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-thandi-brown/70 font-body">
              Time Range:
            </span>
            <div className="flex space-x-2">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-body transition-colors ${
                    timeRange === range
                      ? 'bg-thandi-teal text-white'
                      : 'bg-gray-100 text-thandi-brown hover:bg-gray-200'
                  }`}
                >
                  {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Dashboard */}
        <PerformanceDashboard
          performanceData={performanceData}
          trendsData={trendsData}
          loading={loading}
        />
      </main>
    </div>
  );
}
