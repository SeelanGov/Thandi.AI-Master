#!/usr/bin/env node

const https = require('https');

async function diagnoseRegisteredVsAnonymous() {
  console.log('🔍 DIAGNOSING: Registered vs Anonymous Flow');
  console.log('===========================================\n');
  
  console.log('🎯 KEY INSIGHT: Anonymous works, Registered loops back');
  console.log('This means the issue is specifically in the registered user flow\n');
  
  console.log('📋 Step 1: Test anonymous flow URL...');
  
  try {
    // Test anonymous flow
    const anonymousResult = await makeRequest('https://www.thandi.online/assessment/grade/12?anonymous=true');
    
    if (anonymousResult.status === 200) {
      console.log('✅ Anonymous URL loads successfully');
      
      const anonymousHtml = anonymousResult.data;
      
      // Check what's in anonymous page
      const hasAssessmentForm = anonymousHtml.includes('subject') || 
                               anonymousHtml.includes('assessment') ||
                               anonymousHtml.includes('InterestAreas') ||
                               anonymousHtml.includes('SubjectSelection');
      
      const hasRegistrationForm = anonymousHtml.includes('Continue with Registration') ||
                                 anonymousHtml.includes('BulletproofStudentRegistration');
      
      console.log(`Anonymous - Assessment form: ${hasAssessmentForm ? '✅ PRESENT' : '❌ MISSING'}`);
      console.log(`Anonymous - Registration form: ${hasRegistrationForm ? '❌ PRESENT (BAD)' : '✅ ABSENT (GOOD)'}`);
      
    } else {
      console.log(`❌ Anonymous URL failed: ${anonymousResult.status}`);
    }
    
    console.log('\n📋 Step 2: Test registered flow URL...');
    
    // Test registered flow
    const registeredResult = await makeRequest('https://www.thandi.online/assessment/grade/12?registered=true');
    
    if (registeredResult.status === 200) {
      console.log('✅ Registered URL loads successfully');
      
      const registeredHtml = registeredResult.data;
      
      // Check what's in registered page
      const hasAssessmentForm = registeredHtml.includes('subject') || 
                               registeredHtml.includes('assessment') ||
                               registeredHtml.includes('InterestAreas') ||
                               registeredHtml.includes('SubjectSelection');
      
      const hasRegistrationForm = registeredHtml.includes('Continue with Registration') ||
                                 registeredHtml.includes('BulletproofStudentRegistration');
      
      console.log(`Registered - Assessment form: ${hasAssessmentForm ? '✅ PRESENT' : '❌ MISSING'}`);
      console.log(`Registered - Registration form: ${hasRegistrationForm ? '❌ PRESENT (BAD)' : '✅ ABSENT (GOOD)'}`);
      
      // Check for specific issues
      const hasGradeSelector = registeredHtml.includes('GradeSelector') ||
                              registeredHtml.includes('Select your grade');
      
      const hasCurrentStep = registeredHtml.includes('currentStep') ||
                            registeredHtml.includes('step');
      
      console.log(`Registered - Grade selector: ${hasGradeSelector ? '❌ PRESENT (WRONG)' : '✅ ABSENT'}`);
      console.log(`Registered - Step indicators: ${hasCurrentStep ? '✅ PRESENT' : '❌ MISSING'}`);
      
    } else {
      console.log(`❌ Registered URL failed: ${registeredResult.status}`);
    }
    
    console.log('\n📋 Step 3: Compare URL parameters handling...');
    
    // Test base assessment page
    const baseResult = await makeRequest('https://www.thandi.online/assessment');
    
    if (baseResult.status === 200) {
      console.log('✅ Base assessment page loads');
      
      const baseHtml = baseResult.data;
      const hasRegistrationForm = baseHtml.includes('Continue with Registration');
      
      console.log(`Base page - Registration form: ${hasRegistrationForm ? '✅ PRESENT (CORRECT)' : '❌ MISSING'}`);
    }
    
    console.log('\n🔍 ANALYSIS:');
    console.log('============');
    console.log('If anonymous works but registered doesn\'t, the issue is likely:');
    console.log('1. ✅ Anonymous flow: initialStep gets set correctly');
    console.log('2. ❌ Registered flow: initialStep not being processed correctly');
    console.log('3. ❌ Registered flow: Some validation failing');
    console.log('4. ❌ Registered flow: Token/authentication check failing');
    
    console.log('\n🎯 LIKELY ROOT CAUSE:');
    console.log('=====================');
    console.log('The AssessmentForm is probably checking for:');
    console.log('- Valid student token');
    console.log('- Proper authentication state');
    console.log('- Student info validation');
    console.log('');
    console.log('When these checks fail, it defaults back to registration step');
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('==============');
    console.log('1. Check token validation logic in AssessmentForm');
    console.log('2. Look for authentication checks that might fail');
    console.log('3. Verify studentInfo state is properly set for registered users');
    console.log('4. Check if there\'s a useEffect that overrides the initial state');
    
  } catch (error) {
    console.log(`❌ Diagnosis failed: ${error.message}`);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    }).on('error', reject);
  });
}

diagnoseRegisteredVsAnonymous();