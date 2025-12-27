'use client';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-assessment-bg flex items-center justify-center">
      <div className="assessment-card max-w-md text-center">
        <div className="w-16 h-16 bg-thandi-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🔒</span>
        </div>
        
        <h1 className="assessment-title text-2xl mb-4">Access Denied</h1>
        
        <p className="assessment-description mb-6">
          You need a valid magic link to access the school dashboard. 
          Please contact your THANDI administrator for access.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-assessment-primary w-full"
          >
            Return to Home
          </button>
          
          <p className="text-xs text-assessment-text-muted font-body">
            Need help? Contact support at hello@thandi.online
          </p>
        </div>
      </div>
    </div>
  );
}