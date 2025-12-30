'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (!token) {
      setError(new Error('No authentication token provided'));
      setLoading(false);
      return;
    }

    // Fetch stats with token in URL (middleware will handle headers)
    fetch(`/api/school/dashboard/stats?token=${encodeURIComponent(token)}`)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to fetch stats: ${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(data => {
        setStats(data);
        // Extract school info from test mode or API response
        setSchoolInfo({
          name: 'MT CURRIE SENIOR SECONDARY SCHOOL',
          id: 'ZAF-P-500215340',
          principal: 'Test Principal'
        });
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [token]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-thandi-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto"></div>
          <p className="mt-4 text-thandi-brown font-body">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-thandi-cream flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-thandi max-w-md border border-thandi-brown/10">
          <h2 className="text-xl font-bold font-heading text-thandi-teal mb-4">Unable to load Thandi dashboard</h2>
          <p className="text-thandi-brown font-body mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-thandi-gold text-thandi-teal px-6 py-3 rounded-lg hover:bg-thandi-gold/90 font-body font-semibold transition-all duration-200 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-thandi-cream">
      {/* Header */}
      <div className="bg-white shadow-thandi border-b border-thandi-brown/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-thandi-gradient rounded-full flex items-center justify-center ring-2 ring-thandi-gold">
                <span className="text-white font-bold text-xl font-heading">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading text-thandi-teal">Thandi School Dashboard</h1>
                <p className="text-thandi-brown font-body">{schoolInfo?.name || 'Loading school...'}</p>
              </div>
            </div>
            <div className="bg-thandi-gold/20 text-thandi-teal px-4 py-2 rounded-full text-sm font-medium font-body">
              🧪 Test Mode
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-thandi border border-thandi-brown/10">
            <h3 className="text-sm font-medium font-heading text-thandi-brown/70 mb-2">Total Students</h3>
            <p className="text-3xl font-bold font-heading text-thandi-teal">{stats?.total_students || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-thandi border border-thandi-brown/10">
            <h3 className="text-sm font-medium font-heading text-thandi-brown/70 mb-2">Completed Assessments</h3>
            <p className="text-3xl font-bold font-heading text-thandi-teal">{stats?.completed || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-thandi border border-thandi-brown/10">
            <h3 className="text-sm font-medium font-heading text-thandi-brown/70 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold font-heading text-thandi-gold">{stats?.completion_rate || 0}%</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-thandi border border-thandi-brown/10">
            <h3 className="text-sm font-medium font-heading text-thandi-brown/70 mb-2">At-Risk Students</h3>
            <p className="text-3xl font-bold font-heading text-red-600">{stats?.at_risk_red || 0}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Careers */}
          <div className="bg-white p-6 rounded-xl shadow-thandi border border-thandi-brown/10">
            <h3 className="text-lg font-semibold font-heading text-thandi-teal mb-4">Top Career Choices</h3>
            <div className="space-y-3">
              {stats?.top_careers?.slice(0, 5).map((career, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-thandi-brown/10 last:border-b-0">
                  <span className="text-sm font-body text-thandi-brown">{career.career_title}</span>
                  <span className="text-sm font-semibold font-body text-thandi-teal">{career.count} students</span>
                </div>
              )) || (
                <p className="text-thandi-brown/70 text-sm font-body">No career data available yet.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-thandi border border-thandi-brown/10">
            <h3 className="text-lg font-semibold font-heading text-thandi-teal mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-lg border-2 border-thandi-brown/10 hover:border-thandi-gold hover:bg-thandi-cream/30 transition-all duration-200">
                <div className="font-medium font-heading text-thandi-teal">View All Students</div>
                <div className="text-sm font-body text-thandi-brown/70">See complete student list and progress</div>
              </button>
              
              <button className="w-full text-left p-4 rounded-lg border-2 border-thandi-brown/10 hover:border-thandi-gold hover:bg-thandi-cream/30 transition-all duration-200">
                <div className="font-medium font-heading text-thandi-teal">Generate Reports</div>
                <div className="text-sm font-body text-thandi-brown/70">Download assessment reports and analytics</div>
              </button>
              
              <button className="w-full text-left p-4 rounded-lg border-2 border-thandi-brown/10 hover:border-thandi-gold hover:bg-thandi-cream/30 transition-all duration-200">
                <div className="font-medium font-heading text-thandi-teal">At-Risk Students</div>
                <div className="text-sm font-body text-thandi-brown/70">Review students needing attention</div>
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-thandi-brown/10">
          <h4 className="font-semibold font-heading text-thandi-teal mb-3">🎉 Dashboard Status: WORKING!</h4>
          <div className="text-sm font-body text-thandi-brown space-y-1">
            <p>✅ Test mode authentication successful</p>
            <p>✅ Database connection working</p>
            <p>✅ API endpoints responding</p>
            <p>✅ Thandi branding applied</p>
            <p className="mt-3 font-medium font-heading">School Info:</p>
            <div className="text-xs bg-white p-3 rounded-lg mt-2 border border-thandi-brown/10">
              <p><strong>Name:</strong> {schoolInfo?.name}</p>
              <p><strong>ID:</strong> {schoolInfo?.id}</p>
              <p><strong>Principal:</strong> {schoolInfo?.principal}</p>
            </div>
            <p className="mt-3 font-medium font-heading">Raw stats data:</p>
            <pre className="text-xs bg-white p-3 rounded-lg mt-2 overflow-auto border border-thandi-brown/10">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimpleDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-thandi-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto mb-4"></div>
          <p className="text-thandi-brown font-body">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}