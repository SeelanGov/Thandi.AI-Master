'use client';

import { useState, useEffect, useRef } from 'react';

export default function BulletproofStudentRegistration({ onComplete }) {
  const [step, setStep] = useState('privacy');
  const [consent, setConsent] = useState(false);
  const [studentData, setStudentData] = useState({
    name: '',
    surname: '',
    school_id: '',
    school_name: '',
    grade: ''
  });
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolResults, setSchoolResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const firstNameRef = useRef(null);

  // Focus management - only focus when we're on the registration step
  useEffect(() => {
    if (step === 'registration' && firstNameRef.current) {
      setTimeout(() => {
        firstNameRef.current?.focus();
      }, 100);
    }
  }, [step]);

  // School search function
  const searchSchools = async (query) => {
    if (query.length < 2) {
      setSchoolResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSchoolResults(data.results || []);
    } catch (error) {
      console.error('School search error:', error);
      setSchoolResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration submission
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: studentData.name,
          student_surname: studentData.surname,
          school_id: studentData.school_id,
          grade: studentData.grade,
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          consent_version: 'v1.0'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('thandi_student_token', data.token);
        onComplete({
          type: 'registered',
          student_id: data.student_id,
          grade: studentData.grade,
          name: studentData.name
        });
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle anonymous submission
  const handleAnonymousSubmit = () => {
    const sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const sessionToken = btoa(JSON.stringify({
      session_id: sessionId,
      grade: studentData.grade,
      anonymous: true,
      expires: Date.now() + (4 * 60 * 60 * 1000)
    }));
    
    localStorage.setItem('thandi_session_token', sessionToken);
    
    onComplete({
      type: 'anonymous',
      session_id: sessionId,
      grade: studentData.grade
    });
  };

  // Privacy Notice Step
  if (step === 'privacy') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome to THANDI Career Assessment
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Let's help you discover your career path
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">
              How we use your information:
            </h2>
            <ul className="space-y-2 text-blue-800 text-sm sm:text-base">
              <li>• Personalize your career recommendations</li>
              <li>• Help your school support student career development</li>
              <li>• Improve our guidance for South African students</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">We collect:</h3>
                <p className="text-gray-700">Your name, surname, and school only</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your school sees:</h3>
                <p className="text-gray-700">That you completed the assessment (not your results)</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your rights:</h3>
                <p className="text-gray-700">You can request data deletion anytime</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data retention:</h3>
                <p className="text-gray-700">Automatically deleted after 1 year</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                required
              />
              <span className="text-sm text-gray-700">
                I understand how my information will be used and consent to its collection and processing 
                in accordance with POPIA (Protection of Personal Information Act).
              </span>
            </label>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={() => setStep('registration')}
                disabled={!consent}
                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-base min-h-[48px] touch-manipulation"
              >
                Continue with Registration
              </button>
              <button
                onClick={() => setStep('anonymous')}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-4 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium text-base min-h-[48px] touch-manipulation"
              >
                Continue Anonymously
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form Step
  if (step === 'registration') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Student Registration
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Help us personalize your career guidance
            </p>
          </div>

          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  ref={firstNameRef}
                  value={studentData.name}
                  onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px] touch-manipulation"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={studentData.surname}
                  onChange={(e) => setStudentData({...studentData, surname: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px] touch-manipulation"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School *
              </label>
              <input
                type="text"
                value={schoolSearch}
                onChange={(e) => {
                  setSchoolSearch(e.target.value);
                  searchSchools(e.target.value);
                }}
                placeholder="Start typing your school name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px] touch-manipulation"
                autoComplete="off"
                required
              />
              
              {schoolResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto bg-white shadow-lg z-10 relative">
                  {schoolResults.map((school) => (
                    <button
                      key={school.school_id}
                      type="button"
                      onClick={() => {
                        setStudentData({
                          ...studentData,
                          school_id: school.school_id,
                          school_name: school.name
                        });
                        setSchoolSearch(school.name);
                        setSchoolResults([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 min-h-[48px] touch-manipulation"
                    >
                      <div className="font-medium text-sm sm:text-base">{school.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{school.province}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade *
              </label>
              <select
                value={studentData.grade}
                onChange={(e) => setStudentData({...studentData, grade: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base min-h-[48px] touch-manipulation"
                required
              >
                <option value="">Select your grade</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('privacy')}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-4 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium text-base min-h-[48px] touch-manipulation"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!studentData.name || !studentData.surname || !studentData.school_id || !studentData.grade || loading}
                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-base min-h-[48px] touch-manipulation"
              >
                {loading ? 'Starting...' : 'Start Assessment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Anonymous Confirmation Step
  if (step === 'anonymous') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Anonymous Assessment
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              You'll get full career guidance without storing personal data
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">
              What you'll get:
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm sm:text-base">
              <li>• Complete career assessment</li>
              <li>• Personalized career recommendations</li>
              <li>• University program suggestions</li>
              <li>• Career pathway guidance</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade (for appropriate recommendations) *
            </label>
            <select
              value={studentData.grade}
              onChange={(e) => setStudentData({...studentData, grade: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6 text-base min-h-[48px] touch-manipulation"
              required
            >
              <option value="">Select your grade</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setStep('privacy')}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-4 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium text-base min-h-[48px] touch-manipulation"
            >
              Back
            </button>
            <button
              onClick={handleAnonymousSubmit}
              disabled={!studentData.grade}
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-base min-h-[48px] touch-manipulation"
            >
              Start Anonymous Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}