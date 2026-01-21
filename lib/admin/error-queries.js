/**
 * Error Query Library - Admin Dashboard
 * Handles error retrieval with filtering and pagination
 * Created: January 19, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Query errors with filters and pagination
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Paginated error results
 */
export async function queryErrors(filters = {}) {
  try {
    const {
      page = 1,
      limit = 50,
      severity,
      error_type,
      school_id,
      feature_area,
      start_date,
      end_date,
      resolved,
      user_id
    } = filters;

    // Build query
    let query = supabase
      .from('system_errors')
      .select('*', { count: 'exact' });

    // Apply filters
    if (severity) {
      query = query.eq('severity', severity);
    }

    if (error_type) {
      query = query.eq('error_type', error_type);
    }

    if (school_id) {
      query = query.eq('school_id', school_id);
    }

    if (feature_area) {
      query = query.eq('feature_area', feature_area);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (resolved !== undefined) {
      query = query.eq('resolved', resolved);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error querying errors:', error);
      return {
        success: false,
        error: 'Failed to query errors'
      };
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: totalPages
      }
    };

  } catch (error) {
    console.error('Error in queryErrors:', error);
    return {
      success: false,
      error: 'Internal query error'
    };
  }
}

/**
 * Get error by ID
 * @param {string} errorId - Error UUID
 * @returns {Promise<Object>} Error details
 */
export async function getErrorById(errorId) {
  try {
    const { data, error } = await supabase
      .from('system_errors')
      .select('*')
      .eq('id', errorId)
      .single();

    if (error) {
      console.error('Error fetching error by ID:', error);
      return {
        success: false,
        error: 'Error not found'
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Error in getErrorById:', error);
    return {
      success: false,
      error: 'Internal query error'
    };
  }
}

/**
 * Mark error as resolved
 * @param {string} errorId - Error UUID
 * @param {string} adminUserId - Admin user ID
 * @returns {Promise<Object>} Result
 */
export async function resolveError(errorId, adminUserId) {
  try {
    const { data, error } = await supabase
      .from('system_errors')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: adminUserId
      })
      .eq('id', errorId)
      .select()
      .single();

    if (error) {
      console.error('Error resolving error:', error);
      return {
        success: false,
        error: 'Failed to resolve error'
      };
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Error in resolveError:', error);
    return {
      success: false,
      error: 'Internal error'
    };
  }
}

/**
 * Get error statistics
 * @param {Object} filters - Time range filters
 * @returns {Promise<Object>} Error statistics
 */
export async function getErrorStatistics(filters = {}) {
  try {
    const {
      start_date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end_date = new Date().toISOString()
    } = filters;

    // Get total errors
    const { count: totalErrors } = await supabase
      .from('system_errors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    // Get unresolved errors
    const { count: unresolvedErrors } = await supabase
      .from('system_errors')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false)
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    // Get errors by severity
    const { data: bySeverity } = await supabase
      .from('system_errors')
      .select('severity')
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    const severityCounts = {
      critical: 0,
      error: 0,
      warning: 0
    };

    bySeverity?.forEach(row => {
      if (severityCounts[row.severity] !== undefined) {
        severityCounts[row.severity]++;
      }
    });

    // Get errors by feature area
    const { data: byFeature } = await supabase
      .from('system_errors')
      .select('feature_area')
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    const featureCounts = {};
    byFeature?.forEach(row => {
      if (row.feature_area) {
        featureCounts[row.feature_area] = (featureCounts[row.feature_area] || 0) + 1;
      }
    });

    return {
      success: true,
      data: {
        total_errors: totalErrors || 0,
        unresolved_errors: unresolvedErrors || 0,
        by_severity: severityCounts,
        by_feature: featureCounts
      }
    };

  } catch (error) {
    console.error('Error in getErrorStatistics:', error);
    return {
      success: false,
      error: 'Failed to get statistics'
    };
  }
}

/**
 * Get recent errors (last 24 hours)
 * @param {number} limit - Number of errors to return
 * @returns {Promise<Object>} Recent errors
 */
export async function getRecentErrors(limit = 10) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('system_errors')
      .select('id, error_type, message, feature_area, severity, created_at, resolved')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent errors:', error);
      return {
        success: false,
        error: 'Failed to fetch recent errors'
      };
    }

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    console.error('Error in getRecentErrors:', error);
    return {
      success: false,
      error: 'Internal error'
    };
  }
}
