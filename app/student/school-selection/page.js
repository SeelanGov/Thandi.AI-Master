'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Retroactive School Selection Interface
 * Allows existing students to select their school and provide consent
 */
export default function StudentSchoolSelection() {
  const [studentId, setStudentId] = useState('');
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(true); // Default opt-in
  const [step, setStep] = useState('identify'); // identify, select, consent, complete
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load schools for selection
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, code, district, province')
        .order('name');

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
      setError('Failed to load schools. Please try again.');
    }
  };

  const searchSchools = (query) => {
    if (!query) return schools;
    
    const lowercaseQuery = query.toLowerCase();
    return schools.filter(school => 
      school.name.toLowerCase().includes(lowercaseQuery) ||
      school.code.toLowerCase().includes(lowercaseQuery) ||
      school.district.toLowerCase().includes(lowercaseQuery)
    );
  };

  const handleStudentIdentification = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('Please enter your student ID or email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if student exists and doesn't have school association
      const { data: student, error } = await supabase
        .from('student_profiles')
        .select('id, email, phone, grade, school_id')
        .or(`id.eq.${studentId},email.eq.${studentId}`)
        .single();

      if (error || !student) {
        setError('Student not found. Please check your ID or email.');
        return;
      }

      if (student.school_id) {
        setError('You are already associated with a school. Contact support if you need to change schools.');
        return;
      }

      setStep('select');
      setSuccess('Student found! Please select your school below.');
    } catch (error) {
      console.error('Error identifying student:', error);
      setError('Error identifying student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSelection = (e) => {
    e.preventDefault();
    if (!selectedSchool) {
      setError('Please select your school');
      return;
    }

    setStep('consent');
    setError('');
  };

  const handleConsentAndAssociation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/retroactive-association', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          schoolId: selectedSchool,
          consentGiven: consent,
          consentMethod: 'retroactive_web_form',
          consentContext: 'student_initiated_school_selection'
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create school association');
      }

      setStep('complete');
      setSuccess('School association created successfully! Your historical assessment data is now available to your school (if you provided consent).');
    } catch (error) {
      console.error('Error creating association:', error);
      setError(error.message || 'Failed to create school association. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = searchSchools(searchQuery);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Link Your School Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Connect your existing assessment data with your school
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className={step === 'identify' ? 'text-blue-600 font-medium' : ''}>
              Identify
            </span>
            <span className={step === 'select' ? 'text-blue-600 font-medium' : ''}>
              Select School
            </span>
            <span className={step === 'consent' ? 'text-blue-600 font-medium' : ''}>
              Consent
            </span>
            <span className={step === 'complete' ? 'text-green-600 font-medium' : ''}>
              Complete
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: step === 'identify' ? '25%' : 
                       step === 'select' ? '50%' : 
                       step === 'consent' ? '75%' : '100%' 
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Step 1: Student Identification */}
        {step === 'identify' && (
          <form onSubmit={handleStudentIdentification}>
            <div className="mb-4">
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                Student ID or Email Address
              </label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your student ID or email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find My Account'}
            </button>
          </form>
        )}

        {/* Step 2: School Selection */}
        {step === 'select' && (
          <form onSubmit={handleSchoolSelection}>
            <div className="mb-4">
              <label htmlFor="schoolSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Search for Your School
              </label>
              <input
                type="text"
                id="schoolSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type school name, code, or district"
              />
            </div>

            <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {filteredSchools.map((school) => (
                <label
                  key={school.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="radio"
                    name="school"
                    value={school.id}
                    checked={selectedSchool === school.id}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{school.name}</div>
                    <div className="text-sm text-gray-500">
                      {school.code} • {school.district}, {school.province}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={!selectedSchool}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Continue to Consent
            </button>
          </form>
        )}

        {/* Step 3: Consent Collection */}
        {step === 'consent' && (
          <form onSubmit={handleConsentAndAssociation}>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Data Sharing Consent
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Benefits of Sharing Your Data
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Personalized career guidance from your teachers</li>
                  <li>• School-specific program recommendations</li>
                  <li>• Better support for your academic journey</li>
                  <li>• Access to relevant bursary opportunities</li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="consent"
                    value="true"
                    checked={consent === true}
                    onChange={() => setConsent(true)}
                    className="mt-1 mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      Yes, I consent to share my data
                    </div>
                    <div className="text-sm text-gray-600">
                      Allow your school to access your assessment results and career guidance data
                    </div>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="radio"
                    name="consent"
                    value="false"
                    checked={consent === false}
                    onChange={() => setConsent(false)}
                    className="mt-1 mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      No, keep my data private
                    </div>
                    <div className="text-sm text-gray-600">
                      Link to your school but don't share assessment data
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-xs text-gray-600">
                  <strong>Your Rights:</strong> You can change your consent preferences at any time 
                  in your student portal. You have the right to access, correct, or delete your data 
                  under POPIA (Protection of Personal Information Act).
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Creating Association...' : 'Complete School Linking'}
            </button>
          </form>
        )}

        {/* Step 4: Completion */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              School Association Complete!
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Your account has been successfully linked to your school. 
              {consent ? ' Your historical assessment data is now available to your school.' : ' Your data remains private as requested.'}
            </p>

            <div className="space-y-3">
              <a
                href="/student/consent"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
              >
                Manage Consent Preferences
              </a>
              
              <a
                href="/"
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
              >
                Return to Assessment
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}