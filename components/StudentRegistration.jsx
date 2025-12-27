'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function StudentRegistration({ onComplete }) {
  const [step, setStep] = useState('privacy'); // privacy, registration, anonymous
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

  // Debug: Log current step
  console.log('StudentRegistration - Current step:', step);

  // Privacy Notice Step
  const PrivacyNotice = () => (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to THANDI Career Assessment
        </h1>
        <p className="text-gray-600">
          Let's help you discover your career path
        </p>
      </div>

      <div className="bg-thandi-cream border border-thandi-teal/20 rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-thandi-teal mb-3">
          How we use your information:
        </h2>
        <ul className="space-y-2 text-thandi-brown">
          <li>• Personalize your career recommendations</li>
          <li>• Help your school support student career development</li>
          <li>• Improve our guidance for South African students</li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
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

      <div className="border border-thandi-gold/30 bg-thandi-cream/50 rounded-lg p-4 mb-6">
        <p className="text-thandi-brown text-sm">
          <strong>Note:</strong> This is optional - you can continue anonymously if you prefer.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 text-thandi-teal border-gray-300 rounded focus:ring-thandi-teal"
            required
          />
          <span className="text-sm text-gray-700">
            I understand how my information will be used and consent to its collection and processing 
            in accordance with POPIA (Protection of Personal Information Act).
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => setStep('registration')}
            disabled={!consent}
            className="flex-1"
          >
            Continue with Registration
          </Button>
          <Button
            onClick={() => setStep('anonymous')}
            variant="outline"
            className="flex-1"
          >
            Continue Anonymously
          </Button>
        </div>
      </div>
    </Card>
  );

  // School Search Function
  const searchSchools = async (query) => {
    if (query.length < 2) {
      setSchoolResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSchoolResults(data.schools || []);
    } catch (error) {
      console.error('School search error:', error);
      setSchoolResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Registration Form Step
  const RegistrationForm = () => (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Student Registration
        </h2>
        <p className="text-gray-600">
          Help us personalize your career guidance
        </p>
      </div>

      <form onSubmit={handleRegistrationSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={studentData.name}
              onChange={(e) => setStudentData({...studentData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-thandi-teal"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-thandi-teal"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-thandi-teal"
            required
          />
          
          {schoolResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
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
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{school.name}</div>
                  <div className="text-sm text-gray-500">{school.province}</div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-thandi-teal"
            required
          >
            <option value="">Select your grade</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            onClick={() => setStep('privacy')}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={!studentData.name || !studentData.surname || !studentData.school_id || !studentData.grade}
            className="flex-1"
          >
            Start Assessment
          </Button>
        </div>
      </form>
    </Card>
  );

  // Anonymous Confirmation Step
  const AnonymousConfirmation = () => (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Anonymous Assessment
        </h2>
        <p className="text-gray-600">
          You'll get full career guidance without storing personal data
        </p>
      </div>

      <div className="bg-thandi-cream border border-thandi-teal/20 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-thandi-teal mb-3">
          What you'll get:
        </h3>
        <ul className="space-y-2 text-thandi-brown">
          <li>• Complete career assessment</li>
          <li>• Personalized career recommendations</li>
          <li>• University program suggestions</li>
          <li>• Career pathway guidance</li>
        </ul>
      </div>

      <div className="bg-thandi-gold/10 border border-thandi-gold/30 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-thandi-brown mb-3">
          Please note:
        </h3>
        <ul className="space-y-2 text-thandi-brown">
          <li>• Your results won't be saved</li>
          <li>• You'll need to complete the assessment again if you return</li>
          <li>• Your school won't see that you participated</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grade (for appropriate recommendations) *
        </label>
        <select
          value={studentData.grade}
          onChange={(e) => setStudentData({...studentData, grade: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-thandi-teal mb-6"
          required
        >
          <option value="">Select your grade</option>
          <option value="10">Grade 10</option>
          <option value="11">Grade 11</option>
          <option value="12">Grade 12</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => setStep('privacy')}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleAnonymousSubmit}
          disabled={!studentData.grade}
          className="flex-1"
        >
          Start Anonymous Assessment
        </Button>
      </div>
    </Card>
  );

  // Handle Registration Submission
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
          ...studentData,
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          consent_version: 'v1.0'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store JWT token for assessment flow
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

  // Handle Anonymous Submission
  const handleAnonymousSubmit = () => {
    // Generate session ID for anonymous user
    const sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Store session token (short expiry)
    const sessionToken = btoa(JSON.stringify({
      session_id: sessionId,
      grade: studentData.grade,
      anonymous: true,
      expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
    }));
    
    localStorage.setItem('thandi_session_token', sessionToken);
    
    onComplete({
      type: 'anonymous',
      session_id: sessionId,
      grade: studentData.grade
    });
  };

  // Render current step
  if (step === 'privacy') return <PrivacyNotice />;
  if (step === 'registration') return <RegistrationForm />;
  if (step === 'anonymous') return <AnonymousConfirmation />;

  return null;
}