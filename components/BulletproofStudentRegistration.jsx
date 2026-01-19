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
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolResults, setSchoolResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('name'); // 'name' or 'code'
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [addRequestData, setAddRequestData] = useState({
    school_name: '',
    school_code: '',
    contact_email: ''
  });
  const [schoolError, setSchoolError] = useState(false);

  const firstNameRef = useRef(null);

  // Focus management - only focus when we're on the registration step
  useEffect(() => {
    if (step === 'registration' && firstNameRef.current) {
      setTimeout(() => {
        firstNameRef.current?.focus();
      }, 100);
    }
  }, [step]);

  // School search function with enhanced error handling
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

  // School code validation function
  const validateSchoolCode = async (code) => {
    if (code.length < 3) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/schools/validate-code?code=${encodeURIComponent(code)}`);
      const data = await response.json();
      
      if (data.success && data.school) {
        setStudentData({
          ...studentData,
          school_id: data.school.school_id,
          school_name: data.school.name
        });
        setSchoolSearch(data.school.name);
        setSchoolResults([]);
      } else {
        // Invalid code - could show error message
        console.log('Invalid school code:', code);
      }
    } catch (error) {
      console.error('School code validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle school addition request
  const handleAddSchoolRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/schools/request-addition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addRequestData,
          requested_by_name: `${studentData.name} ${studentData.surname}`.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('School addition request submitted successfully! We\'ll review it and add the school to our database. You can continue with the assessment anonymously for now.');
        setShowAddRequest(false);
        setStep('anonymous');
      } else {
        alert(`Request failed: ${data.error}`);
      }
    } catch (error) {
      console.error('School addition request error:', error);
      alert('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration submission
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Enhanced debug logging
    console.log('🚀 Registration attempt started');
    console.log('📋 Student data:', {
      name: studentData.name,
      surname: studentData.surname,
      school_id: studentData.school_id,
      school_name: studentData.school_name,
      grade: studentData.grade
    });

    // Validate school selection with better error message
    if (!studentData.school_id) {
      console.log('❌ School validation failed - no school_id');
      console.error('REGISTRATION BLOCKED: No school selected');
      setSchoolError(true);
      alert('⚠️ IMPORTANT: Please select your school from the dropdown list.\n\n1. Type your school name\n2. Wait for results to appear\n3. CLICK on your school in the list\n4. You should see a green checkmark\n\nIf you can\'t find your school, click "Request to add your school"');
      setLoading(false);
      return;
    }

    setSchoolError(false);
    console.log('✅ School validation passed, proceeding with registration...');

    try {
      console.log('📡 Sending registration request to API...');
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

      console.log('📡 API response status:', response.status);
      const data = await response.json();
      console.log('📡 API response data:', data);
      
      if (data.success) {
        console.log('✅ Registration successful, storing token and calling onComplete');
        localStorage.setItem('Thandi_student_token', data.token);
        
        // CRITICAL: Call onComplete to trigger navigation
        console.log('🎯 Calling onComplete with:', {
          type: 'registered',
          student_id: data.student_id,
          grade: studentData.grade,
          name: studentData.name
        });
        
        onComplete({
          type: 'registered',
          student_id: data.student_id,
          grade: studentData.grade,
          name: studentData.name
        });
      } else {
        console.error('❌ Registration failed:', data.error);
        alert(`Registration failed: ${data.error}\n\nPlease try again or contact support if the problem persists.`);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      alert('Registration failed due to a network error. Please check your internet connection and try again.');
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
      <div className="assessment-container">
        <div className="assessment-card animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="assessment-title">
              Welcome to Thandi Career Assessment
            </h1>
            <p className="assessment-description">
              Let's help you discover your career path
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="font-semibold text-teal-900 mb-3 text-sm sm:text-base">
              How we use your information:
            </h2>
            <ul className="space-y-2 text-teal-800 text-sm sm:text-base">
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
                className="mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
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
                className="flex-1 btn-assessment-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue with Registration
              </button>
              <button
                onClick={() => setStep('anonymous')}
                className="flex-1 btn-assessment-secondary"
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
      <div className="assessment-container">
        <div className="assessment-card animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="assessment-title">
              Thandi Student Registration
            </h2>
            <p className="assessment-description">
              Help us personalize your career guidance
            </p>
          </div>

          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="assessment-label">
                  First Name *
                </label>
                <input
                  type="text"
                  ref={firstNameRef}
                  value={studentData.name}
                  onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                  className="form-input-assessment"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <label className="assessment-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={studentData.surname}
                  onChange={(e) => setStudentData({...studentData, surname: e.target.value})}
                  className="form-input-assessment"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="assessment-label">
                School * 
                <span className="text-sm text-gray-500 ml-2">
                  (Find your school by name or enter school code)
                </span>
              </label>
              
              {/* Search Mode Toggle */}
              <div className="flex space-x-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchMode('name');
                    setSchoolCode('');
                    setSchoolResults([]);
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    searchMode === 'name' 
                      ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Search by Name
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchMode('code');
                    setSchoolSearch('');
                    setSchoolResults([]);
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    searchMode === 'code' 
                      ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Enter School Code
                </button>
              </div>

              {/* School Name Search */}
              {searchMode === 'name' && (
                <div className="relative">
                  <input
                    type="text"
                    value={schoolSearch}
                    onChange={(e) => {
                      setSchoolSearch(e.target.value);
                      searchSchools(e.target.value);
                      setSchoolError(false); // Clear error when user types
                    }}
                    placeholder="Start typing your school name..."
                    className={`form-input-assessment ${schoolError ? 'border-red-500 border-2 bg-red-50' : ''}`}
                    autoComplete="off"
                  />
                  
                  {schoolError && !studentData.school_id && (
                    <div className="mt-2 p-3 bg-red-50 border-2 border-red-500 rounded-md animate-pulse">
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        ⚠️ School Not Selected
                      </p>
                      <p className="text-xs text-red-700">
                        You must CLICK on your school from the dropdown list below. Just typing is not enough!
                      </p>
                    </div>
                  )}
                  
                  {schoolResults.length > 0 && (
                    <div className="mt-2 border-2 border-teal-500 rounded-md max-h-48 overflow-y-auto bg-white shadow-lg absolute w-full" style={{ zIndex: 9999 }}>
                      <div className="bg-teal-50 border-b-2 border-teal-500 px-4 py-2 sticky top-0">
                        <p className="text-xs font-semibold text-teal-800">
                          👇 CLICK on your school below to select it
                        </p>
                      </div>
                      {schoolResults.map((school) => (
                        <button
                          key={school.school_id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🎯 School selected:', school.name, school.school_id);
                            
                            const updatedData = {
                              ...studentData,
                              school_id: school.school_id,
                              school_name: school.name
                            };
                            
                            setStudentData(updatedData);
                            setSchoolSearch(school.name);
                            setSchoolError(false); // Clear error when school is selected
                            
                            setTimeout(() => {
                              setSchoolResults([]);
                            }, 100);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-teal-50 active:bg-teal-100 border-b border-gray-100 last:border-b-0 min-h-[48px] cursor-pointer transition-colors duration-150"
                        >
                          <div className="font-medium text-sm sm:text-base">{school.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{school.province}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {schoolSearch.length > 2 && schoolResults.length === 0 && !loading && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800 mb-2">
                        Can't find your school? 
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddRequest(true);
                          setAddRequestData({
                            ...addRequestData,
                            school_name: schoolSearch
                          });
                        }}
                        className="text-sm text-teal-600 hover:text-teal-800 underline"
                      >
                        Request to add your school
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* School Code Entry */}
              {searchMode === 'code' && (
                <div className="relative">
                  <input
                    type="text"
                    value={schoolCode}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase();
                      setSchoolCode(code);
                      if (code.length >= 3) {
                        validateSchoolCode(code);
                      }
                    }}
                    placeholder="Enter your school code (e.g., 0123456789)"
                    className="form-input-assessment font-mono"
                    autoComplete="off"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Your school code is usually found on official school documents
                  </div>
                  
                  {schoolCode.length > 2 && !studentData.school_id && !loading && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800 mb-2">
                        School code not found. 
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddRequest(true);
                          setAddRequestData({
                            ...addRequestData,
                            school_code: schoolCode
                          });
                        }}
                        className="text-sm text-teal-600 hover:text-teal-800 underline"
                      >
                        Request to add your school
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Selected School Display */}
              {studentData.school_id && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        ✓ {studentData.school_name}
                      </p>
                      <p className="text-xs text-green-600">School selected</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentData({
                          ...studentData,
                          school_id: '',
                          school_name: ''
                        });
                        setSchoolSearch('');
                        setSchoolCode('');
                      }}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="assessment-label">
                Grade *
              </label>
              <select
                value={studentData.grade}
                onChange={(e) => setStudentData({...studentData, grade: e.target.value})}
                className="form-input-assessment form-select-assessment bg-white"
                required
              >
                <option value="">Select your grade</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            {/* Enhanced Consent Section */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold text-teal-900 mb-3 text-sm sm:text-base">
                Share your results with your school?
              </h3>
              <div className="space-y-3 text-sm text-teal-800">
                <p>
                  <strong>Benefits of sharing:</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Your school can provide personalized career guidance</li>
                  <li>• Teachers can help you with subject choices</li>
                  <li>• Access to school-specific opportunities and programs</li>
                  <li>• Better support for your career development</li>
                </ul>
                <p className="text-xs text-teal-700 mt-3">
                  Your school will only see that you completed the assessment and your career recommendations. 
                  Your individual answers remain private. You can withdraw consent at any time.
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('privacy')}
                className="flex-1 btn-assessment-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!studentData.name || !studentData.surname || !studentData.school_id || !studentData.grade || loading}
                className={`flex-1 btn-assessment-primary disabled:bg-gray-300 disabled:cursor-not-allowed ${
                  !studentData.school_id && studentData.name && studentData.surname && studentData.grade
                    ? 'animate-pulse bg-gray-400'
                    : ''
                }`}
              >
                {loading ? 'Starting...' : !studentData.school_id ? '⚠️ Select School First' : 'Start Assessment'}
              </button>
            </div>
            
            {!studentData.school_id && studentData.name && studentData.surname && studentData.grade && (
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-md">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  ⚠️ Almost there! One more step:
                </p>
                <p className="text-sm text-yellow-800">
                  Please select your school from the dropdown list above. Type your school name and CLICK on it when it appears.
                </p>
              </div>
            )}
          </form>

          {/* School Addition Request Modal */}
          {showAddRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Request School Addition
                </h3>
                <form onSubmit={handleAddSchoolRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Name *
                    </label>
                    <input
                      type="text"
                      value={addRequestData.school_name}
                      onChange={(e) => setAddRequestData({
                        ...addRequestData,
                        school_name: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Full school name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Code (if known)
                    </label>
                    <input
                      type="text"
                      value={addRequestData.school_code}
                      onChange={(e) => setAddRequestData({
                        ...addRequestData,
                        school_code: e.target.value.toUpperCase()
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      placeholder="e.g., 0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email (optional)
                    </label>
                    <input
                      type="email"
                      value={addRequestData.contact_email}
                      onChange={(e) => setAddRequestData({
                        ...addRequestData,
                        contact_email: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    We'll review your request and add the school to our database. 
                    This usually takes 1-2 business days.
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddRequest(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-300 transition-colors"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Anonymous Confirmation Step
  if (step === 'anonymous') {
    return (
      <div className="assessment-container">
        <div className="assessment-card animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="assessment-title">
              Anonymous Assessment
            </h2>
            <p className="assessment-description">
              You'll get full career guidance without storing personal data
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="font-semibold text-teal-900 mb-3 text-sm sm:text-base">
              What you'll get:
            </h3>
            <ul className="space-y-2 text-teal-800 text-sm sm:text-base">
              <li>• Complete career assessment</li>
              <li>• Personalized career recommendations</li>
              <li>• University program suggestions</li>
              <li>• Career pathway guidance</li>
            </ul>
          </div>

          <div>
            <label className="assessment-label">
              Grade (for appropriate recommendations) *
            </label>
            <select
              value={studentData.grade}
              onChange={(e) => setStudentData({...studentData, grade: e.target.value})}
              className="form-input-assessment form-select-assessment bg-white mb-6"
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
              className="flex-1 btn-assessment-secondary"
            >
              Back
            </button>
            <button
              onClick={handleAnonymousSubmit}
              disabled={!studentData.grade}
              className="flex-1 btn-assessment-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
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