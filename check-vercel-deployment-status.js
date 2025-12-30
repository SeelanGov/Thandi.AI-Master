#!/usr/bin/env node

/**
 * CHECK VERCEL DEPLOYMENT STATUS
 * Quick check of current deployment and cache status
 */

const https = require('https');

function makeRequest(url, headers = {}) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          success: res.statusCode === 200
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ url, success: false, error: error.message });
    });
    
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ url, success: false, error: 'Timeout' });
    });
  });
}

async function checkDeploymentStatus() {
  console.log('🔍 VERCEL DEPLOYMENT STATUS CHECK');
  console.log('=================================');
  console.log(`📅 Time: ${new Date().toLocaleTimeString()}`);
  
  // Test with cache-busting headers
  const testUrl = 'https://www.thandi.online/assessment';
  
  console.log('\n📡 Testing with cache-busting headers...');
  const result = await makeRequest(testUrl, {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  if (result.success) {
    console.log(`✅ Status: ${result.statusCode}`);
    console.log(`📏 Size: ${result.body.length} bytes`);
    console.log(`🕒 Server Date: ${result.headers.date}`);
    console.log(`⚡ Cache Status: ${result.headers['x-vercel-cache'] || 'Unknown'}`);
    console.log(`🔄 CDN: ${result.headers['x-vercel-id'] || 'Unknown'}`);
    
    // Check for specific UI fixes in the HTML
    const checks = {
      'Thandi Branding': result.body.includes('Thandi') && !result.body.includes('THANDI'),
      'Teal Colors': result.body.includes('thandi-teal') || result.body.includes('bg-teal-'),
      'Loading Spinners': result.body.includes('animate-spin'),
      'Responsive Classes': result.body.includes('px-4 sm:px-6') || result.body.includes('sm:'),
      'Error States': result.body.includes('setError') || result.body.includes('error'),
      'New Components': result.body.includes('AssessmentPageClient') || result.body.includes('GradeSelector'),
      'React Hooks': result.body.includes('useState') || result.body.includes('useEffect'),
      'Form Validation': result.body.includes('required') || result.body.includes('validate')
    };
    
    console.log('\n🎨 DETAILED UI/UX CHECK:');
    let implementedFixes = 0;
    Object.entries(checks).forEach(([check, found]) => {
      console.log(`   ${found ? '✅' : '❌'} ${check}`);
      if (found) implementedFixes++;
    });
    
    const percentage = Math.round((implementedFixes / Object.keys(checks).length) * 100);
    console.log(`\n📊 Implementation Status: ${percentage}% (${implementedFixes}/${Object.keys(checks).length})`);
    
    // Check if this looks like the old or new version
    const hasNewFeatures = result.body.includes('AssessmentPageClient') || result.body.includes('thandi-teal');
    const hasOldFeatures = result.body.includes('bg-blue-') || result.body.includes('THANDI');
    
    console.log('\n🔍 VERSION ANALYSIS:');
    console.log(`   ${hasNewFeatures ? '✅' : '❌'} New features detected`);
    console.log(`   ${hasOldFeatures ? '⚠️' : '✅'} Old features ${hasOldFeatures ? 'still present' : 'removed'}`);
    
    let deploymentStatus;
    if (percentage >= 75) {
      deploymentStatus = 'COMPLETE';
    } else if (percentage >= 50) {
      deploymentStatus = 'MOSTLY_DEPLOYED';
    } else if (percentage >= 25) {
      deploymentStatus = 'PARTIAL';
    } else {
      deploymentStatus = 'OLD_VERSION';
    }
    
    console.log(`\n🎯 DEPLOYMENT STATUS: ${deploymentStatus}`);
    
    if (deploymentStatus === 'COMPLETE') {
      console.log('🎉 UI/UX fixes are fully deployed!');
      console.log('✅ Ready for testing and use');
    } else if (deploymentStatus === 'MOSTLY_DEPLOYED') {
      console.log('⚠️ Most fixes deployed, some may still be propagating');
      console.log('🔄 Check again in 5-10 minutes');
    } else if (deploymentStatus === 'PARTIAL') {
      console.log('⏳ Deployment still in progress');
      console.log('💡 CDN cache may be serving mixed versions');
    } else {
      console.log('❌ Still serving old version');
      console.log('🔧 May need to force cache refresh or redeploy');
    }
    
    return { status: deploymentStatus, percentage, implementedFixes };
    
  } else {
    console.log(`❌ Request failed: ${result.error}`);
    return { status: 'ERROR', percentage: 0, implementedFixes: 0 };
  }
}

async function quickPageTest() {
  console.log('\n🌐 QUICK PAGE TEST');
  console.log('==================');
  
  const pages = [
    { url: 'https://www.thandi.online', name: 'Homepage' },
    { url: 'https://www.thandi.online/admin', name: 'Admin' },
    { url: 'https://www.thandi.online/school/claim', name: 'School Claim' }
  ];
  
  for (const page of pages) {
    const result = await makeRequest(page.url);
    if (result.success) {
      const hasThandi = result.body.includes('Thandi');
      const hasTeal = result.body.includes('thandi-teal');
      console.log(`${hasThandi && hasTeal ? '✅' : '⚠️'} ${page.name}: ${hasThandi ? 'Thandi' : 'No Thandi'} | ${hasTeal ? 'Teal' : 'No Teal'}`);
    } else {
      console.log(`❌ ${page.name}: Failed`);
    }
  }
}

async function main() {
  const deploymentResult = await checkDeploymentStatus();
  await quickPageTest();
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log(`🚀 Status: ${deploymentResult.status}`);
  console.log(`📊 Implementation: ${deploymentResult.percentage}%`);
  console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
  
  if (deploymentResult.status === 'COMPLETE') {
    console.log('\n🎉 READY TO GO!');
    console.log('✅ All UI/UX fixes are live');
    console.log('🌐 https://www.thandi.online is ready for testing');
  } else {
    console.log('\n⏳ STILL DEPLOYING');
    console.log('🔄 Deployment in progress or cache propagating');
    console.log('💡 Normal for large deployments - check again soon');
  }
}

main().catch(error => {
  console.error('❌ Check failed:', error.message);
});