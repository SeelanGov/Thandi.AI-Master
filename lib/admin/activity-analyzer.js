/**
 * Activity Analyzer Utility
 * Analyzes user activity metrics for the admin dashboard
 */

/**
 * Calculate activity summary metrics
 * @param {Array} activities - Array of activity records
 * @returns {Object} Summary metrics
 */
function calculateActivitySummary(activities) {
  if (!activities || activities.length === 0) {
    return {
      totalEvents: 0,
      uniqueUsers: 0,
      uniqueSessions: 0,
      registrations: 0,
      assessments: 0,
      schoolLogins: 0,
      ragQueries: 0
    };
  }

  const uniqueUsers = new Set();
  const uniqueSessions = new Set();
  let registrations = 0;
  let assessments = 0;
  let schoolLogins = 0;
  let ragQueries = 0;

  activities.forEach(activity => {
    if (activity.user_id) uniqueUsers.add(activity.user_id);
    if (activity.session_id) uniqueSessions.add(activity.session_id);

    switch (activity.event_type) {
      case 'registration':
        registrations++;
        break;
      case 'assessment_completed':
        assessments++;
        break;
      case 'school_login':
        schoolLogins++;
        break;
      case 'rag_query':
        ragQueries++;
        break;
    }
  });

  return {
    totalEvents: activities.length,
    uniqueUsers: uniqueUsers.size,
    uniqueSessions: uniqueSessions.size,
    registrations,
    assessments,
    schoolLogins,
    ragQueries
  };
}

/**
 * Calculate funnel metrics
 * @param {Array} activities - Array of activity records
 * @returns {Object} Funnel metrics with conversion rates
 */
function calculateFunnelMetrics(activities) {
  if (!activities || activities.length === 0) {
    return {
      registrations: 0,
      assessmentsStarted: 0,
      assessmentsCompleted: 0,
      conversionRate: 0,
      completionRate: 0
    };
  }

  const registrations = activities.filter(a => a.event_type === 'registration').length;
  const assessmentsStarted = activities.filter(a => a.event_type === 'assessment_started').length;
  const assessmentsCompleted = activities.filter(a => a.event_type === 'assessment_completed').length;

  const conversionRate = registrations > 0
    ? Math.round((assessmentsStarted / registrations) * 100)
    : 0;

  const completionRate = assessmentsStarted > 0
    ? Math.round((assessmentsCompleted / assessmentsStarted) * 100)
    : 0;

  return {
    registrations,
    assessmentsStarted,
    assessmentsCompleted,
    conversionRate,
    completionRate
  };
}

/**
 * Identify drop-off points in the user funnel
 * @param {Object} funnelMetrics - Funnel metrics from calculateFunnelMetrics
 * @returns {Array} Array of drop-off points
 */
function identifyDropOffPoints(funnelMetrics) {
  const dropOffPoints = [];

  // Check registration to assessment conversion
  if (funnelMetrics.conversionRate < 50) {
    dropOffPoints.push({
      stage: 'registration_to_assessment',
      dropOffRate: 100 - funnelMetrics.conversionRate,
      severity: funnelMetrics.conversionRate < 25 ? 'high' : 'medium',
      message: `${100 - funnelMetrics.conversionRate}% of users drop off after registration`
    });
  }

  // Check assessment completion
  if (funnelMetrics.completionRate < 70) {
    dropOffPoints.push({
      stage: 'assessment_completion',
      dropOffRate: 100 - funnelMetrics.completionRate,
      severity: funnelMetrics.completionRate < 50 ? 'high' : 'medium',
      message: `${100 - funnelMetrics.completionRate}% of users drop off during assessment`
    });
  }

  return dropOffPoints;
}

/**
 * Calculate activity trends over time
 * @param {Array} activities - Array of activity records with timestamps
 * @param {string} interval - Time interval ('hourly', 'daily', 'weekly')
 * @returns {Array} Array of trend data points
 */
function calculateActivityTrends(activities, interval = 'daily') {
  if (!activities || activities.length === 0) {
    return [];
  }

  // Group activities by time interval
  const groups = {};
  activities.forEach(activity => {
    const timestamp = new Date(activity.timestamp || activity.created_at);
    let key;

    switch (interval) {
      case 'hourly':
        key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:00`;
        break;
      case 'daily':
        key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`;
        break;
      case 'weekly':
        const weekStart = new Date(timestamp);
        weekStart.setDate(timestamp.getDate() - timestamp.getDay());
        key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        break;
      default:
        key = timestamp.toISOString();
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(activity);
  });

  // Calculate metrics for each time period
  const trends = Object.entries(groups).map(([timestamp, groupActivities]) => ({
    timestamp,
    ...calculateActivitySummary(groupActivities)
  }));

  // Sort by timestamp
  return trends.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Group activities by event type
 * @param {Array} activities - Array of activity records
 * @returns {Object} Activities grouped by event type with counts
 */
function groupByEventType(activities) {
  if (!activities || activities.length === 0) {
    return {};
  }

  const groups = {};
  activities.forEach(activity => {
    const eventType = activity.event_type || 'unknown';
    if (!groups[eventType]) {
      groups[eventType] = {
        count: 0,
        events: []
      };
    }
    groups[eventType].count++;
    groups[eventType].events.push(activity);
  });

  return groups;
}

/**
 * Log an activity event (stub for tests)
 * @param {Object} supabase - Supabase client
 * @param {Object} activityData - Activity data to log
 * @param {Object} options - Options (e.g., deduplicate)
 * @returns {Promise<Object>} Result with success status
 */
async function logActivity(supabase, activityData, options = {}) {
  try {
    // Validate required fields
    if (!activityData.event_type) {
      return {
        success: false,
        error: 'Event type is required'
      };
    }

    // Check for deduplication if requested
    if (options.deduplicate) {
      // Simplified deduplication check
      const { data: existingEvents } = await supabase
        .from('user_activities')
        .select('*')
        .eq('event_type', activityData.event_type)
        .eq('user_id', activityData.user_id)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .limit(1);

      if (existingEvents && existingEvents.length > 0) {
        return {
          success: true,
          deduplicated: true,
          data: existingEvents[0]
        };
      }
    }

    // Insert new activity
    const { data, error } = await supabase
      .from('user_activities')
      .insert(activityData)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to log activity: ${error.message}`
      };
    }

    return {
      success: true,
      deduplicated: false,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: `Activity logging failed: ${error.message}`
    };
  }
}

/**
 * Calculate active users (stub for tests)
 * @param {Object} supabase - Supabase client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Active users metrics
 */
async function calculateActiveUsers(supabase, options = {}) {
  try {
    let query = supabase
      .from('user_activities')
      .select('*');

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data: activities, error } = await query;

    if (error || !activities) {
      return {
        count: 0,
        uniqueUsers: [],
        period: options
      };
    }

    const uniqueUsers = [...new Set(activities.map(a => a.user_id).filter(Boolean))];

    if (options.groupBy === 'school_id') {
      const grouped = {};
      activities.forEach(activity => {
        const schoolId = activity.school_id || 'unknown';
        if (!grouped[schoolId]) {
          grouped[schoolId] = { count: 0, users: new Set() };
        }
        grouped[schoolId].count++;
        if (activity.user_id) {
          grouped[schoolId].users.add(activity.user_id);
        }
      });

      // Convert Sets to counts
      Object.keys(grouped).forEach(key => {
        grouped[key].count = grouped[key].users.size;
        delete grouped[key].users;
      });

      return grouped;
    }

    return {
      count: uniqueUsers.length,
      uniqueUsers,
      period: options
    };
  } catch (error) {
    return {
      count: 0,
      uniqueUsers: [],
      error: error.message
    };
  }
}

/**
 * Calculate registration count (stub for tests)
 * @param {Object} supabase - Supabase client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Registration metrics
 */
async function calculateRegistrationCount(supabase, options = {}) {
  try {
    let query = supabase
      .from('user_activities')
      .select('*');

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    if (options.eventType) {
      query = query.eq('event_type', options.eventType);
    }

    const { data: activities, error } = await query;

    if (error || !activities) {
      return {
        completed: 0,
        started: 0,
        count: 0
      };
    }

    const completed = activities.filter(a => a.event_type === 'registration_completed').length;
    const started = activities.filter(a => a.event_type === 'registration_started').length;

    return {
      completed,
      started,
      count: options.eventType ? activities.length : completed + started
    };
  } catch (error) {
    return {
      completed: 0,
      started: 0,
      error: error.message
    };
  }
}

/**
 * Calculate assessment completions (stub for tests)
 * @param {Object} supabase - Supabase client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Assessment metrics
 */
async function calculateAssessmentCompletions(supabase, options = {}) {
  try {
    let query = supabase
      .from('user_activities')
      .select('*');

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data: activities, error } = await query;

    if (error || !activities) {
      return {
        completed: 0,
        started: 0,
        completionRate: 0
      };
    }

    const completed = activities.filter(a => a.event_type === 'assessment_completed').length;
    const started = activities.filter(a => a.event_type === 'assessment_started').length;
    const completionRate = started > 0 ? Math.round((completed / started) * 100) / 100 : 0;

    return {
      completed,
      started,
      completionRate
    };
  } catch (error) {
    return {
      completed: 0,
      started: 0,
      completionRate: 0,
      error: error.message
    };
  }
}

/**
 * Calculate comprehensive activity metrics for a time period
 * @param {Object} supabase - Supabase client
 * @param {string} startDate - Start date ISO string
 * @param {string} endDate - End date ISO string
 * @returns {Promise<Object>} Comprehensive metrics
 */
async function calculateMetrics(supabase, startDate, endDate) {
  try {
    // Fetch all activities in the time range
    const { data: activities, error } = await supabase
      .from('user_activity')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('Error fetching activities for metrics:', error);
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        uniqueSessions: 0,
        registrations: 0,
        assessments: 0,
        schoolLogins: 0,
        ragQueries: 0
      };
    }

    // Calculate summary metrics
    const summary = calculateActivitySummary(activities || []);
    
    // Calculate funnel metrics
    const funnel = calculateFunnelMetrics(activities || []);
    
    // Identify drop-off points
    const dropOffPoints = identifyDropOffPoints(funnel);

    return {
      ...summary,
      funnel,
      dropOffPoints
    };
  } catch (error) {
    console.error('Error calculating activity metrics:', error);
    return {
      totalEvents: 0,
      uniqueUsers: 0,
      uniqueSessions: 0,
      registrations: 0,
      assessments: 0,
      schoolLogins: 0,
      ragQueries: 0,
      error: error.message
    };
  }
}

/**
 * Calculate detailed funnel metrics with conversion rates
 * @param {Object} supabase - Supabase client
 * @param {string} startDate - Start date ISO string
 * @param {string} endDate - End date ISO string
 * @returns {Promise<Object>} Detailed funnel analysis
 */
async function calculateFunnelMetricsDetailed(supabase, startDate, endDate) {
  try {
    // Fetch all activities in the time range
    const { data: activities, error } = await supabase
      .from('user_activity')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('Error fetching activities for funnel:', error);
      return {
        funnel: {
          started: 0,
          registered: 0,
          assessed: 0,
          completed: 0
        },
        conversionRates: {
          startToRegister: 0,
          registerToAssess: 0,
          assessToComplete: 0,
          overall: 0
        },
        dropOffPoints: []
      };
    }

    // Count events at each funnel stage
    const started = activities?.filter(a => 
      a.event_type === 'page_view' || 
      a.event_type === 'registration_started'
    ).length || 0;
    
    const registered = activities?.filter(a => 
      a.event_type === 'registration' || 
      a.event_type === 'registration_completed'
    ).length || 0;
    
    const assessed = activities?.filter(a => 
      a.event_type === 'assessment_started'
    ).length || 0;
    
    const completed = activities?.filter(a => 
      a.event_type === 'assessment_completed'
    ).length || 0;

    // Calculate conversion rates
    const startToRegister = started > 0 ? Math.round((registered / started) * 100) : 0;
    const registerToAssess = registered > 0 ? Math.round((assessed / registered) * 100) : 0;
    const assessToComplete = assessed > 0 ? Math.round((completed / assessed) * 100) : 0;
    const overall = started > 0 ? Math.round((completed / started) * 100) : 0;

    // Identify drop-off points
    const dropOffPoints = [];
    
    if (startToRegister < 50) {
      dropOffPoints.push({
        stage: 'start_to_register',
        dropOff: started - registered,
        percentage: 100 - startToRegister
      });
    }
    
    if (registerToAssess < 70) {
      dropOffPoints.push({
        stage: 'register_to_assess',
        dropOff: registered - assessed,
        percentage: 100 - registerToAssess
      });
    }
    
    if (assessToComplete < 80) {
      dropOffPoints.push({
        stage: 'assess_to_complete',
        dropOff: assessed - completed,
        percentage: 100 - assessToComplete
      });
    }

    return {
      funnel: {
        started,
        registered,
        assessed,
        completed
      },
      conversionRates: {
        startToRegister,
        registerToAssess,
        assessToComplete,
        overall
      },
      dropOffPoints
    };
  } catch (error) {
    console.error('Error calculating funnel metrics:', error);
    return {
      funnel: {
        started: 0,
        registered: 0,
        assessed: 0,
        completed: 0
      },
      conversionRates: {
        startToRegister: 0,
        registerToAssess: 0,
        assessToComplete: 0,
        overall: 0
      },
      dropOffPoints: [],
      error: error.message
    };
  }
}

// Create singleton instance
const activityAnalyzer = {
  calculateActivitySummary,
  calculateFunnelMetrics,
  identifyDropOffPoints,
  calculateActivityTrends,
  groupByEventType,
  logActivity,
  calculateActiveUsers,
  calculateRegistrationCount,
  calculateAssessmentCompletions,
  calculateMetrics,
  calculateFunnelMetrics: calculateFunnelMetricsDetailed
};

module.exports = {
  calculateActivitySummary,
  calculateFunnelMetrics,
  identifyDropOffPoints,
  calculateActivityTrends,
  groupByEventType,
  logActivity,
  calculateActiveUsers,
  calculateRegistrationCount,
  calculateAssessmentCompletions,
  calculateMetrics,
  calculateFunnelMetricsDetailed,
  activityAnalyzer
};
