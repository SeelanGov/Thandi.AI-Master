/**
 * Error Logger - Admin Dashboard
 * Handles error logging with deduplication and context capture
 * Created: January 19, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Log an error to the admin dashboard
 * @param {Object} errorData - Error information
 * @returns {Promise<Object>} Result with error_id or error
 */
export async function logError(errorData) {
  try {
    // Validate required fields
    const validation = validateErrorData(errorData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Check for duplicate errors (same error within 5 minutes)
    const isDuplicate = await checkDuplicateError(errorData);
    if (isDuplicate) {
      return {
        success: true,
        error_id: isDuplicate.id,
        deduplicated: true
      };
    }

    // Insert error into database
    const { data, error } = await supabase
      .from('system_errors')
      .insert([{
        error_type: errorData.error_type,
        message: errorData.message,
        stack_trace: errorData.stack_trace || null,
        url: errorData.url || null,
        user_agent: errorData.user_agent || null,
        user_id: errorData.user_id || null,
        school_id: errorData.school_id || null,
        student_grade: errorData.student_grade || null,
        feature_area: errorData.feature_area || null,
        severity: errorData.severity || 'error',
        metadata: errorData.metadata || {}
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log error:', error);
      return {
        success: false,
        error: 'Failed to log error to database'
      };
    }

    return {
      success: true,
      error_id: data.id,
      deduplicated: false
    };

  } catch (error) {
    console.error('Error in logError:', error);
    return {
      success: false,
      error: 'Internal error logging failure'
    };
  }
}

/**
 * Validate error data
 * @param {Object} errorData - Error data to validate
 * @returns {Object} Validation result
 */
function validateErrorData(errorData) {
  if (!errorData) {
    return { valid: false, error: 'Error data is required' };
  }

  if (!errorData.error_type || typeof errorData.error_type !== 'string') {
    return { valid: false, error: 'error_type is required and must be a string' };
  }

  if (!errorData.message || typeof errorData.message !== 'string') {
    return { valid: false, error: 'message is required and must be a string' };
  }

  // Validate severity if provided
  const validSeverities = ['error', 'warning', 'critical'];
  if (errorData.severity && !validSeverities.includes(errorData.severity)) {
    return { valid: false, error: 'severity must be one of: error, warning, critical' };
  }

  // Validate feature_area if provided
  const validFeatureAreas = ['registration', 'assessment', 'results', 'rag', 'school_dashboard', 'admin_dashboard'];
  if (errorData.feature_area && !validFeatureAreas.includes(errorData.feature_area)) {
    return { valid: false, error: `feature_area must be one of: ${validFeatureAreas.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Check if error is a duplicate (same error within 5 minutes)
 * @param {Object} errorData - Error data to check
 * @returns {Promise<Object|null>} Existing error if duplicate, null otherwise
 */
async function checkDuplicateError(errorData) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('system_errors')
      .select('id, created_at')
      .eq('error_type', errorData.error_type)
      .eq('message', errorData.message)
      .eq('url', errorData.url || null)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking duplicates:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;

  } catch (error) {
    console.error('Error in checkDuplicateError:', error);
    return null;
  }
}

/**
 * Capture error from frontend
 * @param {Error} error - JavaScript Error object
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} Result
 */
export async function captureError(error, context = {}) {
  const errorData = {
    error_type: error.name || 'Error',
    message: error.message || 'Unknown error',
    stack_trace: error.stack || null,
    url: context.url || (typeof window !== 'undefined' ? window.location.href : null),
    user_agent: context.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    student_grade: context.student_grade || null,
    feature_area: context.feature_area || null,
    severity: context.severity || 'error',
    metadata: {
      ...context.metadata,
      component: context.component || null,
      action: context.action || null
    }
  };

  return await logError(errorData);
}

/**
 * Capture API error
 * @param {Object} request - Request object
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} Result
 */
export async function captureAPIError(request, error, context = {}) {
  const errorData = {
    error_type: error.name || 'APIError',
    message: error.message || 'API request failed',
    stack_trace: error.stack || null,
    url: request.url || null,
    user_agent: request.headers?.get('user-agent') || null,
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    feature_area: context.feature_area || 'api',
    severity: context.severity || 'error',
    metadata: {
      method: request.method || null,
      endpoint: context.endpoint || null,
      status_code: context.status_code || null,
      ...context.metadata
    }
  };

  return await logError(errorData);
}
