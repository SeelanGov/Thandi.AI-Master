-- Gate monitoring schema

CREATE TABLE IF NOT EXISTS gate_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  student_grade INTEGER,
  
  -- Gate statistics
  careers_checked INTEGER DEFAULT 0,
  careers_blocked INTEGER DEFAULT 0,
  careers_warned INTEGER DEFAULT 0,
  
  -- Specific gate blocks
  math_gate_blocked INTEGER DEFAULT 0,
  science_gate_blocked INTEGER DEFAULT 0,
  aps_gate_blocked INTEGER DEFAULT 0,
  budget_gate_warned INTEGER DEFAULT 0,
  deadline_gate_blocked INTEGER DEFAULT 0,
  
  -- Post-correction stats (Week 2)
  issues_found_by_correction INTEGER DEFAULT 0,
  corrections_made INTEGER DEFAULT 0,
  
  -- Outcomes
  final_recommendations INTEGER DEFAULT 0,
  student_satisfied BOOLEAN,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_gate_metrics_created (created_at),
  INDEX idx_gate_metrics_grade (student_grade)
);

-- View for dashboard
CREATE OR REPLACE VIEW gate_performance_summary AS
SELECT 
  COUNT(*) as total_assessments,
  AVG(careers_blocked) as avg_careers_blocked,
  AVG(careers_blocked::float / NULLIF(careers_checked, 0) * 100) as avg_block_percentage,
  SUM(math_gate_blocked) as total_math_blocks,
  SUM(science_gate_blocked) as total_science_blocks,
  SUM(aps_gate_blocked) as total_aps_blocks,
  AVG(final_recommendations) as avg_recommendations,
  DATE_TRUNC('day', created_at) as date
FROM gate_metrics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
