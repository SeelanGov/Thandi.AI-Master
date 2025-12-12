
#!/usr/bin/env node

/**
 * Daily Gap Analysis Script
 * Run this every evening at 6pm SAST during alpha testing
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateGapReport(date = 'today') {
  const startDate = date === 'today' ? new Date().toISOString().split('T')[0] : date;
  
  // Get all queries from the specified date
  const { data: queries, error } = await supabase
    .from('student_queries')
    .select('*')
    .gte('created_at', startDate + ' 00:00:00')
    .lt('created_at', startDate + ' 23:59:59');
    
  if (error) {
    console.error('Failed to fetch queries:', error);
    return;
  }
  
  // Analyze gaps
  const totalQueries = queries.length;
  const lowConfidenceQueries = queries.filter(q => q.confidence_score < 0.7);
  const criticalGaps = queries.filter(q => q.confidence_score < 0.5);
  
  // Group by question patterns
  const questionPatterns = {};
  queries.forEach(query => {
    const pattern = extractQuestionPattern(query.question);
    if (!questionPatterns[pattern]) {
      questionPatterns[pattern] = [];
    }
    questionPatterns[pattern].push(query);
  });
  
  // Find top unanswered questions
  const topGaps = Object.entries(questionPatterns)
    .filter(([pattern, queries]) => queries.some(q => q.confidence_score < 0.7))
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 10);
  
  // Generate report
  console.log(`
═══════════════════════════════════════════════════════
📊 DAILY GAP ANALYSIS REPORT
Date: ${startDate}
═══════════════════════════════════════════════════════

📈 SUMMARY:
   Total Queries: ${totalQueries}
   Low Confidence (<70%): ${lowConfidenceQueries.length} (${Math.round(lowConfidenceQueries.length/totalQueries*100)}%)
   Critical Gaps (<50%): ${criticalGaps.length} (${Math.round(criticalGaps.length/totalQueries*100)}%)

🔍 TOP UNANSWERED QUESTIONS:
${topGaps.map(([pattern, queries], i) => 
  `   ${i+1}. "${pattern}" (${queries.length} students asked)`
).join('\n')}

🎯 PRIORITY ACTIONS:
${generateActionItems(topGaps)}

═══════════════════════════════════════════════════════
  `);
  
  // Save analysis to database
  await supabase
    .from('gap_analysis')
    .insert({
      analysis_date: startDate,
      total_queries: totalQueries,
      low_confidence_queries: lowConfidenceQueries.length,
      top_gaps: topGaps.map(([pattern, queries]) => ({
        pattern,
        count: queries.length,
        avg_confidence: queries.reduce((sum, q) => sum + q.confidence_score, 0) / queries.length
      })),
      priority_careers: extractPriorityCareers(topGaps),
      action_items: generateActionItems(topGaps)
    });
}

function extractQuestionPattern(question) {
  // Simplify question to identify patterns
  return question
    .toLowerCase()
    .replace(/\b(i|my|me|am|is|are|can|should|would|could)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 60) + '...';
}

function extractPriorityCareers(topGaps) {
  const careers = [];
  topGaps.forEach(([pattern, queries]) => {
    queries.forEach(query => {
      if (query.career_keywords) {
        careers.push(...query.career_keywords);
      }
    });
  });
  
  // Return most frequently mentioned careers
  const careerCounts = {};
  careers.forEach(career => {
    careerCounts[career] = (careerCounts[career] || 0) + 1;
  });
  
  return Object.entries(careerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([career]) => career);
}

function generateActionItems(topGaps) {
  return topGaps.slice(0, 3).map(([pattern, queries], i) => {
    const avgConfidence = queries.reduce((sum, q) => sum + q.confidence_score, 0) / queries.length;
    const priority = avgConfidence < 0.3 ? 'P1 - CRITICAL' : avgConfidence < 0.5 ? 'P2 - HIGH' : 'P3 - MEDIUM';
    
    return {
      priority,
      pattern,
      student_count: queries.length,
      avg_confidence: avgConfidence,
      suggested_action: avgConfidence < 0.5 ? 'Create new content module' : 'Enhance existing content'
    };
  });
}

// Run the analysis
if (process.argv[2] === '--date') {
  generateGapReport(process.argv[3]);
} else {
  generateGapReport();
}
