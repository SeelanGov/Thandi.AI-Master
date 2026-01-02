#!/usr/bin/env node

const https = require('https');

async function checkCSSDeployment() {
  console.log('🎨 CHECKING CSS DEPLOYMENT ISSUE');
  console.log('================================\n');
  
  try {
    // Get the assessment page HTML
    const result = await makeRequest('https://www.thandi.online/assessment');
    
    if (result.status === 200) {
      const html = result.data;
      
      console.log('🔍 Checking for CSS issues...');
      
      // Check if our CSS classes are referenced
      const hasAssessmentClasses = html.includes('assessment-container') || 
                                  html.includes('assessment-card') ||
                                  html.includes('btn-assessment-primary');
      
      console.log(`   Assessment CSS classes in HTML: ${hasAssessmentClasses ? 'Present' : 'MISSING'}`);
      
      // Check if CSS file is loading
      const hasCSSLink = html.includes('/_next/static/css/') || html.includes('globals.css');
      console.log(`   CSS file references: ${hasCSSLink ? 'Present' : 'MISSING'}`);
      
      // Check for hydration errors
      const hasHydrationError = html.includes('hydration') || html.includes('mismatch');
      console.log(`   Hydration errors: ${hasHydrationError ? 'DETECTED' : 'None'}`);
      
      // Check if the component is rendering at all
      const hasRegistrationComponent = html.includes('BulletproofStudentRegistration') ||
                                      html.includes('Welcome to Thandi Career Assessment');
      console.log(`   Registration component: ${hasRegistrationComponent ? 'Present' : 'MISSING'}`);
      
      // Look for React errors
      const hasReactError = html.includes('React') && (html.includes('Error') || html.includes('Failed'));
      console.log(`   React errors: ${hasReactError ? 'DETECTED' : 'None visible'}`);
      
      // Check what's actually rendering
      console.log('\n📄 What\'s actually on the page:');
      
      if (html.includes('Welcome to Thandi Career Assessment')) {
        console.log('   ✅ Privacy step is rendering');
      } else {
        console.log('   ❌ Privacy step not rendering');
      }
      
      if (html.includes('Continue with Registration')) {
        console.log('   ✅ Registration button present');
      } else {
        console.log('   ❌ Registration button missing');
      }
      
      // Check for any obvious errors in the HTML
      const errorPatterns = [
        'SyntaxError',
        'ReferenceError', 
        'TypeError',
        'Cannot read property',
        'undefined is not a function',
        'Failed to compile'
      ];
      
      console.log('\n🚨 Error Detection:');
      errorPatterns.forEach(pattern => {
        if (html.includes(pattern)) {
          console.log(`   ❌ Found: ${pattern}`);
        }
      });
      
      // Extract any visible error messages
      const errorMatch = html.match(/<div[^>]*error[^>]*>(.*?)<\/div>/gi);
      if (errorMatch) {
        console.log('\n🔍 Visible errors:');
        errorMatch.forEach(error => {
          console.log(`   ${error}`);
        });
      }
      
    } else {
      console.log(`❌ Failed to load assessment page: ${result.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Check failed: ${error.message}`);
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
          data: data,
          headers: res.headers
        });
      });
    }).on('error', reject);
  });
}

checkCSSDeployment();