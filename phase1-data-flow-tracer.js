/**
 * PHASE 1: DATA FLOW TRACER
 * 
 * Traces how assessment data flows from form submission to LLM processing
 * Identifies data transformation points and validates data integrity
 */

const fs = require('fs');
const path = require('path');

async function traceDataFlow() {
  console.log('🔍 PHASE 1: DATA FLOW MAPPING');
  console.log('==============================\n');
  
  const findings = {
    dataCollectionPoints: [],
    transformationPoints: [],
    apiEndpoints: [],
    dataIntegrity: [],
    issues: []
  };
  
  // 1. Assessment Data Collection Analysis
  console.log('1️⃣ Assessment Data Collection Points');
  console.log('------------------------------------');
  
  // Check AssessmentForm data structure
  try {
    const assessmentFormPath = 'app/assessment/components/AssessmentForm.jsx';
    const assessmentContent = fs.readFileSync(assessmentFormPath, 'utf8');
    
    // Extract data collection fields
    const dataFields = [];
    
    // Check for form data structure
    if (assessmentContent.includes('enjoyedSubjects')) {
      dataFields.push('enjoyedSubjects - Student subject preferences');
    }
    if (assessmentContent.includes('interests')) {
      dataFields.push('interests - Career interest areas');
    }
    if (assessmentContent.includes('marksData')) {
      dataFields.push('marksData - Academic performance (exact marks or ranges)');
    }
    if (assessmentContent.includes('constraints')) {
      dataFields.push('constraints - Financial/location/family constraints');
    }
    if (assessmentContent.includes('openQuestions')) {
      dataFields.push('openQuestions - Motivation and career concerns');
    }
    if (assessmentContent.includes('curriculumProfile')) {
      dataFields.push('curriculumProfile - CAPS framework and current subjects');
    }
    
    findings.dataCollectionPoints = dataFields;
    
    console.log('✅ Data Collection Fields Found:');
    dataFields.forEach(field => console.log(`   - ${field}`));
    
    // Check for marks extraction function
    if (assessmentContent.includes('extractActualMarks')) {
      console.log('✅ Marks extraction function found');
      findings.dataIntegrity.push('Marks extraction function exists');
    } else {
      console.log('⚠️ No marks extraction function found');
      findings.issues.push('Missing marks extraction function');
    }
    
  } catch (error) {
    console.log('❌ Error reading AssessmentForm:', error.message);
    findings.issues.push('Cannot read AssessmentForm component');
  }
  
  console.log('');
  
  // 2. API Endpoint Analysis
  console.log('2️⃣ API Endpoint Analysis');
  console.log('-------------------------');
  
  // Check RAG query endpoint
  try {
    const ragQueryPath = 'app/api/rag/query/route.js';
    const ragContent = fs.readFileSync(ragQueryPath, 'utf8');
    
    console.log('✅ RAG Query Endpoint Found: /api/rag/query');
    
    // Check for profile parameter handling
    if (ragContent.includes('profile') && ragContent.includes('marks')) {
      console.log('✅ Profile parameter with marks handling found');
      findings.apiEndpoints.push('RAG endpoint accepts profile with marks data');
    } else {
      console.log('⚠️ Limited profile parameter handling');
      findings.issues.push('RAG endpoint may not properly handle marks data');
    }
    
    // Check for grade parameter handling
    if (ragContent.includes('grade') && ragContent.includes('parsedGrade')) {
      console.log('✅ Grade parameter processing found');
      findings.apiEndpoints.push('Grade parameter properly processed');
    } else {
      console.log('⚠️ Grade parameter handling unclear');
      findings.issues.push('Grade parameter processing may be incomplete');
    }
    
    // Check for CAG integration
    if (ragContent.includes('generateSpecificRecommendations')) {
      console.log('✅ CAG integration found in RAG endpoint');
      findings.apiEndpoints.push('CAG (Career Assessment Generator) integrated');
    } else {
      console.log('⚠️ No CAG integration found');
      findings.issues.push('CAG not integrated in main RAG endpoint');
    }
    
  } catch (error) {
    console.log('❌ Error reading RAG endpoint:', error.message);
    findings.issues.push('Cannot read RAG query endpoint');
  }
  
  // Check G10-12 endpoint
  try {
    const g1012Path = 'app/api/g10-12/route.js';
    const g1012Content = fs.readFileSync(g1012Path, 'utf8');
    
    console.log('✅ G10-12 Endpoint Found: /api/g10-12');
    
    if (g1012Content.includes('requirements-engine')) {
      console.log('✅ Requirements engine integration found');
      findings.apiEndpoints.push('Requirements engine (Supabase function) integrated');
    }
    
    if (g1012Content.includes('subjects') && g1012Content.includes('career_interests')) {
      console.log('✅ Subject and career interest processing found');
      findings.apiEndpoints.push('Subject and career data processed');
    }
    
  } catch (error) {
    console.log('❌ Error reading G10-12 endpoint:', error.message);
    findings.issues.push('Cannot read G10-12 endpoint');
  }
  
  console.log('');
  
  // 3. Data Transformation Analysis
  console.log('3️⃣ Data Transformation Points');
  console.log('------------------------------');
  
  // Check for data transformation functions
  const transformationChecks = [
    {
      file: 'app/assessment/components/AssessmentForm.jsx',
      function: 'extractActualMarks',
      purpose: 'Convert marks data to APS calculation format'
    },
    {
      file: 'app/api/rag/query/route.js',
      function: 'extractCareerInterests',
      purpose: 'Extract career interests from query text'
    },
    {
      file: 'app/api/rag/query/route.js',
      function: 'extractMarksFromQuery',
      purpose: 'Extract marks from query text'
    }
  ];
  
  transformationChecks.forEach(check => {
    try {
      const content = fs.readFileSync(check.file, 'utf8');
      if (content.includes(check.function)) {
        console.log(`✅ ${check.function} found - ${check.purpose}`);
        findings.transformationPoints.push(`${check.function}: ${check.purpose}`);
      } else {
        console.log(`⚠️ ${check.function} not found`);
        findings.issues.push(`Missing transformation function: ${check.function}`);
      }
    } catch (error) {
      console.log(`❌ Cannot check ${check.file}`);
    }
  });
  
  console.log('');
  
  // 4. Data Flow Integrity Check
  console.log('4️⃣ Data Flow Integrity Assessment');
  console.log('----------------------------------');
  
  // Check if assessment data reaches RAG system
  const integrityChecks = [
    'Assessment form collects structured data',
    'Data is transformed for API consumption',
    'RAG endpoint receives and processes profile data',
    'Marks data is extracted and used for recommendations',
    'Grade-specific processing is implemented'
  ];
  
  let integrityScore = 0;
  
  if (findings.dataCollectionPoints.length >= 5) {
    console.log('✅ Comprehensive data collection');
    integrityScore++;
  }
  
  if (findings.transformationPoints.length >= 2) {
    console.log('✅ Data transformation functions present');
    integrityScore++;
  }
  
  if (findings.apiEndpoints.length >= 3) {
    console.log('✅ Multiple API endpoints for data processing');
    integrityScore++;
  }
  
  if (findings.issues.length === 0) {
    console.log('✅ No critical issues identified');
    integrityScore++;
  } else {
    console.log(`⚠️ ${findings.issues.length} issues identified`);
  }
  
  const integrityPercentage = (integrityScore / 4) * 100;
  console.log(`\n📊 Data Flow Integrity Score: ${integrityPercentage}%`);
  
  return findings;
}

// Run Phase 1 investigation
traceDataFlow().then(findings => {
  console.log('\n📋 PHASE 1 SUMMARY REPORT');
  console.log('=========================');
  
  console.log('\n🔍 Data Collection Points:');
  findings.dataCollectionPoints.forEach(point => console.log(`   - ${point}`));
  
  console.log('\n🔄 Transformation Points:');
  findings.transformationPoints.forEach(point => console.log(`   - ${point}`));
  
  console.log('\n🌐 API Endpoints:');
  findings.apiEndpoints.forEach(endpoint => console.log(`   - ${endpoint}`));
  
  if (findings.issues.length > 0) {
    console.log('\n⚠️ Issues Identified:');
    findings.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n🎯 KEY FINDINGS:');
  
  if (findings.dataCollectionPoints.length >= 5) {
    console.log('✅ COMPREHENSIVE DATA COLLECTION: Assessment form captures detailed student profile');
  } else {
    console.log('⚠️ LIMITED DATA COLLECTION: May not capture sufficient student context');
  }
  
  if (findings.transformationPoints.length >= 2) {
    console.log('✅ DATA TRANSFORMATION: Functions exist to process assessment data');
  } else {
    console.log('❌ MISSING TRANSFORMATIONS: Assessment data may not be properly processed');
  }
  
  if (findings.apiEndpoints.includes('CAG (Career Assessment Generator) integrated')) {
    console.log('✅ CAG INTEGRATION: Career-specific AI is integrated in RAG system');
  } else {
    console.log('❌ NO CAG INTEGRATION: Only base LLM being used, missing career expertise');
  }
  
  console.log('\n🚀 NEXT PHASE: LLM Context Utilization Analysis');
  console.log('Ready to proceed to Phase 2? (Y/n)');
  
  // Save findings for next phase
  fs.writeFileSync('phase1-findings.json', JSON.stringify(findings, null, 2));
  console.log('📁 Findings saved to phase1-findings.json');
  
}).catch(error => {
  console.error('❌ Phase 1 investigation failed:', error.message);
  process.exit(1);
});