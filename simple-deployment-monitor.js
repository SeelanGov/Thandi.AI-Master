#!/usr/bin/env node

/**
 * SIMPLE DEPLOYMENT MONITOR
 * Monitor the active deployment and check for UI/UX fixes
 */

const https = require('https');

function makeRequest(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
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

async function checkCurrentDeployment() {
  console.log('🔍 CHECKING CURRENT DEPLOYMENT STATUS');
  console.log('=====================================');
  console.log(`📅 Time: ${new Date().toLocaleTimeString()}`);
  
  const testUrl = 'https://www.thandi.online/assessment';
  console.log(`📡 Testing: ${testUrl}`);
  
  const result = await makeRequest(testUrl);
  
  if (result.success) {
    console.log(`✅ Status: ${result.statusCode}`);
    console.log(`📏 Response Size: ${result.body.length} bytes`);
    
    // Check for our UI/UX fixes
    const checks = {
      'Thandi Branding': result.body.includes('Thandi') && !result.body.includes('THANDI'),
      'Teal Colors': result.body.includes('thandi-teal'),
      'Loading States': result.body.includes('animate-spin') || result.body.includes('Loading'),
      'Responsive Design': result.body.includes('sm:') || result.body.includes('px-4'),
      'Error Handling': result.body.includes('error') || result.body.includes('Error'),
      'Grade Selector': result.body.includes('GradeSelector'),
      'Assessment Form': result.body.includes('AssessmentForm'),
      'React Components': result.body.includes('useState') || result.body.includes('useEffect')
    };
    
    console.log('\n🎨 UI/UX FIX DETECTION:');
    let fixesFound = 0;
    Object.entries(checks).forEach(([check, found]) => {
      console.log(`   ${found ? '✅' : '❌'} ${check}`);
      if (found) fixesFound++;
    });
    
    const percentage = Math.round((fixesFound / Object.keys(checks).length) * 100);
    console.log(`\n📊 UI/UX Implementation: ${percentage}% (${fixesFound}/${Object.keys(checks).length})`);
    
    // Determine deployment status
    let status, emoji, message;
    if (percentage >= 75) {
      status = 'EXCELLENT';
      emoji = '🎉';
      message = 'UI/UX fixes successfully deployed!';
    } else if (percentage >= 50) {
      status = 'GOOD';
      emoji = '✅';
      message = 'Most fixes deployed, some may still be propagating';
    } else if (percentage >= 25) {
      status = 'PARTIAL';
      emoji = '⚠️';
      message = 'Deployment in progress, fixes partially visible';
    } else {
      status = 'PENDING';
      emoji = '⏳';
      message = 'Deployment still in progress or using cached version';
    }
    
    console.log(`\n${emoji} DEPLOYMENT STATUS: ${status}`);
    console.log(`💬 ${message}`);
    
    return { status, percentage, fixesFound, totalChecks: Object.keys(checks).length };
    
  } else {
    console.log(`❌ Request failed: ${result.error}`);
    return { status: 'ERROR', percentage: 0, fixesFound: 0, totalChecks: 0 };
  }
}

async function testAllPages() {
  console.log('\n🌐 TESTING ALL KEY PAGES');
  console.log('========================');
  
  const pages = [
    'https://www.thandi.online',
    'https://www.thandi.online/assessment',
    'https://www.thandi.online/admin',
    'https://www.thandi.online/school/claim',
    'https://www.thandi.online/api/health'
  ];
  
  const results = [];
  
  for (const url of pages) {
    const pageName = url.replace('https://www.thandi.online', '') || '/';
    console.log(`\n📄 Testing: ${pageName}`);
    
    const result = await makeRequest(url);
    
    if (result.success) {
      console.log(`   ✅ Status: ${result.statusCode} (${result.body.length} bytes)`);
      
      // Quick checks
      const hasThandi = result.body.includes('Thandi');
      const hasTeal = result.body.includes('thandi-teal');
      const hasResponsive = result.body.includes('sm:');
      
      console.log(`   🎨 Thandi: ${hasThandi ? '✅' : '❌'} | Teal: ${hasTeal ? '✅' : '❌'} | Responsive: ${hasResponsive ? '✅' : '❌'}`);
      
      results.push({ url, success: true, hasThandi, hasTeal, hasResponsive });
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      results.push({ url, success: false });
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const workingPages = results.filter(r => r.success);
  console.log(`\n📊 Summary: ${workingPages.length}/${results.length} pages working`);
  
  return results;
}

async function main() {
  console.log('🚀 DEPLOYMENT MONITORING');
  console.log('========================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  
  try {
    // Check main assessment page for UI fixes
    const deploymentStatus = await checkCurrentDeployment();
    
    // Test all pages
    const pageResults = await testAllPages();
    
    console.log('\n🎯 FINAL ASSESSMENT');
    console.log('===================');
    console.log(`🚀 Deployment Status: ${deploymentStatus.status}`);
    console.log(`🎨 UI/UX Implementation: ${deploymentStatus.percentage}%`);
    console.log(`🌐 Working Pages: ${pageResults.filter(r => r.success).length}/${pageResults.length}`);
    
    if (deploymentStatus.status === 'EXCELLENT' || deploymentStatus.status === 'GOOD') {
      console.log('\n🎉 READY FOR USE!');
      console.log('✅ https://www.thandi.online is live with UI/UX improvements');
      console.log('🚀 You can start testing the new features');
    } else if (deploymentStatus.status === 'PARTIAL') {
      console.log('\n⏳ DEPLOYMENT IN PROGRESS');
      console.log('🔄 Check again in 5-10 minutes for full deployment');
      console.log('💡 Some fixes may still be propagating through CDN');
    } else {
      console.log('\n⚠️ DEPLOYMENT PENDING');
      console.log('🔄 Deployment may still be building or caching');
      console.log('⏰ Monitor Vercel logs for completion status');
    }
    
    return deploymentStatus.status === 'EXCELLENT' || deploymentStatus.status === 'GOOD';
    
  } catch (error) {
    console.error('❌ Monitoring error:', error.message);
    return false;
  }
}

// Run monitoring
main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  console.log(`🎯 Status: ${success ? 'DEPLOYMENT READY' : 'NEEDS MORE TIME'}`);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});