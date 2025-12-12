#!/usr/bin/env node

/**
 * Gap Detection System Setup
 * 
 * Creates logging infrastructure for real-time gap detection during alpha testing
 * Tracks student queries, confidence scores, and identifies content gaps
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('🔍 GAP DETECTION SYSTEM SETUP');
console.log('   Real-time monitoring for alpha testing');
console.log('═══════════════════════════════════════════════════════\n');

async function setupGapDetection() {
  try {
    // Create student_queries table for gap detection
    console.log('📊 Setting up gap detection infrastructure...');
    
    const createTableSQL = `
      -- Student queries logging for gap detection
      CREATE TABLE IF NOT EXISTS student_queries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        response JSONB NOT NULL,
        confidence_score DECIMAL(3,2),
        career_keywords TEXT[],
        student_id VARCHAR(50),
        session_id VARCHAR(50),
        response_time_ms INTEGER,
        chunks_retrieved JSONB,
        flagged_for_review BOOLEAN DEFAULT false,
        gap_category VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Gap analysis summary table
      CREATE TABLE IF NOT EXISTS gap_analysis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        analysis_date DATE NOT NULL,
        total_queries INTEGER,
        low_confidence_queries INTEGER,
        top_gaps JSONB,
        priority_careers TEXT[],
        action_items JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_student_queries_date ON student_queries(created_at);
      CREATE INDEX IF NOT EXISTS idx_student_queries_confidence ON student_queries(confidence_score);
      CREATE INDEX IF NOT EXISTS idx_student_queries_flagged ON student_queries(flagged_for_review);
    `;
    
    // Note: This would need to be run directly in Supabase SQL editor
    console.log('✓ Gap detection table schema ready');
    console.log('  (Run the SQL in Supabase SQL editor to create tables)');
    
    // Create gap detection functions
    const gapDetectionCode = `
// Add this to your RAG query handler (app/api/rag/query/route.js)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function logStudentQuery(queryData) {
  const {
    question,
    response,
    confidenceScore,
    careerKeywords,
    studentId,
    sessionId,
    responseTimeMs,
    chunksRetrieved
  } = queryData;
  
  // Calculate confidence score based on response quality
  const confidence = calculateConfidenceScore(response);
  
  // Flag low-confidence responses for review
  const flaggedForReview = confidence < 0.7;
  
  // Determine gap category
  const gapCategory = determineGapCategory(question, confidence);
  
  // Log to database
  const { error } = await supabase
    .from('student_queries')
    .insert({
      question,
      response,
      confidence_score: confidence,
      career_keywords: careerKeywords,
      student_id: studentId,
      session_id: sessionId,
      response_time_ms: responseTimeMs,
      chunks_retrieved: chunksRetrieved,
      flagged_for_review: flaggedForReview,
      gap_category: gapCategory
    });
    
  if (error) {
    console.error('Failed to log student query:', error);
  }
  
  // Real-time alerting for critical gaps
  if (flaggedForReview && confidence < 0.5) {
    await alertCriticalGap(question, response, confidence);
  }
}

function calculateConfidenceScore(response) {
  let score = 0.5; // Base score
  
  // Check for key indicators of good responses
  if (response.hasCareerMatches) score += 0.1;
  if (response.hasReasoningForCareer) score += 0.1;
  if (response.hasSalaries) score += 0.1;
  if (response.hasBursaries) score += 0.1;
  if (response.hasNextSteps) score += 0.1;
  if (response.hasSAContext) score += 0.1;
  
  // Penalize for validation failures
  if (!response.hasSubstantialContent) score -= 0.2;
  if (!response.hasFrameworkReference) score -= 0.1;
  
  return Math.max(0, Math.min(1, score));
}

function determineGapCategory(question, confidence) {
  const questionLower = question.toLowerCase();
  
  if (confidence < 0.3) return 'critical_gap';
  if (confidence < 0.5) return 'major_gap';
  if (confidence < 0.7) return 'minor_gap';
  
  // Categorize by topic
  if (questionLower.includes('creative') || questionLower.includes('art') || questionLower.includes('film')) {
    return 'creative_arts';
  }
  if (questionLower.includes('engineering') && questionLower.includes('difference')) {
    return 'engineering_confusion';
  }
  if (questionLower.includes('influencer') || questionLower.includes('youtube') || questionLower.includes('tiktok')) {
    return 'social_media_careers';
  }
  
  return 'general';
}

async function alertCriticalGap(question, response, confidence) {
  // Log critical gap for immediate attention
  console.error(\`🚨 CRITICAL GAP DETECTED: \${confidence.toFixed(2)} confidence\`);
  console.error(\`Question: \${question}\`);
  
  // Could integrate with Slack/email alerts here
}
`;
    
    console.log('\n📝 Gap Detection Code Generated');
    console.log('   Copy the above code to your RAG handler');
    
    // Create gap analysis script
    const analysisScript = `
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
  console.log(\`
═══════════════════════════════════════════════════════
📊 DAILY GAP ANALYSIS REPORT
Date: \${startDate}
═══════════════════════════════════════════════════════

📈 SUMMARY:
   Total Queries: \${totalQueries}
   Low Confidence (<70%): \${lowConfidenceQueries.length} (\${Math.round(lowConfidenceQueries.length/totalQueries*100)}%)
   Critical Gaps (<50%): \${criticalGaps.length} (\${Math.round(criticalGaps.length/totalQueries*100)}%)

🔍 TOP UNANSWERED QUESTIONS:
\${topGaps.map(([pattern, queries], i) => 
  \`   \${i+1}. "\${pattern}" (\${queries.length} students asked)\`
).join('\\n')}

🎯 PRIORITY ACTIONS:
\${generateActionItems(topGaps)}

═══════════════════════════════════════════════════════
  \`);
  
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
    .replace(/\\b(i|my|me|am|is|are|can|should|would|could)\\b/g, '')
    .replace(/\\s+/g, ' ')
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
`;
    
    // Write the analysis script
    await import('fs/promises').then(fs => 
      fs.writeFile('scripts/daily-gap-analysis.js', analysisScript)
    );
    
    console.log('✓ Created scripts/daily-gap-analysis.js');
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ GAP DETECTION SYSTEM READY!');
    console.log('   Next: Integrate logging into RAG handler');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📋 ALPHA TESTING PROTOCOL:');
    console.log('   1. Monday: Deploy with logging enabled');
    console.log('   2. Daily: Run gap analysis at 6pm SAST');
    console.log('   3. Friday: Generate content for top 3 gaps');
    console.log('   4. Weekend: Deploy fixes for Monday');
    
  } catch (error) {
    console.error('❌ Error setting up gap detection:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupGapDetection();