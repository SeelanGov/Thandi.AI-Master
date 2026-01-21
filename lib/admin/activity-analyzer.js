/**
 * Activity Analyzer - Admin Dashboard
 * Analyzes user activity data and calculates metrics
 * Created: January 19, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Calculate summary metrics for user activity
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Summary metrics
 */
export async function calculateSummaryMetrics(filters = {}) {
  try {
    const { start_date, end_date } = filters;
    
    // Build date filter
    let query = supabase.from('user_activity').select('*', { count: 'exact' });
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return null;
    }

    // Calculate metrics
    const uniqueUsers = new Set(activities.filter(a => a.user_id).map(a => a.user_id)).size;
    const uniqueSchools = new Set(activities.filter(a => a.school_id).map(a => a.school_id)).size;
    
    const registrations = activities.filter(a => a.event_type === 'registration').length;
    const assessmentsStarted = activities.filter(a => a.event_type === 'assessment_start').length;
    const assessmentsCompleted = activities.filter(a => a.event_type === 'assessment_complete').length;
    const schoolLogins = activities.filter(a => a.event_type === 'school_login').length;
    const ragQueries = activities.filter(a => a.event_type === 'rag_query').length;
    const pdfGenerations = activities.filter(a => a.event_type === 'pdf_generation').length;

    return {
      total_events: count || 0,
      unique_users: uniqueUsers,
      unique_schools: uniqueSchools,
      registrations,
      assessments_started: assessmentsStarted,
      assessments_completed: assessmentsCompleted,
      school_logins: schoolLogins,
      rag_queries: ragQueries,
      pdf_generations: pdfGenerations,
      assessment_completion_rate: assessmentsStarted > 0 
        ? Math.round((assessmentsCompleted / assessmentsStarted) * 100) 
        : 0
    };

  } catch (error) {
    console.error('Error calculating summary metrics:', error);
    return null;
  }
}

/**
 * Calculate funnel metrics (conversion rates)
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Funnel metrics
 */
export async function calculateFunnelMetrics(filters = {}) {
  try {
    const { start_date, end_date } = filters;
    
    // Build date filter
    let query = supabase.from('user_activity').select('*');
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return null;
    }

    // Calculate funnel stages
    const registrations = activities.filter(a => a.event_type === 'registration').length;
    const assessmentsStarted = activities.filter(a => a.event_type === 'assessment_start').length;
    const assessmentsCompleted = activities.filter(a => a.event_type === 'assessment_complete').length;
    const resultsViewed = activities.filter(a => a.event_type === 'results_view').length;
    const pdfsGenerated = activities.filter(a => a.event_type === 'pdf_generation').length;

    // Calculate conversion rates
    const registrationToAssessment = registrations > 0 
      ? Math.round((assessmentsStarted / registrations) * 100) 
      : 0;
    
    const assessmentToCompletion = assessmentsStarted > 0 
      ? Math.round((assessmentsCompleted / assessmentsStarted) * 100) 
      : 0;
    
    const completionToResults = assessmentsCompleted > 0 
      ? Math.round((resultsViewed / assessmentsCompleted) * 100) 
      : 0;
    
    const resultsToPDF = resultsViewed > 0 
      ? Math.round((pdfsGenerated / resultsViewed) * 100) 
      : 0;

    // Identify drop-off points
    const dropoffs = [];
    
    if (registrationToAssessment < 70) {
      dropoffs.push({
        stage: 'registration_to_assessment',
        conversion_rate: registrationToAssessment,
        severity: registrationToAssessment < 50 ? 'critical' : 'warning',
        message: `${100 - registrationToAssessment}% of users drop off after registration`
      });
    }
    
    if (assessmentToCompletion < 80) {
      dropoffs.push({
        stage: 'assessment_to_completion',
        conversion_rate: assessmentToCompletion,
        severity: assessmentToCompletion < 60 ? 'critical' : 'warning',
        message: `${100 - assessmentToCompletion}% of users abandon assessment`
      });
    }
    
    if (completionToResults < 90) {
      dropoffs.push({
        stage: 'completion_to_results',
        conversion_rate: completionToResults,
        severity: completionToResults < 70 ? 'critical' : 'warning',
        message: `${100 - completionToResults}% of users don't view results`
      });
    }

    return {
      funnel: {
        registrations,
        assessments_started: assessmentsStarted,
        assessments_completed: assessmentsCompleted,
        results_viewed: resultsViewed,
        pdfs_generated: pdfsGenerated
      },
      conversion_rates: {
        registration_to_assessment: registrationToAssessment,
        assessment_to_completion: assessmentToCompletion,
        completion_to_results: completionToResults,
        results_to_pdf: resultsToPDF,
        overall: registrations > 0 
          ? Math.round((pdfsGenerated / registrations) * 100) 
          : 0
      },
      dropoffs: dropoffs.length > 0 ? dropoffs : [{
        stage: 'none',
        message: 'No significant drop-offs detected',
        severity: 'good'
      }]
    };

  } catch (error) {
    console.error('Error calculating funnel metrics:', error);
    return null;
  }
}

/**
 * Get activity breakdown by event type
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Activity breakdown
 */
export async function getActivityBreakdown(filters = {}) {
  try {
    const { start_date, end_date } = filters;
    
    // Build date filter
    let query = supabase.from('user_activity').select('event_type');
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    // Count by event type
    const breakdown = {};
    activities.forEach(activity => {
      const type = activity.event_type;
      breakdown[type] = (breakdown[type] || 0) + 1;
    });

    // Convert to array and sort by count
    return Object.entries(breakdown)
      .map(([event_type, count]) => ({
        event_type,
        count,
        percentage: Math.round((count / activities.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

  } catch (error) {
    console.error('Error getting activity breakdown:', error);
    return [];
  }
}

/**
 * Get activity timeline (hourly or daily)
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Activity timeline
 */
export async function getActivityTimeline(filters = {}) {
  try {
    const { start_date, end_date, interval = 'hourly' } = filters;
    
    // Build date filter
    let query = supabase.from('user_activity').select('created_at, event_type');
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: activities, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    // Group by time interval
    const timeline = {};
    activities.forEach(activity => {
      const date = new Date(activity.created_at);
      let key;
      
      if (interval === 'hourly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      if (!timeline[key]) {
        timeline[key] = { timestamp: key, count: 0 };
      }
      timeline[key].count++;
    });

    // Convert to array and sort by timestamp
    return Object.values(timeline).sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

  } catch (error) {
    console.error('Error getting activity timeline:', error);
    return [];
  }
}

/**
 * Get top schools by activity
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Top schools
 */
export async function getTopSchools(filters = {}) {
  try {
    const { start_date, end_date, limit = 10 } = filters;
    
    // Build date filter
    let query = supabase.from('user_activity').select('school_id');
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: activities, error } = await query.not('school_id', 'is', null);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    // Count by school
    const schoolCounts = {};
    activities.forEach(activity => {
      const schoolId = activity.school_id;
      schoolCounts[schoolId] = (schoolCounts[schoolId] || 0) + 1;
    });

    // Convert to array and sort by count
    return Object.entries(schoolCounts)
      .map(([school_id, activity_count]) => ({
        school_id,
        activity_count
      }))
      .sort((a, b) => b.activity_count - a.activity_count)
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting top schools:', error);
    return [];
  }
}
