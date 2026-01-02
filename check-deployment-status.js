#!/usr/bin/env node

const https = require('https');

async function checkDeploymentStatus() {
  console.log('🔍 CHECKING DEPLOYMENT STATUS');
  console.log('=============================\n');
  
  try {
    console.log('📋 Step 1: Check if debug logs are in deployed code...');
    
    const pageResult = await makeRequest('https://www.thandi.online/assessment/grade/12?registered=true');
    
    if (pageResult.status === 200) {
      const html = pageResult.data;
      
      // Check for our debug logs
      const hasDebugLogs = html.includes('AssessmentPageClient props') ||
                          html.includes('AssessmentForm received props') ||
                          html.includes('Initializing currentStep');
      
      console.log(`Debug logs in deployed code: ${hasDebugLogs ? '✅ PRESENT' : '❌ MISSING'}`);
      
      // Check for our fixes
      const hasGradeSelectorFix = html.includes('grade_selector') ||
                                 html.includes('initialStep === \'grade_selector\'');
      
      console.log(`Grade selector fix: ${hasGradeSelectorFix ? '✅ PRESENT' : '❌ MISSING'}`);
      
      // Check for localStorage skip logic
      const hasLocalStorageFix = html.includes('Skipping localStorage') ||
                                html.includes('using URL parameters');
      
      console.log(`LocalStorage fix: ${hasLocalStorageFix ? '✅ PRESENT' : '❌ MISSING'}`);
      
      // Check for JavaScript errors in the HTML
      const hasJSErrors = html.includes('SyntaxError') ||
                         html.includes('ReferenceError') ||
                         html.includes('TypeError') ||
                         html.includes('Uncaught');
      
      console.log(`JavaScript errors in HTML: ${hasJSErrors ? '❌ DETECTED' : '✅ NONE'}`);
      
      if (!hasDebugLogs) {
        console.log('\n❌ DEPLOYMENT ISSUE DETECTED');
        console.log('===============================');
        console.log('Our debug logs are not in the deployed code.');
        console.log('This means either:');
        console.log('1. Vercel deployment failed');
        console.log('2. Build process failed');
        console.log('3. Changes were not properly committed');
        console.log('4. Caching issue preventing updates');
      } else {
        console.log('\n✅ DEPLOYMENT SUCCESSFUL');
        console.log('========================');
        console.log('Debug logs are present in deployed code.');
        console.log('The issue is in the logic, not deployment.');
      }
      
    } else {
      console.log(`❌ Could not load page: ${pageResult.status}`);
    }
    
    console.log('\n📋 Step 2: Check git commit status...');
    
    // This would need to be run locally to check git status
    console.log('Run locally: git log --oneline -5');
    console.log('Should show recent commits with our fixes');
    
    console.log('\n📋 Step 3: Check Vercel deployment...');
    console.log('Visit: https://vercel.com/dashboard');
    console.log('Check if latest deployment succeeded');
    
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
          data: data
        });
      });
    }).on('error', reject);
  });
}

checkDeploymentStatus();