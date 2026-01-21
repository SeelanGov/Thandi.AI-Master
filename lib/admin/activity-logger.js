/**
 * Activity Logger - Admin Dashboard
 * Handles user activity tracking with session management
 * Created: January 19, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Event types for activity tracking
 */
export const EVENT_TYPES = {
  REGISTRATION: 'registration',
  ASSESSMENT_START: 'assessment_start',
  ASSESSMENT_COMPLETE: 'assessment_complete',
  SCHOOL_LOGIN: 'school_login',
  RAG_QUERY: 'rag_query',
  PDF_GENERATION: 'pdf_generation',
  RESULTS_VIEW: 'results_view'
};

/**
 * Log a user activity event
 * @param {Object} activityData - Activity information
 * @returns {Promise<Object>} Result with activity_id or error
 */
export async function logActivity(activityData) {
  try {
    // Validate required fields
    const validation = validateActivityData(activityData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Check for duplicate events (same event within 1 minute)
    const isDuplicate = await checkDuplicateActivity(activityData);
    if (isDuplicate) {
      return {
        success: true,
        activity_id: isDuplicate.id,
        deduplicated: true
      };
    }

    // Insert activity into database
    const { data, error } = await supabase
      .from('user_activity')
      .insert([{
        event_type: activityData.event_type,
        user_id: activityData.user_id || null,
        school_id: activityData.school_id || null,
        student_grade: activityData.student_grade || null,
        event_data: activityData.event_data || {},
        session_id: activityData.session_id || null
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log activity:', error);
      return {
        success: false,
        error: 'Failed to log activity to database'
      };
    }

    return {
      success: true,
      activity_id: data.id,
      deduplicated: false
    };

  } catch (error) {
    console.error('Error in logActivity:', error);
    return {
      success: false,
      error: 'Internal activity logging failure'
    };
  }
}

/**
 * Validate activity data
 * @param {Object} activityData - Activity data to validate
 * @returns {Object} Validation result
 */
function validateActivityData(activityData) {
  if (!activityData) {
    return { valid: false, error: 'Activity data is required' };
  }

  if (!activityData.event_type || typeof activityData.event_type !== 'string') {
    return { valid: false, error: 'event_type is required and must be a string' };
  }

  // Validate event_type is one of the allowed types
  const validEventTypes = Object.values(EVENT_TYPES);
  if (!validEventTypes.includes(activityData.event_type)) {
    return { valid: false, error: `event_type must be one of: ${validEventTypes.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Check if activity is a duplicate (same event within 1 minute)
 * @param {Object} activityData - Activity data to check
 * @returns {Promise<Object|null>} Existing activity if duplicate, null otherwise
 */
async function checkDuplicateActivity(activityData) {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    let query = supabase
      .from('user_activity')
      .select('id, created_at')
      .eq('event_type', activityData.event_type)
      .eq('session_id', activityData.session_id || null)
      .gte('created_at', oneMinuteAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    // Only filter by user_id if it's provided
    if (activityData.user_id) {
      query = query.eq('user_id', activityData.user_id);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking duplicates:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;

  } catch (error) {
    console.error('Error in checkDuplicateActivity:', error);
    return null;
  }
}

/**
 * Track registration event
 * @param {Object} context - Registration context
 * @returns {Promise<Object>} Result
 */
export async function trackRegistration(context = {}) {
  return await logActivity({
    event_type: EVENT_TYPES.REGISTRATION,
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    student_grade: context.student_grade || null,
    session_id: context.session_id || null,
    event_data: {
      registration_type: context.registration_type || 'student',
      has_school: !!context.school_id,
      timestamp: new Date().toISOString(),
      ...context.metadata
    }
  });
}

/**
 * Track assessment start event
 * @param {Object} context - Assessment context
 * @returns {Promise<Object>} Result
 */
export async function trackAssessmentStart(context = {}) {
  return await logActivity({
    event_type: EVENT_TYPES.ASSESSMENT_START,
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    student_grade: context.student_grade || null,
    session_id: context.session_id || null,
    event_data: {
      assessment_type: context.assessment_type || 'standard',
      timestamp: new Date().toISOString(),
      ...context.metadata
    }
  });
}

/**
 * Track assessment completion event
 * @param {Object} context - Assessment context
 * @returns {Promise<Object>} Result
 */
export async function trackAssessmentComplete(context = {}) {
  return await logActivity({
    event_type: EVENT_TYPES.ASSESSMENT_COMPLETE,
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    student_grade: context.student_grade || null,
    session_id: context.session_id || null,
    event_data: {
      aps_score: context.aps_score || null,
      duration_seconds: context.duration_seconds || null,
      completed: true,
      timestamp: new Date().toISOString(),
      ...context.metadata
    }
  });
}

/**
 * Track school login event
 * @param {Object} context - School login context
 * @returns {Promise<Object>} Result
 */
export async function trackSchoolLogin(context = {}) {
  return await logActivity({
    event_type: EVENT_TYPES.SCHOOL_LOGIN,
    school_id: context.school_id || null,
    session_id: context.session_id || null,
    event_data: {
      school_name: context.school_name || null,
      user_role: context.user_role || 'admin',
      timestamp: new Date().toISOString(),
      ...context.metadata
    }
  });
}

/**
 * Track RAG query event
 * @param {Object} context - RAG query context
 * @returns {Promise<Object>} Result
 */
export async function trackRAGQuery(context = {}) {
  return await logActivity({
    event_type: EVENT_TYPES.RAG_QUERY,
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    student_grade: context.student_grade || null,
    session_id: context.session_id || null,
    event_data: {
      query_type: context.query_type || 'general',
      response_time_ms: context.response_time_ms || null,
      results_count: context.results_count || null,
      timestamp: new Date().toISOString(),
      ...context.metadata
    }
  });
}

/**
 * Track PDF generation event
 * @param {Object} context - PDF generation context
 * @returns {Promise<Object>} Result
 */
export async function trackPDFGeneration(context = {}) {
  return await logActivity({
    event_type: EVENT_TYPES.PDF_GENERATION,
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    student_grade: context.student_grade || null,
    session_id: context.session_id || null,
    event_data: {
      pdf_type: context.pdf_type || 'results',
      generation_time_ms: context.generation_time_ms || null,
      timestamp: new Date().toISOString(),
      ...context.metadata
    }
  });
}

/**
 * Track results view event
 * @param {Object} context - Results view context
 * @returns {Promise<Object>} Result
 */
export async function trackResultsView(context = {}) {
  return await logActivity({
    event_type: EVENT_TYPES.RESULTS_VIEW,
    user_id: context.user_id || null,
    school_id: context.school_id || null,
    student_grade: context.student_grade || null,
    session_id: context.session_id || null,
    event_data: {
      view_type: context.view_type || 'full',
      timestamp: new Date().toISOString(),
      ...context.metadata
    }
  });
}
