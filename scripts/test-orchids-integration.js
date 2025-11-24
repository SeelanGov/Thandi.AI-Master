// Test script for Orchids integration
// Run this to verify the backend is working correctly

const BACKEND_URL = 'https://thandiai.vercel.app';

console.log('🧪 Testing Orchids Integration with Thandi Backend');
console.log('='.repeat(60));

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n📋 Test 1: Health Check...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/assess`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ PASSED - Backend is healthy');
      console.log(`   Status: ${data.status}`);
      console.log(`   Endpoint: ${data.endpoint}`);
      return true;
    } else {
      console.log('❌ FAILED - Unexpected response');
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED - Connection error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 2: Submit Assessment
async function testAssessment() {
  console.log('\n📝 Test 2: Submit Assessment...');
  
  const testData = {
    answers: [
      'I am good at Math and Science',
      'I enjoy technology and problem-solving',
      'I have limited budget but willing to work hard',
      'I want a career with good job prospects in South Africa'
    ]
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      console.log(`❌ FAILED - HTTP ${response.status}`);
      const errorText = await response.text();
      console.log(`   Error: ${errorText.substring(0, 200)}`);
      return false;
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.careers || !Array.isArray(data.careers)) {
      console.log('❌ FAILED - Invalid response structure');
      console.log('   Missing careers array');
      return false;
    }
    
    if (!data.sessionId) {
      console.log('❌ FAILED - Invalid response structure');
      console.log('   Missing sessionId');
      return false;
    }
    
    console.log('✅ PASSED - Assessment submitted successfully');
    console.log(`   Careers returned: ${data.careers.length}`);
    console.log(`   Session ID: ${data.sessionId}`);
    
    // Display top career
    if (data.careers.length > 0) {
      const topCareer = data.careers[0];
      console.log(`\n   Top Career: ${topCareer.name} (${topCareer.match}% match)`);
      console.log(`   Description: ${topCareer.description.substring(0, 100)}...`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ FAILED - Request error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 3: Invalid Data Handling
async function testErrorHandling() {
  console.log('\n🐛 Test 3: Error Handling...');
  
  const invalidData = {
    answers: ['only', 'three', 'answers'] // Should be 4
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    if (response.status === 400) {
      console.log('✅ PASSED - Correctly rejects invalid data');
      const data = await response.json();
      console.log(`   Error message: ${data.error}`);
      return true;
    } else {
      console.log('⚠️  WARNING - Should return 400 for invalid data');
      console.log(`   Got status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED - Request error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 4: Response Time
async function testResponseTime() {
  console.log('\n⏱️  Test 4: Response Time...');
  
  const testData = {
    answers: [
      'Math and Science',
      'Technology',
      'Limited budget',
      'Good prospects'
    ]
  };
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}/api/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      await response.json();
      console.log('✅ PASSED - Response received');
      console.log(`   Response time: ${responseTime}ms`);
      
      if (responseTime < 5000) {
        console.log('   ⚡ Fast response (< 5s)');
      } else if (responseTime < 10000) {
        console.log('   ✅ Acceptable response (< 10s)');
      } else {
        console.log('   ⚠️  Slow response (> 10s)');
      }
      
      return true;
    } else {
      console.log('❌ FAILED - Request failed');
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED - Request error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`\nBackend URL: ${BACKEND_URL}`);
  console.log('Starting tests...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    assessment: await testAssessment(),
    errorHandling: await testErrorHandling(),
    responseTime: await testResponseTime()
  };
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`\nTests Passed: ${passed}/${total}`);
  console.log('\nDetailed Results:');
  console.log(`  Health Check:     ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Assessment:       ${results.assessment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Error Handling:   ${results.errorHandling ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Response Time:    ${results.responseTime ? '✅ PASS' : '❌ FAIL'}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Backend is ready for Orchids integration.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
