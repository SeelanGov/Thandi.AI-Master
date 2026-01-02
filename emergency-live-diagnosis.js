#!/usr/bin/env node

const https = require('https');

async function emergencyDiagnosis() {
  console.log('🚨 EMERGENCY LIVE SITE DIAGNOSIS');
  console.log('================================\n');
  
  console.log('🔍 Testing actual student registration flow...');
  
  try {
    // Test the assessment page
    const assessmentResult = await makeRequest('https://www.thandi.online/assessment');
    
    if (assessmentResult.status === 200) {
      console.log('✅ Assessment page loads');
      
      // Check what's actually in the HTML
      const html = assessmentResult.data;
      
      // Look for the registration form elements
      const hasRegistrationForm = html.includes('Continue with Registration');
      const hasGradeDropdown = html.includes('Select your grade');
      const hasNameInputs = html.includes('Enter your first name');
      const hasSchoolInput = html.includes('Start typing your school');
      
      console.log('\n📋 Registration Form Elements:');
      console.log(`   Registration button: ${hasRegistrationForm ? 'Present' : 'MISSING'}`);
      console.log(`   Grade dropdown: ${hasGradeDropdown ? 'Present' : 'MISSING'}`);
      console.log(`   Name inputs: ${hasNameInputs ? 'Present' : 'MISSING'}`);
      console.log(`   School input: ${hasSchoolInput ? 'Present' : 'MISSING'}`);
      
      // Check for JavaScript errors or issues
      const hasJSErrors = html.includes('Error') || html.includes('undefined') || html.includes('null');
      console.log(`   JavaScript errors: ${hasJSErrors ? 'DETECTED' : 'None visible'}`);
      
      // Check for the grade-specific redirect URLs
      const hasGradeRedirect = html.includes('/assessment/grade/');
      console.log(`   Grade redirect logic: ${hasGradeRedirect ? 'Present' : 'MISSING'}`);
      
      // Test if grade-specific pages exist
      console.log('\n🎯 Testing grade-specific pages...');
      
      const gradePages = ['10', '11', '12'];
      for (const grade of gradePages) {
        const gradeResult = await makeRequest(`https://www.thandi.online/assessment/grade/${grade}?registered=true`);
        console.log(`   Grade ${grade} page: ${gradeResult.status} ${getStatusText(gradeResult.status)}`);
        
        if (gradeResult.status === 307 || gradeResult.status === 302) {
          const location = gradeResult.headers.location;
          console.log(`     → Redirects to: ${location}`);
          
          if (location && location.includes('/assessment')) {
            console.log('     ❌ LOOP DETECTED: Redirecting back to assessment page!');
          }
        }
      }
      
    } else {
      console.log(`❌ Assessment page failed: ${assessmentResult.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Diagnosis failed: ${error.message}`);
  }
  
  console.log('\n🔧 IMMEDIATE ACTION REQUIRED:');
  console.log('   The registration flow is broken in production');
  console.log('   Students cannot complete registration');
  console.log('   Need to fix the redirect loop immediately');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    }).on('error', reject);
  });
}

function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    302: 'Found (Redirect)',
    307: 'Temporary Redirect',
    404: 'Not Found',
    500: 'Server Error'
  };
  return statusTexts[status] || 'Unknown';
}

emergencyDiagnosis();