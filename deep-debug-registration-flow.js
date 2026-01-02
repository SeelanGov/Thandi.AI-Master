#!/usr/bin/env node

const https = require('https');

async function deepDebugRegistrationFlow() {
  console.log('🔍 DEEP DEBUG: Registration Flow Analysis');
  console.log('=========================================\n');
  
  console.log('🎯 SYSTEMATIC APPROACH:');
  console.log('1. Test registration API directly');
  console.log('2. Check what URL the registration actually redirects to');
  console.log('3. Test that specific URL manually');
  console.log('4. Identify where the loop back occurs');
  
  try {
    console.log('\n📋 Step 1: Test registration API...');
    
    // Get a real school first
    const schoolResult = await makeRequest('https://www.thandi.online/api/schools/search?q=high&limit=1');
    
    if (schoolResult.status === 200) {
      const schoolData = JSON.parse(schoolResult.data);
      
      if (schoolData.results && schoolData.results.length > 0) {
        const school = schoolData.results[0];
        console.log(`Using school: ${school.name} (ID: ${school.school_id})`);
        
        // Test registration
        const registrationData = {
          student_name: 'Debug',
          student_surname: 'Test',
          school_id: school.school_id,
          grade: '12',
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          consent_version: 'v1.0'
        };
        
        const regResult = await makePostRequest(
          'https://www.thandi.online/api/student/register',
          registrationData
        );
        
        console.log(`Registration API: ${regResult.status}`);
        
        if (regResult.status === 200) {
          const regData = JSON.parse(regResult.data);
          console.log('✅ Registration successful');
          console.log(`Student ID: ${regData.student_id}`);
          console.log(`Token created: ${regData.token ? 'Yes' : 'No'}`);
          
          console.log('\n📋 Step 2: Test the redirect URL manually...');
          
          // Test the exact URL that registration should redirect to
          const redirectUrl = 'https://www.thandi.online/assessment/grade/12?registered=true';
          console.log(`Testing: ${redirectUrl}`);
          
          const redirectResult = await makeRequest(redirectUrl);
          
          if (redirectResult.status === 200) {
            console.log('✅ Redirect URL loads successfully');
            
            const html = redirectResult.data;
            
            // Detailed analysis of what's in the page
            console.log('\n🔍 PAGE CONTENT ANALYSIS:');
            
            // Check for registration form
            const hasRegistrationForm = html.includes('Continue with Registration') ||
                                       html.includes('BulletproofStudentRegistration') ||
                                       html.includes('student registration');
            
            // Check for assessment content
            const hasSubjectSelection = html.includes('SubjectSelection') ||
                                       html.includes('subject selection') ||
                                       html.includes('curriculum');
            
            const hasCurriculumProfile = html.includes('CurriculumProfile') ||
                                        html.includes('curriculum profile');
            
            const hasAssessmentSteps = html.includes('ProgressBar') ||
                                      html.includes('step') ||
                                      html.includes('assessment');
            
            // Check for grade selector (should NOT be present)
            const hasGradeSelector = html.includes('GradeSelector') ||
                                    html.includes('Select your grade') ||
                                    html.includes('grade selection');
            
            console.log(`Registration form present: ${hasRegistrationForm ? '❌ BAD' : '✅ GOOD'}`);
            console.log(`Subject selection present: ${hasSubjectSelection ? '✅ GOOD' : '❌ BAD'}`);
            console.log(`Curriculum profile present: ${hasCurriculumProfile ? '✅ GOOD' : '❌ BAD'}`);
            console.log(`Assessment steps present: ${hasAssessmentSteps ? '✅ GOOD' : '❌ BAD'}`);
            console.log(`Grade selector present: ${hasGradeSelector ? '❌ BAD' : '✅ GOOD'}`);
            
            // Check for JavaScript that might cause redirects
            const hasWindowLocation = html.includes('window.location') ||
                                     html.includes('location.href');
            
            const hasRedirectScript = html.includes('redirect') ||
                                     html.includes('window.location.href = "/assessment"');
            
            console.log(`Window.location redirects: ${hasWindowLocation ? '⚠️  DETECTED' : '✅ NONE'}`);
            console.log(`Redirect scripts: ${hasRedirectScript ? '⚠️  DETECTED' : '✅ NONE'}`);
            
            // Check for React hydration issues
            const hasHydrationWarning = html.includes('hydration') ||
                                       html.includes('mismatch') ||
                                       html.includes('suppressHydrationWarning');
            
            console.log(`Hydration issues: ${hasHydrationWarning ? '⚠️  DETECTED' : '✅ NONE'}`);
            
            // Look for specific debug logs we added
            const hasDebugLogs = html.includes('Skipping localStorage') ||
                                html.includes('URL Parameters processed') ||
                                html.includes('currentStep');
            
            console.log(`Debug logs present: ${hasDebugLogs ? '✅ PRESENT' : '❌ MISSING'}`);
            
          } else {
            console.log(`❌ Redirect URL failed: ${redirectResult.status}`);
          }
          
        } else {
          console.log(`❌ Registration failed: ${regResult.data}`);
        }
      }
    }
    
    console.log('\n🎯 ANALYSIS:');
    console.log('============');
    console.log('If the redirect URL shows registration form instead of assessment:');
    console.log('1. The component is defaulting to registration step');
    console.log('2. Our fixes are not taking effect');
    console.log('3. There might be another condition overriding our logic');
    
    console.log('\n🔧 NEXT INVESTIGATION:');
    console.log('======================');
    console.log('We need to check:');
    console.log('1. Is the grade parameter being passed correctly?');
    console.log('2. Is the registered parameter being recognized?');
    console.log('3. Are there other conditions in the component logic?');
    console.log('4. Is there client-side JavaScript causing the redirect?');
    
  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`);
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

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData
        });
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

deepDebugRegistrationFlow();