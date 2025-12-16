// Gate performance monitoring

import { createClient } from '@supabase/supabase-js';

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

export async function trackGatePerformance(session) {
  try {
    const { data, error } = await supabase
      .from('gate_metrics')
      .insert({
        session_id: session.id,
        student_grade: session.student.grade,
        
        // Gate stats
        careers_checked: session.gateResults?.length || 0,
        careers_blocked: session.gateResults?.filter(r => r.blocked).length || 0,
        careers_warned: session.gateResults?.filter(r => r.warnings?.length > 0).length || 0,
        
        // Most common blocks
        math_gate_blocked: session.gateResults?.filter(r => 
          r.reasons?.some(reason => reason.includes('Math'))
        ).length || 0,
        science_gate_blocked: session.gateResults?.filter(r => 
          r.reasons?.some(reason => reason.includes('Science'))
        ).length || 0,
        aps_gate_blocked: session.gateResults?.filter(r => 
          r.reasons?.some(reason => reason.includes('APS'))
        ).length || 0,
        
        // Post-correction stats (Week 2)
        issues_found_by_correction: session.correction?.issues_found?.length || 0,
        corrections_made: session.correction?.corrections_made?.length || 0,
        
        // Outcome
        final_recommendations: session.finalReport?.careers?.length || 0,
        student_satisfied: null, // Fill after feedback survey
        
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('[MONITORING] Error tracking gates:', error);
    }

    return data;
  } catch (err) {
    console.error('[MONITORING] Exception tracking gates:', err);
  }
}

export async function getGateStats(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('gate_metrics')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const stats = {
      totalAssessments: data.length,
      avgCareersBlocked: data.reduce((sum, d) => sum + d.careers_blocked, 0) / data.length,
      mostCommonBlock: this.getMostCommonBlock(data),
      postCorrectionStats: {
        issuesFound: data.reduce((sum, d) => sum + d.issues_found_by_correction, 0),
        correctionsMade: data.reduce((sum, d) => sum + d.corrections_made, 0)
      }
    };

    return stats;
  } catch (err) {
    console.error('[MONITORING] Error getting stats:', err);
    return null;
  }
}

function getMostCommonBlock(data) {
  const blocks = {
    math: data.reduce((sum, d) => sum + d.math_gate_blocked, 0),
    science: data.reduce((sum, d) => sum + d.science_gate_blocked, 0),
    aps: data.reduce((sum, d) => sum + d.aps_gate_blocked, 0)
  };

  const max = Math.max(...Object.values(blocks));
  const blockType = Object.keys(blocks).find(key => blocks[key] === max);
  
  return { type: blockType, count: max };
}
