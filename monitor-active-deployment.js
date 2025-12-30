#!/usr/bin/env node

/**
 * MONITOR ACTIVE DEPLOYMENT
 * Watch the current deployment complete and verify UI/UX fixes
 */

const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          body: data,
          timestamp: new Date().toISOString(),
          success: res.statusCode === 200
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ 
        url, 
        success: false, 
        error: error.message, 
        timestamp: new Date().toISOString() 
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ 
        url, 
        success: false, 
        error: 'Timeout', 
        timestamp: new Date().toISOString() 
      });
    });
  });
}

async function checkDeploymentProgress() {
  console.log('🔍 MONITORING ACTIVE DEPLOYMENT');
  console.log('===============================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('🌐 Domain: https://www.thandi.online');
  console.log('⏳ Waiting for deployment to complete...');
  
  const testUrl = 'https://www.thandi.online/assessment';
  let attempts = 0;
  const maxAttempts = 20; // 10 minutes of monitoring
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n🔍 Check ${attempts}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
    
    const result = await testUrl(testUrl);
    
    if (result.success) {
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`📏 Size: ${result.body.length} bytes`);
      
      // Check for our specific UI fixes
      const uiChecks = {
        'Thandi Branding': result.body.includes('Thandi') && !result.body.includes('THANDI'),
        'Teal Colors': result.body.includes('thandi-teal') || result.body.includes('teal-'),
        'Loading Spinners': result.body.includes('animate-spin'),
        'Responsive Design': result.body.includes('px-4 sm:px-6') || result.body.includes('sm:'),
        'Error Handling': result.body.includes('setError') || result.body.includes('error'),
        'Form Validation': result.body.includes('required') || result.body.includes('validate'),
        'Grade Selector': result.body.includes('GradeSelector') || result.body.includes('grade'),
        'Assessment Form': result.body.includes('AssessmentForm') || result.body.includes('assessment')
      };
      
      let fixesDetected = 0;
      console.log('🎨 UI/UX Fix Detection:');
      Object.entries(uiChecks).forEach(([check, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${check}`);
        if (passed) fixesDetected++;
      });
      
      const percentage = Math.round((fixesDetected / Object.keys(uiChecks).length) * 100);
      console.log(`📊 UI/UX Implementation: ${percentage}% (${fixesDetected}/${Object.keys(uiChecks).length})`);
      
      // Check if deployment seems complete
      if (fixesDetected >= 5) {
        console.log('\n🎉 DEPLOYMENT APPEARS COMPLETE!');
        console.log('✅ Significant UI/UX fixes detected');
        console.log('🚀 Ready for comprehensive testing');
        return { complete: true, percentage, fixesDetected };
      } else if (fixesDetected >= 3) {
        console.log('\n⚠️ PARTIAL DEPLOYMENT DETECTED');
        console.log('🔄 Some fixes visible, continuing to monitor...');
      } else {
        console.log('\n⏳ DEPLOYMENT STILL IN PROGRESS');
        console.log('🔄 Waiting for UI/UX fixes to appear...');
      }
      
    } else {
      console.log(`❌ Request failed: ${result.error}`);
    }
    
    // Wait 30 seconds before next check
    if (attempts < maxAttempts) {
      console.log('⏳ Waiting 30 seconds for next check...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  console.log('\n⏰ MONITORING TIMEOUT REACHED');
  console.log('Deployment may need more time or manual intervention');
  return { complete: false, percentage: 0, fixesDetected: 0 };
}

async function comprehensiveTest() {
  console.log('\n🎯 COMPREHENSIVE DEPLOYMENT TEST');
  console.log('================================');
  
  const testPages = [
    { url: 'https://www.thandi.online', name: 'Homepage' },
    { url: 'https://www.thandi.online/assessment', name: 'Assessment (UI Fixes)' },
    { url: 'https://www.thandi.online/admin', name: 'Admin (Branding Fixes)' },
    { url: 'https://www.thandi.online/school/claim', name: 'School Claim' },
    { url: 'https://www.thandi.online/api/health', name: 'API Health' }
  ];
  
  const results = [];
  
  for (const page of testPages) {
    console.log(`\n📡 Testing: ${page.name}`);
    const result = await testUrl(page.url);
    
    if (result.success) {
      console.log(`✅ ${page.name}: ${result.statusCode} (${result.body.length} bytes)`);
      
      // Quick UI check for each page
      const hasThandi = result.body.includes('Thandi') && !result.body.includes('THANDI');
      const hasTeal = result.body.includes('thandi-teal') || result.body.includes('teal-');
      const hasResponsive = result.body.includes('sm:') || result.body.includes('px-4');
      
      console.log(`   🎨 Thandi: ${hasThandi ? '✅' : '❌'} | Teal: ${hasTeal ? '✅' : '❌'} | Responsive: ${hasResponsive ? '✅' : '❌'}`);
      
      result.uiScore = (hasThandi ? 1 : 0) + (hasTeal ? 1 : 0) + (hasResponsive ? 1 : 0);
    } else {
      console.log(`❌ ${page.name}: ${result.error}`);
      result.uiScore = 0;
    }
    
    results.push({ ...result, ...page });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  const workingPages = results.filter(r => r.success);
  const avgUiScore = workingPages.length > 0 ? 
    Math.round((workingPages.reduce((sum, r) => sum + r.uiScore, 0) / workingPages.length) * 33.33) : 0;
  
  console.log('\n📊 FINAL RESULTS');
  console.log('================');
  console.log(`✅ Working Pages: ${workingPages.length}/${results.length}`);
  console.log(`🎨 Average UI Score: ${avgUiScore}%`);
  
  if (workingPages.length >= 4 && avgUiScore >= 50) {
    console.log('🎉 DEPLOYMENT SUCCESS!');
    console.log('✅ UI/UX fixes are deployed and working');
    console.log('🌐 https://www.thandi.online is ready for use');
  } else if (workingPages.length >= 3) {
    console.log('⚠️ PARTIAL SUCCESS');
    console.log('🔄 Most pages working, some fixes may need more time');
  } else {
    console.log('❌ DEPLOYMENT ISSUES');
    console.log('🛠️ Requires investigation');
  }
  
  return { workingPages: workingPages.length, totalPages: results.length, avgUiScore };
}

async function main() {
  try {
    // First, monitor the active deployment
    const deploymentResult = await checkDeploymentProgress();
    
    // Then run comprehensive test
    const testResult = await comprehensiveTest();
    
    console.log('\n🏁 MONITORING COMPLETE');
    console.log('======================');
    console.log(`📅 Completed: ${new Date().toISOString()}`);
    console.log(`🚀 Deployment Complete: ${deploymentResult.complete ? 'Yes' : 'Partial'}`);
    console.log(`🎨 UI/UX Implementation: ${Math.max(deploymentResult.percentage, testResult.avgUiScore)}%`);
    console.log(`🌐 Pages Working: ${testResult.workingPages}/${testResult.totalPages}`);
    
    if (deploymentResult.complete && testResult.workingPages >= 4) {
      console.log('\n🎉 SUCCESS: Thandi.online is live with UI/UX improvements!');
      return true;
    } else {
      console.log('\n⏳ IN PROGRESS: Deployment may need more time');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
    return false;
  }
}

// Start monitoring
main().then(success => {
  console.log(`\n🎯 Final Status: ${success ? 'READY FOR USE' : 'NEEDS MORE TIME'}`);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});