/**
 * Error Logger Utility
 */

async function deduplicateError(supabase, errorData) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existingErrors, error } = await supabase
      .from('system_errors')
      .select('*')
      .eq('type', errorData.type)
      .eq('message', errorData.message)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) return { isDuplicate: false };
    if (existingErrors && existingErrors.length > 0) {
      return { isDuplicate: true, existingErrorId: existingErrors[0].id, count: existingErrors[0].count || 1 };
    }
    return { isDuplicate: false };
  } catch (error) {
    return { isDuplicate: false };
  }
}

async function logError(supabase, errorData) {
  try {
    if (!errorData.type || !errorData.message) return { success: false, error: 'Error type and message are required' };
    const validTypes = ['api_error', 'frontend_error', 'database_error', 'integration_error'];
    if (!validTypes.includes(errorData.type)) return { success: false, error: 'Invalid error type' };
    const deduplicationResult = await deduplicateError(supabase, errorData);
    if (deduplicationResult.isDuplicate) {
      await supabase.from('system_errors').update({ count: deduplicationResult.count + 1, last_occurrence: new Date().toISOString() }).eq('id', deduplicationResult.existingErrorId);
      return { success: true, isDuplicate: true, errorId: deduplicationResult.existingErrorId, count: deduplicationResult.count + 1 };
    }
    const { data: newError, error: insertError } = await supabase.from('system_errors').insert({ type: errorData.type, message: errorData.message, severity: errorData.severity || 'medium', count: 1, status: 'active', created_at: new Date().toISOString() }).select().single();
    if (insertError) return { success: false, error: insertError.message };
    return { success: true, isDuplicate: false, error: newError };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function queryErrors(supabase, filters = {}) {
  try {
    let query = supabase.from('system_errors').select('*', { count: 'exact' });
    if (filters.type) query = query.eq('type', filters.type);
    const { data: errors, error, count } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, errors, pagination: { total: count } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function resolveError(supabase, errorId) {
  try {
    const { data, error } = await supabase.from('system_errors').update({ status: 'resolved' }).eq('id', errorId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, error: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { logError, deduplicateError, queryErrors, resolveError };
