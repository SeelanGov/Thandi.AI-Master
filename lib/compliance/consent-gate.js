// Consent Gate - Explicit opt-in for external data processing
// Required by POPIA Section 11 (Consent) and school DPAs

import { POPIAAuditLogger } from './popia-audit.js';

export class ConsentGate {
  /**
   * Check if user has given consent for external processing
   * @param {Object} session - User session with consent status
   * @returns {Object} - Consent check result
   */
  static checkConsent(session) {
    const consentGiven = session.externalProcessingConsent === true;
    const consentTimestamp = session.consentTimestamp;

    // Consent must be explicit and recent (within 90 days)
    const consentValid = consentGiven && this._isConsentRecent(consentTimestamp);

    return {
      allowed: consentValid,
      consentGiven,
      consentTimestamp,
      reason: !consentGiven 
        ? 'User has not consented to external data processing'
        : !consentValid
        ? 'Consent has expired (>90 days old)'
        : 'Consent valid'
    };
  }

  /**
   * Record consent given by user
   * @param {Object} consent - Consent details
   */
  static async recordConsent(consent) {
    // Log to audit trail
    await POPIAAuditLogger.logConsent({
      sessionId: consent.sessionId,
      given: consent.given,
      type: 'external_processing',
      text: consent.consentText,
      ipAddress: consent.ipAddress,
      userAgent: consent.userAgent
    });

    return {
      recorded: true,
      timestamp: new Date().toISOString(),
      expiresAt: this._calculateExpiryDate()
    };
  }

  /**
   * Check if consent is recent (within 90 days)
   */
  static _isConsentRecent(timestamp) {
    if (!timestamp) return false;

    const consentDate = new Date(timestamp);
    const now = new Date();
    const daysSinceConsent = (now - consentDate) / (1000 * 60 * 60 * 24);

    return daysSinceConsent <= 90;
  }

  /**
   * Calculate consent expiry date (90 days from now)
   */
  static _calculateExpiryDate() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90);
    return expiry.toISOString();
  }

  /**
   * Generate consent text for UI
   */
  static getConsentText() {
    return {
      title: 'External Data Processing Consent',
      body: `To provide you with personalized career recommendations, we need to process your assessment data using external AI services (Claude AI by Anthropic).

Your data will be:
• Sanitized to remove all personal information (name, ID number, school name, etc.)
• Sent only with your explicit consent
• Used solely for generating your career report
• Not stored by the external service
• Processed in compliance with POPIA (Protection of Personal Information Act)

You can withdraw consent at any time by contacting your school administrator.`,
      checkboxLabel: 'I consent to external processing of my sanitized assessment data for career recommendations',
      learnMoreUrl: '/privacy-policy#external-processing'
    };
  }

  /**
   * Validate consent before external API call
   * Throws error if consent not given
   */
  static enforceConsent(session) {
    const check = this.checkConsent(session);

    if (!check.allowed) {
      throw new ConsentError(check.reason);
    }

    return true;
  }
}

/**
 * Custom error for consent violations
 */
export class ConsentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConsentError';
    this.code = 'CONSENT_REQUIRED';
    this.statusCode = 403;
  }
}
