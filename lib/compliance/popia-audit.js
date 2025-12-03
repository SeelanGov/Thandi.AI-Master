// POPIA Audit Trail - Log all PII processing for compliance
// Required by POPIA Section 14 (Information Officer duties)

// Lazy load Supabase to avoid initialization errors
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

export class POPIAAuditLogger {
  /**
   * Log external API call with sanitised data
   * @param {Object} event - Audit event details
   */
  static async logExternalAPICall(event) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('popia_audit_log')
        .insert({
          event_type: 'EXTERNAL_API_CALL',
          api_provider: event.provider, // 'anthropic', 'openai', etc.
          data_sanitised: event.sanitised,
          pii_detected: event.piiDetected || [],
          pii_removed: event.piiRemoved || [],
          session_id: event.sessionId,
          user_consent: event.userConsent,
          purpose: event.purpose,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('[POPIA] Audit log error:', error);
      }
    } catch (err) {
      console.error('[POPIA] Audit log exception:', err);
    }
  }

  /**
   * Log consent given by user
   */
  static async logConsent(consent) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('popia_consent_log')
        .insert({
          session_id: consent.sessionId,
          consent_given: consent.given,
          consent_type: consent.type, // 'external_processing', 'data_storage', etc.
          consent_text: consent.text,
          ip_address: consent.ipAddress,
          user_agent: consent.userAgent,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('[POPIA] Consent log error:', error);
      }
    } catch (err) {
      console.error('[POPIA] Consent log exception:', err);
    }
  }

  /**
   * Log data access (for POPIA Section 23 - Right to access)
   */
  static async logDataAccess(access) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('popia_access_log')
        .insert({
          session_id: access.sessionId,
          data_accessed: access.dataType,
          accessed_by: access.accessedBy, // 'student', 'teacher', 'admin', 'system'
          purpose: access.purpose,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('[POPIA] Access log error:', error);
      }
    } catch (err) {
      console.error('[POPIA] Access log exception:', err);
    }
  }

  /**
   * Generate compliance report for Information Officer
   */
  static async generateComplianceReport(startDate, endDate) {
    try {
      const supabase = getSupabaseClient();
      const { data: apiCalls, error: apiError } = await supabase
        .from('popia_audit_log')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      const { data: consents, error: consentError } = await supabase
        .from('popia_consent_log')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (apiError || consentError) {
        throw new Error('Failed to generate compliance report');
      }

      return {
        period: { startDate, endDate },
        summary: {
          totalAPIcalls: apiCalls.length,
          sanitisedCalls: apiCalls.filter(c => c.data_sanitised).length,
          piiDetected: apiCalls.reduce((sum, c) => sum + (c.pii_detected?.length || 0), 0),
          consentsGiven: consents.filter(c => c.consent_given).length,
          consentsDeclined: consents.filter(c => !c.consent_given).length
        },
        apiCalls,
        consents
      };
    } catch (err) {
      console.error('[POPIA] Report generation error:', err);
      return null;
    }
  }
}
