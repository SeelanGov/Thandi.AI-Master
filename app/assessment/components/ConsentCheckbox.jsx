'use client';

import { useState } from 'react';
import { ConsentGate } from '@/lib/compliance/consent-gate';

export default function ConsentCheckbox({ onConsentChange, required = true }) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const consentText = ConsentGate.getConsentText();

  const handleConsentChange = (e) => {
    const checked = e.target.checked;
    setConsentGiven(checked);
    onConsentChange(checked);
  };

  return (
    <div className="consent-gate-container border-2 border-blue-500 rounded-lg p-6 bg-blue-50 my-6">
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="external-processing-consent"
          checked={consentGiven}
          onChange={handleConsentChange}
          required={required}
          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div className="flex-1">
          <label 
            htmlFor="external-processing-consent" 
            className="font-medium text-gray-900 cursor-pointer"
          >
            {consentText.checkboxLabel}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 block"
          >
            {showDetails ? 'Hide details' : 'Why is this needed?'}
          </button>

          {showDetails && (
            <div className="mt-3 p-4 bg-white rounded border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                {consentText.title}
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {consentText.body}
              </div>
              <a
                href={consentText.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
              >
                Read our full privacy policy →
              </a>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-600">
            <span className="inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              POPIA Compliant • Your personal information is protected
            </span>
          </div>
        </div>
      </div>

      {required && !consentGiven && (
        <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          ⚠️ Consent is required to generate your personalized career report. Without consent, we can only provide general career information.
        </div>
      )}
    </div>
  );
}
