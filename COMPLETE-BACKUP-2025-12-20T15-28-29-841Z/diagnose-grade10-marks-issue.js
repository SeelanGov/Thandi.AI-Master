#!/usr/bin/env node

/**
 * Diagnose Grade 10 Marks Issue
 * Investigates why marks from Step 2 aren't being used for APS calculations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnosing Grade 10 Marks Issue');
console.log('='.repeat(50));

function analyzeAssessmentForm() {
  console.log('\n📋 Analyzing AssessmentForm.jsx');
  
  const assessmentForm = fs.readFileSync(
    path.join(__dirname, 'app/assessment/components/AssessmentForm.jsx'), 
    'utf8'
  );
  
  console.log('🔍 Checking marks data flow...');
  
  // Check if marks are collected in Step 2
  const hasMarksCollection = assessmentForm.includes('MarksCollection');
  console.log(`  ${hasMarksCollection ? '✅' : '❌'} MarksCollection component used`);
  
  // Check if marks are stored in formData
  const hasMarksData = assessmentForm.includes('marksData');
  console.log(`  ${hasMarksData ? '✅' : '❌'} marksData in formData`);
  
  // Check preliminary report generation
  const preliminaryReportMatch = assessmentForm.match(/generatePreliminaryReport[\s\S]*?marksData/);
  console.log(`  ${preliminaryReportMatch ? '✅' : '❌'} Marks used in preliminary report`);
  
  // Check enhanced submission
  const enhancedSubmissionMatch = assessmentForm.match(/handleSubmitWithEnhancement[\s\S]*?marksData/);
  console.log(`  ${enhancedSubmissionMatch ? '✅' : '❌'} Marks used in enhanced submission`);
  
  // Extract marks handling code
  const marksHandlingPattern = /marksData.*exactMarks|exactMarks.*marksData/g;
  const marksMatches = assessmentForm.match(marksHandlingPattern);
  
  if (marksMatches) {
    console.log(`  📊 Found ${marksMatches.length} marks handling references`);
  } else {
    console.log('  ❌ No explicit marks handling found');
  }
  
  return {
    hasMarksCollection,
    hasMarksData,
    hasPreliminaryMarks: !!preliminaryReportMatch,
    hasEnhancedMarks: !!enhancedSubmissionMatch
  };
}

function analyzeAPIRoute() {
  console.log('\n🔌 Analyzing API Route');
  
  const apiRoute = fs.readFileSync(
    path.join(__dirname, 'app/api/rag/query/route.js'), 
    'utf8'
  );
  
  // Check for APS calculation
  const hasAPSCalculation = apiRoute.includes('APS') || apiRoute.includes('aps');
  console.log(`  ${hasAPSCalculation ? '✅' : '❌'} APS calculation present`);
  
  // Check for marks processing
  const hasMarksProcessing = apiRoute.includes('marks') || apiRoute.includes('exactMarks');
  console.log(`  ${hasMarksProcessing ? '✅' : '❌'} Marks processing present`);
  
  // Check for university eligibility
  const hasUniversityEligibility = apiRoute.includes('university') || apiRoute.includes('eligibility');
  console.log(`  ${hasUniversityEligibility ? '✅' : '❌'} University eligibility logic`);
  
  // Check for program matching
  const hasProgramMatching = apiRoute.includes('program') || apiRoute.includes('generateSpecificRecommendations');
  console.log(`  ${hasProgramMatching ? '✅' : '❌'} Program matching logic`);
  
  return {
    hasAPSCalculation,
    hasMarksProcessing,
    hasUniversityEligibility,
    hasProgramMatching
  };
}

function analyzeMarksCollection() {
  console.log('\n📝 Analyzing MarksCollection Component');
  
  const marksCollection = fs.readFileSync(
    path.join(__dirname, 'app/assessment/components/MarksCollection.jsx'), 
    'utf8'
  );
  
  // Check data structure
  const hasExactMarks = marksCollection.includes('exactMarks');
  const hasRangeMarks = marksCollection.includes('rangeMarks');
  const hasMarksOption = marksCollection.includes('marksOption');
  
  console.log(`  ${hasExactMarks ? '✅' : '❌'} exactMarks handling`);
  console.log(`  ${hasRangeMarks ? '✅' : '❌'} rangeMarks handling`);
  console.log(`  ${hasMarksOption ? '✅' : '❌'} marksOption selection`);
  
  // Check if marks are properly structured for APS calculation
  const hasSubjectMarks = marksCollection.includes('Mathematics') || marksCollection.includes('Physical Sciences');
  console.log(`  ${hasSubjectMarks ? '✅' : '❌'} Subject-specific marks structure`);
  
  return {
    hasExactMarks,
    hasRangeMarks,
    hasMarksOption,
    hasSubjectMarks
  };
}

function identifyIssues() {
  console.log('\n🚨 Issue Analysis');
  
  const assessmentAnalysis = analyzeAssessmentForm();
  const apiAnalysis = analyzeAPIRoute();
  const marksAnalysis = analyzeMarksCollection();
  
  const issues = [];
  
  if (!apiAnalysis.hasAPSCalculation) {
    issues.push('❌ CRITICAL: No APS calculation logic in API');
  }
  
  if (!apiAnalysis.hasUniversityEligibility) {
    issues.push('❌ CRITICAL: No university eligibility checking');
  }
  
  if (!assessmentAnalysis.hasPreliminaryMarks) {
    issues.push('❌ CRITICAL: Marks not used in preliminary report');
  }
  
  if (!assessmentAnalysis.hasEnhancedMarks) {
    issues.push('❌ CRITICAL: Marks not used in enhanced submission');
  }
  
  if (!apiAnalysis.hasProgramMatching) {
    issues.push('⚠️ WARNING: Limited program matching logic');
  }
  
  console.log('\n🔧 Issues Found:');
  issues.forEach(issue => console.log(`  ${issue}`));
  
  return issues;
}

function createFixPlan() {
  console.log('\n🛠️ Fix Plan');
  
  console.log('📋 Required Fixes:');
  console.log('  1. Add APS calculation function');
  console.log('  2. Integrate marks data in API query building');
  console.log('  3. Add university eligibility checking');
  console.log('  4. Enhance program matching with APS scores');
  console.log('  5. Add projected APS calculation for Grade 10');
  console.log('  6. Include bias detection and mitigation');
  
  console.log('\n🎯 Implementation Priority:');
  console.log('  🔥 HIGH: APS calculation and university eligibility');
  console.log('  🔥 HIGH: Marks integration in preliminary report');
  console.log('  🔥 HIGH: Enhanced results with APS data');
  console.log('  📊 MEDIUM: Bias detection and mitigation');
  console.log('  🎨 LOW: UI improvements for APS display');
}

function main() {
  console.log('🔍 Starting Grade 10 Marks Issue Diagnosis...\n');
  
  const issues = identifyIssues();
  createFixPlan();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 DIAGNOSIS COMPLETE');
  
  if (issues.length > 0) {
    console.log(`\n❌ Found ${issues.length} critical issues`);
    console.log('🚨 IMMEDIATE ACTION REQUIRED');
    console.log('\n🛠️ Next Steps:');
    console.log('  1. Implement APS calculation logic');
    console.log('  2. Fix marks data integration');
    console.log('  3. Add university eligibility checks');
    console.log('  4. Test with real Grade 10 data');
    console.log('  5. Deploy fixes to production');
  } else {
    console.log('\n✅ No critical issues found');
  }
  
  return issues.length === 0;
}

main();