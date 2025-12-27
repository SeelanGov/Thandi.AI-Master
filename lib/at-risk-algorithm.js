// Integrates with your existing RAG system
export function calculateAtRiskFlags(assessment) {
  const flags = [];
  
  // Rule 1: Rushed completion
  if (assessment.completion_time_minutes < 5) {
    flags.push({
      level: 'red',
      reason: `Rushed assessment (${assessment.completion_time_minutes} min)`
    });
  }
  
  // Rule 2: No clear focus (top 3 within 10%)
  const top3 = assessment.career_matches?.slice(0, 3) || [];
  if (top3.length >= 3 && (top3[0].score - top3[2].score) < 10) {
    flags.push({
      level: 'yellow',
      reason: 'No clear career focus - multiple similar matches'
    });
  }
  
  // Rule 3: Financial mismatch (if you collect this)
  if (assessment.financial_constraint === 'cannot_afford' && 
      top3.some(c => c.avg_cost > 50000)) {
    flags.push({
      level: 'red',
      reason: 'Wants high-cost career but indicated financial constraints'
    });
  }
  
  return flags;
}