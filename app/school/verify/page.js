'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-thandi-cream flex items-center justify-center py-8">
      <div className="max-w-md w-full px-4">
        <div className="bg-white rounded-xl shadow-thandi border border-thandi-brown/10">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold font-heading text-thandi-teal mb-2">
              Loading...
            </h2>
            <p className="text-thandi-brown font-body">
              Please wait while we load the verification page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main verification component that uses useSearchParams
function VerifyContent() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [school, setSchool] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/schools/claim?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setSchool(data.school);
        setRedirectUrl(data.redirect_url);
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify token. Please try again.');
    }
  };

  const handleContinue = () => {
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push('/school/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-thandi-cream flex items-center justify-center py-8">
      <div className="max-w-md w-full px-4">
        <div className="bg-white rounded-xl shadow-thandi border border-thandi-brown/10">
          <div className="p-8 text-center">
            {status === 'verifying' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thandi-teal mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold font-heading text-thandi-teal mb-2">
                  Verifying Your Access
                </h2>
                <p className="text-thandi-brown font-body">
                  Please wait while we verify your school claim...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold font-heading text-thandi-teal mb-2">
                  School Successfully Claimed!
                </h2>
                <p className="text-thandi-brown font-body mb-6">
                  {message}
                </p>

                {school && (
                  <div className="bg-thandi-gradient-light p-4 rounded-lg mb-6 text-left text-white">
                    <h3 className="font-semibold font-heading mb-2">School Details:</h3>
                    <div className="text-sm font-body opacity-90">
                      <div><strong>Name:</strong> {school.name}</div>
                      <div><strong>ID:</strong> {school.school_id}</div>
                      <div><strong>Province:</strong> {school.province}</div>
                      <div><strong>Type:</strong> {school.type}</div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleContinue} 
                  className="w-full px-6 py-3 bg-thandi-gold text-thandi-teal rounded-lg hover:bg-thandi-gold/90 transition-all duration-200 font-body font-semibold hover:scale-105"
                >
                  Continue to Dashboard
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold font-heading text-thandi-teal mb-2">
                  Verification Failed
                </h2>
                <p className="text-thandi-brown font-body mb-6">
                  {message}
                </p>

                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/school/claim')}
                    className="w-full px-4 py-3 bg-thandi-teal text-white rounded-lg hover:bg-thandi-teal-mid transition-colors font-body font-medium"
                  >
                    Try Claiming Again
                  </button>
                  <button 
                    onClick={() => router.push('/')}
                    className="w-full px-4 py-3 border-2 border-thandi-brown/20 text-thandi-brown rounded-lg hover:bg-thandi-cream/50 transition-colors font-body font-medium"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-thandi-brown/70 font-body">
            Need help? Contact support at{' '}
            <a href="mailto:support@thandi.ai" className="text-thandi-teal hover:underline font-semibold">
              support@thandi.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SchoolVerifyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyContent />
    </Suspense>
  );
}