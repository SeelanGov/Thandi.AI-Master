// scripts/analyze-data-quality.js
// Task 8.2: Data quality analysis script
// Command-line utility to analyze knowledge base data quality

import { DataQualityValidator } from '../lib/rag/data-quality-validator.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Format analysis results for console output
 */
function formatCoverageAnalysis(analysis) {
  console.log('\n📊 CAREER COVERAGE ANALYSIS');
  console.log('=' .repeat(50));
  
  console.log(`📈 Total Careers: ${analysis.totalCareers}`);
  console.log(`📂 Categories: ${analysis.categories.size}`);
  console.log(`🏷️ Subcategories: ${analysis.subcategories.size}`);
  
  console.log('\n🎯 Top Categories:');
  const sortedCategories = [...analysis.categories.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedCategories.forEach(([category, count]) => {
    const percentage = ((count / analysis.totalCareers) * 100).toFixed(1);
    console.log(`   ${category}: ${count} careers (${percentage}%)`);
  });
  
  console.log('\n📊 Demand Level Distribution:');
  [...analysis.demandLevels.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([level, count]) => {
      const percentage = ((count / analysis.totalCareers) * 100).toFixed(1);
      console.log(`   ${level}: ${count} careers (${percentage}%)`);
    });
  
  if (analysis.gaps.length > 0) {
    console.log('\n⚠️ IDENTIFIED GAPS:');
    analysis.gaps.forEach((gap, index) => {
      const severity = gap.severity === 'high' ? '🔴' : gap.severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${severity} ${gap.type}: ${gap.category || gap.subject || 'General'}`);
      if (gap.currentCount !== undefined) {
        console.log(`      Current: ${gap.currentCount}, Recommended: ${gap.recommendedMinimum}`);
      }
    });
  }
  
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    analysis.recommendations.slice(0, 5).forEach((rec, index) => {
      const priority = rec.priority === 1 ? '🔴 HIGH' : rec.priority === 2 ? '🟡 MED' : '🟢 LOW';
      console.log(`   ${priority}: ${rec.action}`);
      console.log(`      ${rec.details}`);
    });
  }
}

function formatMetadataAnalysis(analysis) {
  console.log('\n🔍 METADATA CONSISTENCY ANALYSIS');
  console.log('=' .repeat(50));
  
  console.log(`📊 Overall Quality Score: ${analysis.qualityScore.toFixed(1)}%`);
  console.log(`📋 Total Careers Analyzed: ${analysis.totalCareers}`);
  
  console.log('\n📈 Field Completeness:');
  const sortedFields = [...analysis.fieldCompleteness.entries()]
    .sort((a, b) => b[1].completeness - a[1].completeness);
  
  sortedFields.forEach(([field, stats]) => {
    const percentage = (stats.completeness * 100).toFixed(1);
    const status = stats.isEssential ? '🔴 ESSENTIAL' : '🟡 OPTIONAL';
    const completeness = stats.completeness >= 0.9 ? '✅' : stats.completeness >= 0.7 ? '⚠️' : '❌';
    console.log(`   ${completeness} ${field}: ${percentage}% (${stats.completeCount}/${stats.totalCount}) ${status}`);
  });
  
  if (analysis.inconsistencies.length > 0) {
    console.log('\n⚠️ METADATA ISSUES:');
    analysis.inconsistencies.forEach((issue, index) => {
      const severity = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${severity} ${issue.type}: ${issue.field || 'General'}`);
      if (issue.affectedCareers) {
        console.log(`      Affects ${issue.affectedCareers} careers`);
      }
    });
  }
  
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 METADATA RECOMMENDATIONS:');
    analysis.recommendations.slice(0, 5).forEach((rec, index) => {
      const priority = rec.priority === 1 ? '🔴 HIGH' : rec.priority === 2 ? '🟡 MED' : '🟢 LOW';
      console.log(`   ${priority}: ${rec.action}`);
      console.log(`      ${rec.details}`);
    });
  }
}

function formatCompletenessAnalysis(analysis) {
  console.log('\n✅ CAREER COMPLETENESS VALIDATION');
  console.log('=' .repeat(50));
  
  console.log(`📊 Overall Completeness Score: ${analysis.completenessScore.toFixed(1)}%`);
  console.log(`✅ Valid Careers: ${analysis.validCareers.length}/${analysis.totalCareers}`);
  console.log(`❌ Invalid Careers: ${analysis.invalidCareers.length}/${analysis.totalCareers}`);
  console.log(`⚠️ Warnings: ${analysis.warnings.length}`);
  
  if (analysis.invalidCareers.length > 0) {
    console.log('\n❌ CAREERS WITH ISSUES:');
    analysis.invalidCareers.slice(0, 10).forEach(career => {
      console.log(`   ${career.career_code}: ${career.career_title}`);
      career.issues.forEach(issue => {
        console.log(`      🔴 ${issue}`);
      });
      if (career.warnings.length > 0) {
        career.warnings.slice(0, 2).forEach(warning => {
          console.log(`      ⚠️ ${warning}`);
        });
      }
    });
    
    if (analysis.invalidCareers.length > 10) {
      console.log(`   ... and ${analysis.invalidCareers.length - 10} more careers with issues`);
    }
  }
  
  if (analysis.warnings.length > 0) {
    console.log('\n⚠️ COMMON WARNINGS:');
    const warningCounts = new Map();
    analysis.warnings.forEach(warning => {
      const type = warning.split(':')[1]?.trim() || warning;
      warningCounts.set(type, (warningCounts.get(type) || 0) + 1);
    });
    
    [...warningCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([warning, count]) => {
        console.log(`   ${warning}: ${count} careers`);
      });
  }
}

function formatPriorityActions(actions) {
  console.log('\n🎯 PRIORITY ACTIONS');
  console.log('=' .repeat(50));
  
  if (actions.length === 0) {
    console.log('✅ No critical issues found!');
    return;
  }
  
  const highPriority = actions.filter(a => a.impact === 'high');
  const mediumPriority = actions.filter(a => a.impact === 'medium');
  const lowPriority = actions.filter(a => a.impact === 'low');
  
  if (highPriority.length > 0) {
    console.log('\n🔴 HIGH PRIORITY:');
    highPriority.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action.action}`);
      console.log(`      ${action.details}`);
      console.log(`      Source: ${action.source}`);
    });
  }
  
  if (mediumPriority.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY:');
    mediumPriority.slice(0, 3).forEach((action, index) => {
      console.log(`   ${index + 1}. ${action.action}`);
      console.log(`      ${action.details}`);
    });
  }
  
  if (lowPriority.length > 0) {
    console.log(`\n🟢 LOW PRIORITY: ${lowPriority.length} additional recommendations`);
  }
}

/**
 * Save report to file
 */
async function saveReport(report, filename) {
  try {
    const reportsDir = 'reports';
    
    // Create reports directory if it doesn't exist
    try {
      await fs.access(reportsDir);
    } catch {
      await fs.mkdir(reportsDir, { recursive: true });
    }
    
    const filepath = path.join(reportsDir, filename);
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Report saved to: ${filepath}`);
    
    // Also save a summary markdown file
    const summaryPath = path.join(reportsDir, filename.replace('.json', '-summary.md'));
    const summary = generateMarkdownSummary(report);
    await fs.writeFile(summaryPath, summary);
    
    console.log(`📄 Summary saved to: ${summaryPath}`);
    
  } catch (error) {
    console.error(`❌ Failed to save report: ${error.message}`);
  }
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(report) {
  const timestamp = new Date(report.timestamp).toLocaleString();
  
  return `# Data Quality Report

**Generated:** ${timestamp}  
**Overall Score:** ${report.summary.overallScore.toFixed(1)}%  

## Summary

- **Total Careers:** ${report.summary.totalCareers}
- **Categories:** ${report.summary.categories}
- **Data Quality Score:** ${report.summary.dataQualityScore.toFixed(1)}%
- **Completeness Score:** ${report.summary.completenessScore.toFixed(1)}%

## Top Categories

${[...report.coverage.categories.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([cat, count]) => `- **${cat}:** ${count} careers`)
  .join('\n')}

## Priority Actions

${report.priorityActions
  .filter(a => a.impact === 'high')
  .slice(0, 5)
  .map((action, i) => `${i + 1}. **${action.action}**\n   ${action.details}`)
  .join('\n\n')}

## Data Quality Issues

- **High Priority Issues:** ${report.priorityActions.filter(a => a.impact === 'high').length}
- **Medium Priority Issues:** ${report.priorityActions.filter(a => a.impact === 'medium').length}
- **Low Priority Issues:** ${report.priorityActions.filter(a => a.impact === 'low').length}

---
*Generated by Data Quality Validator*
`;
}

/**
 * Main analysis function
 */
async function runDataQualityAnalysis() {
  console.log('🚀 Starting Data Quality Analysis...');
  console.log('=' .repeat(60));
  
  // Check environment
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }
  
  try {
    const validator = new DataQualityValidator({
      enableLogging: true,
      enableMetrics: true
    });
    
    console.log('📊 Generating comprehensive data quality report...');
    const report = await validator.generateQualityReport();
    
    // Display results
    formatCoverageAnalysis(report.coverage);
    formatMetadataAnalysis(report.metadata);
    formatCompletenessAnalysis(report.completeness);
    formatPriorityActions(report.priorityActions);
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📋 ANALYSIS SUMMARY');
    console.log('=' .repeat(60));
    console.log(`🎯 Overall Score: ${report.summary.overallScore.toFixed(1)}%`);
    console.log(`📊 Total Careers: ${report.summary.totalCareers}`);
    console.log(`📂 Categories: ${report.summary.categories}`);
    console.log(`🔍 Data Quality: ${report.summary.dataQualityScore.toFixed(1)}%`);
    console.log(`✅ Completeness: ${report.summary.completenessScore.toFixed(1)}%`);
    console.log(`⚠️ Priority Actions: ${report.priorityActions.filter(a => a.impact === 'high').length} high, ${report.priorityActions.filter(a => a.impact === 'medium').length} medium`);
    
    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    await saveReport(report, `data-quality-report-${timestamp}.json`);
    
    // Recommendations
    console.log('\n💡 NEXT STEPS:');
    if (report.summary.overallScore >= 80) {
      console.log('✅ Data quality is good! Focus on minor improvements.');
    } else if (report.summary.overallScore >= 60) {
      console.log('⚠️ Data quality needs improvement. Address high-priority issues first.');
    } else {
      console.log('🔴 Data quality requires significant attention. Start with critical issues.');
    }
    
    console.log('\n🎯 Task 8.2: Data quality validation utilities - COMPLETE');
    
  } catch (error) {
    console.error('💥 Analysis failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Data Quality Analysis Tool

Usage: node scripts/analyze-data-quality.js [options]

Options:
  --help, -h     Show this help message
  
Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL     Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY    Supabase service role key

Output:
  - Console analysis results
  - JSON report in reports/ directory
  - Markdown summary in reports/ directory
`);
  process.exit(0);
}

// Run the analysis
runDataQualityAnalysis().catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});