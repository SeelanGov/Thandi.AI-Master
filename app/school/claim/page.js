'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SchoolClaimPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [claimForm, setClaimForm] = useState({
    principal_email: '',
    contact_phone: ''
  });
  const [claimStatus, setClaimStatus] = useState(null);

  // Search schools
  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();
      
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle school selection
  const selectSchool = (school) => {
    setSelectedSchool(school);
    setSearchResults([]);
    setSearchQuery(school.name);
  };

  // Handle claim submission
  const handleClaim = async (e) => {
    e.preventDefault();
    if (!selectedSchool) return;

    setLoading(true);
    try {
      const response = await fetch('/api/schools/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          school_id: selectedSchool.school_id,
          principal_email: claimForm.principal_email,
          contact_phone: claimForm.contact_phone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setClaimStatus({
          type: 'success',
          message: data.message,
          magic_link: data.magic_link // For development only
        });
      } else {
        setClaimStatus({
          type: 'error',
          message: data.error
        });
      }
    } catch (error) {
      setClaimStatus({
        type: 'error',
        message: 'Failed to submit claim. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-thandi-cream">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-thandi-brown/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-thandi-gradient rounded-full flex items-center justify-center ring-2 ring-thandi-gold">
                <span className="text-white font-bold text-lg font-heading">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading text-thandi-teal">Thandi.ai</h1>
                <p className="text-xs text-thandi-brown -mt-1 font-body">School Administration</p>
              </div>
            </Link>
            <Link 
              href="/"
              className="text-thandi-brown hover:text-thandi-teal transition-colors font-body"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-thandi-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-thandi">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold font-heading text-thandi-teal mb-4">
              Thandi School Administration Portal
            </h1>
            <p className="text-xl text-thandi-brown font-body max-w-2xl mx-auto">
              Claim your school's access to the Thandi AI dashboard and start supporting your students' career journeys
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-thandi border border-thandi-brown/10 mb-8">
            <div className="p-8">
              <label className="block text-lg font-semibold font-heading text-thandi-teal mb-4">
                Find Your School
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your school name or ID..."
                  className="flex-1 px-4 py-3 border-2 border-thandi-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body text-thandi-brown placeholder-thandi-brown/60"
                />
                <button 
                  onClick={handleSearch}
                  disabled={loading || searchQuery.length < 2}
                  className="px-6 py-3 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-mid disabled:opacity-50 transition-all duration-200 font-body font-medium hover:scale-105 focus:ring-2 focus:ring-thandi-teal focus:ring-offset-2"
                >
                  {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </div>
                ) : 'Search'}
                </button>
              </div>
              <p className="text-sm text-thandi-brown/70 mt-2 font-body">
                Search by school name, location, or official school ID
              </p>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-thandi border border-thandi-brown/10 mb-8">
              <div className="p-8">
                <h3 className="text-xl font-semibold font-heading text-thandi-teal mb-6">Search Results</h3>
                <div className="space-y-3">
                  {searchResults.map((school) => (
                    <div
                      key={school.school_id}
                      onClick={() => selectSchool(school)}
                      className="p-4 border-2 border-thandi-brown/10 rounded-lg hover:border-thandi-gold hover:bg-thandi-cream/30 cursor-pointer transition-all duration-200"
                    >
                      <div className="font-semibold font-heading text-thandi-teal">{school.name}</div>
                      <div className="text-thandi-brown font-body">
                        {school.type} • {school.province} • ID: {school.school_id}
                      </div>
                      <div className="text-sm text-thandi-brown/70 font-body">
                        Status: <span className={school.status === 'unclaimed' ? 'text-thandi-gold' : 'text-thandi-teal'}>{school.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Claim Form */}
          {selectedSchool && (
            <div className="bg-white rounded-xl shadow-thandi border border-thandi-brown/10 mb-8">
              <div className="p-8">
                <h3 className="text-xl font-semibold font-heading text-thandi-teal mb-6">Claim Thandi School Access</h3>
                
                <div className="bg-thandi-gradient-light p-6 rounded-lg mb-6 text-white">
                  <div className="font-semibold font-heading text-lg">{selectedSchool.name}</div>
                  <div className="font-body opacity-90">
                    {selectedSchool.type} • {selectedSchool.province}
                  </div>
                </div>

                <form onSubmit={handleClaim} className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold font-heading text-thandi-teal mb-2">
                      Principal Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={claimForm.principal_email}
                      onChange={(e) => setClaimForm({
                        ...claimForm,
                        principal_email: e.target.value
                      })}
                      placeholder="principal@school.gov.za"
                      className="w-full px-4 py-3 border-2 border-thandi-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body text-thandi-brown"
                    />
                    <p className="text-sm text-thandi-brown/70 mt-2 font-body">
                      Public schools must use official government email addresses
                    </p>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold font-heading text-thandi-teal mb-2">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={claimForm.contact_phone}
                      onChange={(e) => setClaimForm({
                        ...claimForm,
                        contact_phone: e.target.value
                      })}
                      placeholder="+27 11 123 4567"
                      className="w-full px-4 py-3 border-2 border-thandi-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body text-thandi-brown"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !claimForm.principal_email}
                    className="w-full px-6 py-4 bg-thandi-gold text-thandi-teal rounded-lg hover:bg-thandi-gold/90 disabled:opacity-50 transition-all duration-200 font-body font-semibold text-lg hover:scale-105"
                  >
                    {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-thandi-teal"></div>
                      <span>Sending Magic Link...</span>
                    </div>
                  ) : 'Claim Thandi School Access'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Claim Status */}
          {claimStatus && (
            <div className="bg-white rounded-xl shadow-thandi border border-thandi-brown/10">
              <div className="p-8">
                <div className={`p-6 rounded-lg ${
                  claimStatus.type === 'success' 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className={`font-semibold font-heading text-lg mb-3 ${
                    claimStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {claimStatus.type === 'success' ? '✅ Success!' : '❌ Error'}
                  </div>
                  <div className={`font-body ${
                    claimStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {claimStatus.message}
                  </div>
                  
                  {/* Development only - show magic link */}
                  {claimStatus.magic_link && (
                    <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <div className="text-sm font-semibold font-heading text-yellow-800 mb-2">
                        Development Mode - Magic Link:
                      </div>
                      <a 
                        href={claimStatus.magic_link}
                        className="text-thandi-teal hover:underline font-body text-sm break-all"
                      >
                        {claimStatus.magic_link}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="text-center mt-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-thandi-brown/10">
              <h3 className="font-semibold font-heading text-thandi-teal mb-2">Need Help?</h3>
              <p className="text-thandi-brown font-body">
                Contact our support team at{' '}
                <a href="mailto:support@thandi.ai" className="text-thandi-teal hover:underline font-semibold">
                  support@thandi.ai
                </a>
                {' '}or call us at{' '}
                <a href="tel:+27123456789" className="text-thandi-teal hover:underline font-semibold">
                  +27 12 345 6789
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}