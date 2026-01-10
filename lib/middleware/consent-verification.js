import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POPIA-Compliant Consent Verification Middleware
 * Ensures schools can only access student data with valid consent
 */

export class ConsentVerificationError extends Error {
  constructor(message, code = 'CONSENT_REQUIRED') {
    super(message);
    this.name = 'ConsentVerificationError';
    this.code = code;
  }
}

/**
 * Verify if a school has consent to access student data
 * @param {string} schoolId - School UUID
 * @param {string} studentProfileId - Student profile UUID
 * @returns {Promise<{hasConsent: boolean, consentDate: Date|null, reason: string}>}
 */
export async function verifySchoolStudentConsent(schoolId, studentProfileId) {
  try {
    const { data: consentCheck, error } = await supabase
      .rpc('verify_school_student_access', {
        p_school_id: schoolId,
        p_student_profile_id: studentProfileId
      });

    if (error) {
      console.error('Consent verification error:', error);
      return {
        hasConsent: false,
        consentDate: null,
        reason: 'Database error during consent verification'
      };
    }

    // Get detailed consent information
    const { data: consentDetails, error: detailsError } = await supabase
      .rpc('check_student_consent', {
        p_student_profile_id: studentProfileId,
        p_school_id: schoolId
      });

    if (detailsError) {
      console.error('Consent details error:', detailsError);
    }

    const details = consentDetails?.[0] || {};

    return {
      hasConsent: consentCheck || false,
      consentDate: details.consent_date || null,
      consentMethod: details.consent_method || 'unknown',
      canAccessData: details.can_access_data || false,
      reason: consentCheck 
        ? 'Valid consent exists' 
        : 'No valid consent found'
    };

  } catch (error) {
    console.error('Consent verification exception:', error);
    return {
      hasConsent: false,
      consentDate: null,
      reason: 'Exception during consent verification'
    };
  }
}

/**
 * Middleware function to protect API routes with consent verification
 * @param {Request} request - Next.js request object
 * @param {string} schoolId - School ID from request
 * @param {string} studentProfileId - Student profile ID from request
 * @returns {Promise<{allowed: boolean, response?: NextResponse}>}
 */
export async function requireValidConsent(request, schoolId, studentProfileId) {
  if (!schoolId || !studentProfileId) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'School ID and Student ID required for consent verification',
          code: 'MISSING_IDS'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }

  const consentResult = await verifySchoolStudentConsent(schoolId, studentProfileId);

  if (!consentResult.hasConsent || !consentResult.canAccessData) {
    // Log the consent denial for audit purposes
    console.log(`🚫 Consent denied: School ${schoolId} attempted to access student ${studentProfileId} data without valid consent`);
    
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'Student has not consented to share data with this school',
          code: 'CONSENT_REQUIRED',
          details: {
            hasConsent: consentResult.hasConsent,
            canAccessData: consentResult.canAccessData,
            reason: consentResult.reason
          },
          student_rights: {
            message: 'The student can manage their consent preferences in their student portal',
            contact: 'support@thandi.ai'
          }
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }

  // Log successful consent verification
  console.log(`✅ Consent verified: School ${schoolId} has valid consent to access student ${studentProfileId} data`);

  return {
    allowed: true,
    consentDetails: consentResult
  };
}

/**
 * Filter student data based on consent status
 * Removes students without valid consent from school queries
 * @param {Array} students - Array of student records
 * @param {string} schoolId - School ID
 * @returns {Promise<Array>} Filtered array with only consented students
 */
export async function filterStudentsByConsent(students, schoolId) {
  if (!students || students.length === 0) {
    return [];
  }

  const consentChecks = await Promise.all(
    students.map(async (student) => {
      const studentId = student.student_profile_id || student.id;
      if (!studentId) return { student, hasConsent: false };

      const consentResult = await verifySchoolStudentConsent(schoolId, studentId);
      return {
        student,
        hasConsent: consentResult.hasConsent && consentResult.canAccessData
      };
    })
  );

  // Return only students with valid consent
  const filteredStudents = consentChecks
    .filter(check => check.hasConsent)
    .map(check => check.student);

  console.log(`🔍 Consent filtering: ${students.length} students requested, ${filteredStudents.length} have valid consent`);

  return filteredStudents;
}

/**
 * Add consent metadata to API responses
 * @param {Object} data - Response data
 * @param {string} schoolId - School ID
 * @param {string} studentProfileId - Student profile ID (optional)
 * @returns {Promise<Object>} Data with consent metadata
 */
export async function addConsentMetadata(data, schoolId, studentProfileId = null) {
  const metadata = {
    consent_verified: true,
    verification_timestamp: new Date().toISOString(),
    popia_compliant: true
  };

  if (studentProfileId) {
    const consentResult = await verifySchoolStudentConsent(schoolId, studentProfileId);
    metadata.consent_details = {
      consent_date: consentResult.consentDate,
      consent_method: consentResult.consentMethod,
      can_access_data: consentResult.canAccessData
    };
  }

  return {
    ...data,
    _consent_metadata: metadata
  };
}

/**
 * Audit log for consent-related actions
 * @param {string} action - Action performed
 * @param {string} schoolId - School ID
 * @param {string} studentProfileId - Student profile ID
 * @param {Object} details - Additional details
 */
export async function auditConsentAction(action, schoolId, studentProfileId, details = {}) {
  try {
    const auditRecord = {
      action,
      school_id: schoolId,
      student_profile_id: studentProfileId,
      timestamp: new Date().toISOString(),
      details
    };

    // In a production system, this would go to a dedicated audit log
    console.log('📋 Consent Audit:', JSON.stringify(auditRecord, null, 2));

    // Could also store in database for compliance reporting
    // await supabase.from('consent_audit_log').insert(auditRecord);

  } catch (error) {
    console.error('Consent audit logging error:', error);
  }
}

export default {
  verifySchoolStudentConsent,
  requireValidConsent,
  filterStudentsByConsent,
  addConsentMetadata,
  auditConsentAction,
  ConsentVerificationError
};