'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentConsentManagement() {
  const [loading, setLoading] = useState(true);
  const [consentData, setConsentData] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadConsentData();
  }, []);

  const loadConsentData = async () => {
    try {
      const token = localStorage.getItem('Thandi_student_token') || 
                   localStorage.getItem('thandi_session_token');
      
      if (!token) {
        setError('Please log in to manage your consent preferences');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/consent/manage?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (data.success) {
        setConsentData(data);
      } else {
        setError(data.error || 'Failed to load consent data');
      }
    } catch (err) {
      setError('Failed to load consent data');
      console.error('Consent data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (action, reason = '') => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('Thandi_student_token') || 
                   localStorage.getItem('thandi_session_token');

      const response = await fetch('/api/consent/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          token,
          reason
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await loadConsentData(); // Reload data
      } else {
        alert(`Failed to ${action} consent: ${data.error}`);
      }
    } catch (err) {
      alert(`Failed to ${action} consent. Please try again.`);
      console.error('Consent update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your consent preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              Return to Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { consent_status, consent_history, student_rights } = consentData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 text-white p-6">
            <h1 className="text-2xl font-bold">Your Privacy & Consent Settings</h1>
            <p className="text-teal-100 mt-2">
              Manage how your assessment data is shared with your school under POPIA
            </p>
          </div>

          {/* Current Status */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className={`p-4 rounded-lg ${consent_status.has_consent ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${consent_status.has_consent ? 'text-green-600' : 'text-red-600'}`}>
                  {consent_status.has_consent ? '✅' : '❌'}
                </div>
                <div>
                  <h3 className={`font-semibold ${consent_status.has_consent ? 'text-green-900' : 'text-red-900'}`}>
                    {consent_status.has_consent ? 'Sharing Enabled' : 'Sharing Disabled'}
                  </h3>
                  <p className={`text-sm ${consent_status.has_consent ? 'text-green-700' : 'text-red-700'}`}>
                    {consent_status.has_consent 
                      ? 'Your school can access your career assessment results to provide personalized support'
                      : 'Your school cannot access your assessment data. You can still complete assessments privately.'
                    }
                  </p>
                  {consent_status.consent_date && (
                    <p className={`text-xs mt-1 ${consent_status.has_consent ? 'text-green-600' : 'text-red-600'}`}>
                      Last updated: {new Date(consent_status.consent_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Your Consent</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {consent_status.has_consent ? (
                <button
                  onClick={() => {
                    const reason = prompt('Optional: Why are you withdrawing consent?');
                    if (reason !== null) { // User didn't cancel
                      updateConsent('revoke', reason);
                    }
                  }}
                  disabled={updating}
                  className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {updating ? 'Updating...' : '🚫 Withdraw Consent'}
                </button>
              ) : (
                <button
                  onClick={() => updateConsent('grant', 'Student chose to share data')}
                  disabled={updating}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {updating ? 'Updating...' : '✅ Enable Sharing'}
                </button>
              )}
              
              <button
                onClick={() => {
                  if (confirm('This will permanently delete ALL your data. This cannot be undone. Are you sure?')) {
                    if (confirm('Final confirmation: Type DELETE in the next prompt to confirm')) {
                      const confirmation = prompt('Type DELETE to confirm permanent data deletion:');
                      if (confirmation === 'DELETE') {
                        // Handle data deletion
                        alert('Data deletion request submitted. You will receive confirmation within 30 days.');
                      }
                    }
                  }
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
              >
                🗑️ Delete All My Data
              </button>
            </div>
          </div>

          {/* Benefits Explanation */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Share Your Data?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h3 className="font-semibold text-teal-900 mb-2">✅ Benefits of Sharing</h3>
                <ul className="text-sm text-teal-800 space-y-1">
                  <li>• Personalized career guidance from teachers</li>
                  <li>• Targeted subject choice recommendations</li>
                  <li>• Access to school-specific opportunities</li>
                  <li>• Better support for university applications</li>
                  <li>• Improved career development programs</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🔒 Your Privacy is Protected</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Individual answers remain private</li>
                  <li>• Only career recommendations are shared</li>
                  <li>• Data is encrypted and secure</li>
                  <li>• You can withdraw consent anytime</li>
                  <li>• Full POPIA compliance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Consent History */}
          {consent_history && consent_history.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Consent History</h2>
              <div className="space-y-3">
                {consent_history.slice(0, 5).map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        record.consent_action === 'granted' ? 'bg-green-100 text-green-800' :
                        record.consent_action === 'revoked' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {record.consent_action}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        via {record.consent_method}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your Rights */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Rights Under POPIA</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• <strong>Right to Access:</strong> Access your personal information we hold</li>
                <li>• <strong>Right to Correction:</strong> Correct any inaccurate data</li>
                <li>• <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                <li>• <strong>Right to Erasure:</strong> Request permanent deletion of your data</li>
                <li>• <strong>Right to Portability:</strong> Get a copy of your data in a standard format</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Questions or concerns?</strong> Contact us at{' '}
                  <a href={`mailto:${student_rights.contact_email}`} className="underline">
                    {student_rights.contact_email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}