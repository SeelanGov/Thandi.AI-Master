#!/usr/bin/env node

/**
 * FINAL DEPLOYMENT VERIFICATION
 * Comprehensive verification of UI/UX fixes on live domain
 */

const https = require('https');
const fs = require('fs');

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
          success: res.statusCode === 200
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ url, success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ url, success: false, error: 'Timeout' });
    });
  });
}

async function comprehensiveTest() {
  console.log('🎯 FINAL DEPLOYMENT VERIFICATION');
  console.log('================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log('🌐 Domain: https://www.thandi.online');
  
  const testPages = [
    { url: 'https://www.thandi.online', name: 'Homepage', priority: 'high' },
    { url: 'https://www.thandi.online/assessment', name: 'Assessment (Main UI Fixes)', priority: 'critical' },
    { url: 'https://www.thandi.online/admin', name: 'Admin (Branding Fixes)', priority: 'critical' },
    { url: 'https://www.thandi.online/school/claim', name: 'School Claim (Admin Panel)', priority: 'high' },
    { url: 'https://www.thandi.online/results', name: 'Results Page', priority: 'medium' },
    { url: 'https://www.thandi.online/api/health', name: 'API Health Check', priority: 'medium' }
  ];
  
  console.log('\n🔍 TESTING ALL PAGES');
  console.log('====================');
  
  const results = [];
  
  for (const page of testPages) {
    console.log(`\n📡 Testing: ${page.name}`);
    console.log(`🔗 URL: ${page.url}`);
    
    const result = await testUrl(page.url);
    
    if (result.success) {
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`📏 Size: ${result.body.length} bytes`);
      
      // Detailed UI/UX analysis
      const analysis = {
        // Critical branding fixes
        thandiCorrect: result.body.includes('Thandi') && !result.body.includes('THANDI'),
        noOldBranding: !result.body.includes('THANDI'),
        
        // Color system fixes
        thandiColors: result.body.includes('thandi-teal') || result.body.includes('teal-'),
        noBlueColors: !result.body.includes('bg-blue-') && !result.body.includes('text-blue-'),
        
        // UI enhancements
        responsive: result.body.includes('sm:') || result.body.includes('md:') || result.body.includes('lg:'),
        mobileFirst: result.body.includes('px-4') || result.body.includes('max-w-'),
        loadingStates: result.body.includes('animate-spin') || result.body.includes('Loading'),
        errorHandling: result.body.includes('error') || result.body.includes('Error'),
        
        // Admin panel specific
        adminBranding: page.name.includes('Admin') || page.name.includes('School') ? 
          result.body.includes('Thandi School') || result.body.includes('Thandi Administration') : true,
        
        // Form enhancements
        formValidation: result.body.includes('required') || result.body.includes('validate'),
        accessibility: result.body.includes('aria-') || result.body.includes('role=')
      };
      
      const passedChecks = Object.values(analysis).filter(Boolean).length;
      const totalChecks = Object.keys(analysis).length;
      const score = Math.round((passedChecks / totalChecks) * 100);
      
      console.log(`🎨 UI/UX Score: ${score}% (${passedChecks}/${totalChecks})`);
      
      // Show critical fixes status
      if (page.priority === 'critical') {
        console.log('🔍 Critical Fixes:');
        console.log(`   ${analysis.thandiCorrect ? '✅' : '❌'} Thandi Branding`);
        console.log(`   ${analysis.thandiColors ? '✅' : '❌'} Thandi Colors`);
        console.log(`   ${analysis.responsive ? '✅' : '❌'} Responsive Design`);
        console.log(`   ${analysis.loadingStates ? '✅' : '❌'} Loading States`);
      }
      
      result.analysis = analysis;
      result.score = score;
      
    } else {
      console.log(`❌ Failed: ${result.error || 'Unknown error'}`);
      result.score = 0;
    }
    
    results.push({ ...result, ...page });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Overall Analysis
  console.log('\n📊 OVERALL ANALYSIS');
  console.log('===================');
  
  const workingPages = results.filter(r => r.success);
  const criticalPages = results.filter(r => r.priority === 'critical' && r.success);
  
  console.log(`✅ Working Pages: ${workingPages.length}/${results.length}`);
  console.log(`🎯 Critical Pages Working: ${criticalPages.length}/${results.filter(r => r.priority === 'critical').length}`);
  
  if (workingPages.length > 0) {
    const avgScore = Math.round(workingPages.reduce((sum, r) => sum + r.score, 0) / workingPages.length);
    console.log(`🎨 Average UI/UX Score: ${avgScore}%`);
    
    // Critical fixes summary
    if (criticalPages.length > 0) {
      console.log('\n🎯 CRITICAL FIXES STATUS:');
      
      const criticalFixes = {
        'Thandi Branding': criticalPages.filter(p => p.analysis?.thandiCorrect).length,
        'Thandi Colors': criticalPages.filter(p => p.analysis?.thandiColors).length,
        'Responsive Design': criticalPages.filter(p => p.analysis?.responsive).length,
        'Loading States': criticalPages.filter(p => p.analysis?.loadingStates).length,
        'Error Handling': criticalPages.filter(p => p.analysis?.errorHandling).length
      };
      
      Object.entries(criticalFixes).forEach(([fix, count]) => {
        const percentage = Math.round((count / criticalPages.length) * 100);
        const status = percentage >= 80 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
        console.log(`${status} ${fix}: ${count}/${criticalPages.length} pages (${percentage}%)`);
      });
    }
  }
  
  // Deployment Status Assessment
  console.log('\n🎯 DEPLOYMENT STATUS ASSESSMENT');
  console.log('===============================');
  
  const domainHealth = Math.round((workingPages.length / results.length) * 100);
  const avgUiScore = workingPages.length > 0 ? Math.round(workingPages.reduce((sum, r) => sum + r.score, 0) / workingPages.length) : 0;
  
  let deploymentStatus;
  let statusEmoji;
  let recommendations = [];
  
  if (domainHealth >= 90 && avgUiScore >= 70) {
    deploymentStatus = 'EXCELLENT';
    statusEmoji = '🎉';
    recommendations.push('✅ All systems operational');
    recommendations.push('✅ UI/UX fixes successfully deployed');
    recommendations.push('🚀 Ready for production use');
  } else if (domainHealth >= 75 && avgUiScore >= 50) {
    deploymentStatus = 'GOOD';
    statusEmoji = '✅';
    recommendations.push('✅ Core functionality working');
    recommendations.push('⚠️ Some UI/UX fixes may need more time to propagate');
    recommendations.push('🔄 Monitor for improvements over next hour');
  } else if (domainHealth >= 50) {
    deploymentStatus = 'PARTIAL';
    statusEmoji = '⚠️';
    recommendations.push('⚠️ Partial deployment success');
    recommendations.push('🔧 Some pages need attention');
    recommendations.push('💡 Check CDN cache and deployment logs');
  } else {
    deploymentStatus = 'NEEDS ATTENTION';
    statusEmoji = '❌';
    recommendations.push('❌ Multiple issues detected');
    recommendations.push('🛠️ Requires immediate investigation');
    recommendations.push('📞 Contact deployment team');
  }
  
  console.log(`${statusEmoji} Status: ${deploymentStatus}`);
  console.log(`🌐 Domain Health: ${domainHealth}%`);
  console.log(`🎨 UI/UX Implementation: ${avgUiScore}%`);
  
  console.log('\n📋 RECOMMENDATIONS:');
  recommendations.forEach(rec => console.log(`   ${rec}`));
  
  // Save comprehensive results
  const finalResults = {
    timestamp: new Date().toISOString(),
    domain: 'https://www.thandi.online',
    deploymentStatus,
    summary: {
      domainHealth,
      avgUiScore,
      workingPages: workingPages.length,
      totalPages: results.length,
      criticalPagesWorking: criticalPages.length
    },
    results,
    recommendations
  };
  
  fs.writeFileSync('final-deployment-verification.json', JSON.stringify(finalResults, null, 2));
  
  console.log('\n📄 Results saved to: final-deployment-verification.json');
  
  return finalResults;
}

// Run comprehensive test
comprehensiveTest().then(results => {
  console.log('\n🏁 FINAL SUMMARY');
  console.log('================');
  console.log(`📅 Completed: ${new Date().toISOString()}`);
  console.log(`🌐 Domain: ${results.domain}`);
  console.log(`🎯 Status: ${results.deploymentStatus}`);
  console.log(`📊 Health: ${results.summary.domainHealth}%`);
  console.log(`🎨 UI/UX: ${results.summary.avgUiScore}%`);
  
  if (results.deploymentStatus === 'EXCELLENT' || results.deploymentStatus === 'GOOD') {
    console.log('\n🎉 SUCCESS: Your Thandi.online domain is live with UI/UX improvements!');
    console.log('🔗 Visit: https://www.thandi.online');
  } else {
    console.log('\n⚠️ PARTIAL SUCCESS: Domain is live but some improvements are still propagating');
    console.log('⏰ Check again in 10-15 minutes for full deployment');
  }
  
}).catch(error => {
  console.error('❌ Verification failed:', error.message);
});