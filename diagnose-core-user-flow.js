// Diagnose Core User Flow Issues
console.log('🔍 DIAGNOSING CORE USER FLOW ISSUES');
console.log('='.repeat(50));

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testActualUserFlow() {
  console.log('\n1. Testing Assessment Page Load...');
  
  try {
    const response = await fetch(`${BASE_URL}/assessment/grade/10`);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('   ✅ Assessment page loads');
    } else {
      console.log('   ❌ Assessment page failed');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Assessment page error: ${error.message}`);
    return;
  }
  
  console.log('\n2. Testing Registration API...');
  
  try {
    const regResponse = await fetch(`${BASE_URL}/api/student/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_name: 'Test',
        student_surname: 'Student',
        grade: 10,
        school_id: 'ZAF-200100005', // Use valid school ID from database
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        consent_version: '1.0'
      })
    });
    
    console.log(`   Status: ${regResponse.status}`);
    
    if (regResponse.ok) {
      const regData = await regResponse.json();
      console.log('   ✅ Registration works');
      console.log(`   Session ID: ${regData.sessionId}`);
      return regData.sessionId;
    } else {
      const errorData = await regResponse.json();
      console.log('   ❌ Registration failed');
      console.log(`   Error: ${errorData.error}`);
      console.log(`   Details: ${JSON.stringify(errorData, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Registration error: ${error.message}`);
  }
  
  console.log('\n3. Testing RAG API...');
  
  try {
    const ragResponse = await fetch(`${BASE_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'I am a Grade 10 student interested in engineering',
        grade: 'grade10',
        curriculum: 'caps'
      })
    });
    
    console.log(`   Status: ${ragResponse.status}`);
    
    if (ragResponse.ok) {
      const ragData = await ragResponse.json();
      console.log('   ✅ RAG API works');
      console.log(`   Response length: ${ragData.response?.length || 0} chars`);
    } else {
      console.log('   ❌ RAG API failed');
    }
  } catch (error) {
    console.log(`   ❌ RAG API error: ${error.message}`);
  }
}

async function checkDatabaseConnection() {
  console.log('\n4. Testing Database Connection...');
  
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Database connection healthy');
      console.log(`   Status: ${healthData.status}`);
    } else {
      console.log('   ❌ Database connection issues');
    }
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`);
  }
}

async function main() {
  console.log('\n🎯 FOCUS: Fix the core user experience');
  console.log('Stop celebrating partial wins - make it actually work for students\n');
  
  await testActualUserFlow();
  await checkDatabaseConnection();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 NEXT STEPS:');
  console.log('1. Fix registration API issues');
  console.log('2. Test complete user flow end-to-end');
  console.log('3. Only celebrate when students can actually use the system');
  console.log('='.repeat(50));
}

main().catch(console.error);