#!/usr/bin/env node

const https = require('https');

async function diagnoseDeploymentIssue() {
  console.log('🔍 DIAGNOSING DEPLOYMENT ISSUE');
  console.log('==============================\n');
  
  console.log('📋 Based on evidence:');
  console.log('- Git commits show our fixes are committed');
  console.log('- Vercel shows multiple deployments');
  console.log('- But production site lacks our debug logs');
  console.log('- Screenshots show currentStep: 0.5 (registration)');
  
  console.log('\n🎯 HYPOTHESIS: Custom domain not pointing to latest deployment');
  
  try {
    console.log('\n📋 Step 1: Test production domain...');
    
    const prodResult = await makeRequest('https://www.thandi.online/assessment');
    
    if (prodResult.status === 200) {
      console.log('✅ Production domain loads');
      
      const html = prodResult.data;
      
      // Look for deployment indicators
      const hasNextJS = html.includes('_next') || html.includes('Next.js');
      const hasReact = html.includes('React') || html.includes('__NEXT_DATA__');
      
      console.log(`Next.js indicators: ${hasNextJS ? '✅ PRESENT' : '❌ MISSING'}`);
      console.log(`React indicators: ${hasReact ? '✅ PRESENT' : '❌ MISSING'}`);
      
      // Check for our specific debug logs
      const hasOurDebugLogs = html.includes('AssessmentPageClient props') ||
                             html.includes('console.log(\'AssessmentForm received props');
      
      console.log(`Our debug logs: ${hasOurDebugLogs ? '✅ PRESENT' : '❌ MISSING'}`);
      
      // Check for old vs new code patterns
      const hasOldCode = html.includes('grade-selection') && !html.includes('grade_selector');
      const hasNewCode = html.includes('grade_selector');
      
      console.log(`Old code patterns: ${hasOldCode ? '⚠️  DETECTED' : '✅ NONE'}`);
      console.log(`New code patterns: ${hasNewCode ? '✅ PRESENT' : '❌ MISSING'}`);
      
      if (!hasOurDebugLogs && !hasNewCode) {
        console.log('\n❌ PRODUCTION IS RUNNING OLD CODE');
        console.log('=================================');
        console.log('The production domain is not using our latest fixes.');
        console.log('This explains why the registration loop persists.');
        
        console.log('\n🔧 SOLUTIONS:');
        console.log('=============');
        console.log('1. Check Vercel dashboard for domain configuration');
        console.log('2. Ensure custom domain points to latest deployment');
        console.log('3. Force a new deployment to refresh domain mapping');
        console.log('4. Check if there are multiple Vercel projects');
      }
      
    } else {
      console.log(`❌ Production domain failed: ${prodResult.status}`);
    }
    
    console.log('\n📋 Step 2: Check if we can access a working deployment...');
    
    // Try to find a working deployment URL
    const testUrls = [
      'https://thandi-ai-master-git-main-thandiai-projects.vercel.app',
      'https://thandi-ai-master-thandiai-projects.vercel.app'
    ];
    
    for (const url of testUrls) {
      try {
        console.log(`Testing: ${url}`);
        const result = await makeRequest(`${url}/assessment`);
        
        if (result.status === 200) {
          console.log(`✅ ${url} works`);
          
          const html = result.data;
          const hasDebugLogs = html.includes('AssessmentPageClient props');
          
          console.log(`Has our fixes: ${hasDebugLogs ? '✅ YES' : '❌ NO'}`);
          
          if (hasDebugLogs) {
            console.log('\n🎯 WORKING DEPLOYMENT FOUND');
            console.log('===========================');
            console.log(`Working URL: ${url}`);
            console.log('This deployment has our fixes.');
            console.log('We need to point the custom domain to this deployment.');
            break;
          }
        } else {
          console.log(`❌ ${url} failed: ${result.status}`);
        }
      } catch (error) {
        console.log(`❌ ${url} error: ${error.message}`);
      }
    }
    
    console.log('\n📋 Step 3: Recommended actions...');
    console.log('1. Go to Vercel dashboard');
    console.log('2. Find the Thandi project');
    console.log('3. Check which deployment the custom domain points to');
    console.log('4. Update domain to point to latest successful deployment');
    console.log('5. Or force a new deployment to refresh everything');
    
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

diagnoseDeploymentIssue();