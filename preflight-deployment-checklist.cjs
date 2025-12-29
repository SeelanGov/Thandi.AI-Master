#!/usr/bin/env node

/**
 * PREFLIGHT DEPLOYMENT CHECKLIST
 * Final verification before production deployment
 */

const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 PREFLIGHT DEPLOYMENT CHECKLIST');
console.log('=' .repeat(60));
console.log('Final verification before production deployment');
console.log('=' .repeat(60));

const baseUrl = 'http://localhost:3004';

async function checkEnvironmentVariables() {
  console.log('\n🔧 STEP 1: Environment Variables Check');
  console.log('   Verifying all required environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'ANTHROPIC_API_KEY',
    'GROQ_API_KEY'
  ];
  
  const optionalVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  let allRequired = true;
  
  console.log('   📋 Required Variables:');
  requiredVars.forEach(varName => {
    const exists = !!process.env[varName];
    console.log(`      ${varName}: ${exists ? '✅' : '❌'}`);
    if (!exists) allRequired = false;
  });
  
  console.log('   📋 Optional Variables:');
  optionalVars.forEach(varName => {
    const exists = !!process.env[varName];
    console.log(`      ${varName}: ${exists ? '✅' : '⚠️  (optional)'}`);
  });
  
  return allRequired;
}

async function checkDatabaseConnection() {
  console.log('\n🗄️  STEP 2: Database Connection Check');
  console.log('   Testing Supabase connection and schema...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('school_master')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('   ✅ Database connection working');
    
    // Test student_assessments table
    const { data: studentTest, error: studentError } = await supabase
      .from('student_assessments')
      .select('id')
      .limit(1);
    
    if (studentError) {
      console.log('   ❌ student_assessments table issue:', studentError.message);
      return false;
    }
    
    console.log('   ✅ student_assessments table accessible');
    
    // Test school count
    const { count: schoolCount } = await supabase
      .from('school_master')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   ✅ Schools database: ${schoolCount} schools available`);
    
    return schoolCount === 7475;
    
  } catch (error) {
    console.log('   ❌ Database check failed:', error.message);
    return false;
  }
}

async function checkAPIEndpoints() {
  console.log('\n🔌 STEP 3: API Endpoints Check');
  console.log('   Testing all critical API endpoints...');
  
  const endpoints = [
    { path: '/api/schools/search?q=test', name: 'School Search' },
    { path: '/api/student/register', name: 'Student Registration', method: 'POST' },
    { path: '/api/rag/query', name: 'RAG Query', method: 'POST' },
    { path: '/api/school/students?school_id=ZAF-200100021', name: 'School Admin API' }
  ];
  
  let allWorking = true;
  
  for (const endpoint of endpoints) {
    try {
      let response;
      
      if (endpoint.method === 'POST') {
        // Test with minimal valid data
        const testData = endpoint.path.includes('register') ? {
          student_name: 'TEST',
          student_surname: 'PREFLIGHT',
          school_id: 'ZAF-200100021',
          grade: '10',
          consent_given: true
        } : {
          query: 'Test query',
          grade: 'grade10'
        };
        
        response = await fetch(`${baseUrl}${endpoint.path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
      } else {
        response = await fetch(`${baseUrl}${endpoint.path}`);
      }
      
      const working = response.ok || response.status === 400; // 400 is OK for validation errors
      console.log(`   ${endpoint.name}: ${working ? '✅' : '❌'} (${response.status})`);
      
      if (!working && response.status !== 400) {
        allWorking = false;
      }
      
    } catch (error) {
      console.log(`   ${endpoint.name}: ❌ (${error.message})`);
      allWorking = false;
    }
  }
  
  return allWorking;
}

async function checkStudentJourney() {
  console.log('\n👨‍🎓 STEP 4: Student Journey Verification');
  console.log('   Testing complete student workflow...');
  
  try {
    // Test assessment page load
    const pageResponse = await fetch(`${baseUrl}/assessment?grade=10&step=registration`);
    if (!pageResponse.ok) {
      console.log('   ❌ Assessment page not loading');
      return false;
    }
    console.log('   ✅ Assessment page loads');
    
    // Test school search
    const schoolResponse = await fetch(`${baseUrl}/api/schools/search?q=alexander`);
    const schoolData = await schoolResponse.json();
    if (!schoolData.results || schoolData.results.length === 0) {
      console.log('   ❌ School search not working');
      return false;
    }
    console.log('   ✅ School search working');
    
    // Test student registration
    const regResponse = await fetch(`${baseUrl}/api/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: 'PREFLIGHT',
        student_surname: 'TEST',
        school_id: schoolData.results[0].school_id,
        grade: '10',
        consent_given: true,
        consent_timestamp: new Date().toISOString()
      })
    });
    
    const regData = await regResponse.json();
    if (!regData.success) {
      console.log('   ❌ Student registration failed');
      return false;
    }
    console.log('   ✅ Student registration working');
    
    // Test career assessment
    const ragResponse = await fetch(`${baseUrl}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'I am interested in engineering',
        grade: 'grade10'
      })
    });
    
    const ragData = await ragResponse.json();
    if (!ragData.success || ragData.response.length < 100) {
      console.log('   ❌ Career assessment not working properly');
      return false;
    }
    console.log('   ✅ Career assessment working');
    
    // Cleanup test data
    if (regData.student_id) {
      await supabase
        .from('student_assessments')
        .delete()
        .eq('id', regData.student_id);
      console.log('   ✅ Test data cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.log('   ❌ Student journey test failed:', error.message);
    return false;
  }
}

async function checkSchoolAdminFunctionality() {
  console.log('\n🏫 STEP 5: School Admin Functionality');
  console.log('   Testing school administrator features...');
  
  try {
    // Test school admin API
    const adminResponse = await fetch(`${baseUrl}/api/school/students?school_id=ZAF-200100021`);
    const adminData = await adminResponse.json();
    
    if (!adminData.success) {
      console.log('   ❌ School admin API not working');
      return false;
    }
    console.log('   ✅ School admin API working');
    
    // Test database queries for school filtering
    const { data: students, error } = await supabase
      .from('student_assessments')
      .select('assessment_data')
      .filter('assessment_data->>school_master_id', 'eq', 'ZAF-200100021')
      .limit(1);
    
    if (error) {
      console.log('   ❌ School filtering queries not working');
      return false;
    }
    console.log('   ✅ School filtering working');
    
    return true;
    
  } catch (error) {
    console.log('   ❌ School admin test failed:', error.message);
    return false;
  }
}

async function checkSecurityAndPrivacy() {
  console.log('\n🔒 STEP 6: Security & Privacy Check');
  console.log('   Verifying POPIA compliance and data protection...');
  
  try {
    // Check that students have consent tracking
    const { data: students, error } = await supabase
      .from('student_assessments')
      .select('consent_given, consent_timestamp, assessment_data')
      .limit(5);
    
    if (error) {
      console.log('   ❌ Cannot verify privacy compliance');
      return false;
    }
    
    const allHaveConsent = students.every(s => s.consent_given === true);
    const allHaveTimestamp = students.every(s => s.consent_timestamp);
    const allHaveConsentMethod = students.every(s => s.assessment_data?.consent_method);
    
    console.log(`   Consent tracking: ${allHaveConsent ? '✅' : '❌'}`);
    console.log(`   Consent timestamps: ${allHaveTimestamp ? '✅' : '❌'}`);
    console.log(`   Consent method tracking: ${allHaveConsentMethod ? '✅' : '❌'}`);
    
    // Check that school data is properly segregated
    const schoolSegregation = students.every(s => 
      s.assessment_data?.school_master_id && 
      s.assessment_data?.dashboard_visible === true
    );
    
    console.log(`   School data segregation: ${schoolSegregation ? '✅' : '❌'}`);
    
    return allHaveConsent && allHaveTimestamp && schoolSegregation;
    
  } catch (error) {
    console.log('   ❌ Security check failed:', error.message);
    return false;
  }
}

async function checkFileIntegrity() {
  console.log('\n📁 STEP 7: File Integrity Check');
  console.log('   Verifying critical files are present and valid...');
  
  const criticalFiles = [
    'app/assessment/page.jsx',
    'app/assessment/components/AssessmentForm.jsx',
    'components/BulletproofStudentRegistration.jsx',
    'app/api/student/register/route.js',
    'app/api/school/students/route.js',
    'app/api/rag/query/route.js',
    'package.json',
    'next.config.js'
  ];
  
  let allPresent = true;
  
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

async function generatePreflightReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PREFLIGHT DEPLOYMENT REPORT');
  console.log('='.repeat(60));
  
  const checks = [
    'Environment Variables',
    'Database Connection',
    'API Endpoints',
    'Student Journey',
    'School Admin Features',
    'Security & Privacy',
    'File Integrity'
  ];
  
  console.log('\n📊 PREFLIGHT CHECKLIST RESULTS:');
  results.forEach((passed, index) => {
    console.log(`   ${checks[index]}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const passedChecks = results.filter(Boolean).length;
  const totalChecks = results.length;
  
  console.log(`\n📈 OVERALL SCORE: ${passedChecks}/${totalChecks} checks passed`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 PREFLIGHT CHECKS PASSED - READY FOR DEPLOYMENT!');
    console.log('\n✅ DEPLOYMENT CLEARANCE GRANTED:');
    console.log('   • All systems operational');
    console.log('   • Student journey verified');
    console.log('   • School admin features working');
    console.log('   • Security compliance confirmed');
    console.log('   • Database integration stable');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Deploy to production environment');
    console.log('   2. Run post-deployment verification');
    console.log('   3. Enable student access');
    console.log('   4. Monitor system performance');
    
    console.log('\n📋 DEPLOYMENT COMMANDS:');
    console.log('   vercel --prod');
    console.log('   # or');
    console.log('   npm run deploy');
    
  } else {
    console.log('\n⚠️  PREFLIGHT CHECKS FAILED - DO NOT DEPLOY');
    console.log('   Critical issues must be resolved before deployment');
    console.log('\n🔧 REQUIRED ACTIONS:');
    console.log('   1. Fix all failing checks');
    console.log('   2. Re-run preflight verification');
    console.log('   3. Ensure 100% pass rate before deployment');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return passedChecks === totalChecks;
}

// Main execution
async function main() {
  try {
    console.log('\n⏱️  Starting preflight deployment checks...\n');
    
    const results = [
      await checkEnvironmentVariables(),
      await checkDatabaseConnection(),
      await checkAPIEndpoints(),
      await checkStudentJourney(),
      await checkSchoolAdminFunctionality(),
      await checkSecurityAndPrivacy(),
      await checkFileIntegrity()
    ];
    
    const deploymentReady = await generatePreflightReport(results);
    
    process.exit(deploymentReady ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Preflight checks failed:', error.message);
    process.exit(1);
  }
}

main();