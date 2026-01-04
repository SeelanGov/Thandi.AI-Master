#!/usr/bin/env node

/**
 * Debug Registration API Issues
 */

console.log('🔍 Debugging Registration API...\n');

async function debugRegistrationAPI() {
  try {
    console.log('📡 Testing Registration API endpoint...');
    
    const testData = {
      firstName: "Test",
      lastName: "Student", 
      email: "test@example.com",
      grade: "GRADE 11",
      schoolId: "ZAF-200100005", // Valid school ID
      curriculum: "CAPS"
    };
    
    console.log('📝 Test data:', testData);
    
    const response = await fetch('http://localhost:3000/api/student/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response ok: ${response.ok}`);
    
    const responseText = await response.text();
    console.log('📄 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Registration API is working correctly');
      return true;
    } else if (response.status === 409) {
      console.log('✅ Registration API working (409 = user already exists)');
      return true;
    } else if (response.status === 400) {
      console.log('⚠️ Registration API returned 400 - checking error details...');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error:', responseText);
      }
      return false;
    } else {
      console.log('❌ Registration API failed with unexpected status');
      return false;
    }
    
  } catch (error) {
    console.log('💥 Registration API test failed:', error.message);
    return false;
  }
}

debugRegistrationAPI().then(success => {
  if (success) {
    console.log('\n✅ Registration API debugging complete - API is working');
  } else {
    console.log('\n❌ Registration API has issues that need fixing');
  }
}).catch(error => {
  console.error('💥 Debug execution failed:', error);
});