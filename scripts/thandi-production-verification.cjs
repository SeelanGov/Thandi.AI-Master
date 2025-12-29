#!/usr/bin/env node

/**
 * THANDI Production Verification
 * Comprehensive testing to ensure 100% readiness for live students
 */

const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🎯 THANDI PRODUCTION VERIFICATION');
console.log('=' .repeat(60));
console.log('Testing ALL critical paths for live student deployment');
console.log('=' .repeat(60));

const baseUrl = 'http://localhost:3004';

async function verifyUrlParameterHandling() {
  console.log('\n📋 CRITICAL TEST 1: URL Parameter Handling');
  console.log('   Testing: /assessment?grade=10&step=registration');
  
  try {
    const response = await fetch(`${baseUrl}/assessment?grade=10&step=registration`);
    const html = await response.text();
    
    const checks = {
      'Page loads successfully': response.ok,
      'Privacy notice displays': html.includes('Welcome to THANDI Career Assessment'),
      'POPIA compliance visible': html.includes('POPIA'),
      'Consent checkbox present': html.includes('type="checkbox"'),
      'Registration button present': html.includes('Continue with Registration'),
      'Anonymous option available': html.includes('Continue Anonymously'),
      'No grade selector shown': !html.includes('What grade are you in')
    };
    
    console.log('   Results:');
    let allPassed = true;
    Object.entries(checks).forEach(([test, passed]) => {
      console.log(`      ${test}: ${passed ? '✅' : '❌'}`);
      if (!passed) allPassed = false;
    });
    
    return allPassed;
    
  } catch (error) {
    console.log('   ❌ URL parameter test failed:', error.message);
    return false;
  }
}

async function verifySchoolSearch() {
  console.log('\n📋 CRITICAL TEST 2: School Search System');
  console.log('   Testing: 7,475 schools database');
  
  try {
    // Test school search API
    const searchResponse = await fetch(`${baseUrl}/api/schools/search?q=high`);
    const searchData = await searchResponse.json();
    
    // Test database directly
    const { count: schoolCount } = await supabase
      .from('school_master')
      .select('*', { count: 'exact', head: true });
    
    const checks = {
      'School search API works': searchResponse.ok,
      'Returns school results': searchData.results && searchData.results.length > 0,
      'Database has 7,475 schools': schoolCount === 7475,
      'Schools have correct format': searchData.results?.[0]?.school_id?.startsWith('ZAF-'),
      'School names are present': searchData.results?.[0]?.name?.length > 0
    };
    
    console.log('   Results:');
    let allPassed = true;
    Object.entries(checks).forEach(([test, passed]) => {
      console.log(`      ${test}: ${passed ? '✅' : '❌'}`);
      if (!passed) allPassed = false;
    });
    
    if (searchData.results?.[0]) {
      console.log(`   Sample school: ${searchData.results[0].name} (${searchData.results[0].school_id})`);
    }
    
    return allPassed;
    
  } catch (error) {
    console.log('   ❌ School search test failed:', error.message);
    return false;
  }
}

async function verifyStudentRegistration() {
  console.log('\n📋 CRITICAL TEST 3: Student Registration');
  console.log('   Testing: Complete registration flow with real data');
  
  try {
    // Get a real school
    const schoolResponse = await fetch(`${baseUrl}/api/schools/search?q=high&limit=1`);
    const schoolData = await schoolResponse.json();
    
    if (!schoolData.results?.[0]) {
      console.log('   ❌ Cannot get real school for testing');
      return false;
    }
    
    const testSchool = schoolData.results[0];
    
    // Test registration with real school
    const registrationData = {
      student_name: 'THANDI',
      student_surname: 'VERIFICATION',
      school_id: testSchool.school_id,
      grade: '10',
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: 'v1.0'
    };
    
    const regResponse = await fetch(`${baseUrl}/api/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    
    const regData = await regResponse.json();
    
    const checks = {
      'Registration API responds': regResponse.ok,
      'Returns success status': regData.success === true,
      'Provides student ID': regData.student_id && regData.student_id.length > 0,
      'Provides JWT token': regData.token && regData.token.length > 0,
      'Includes school info': regData.school_info && regData.school_info.name,
      'School name matches': regData.school_info?.name === testSchool.name
    };
    
    console.log('   Results:');
    let allPassed = true;
    Object.entries(checks).forEach(([test, passed]) => {
      console.log(`      ${test}: ${passed ? '✅' : '❌'}`);
      if (!passed) allPassed = false;
    });
    
    if (regData.student_id) {
      console.log(`   Student ID created: ${regData.student_id}`);
      console.log(`   School: ${regData.school_info?.name}`);
      
      // Verify data was stored correctly
      const { data: storedStudent, error } = await supabase
        .from('student_assessments')
        .select('*')
        .eq('id', regData.student_id)
        .single();
      
      if (storedStudent) {
        console.log('   ✅ Student data stored in database');
        console.log(`   School stored in JSON: ${storedStudent.assessment_data?.school_name}`);
        
        // Clean up test record
        await supabase
          .from('student_assessments')
          .delete()
          .eq('id', regData.student_id);
        console.log('   🧹 Test record cleaned up');
      } else {
        console.log('   ❌ Student data not found in database');
        allPassed = false;
      }
    }
    
    return allPassed;
    
  } catch (error) {
    console.log('   ❌ Registration test failed:', error.message);
    return false;
  }
}

async function verifyAssessmentEngine() {
  console.log('\n📋 CRITICAL TEST 4: Career Assessment Engine');
  console.log('   Testing: AI career guidance generation');
  
  try {
    const assessmentData = {
      query: 'I am a Grade 10 student interested in engineering. I enjoy Mathematics and Physical Sciences and want to become a software engineer.',
      grade: 'grade10',
      curriculum: 'caps',
      profile: {
        grade: 10,
        marks: { mathematics: 75, physical_sciences: 80 }
      }
    };
    
    const ragResponse = await fetch(`${baseUrl}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    
    const ragData = await ragResponse.json();
    
    const checks = {
      'RAG API responds': ragResponse.ok,
      'Returns success status': ragData.success === true,
      'Provides career guidance': ragData.response && ragData.response.length > 100,
      'Response is substantial': ragData.response && ragData.response.length > 1000,
      'Contains career recommendations': ragData.response && ragData.response.toLowerCase().includes('career'),
      'Contains university guidance': ragData.response && (ragData.response.toLowerCase().includes('university') || ragData.response.toLowerCase().includes('qualification')),
      'Contains verification footer': ragData.response && ragData.response.includes('⚠️')
    };
    
    console.log('   Results:');
    let allPassed = true;
    Object.entries(checks).forEach(([test, passed]) => {
      console.log(`      ${test}: ${passed ? '✅' : '❌'}`);
      if (!passed) allPassed = false;
    });
    
    if (ragData.response) {
      console.log(`   Response length: ${ragData.response.length} characters`);
      console.log(`   Processing time: ${ragData.metadata?.processingTime || 'N/A'}`);
    }
    
    return allPassed;
    
  } catch (error) {
    console.log('   ❌ Assessment engine test failed:', error.message);
    return false;
  }
}

async function verifyDashboardIntegration() {
  console.log('\n📋 CRITICAL TEST 5: School Dashboard Integration');
  console.log('   Testing: Student data visibility for schools');
  
  try {
    // Check if student data is properly structured for dashboard
    const { data: recentStudents, error } = await supabase
      .from('student_assessments')
      .select('id, student_name, student_surname, grade, assessment_data, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const checks = {
      'Can query student data': !error,
      'Students have names': recentStudents && recentStudents.length > 0 && recentStudents[0].student_name,
      'School info in JSON': recentStudents && recentStudents[0]?.assessment_data?.school_name,
      'Dashboard visibility flag': recentStudents && recentStudents[0]?.assessment_data?.dashboard_visible === true,
      'POPIA compliance maintained': recentStudents && recentStudents.every(s => s.assessment_data?.consent_method)
    };
    
    console.log('   Results:');
    let allPassed = true;
    Object.entries(checks).forEach(([test, passed]) => {
      console.log(`      ${test}: ${passed ? '✅' : '❌'}`);
      if (!passed) allPassed = false;
    });
    
    if (recentStudents && recentStudents.length > 0) {
      console.log(`   Recent registrations: ${recentStudents.length}`);
      console.log(`   Sample: ${recentStudents[0].student_name} from ${recentStudents[0].assessment_data?.school_name}`);
    }
    
    return allPassed;
    
  } catch (error) {
    console.log('   ❌ Dashboard integration test failed:', error.message);
    return false;
  }
}

async function generateFinalReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 THANDI PRODUCTION READINESS REPORT');
  console.log('='.repeat(60));
  
  const testNames = [
    'URL Parameter Handling',
    'School Search System', 
    'Student Registration',
    'Career Assessment Engine',
    'Dashboard Integration'
  ];
  
  console.log('\n📊 TEST RESULTS:');
  results.forEach((passed, index) => {
    console.log(`   ${testNames[index]}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;
  
  console.log(`\n📈 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 THANDI IS PRODUCTION READY!');
    console.log('   ✅ All critical systems operational');
    console.log('   ✅ Student journey fully functional');
    console.log('   ✅ Data integrity maintained');
    console.log('   ✅ POPIA compliance verified');
    console.log('   ✅ School integration working');
    console.log('\n🚀 READY FOR LIVE STUDENT DEPLOYMENT');
  } else {
    console.log('\n⚠️  THANDI NOT READY FOR PRODUCTION');
    console.log('   Critical systems have failures');
    console.log('   DO NOT deploy to live students');
    console.log('\n🔧 ISSUES MUST BE RESOLVED BEFORE DEPLOYMENT');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return passedTests === totalTests;
}

// Main execution
async function main() {
  try {
    console.log('\n⏱️  Starting comprehensive verification...\n');
    
    const results = [
      await verifyUrlParameterHandling(),
      await verifySchoolSearch(),
      await verifyStudentRegistration(),
      await verifyAssessmentEngine(),
      await verifyDashboardIntegration()
    ];
    
    const isReady = await generateFinalReport(results);
    
    process.exit(isReady ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

main();