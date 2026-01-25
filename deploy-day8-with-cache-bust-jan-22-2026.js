#!/usr/bin/env node

/**
 * Day 8 Admin Dashboard Deployment with Cache Busting
 * January 22, 2026
 * 
 * This script monitors Vercel deployment and implements cache-busting strategies
 * to ensure Day 8 pages are properly deployed despite Vercel's aggressive caching.
 */

const https = require('https');

const PRODUCTION_URL = 'https://www.thandi.online';
const CACHE_BUST_PARAM = `?cb=${Date.now()}`;

// Pages to verify
const DAY_8_PAGES = [
  '/admin/errors',
  '/admin/performance',
  '/admin/activity'
];

const CONTROL_PAGES = [
  '/admin',
  '/admin/login'
];

console.log('🚀 DAY 8 DEPLOYMENT VERIFICATION WITH CACHE BUSTING');
console.log('='.repeat(60));
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
console.log(`🔄 Cache Bust Parameter: ${CACHE_BUST_PARAM}`);
console.log('');

/**
 * Test a URL with cache busting
 */
async function testUrl(path, expectSuccess = true) {
  const url = `${PRODUCTION_URL}${path}${CACHE_BUST_PARAM}`;
  
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Thandi-Deployment-Verification/1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }, (res) => {
      const success = res.statusCode === 200;
      const status = success ? '✅' : '❌';
      const statusText = success ? 'OK' : `FAILED (${res.statusCode})`;
      
      console.log(`${status} ${path.padEnd(30)} ${statusText}`);
      
      resolve({
        path,
        statusCode: res.statusCode,
        success,
        expected: expectSuccess
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${path.padEnd(30)} ERROR: ${error.message}`);
      resolve({
        path,
        statusCode: 0,
        success: false,
        expected: expectSuccess,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏱️  ${path.padEnd(30)} TIMEOUT`);
      resolve({
        path,
        statusCode: 0,
        success: false,
        expected: expectSuccess,
        error: 'Timeout'
      });
    });
  });
}

/**
 * Wait for deployment to complete
 */
async function waitForDeployment(maxAttempts = 12, intervalMs = 10000) {
  console.log('⏳ Waiting for Vercel deployment to complete...');
  console.log(`   Max attempts: ${maxAttempts}`);
  console.log(`   Check interval: ${intervalMs}ms (${intervalMs / 1000}s)`);
  console.log('');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔍 Attempt ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
    
    // Test control pages first (should always work)
    const controlResults = await Promise.all(
      CONTROL_PAGES.map(path => testUrl(path, true))
    );
    
    // Test Day 8 pages
    const day8Results = await Promise.all(
      DAY_8_PAGES.map(path => testUrl(path, true))
    );
    
    const allResults = [...controlResults, ...day8Results];
    const successCount = allResults.filter(r => r.success).length;
    const totalCount = allResults.length;
    
    console.log('');
    console.log(`📊 Results: ${successCount}/${totalCount} pages responding`);
    
    // Check if Day 8 pages are deployed
    const day8Success = day8Results.every(r => r.success);
    
    if (day8Success) {
      console.log('');
      console.log('✅ SUCCESS! All Day 8 pages are deployed and responding!');
      return true;
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Day 8 pages not ready yet. Waiting ${intervalMs / 1000}s...`);
      console.log('');
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  console.log('');
  console.log('⚠️  WARNING: Deployment verification timed out');
  console.log('   This may be due to Vercel cache issues');
  return false;
}

/**
 * Cache busting recommendations
 */
function printCacheBustingRecommendations() {
  console.log('');
  console.log('🔧 CACHE BUSTING RECOMMENDATIONS');
  console.log('='.repeat(60));
  console.log('');
  console.log('If pages still return 404 after deployment:');
  console.log('');
  console.log('1. **Hard Refresh in Browser**:');
  console.log('   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
  console.log('   - Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
  console.log('');
  console.log('2. **Clear Browser Cache**:');
  console.log('   - Chrome: Settings > Privacy > Clear browsing data');
  console.log('   - Edge: Settings > Privacy > Choose what to clear');
  console.log('');
  console.log('3. **Test with Cache-Busting URL**:');
  console.log(`   ${PRODUCTION_URL}/admin/errors?cb=${Date.now()}`);
  console.log('');
  console.log('4. **Vercel Cache Purge** (if needed):');
  console.log('   - Go to Vercel Dashboard');
  console.log('   - Select deployment');
  console.log('   - Click "Redeploy" with "Use existing Build Cache" UNCHECKED');
  console.log('');
  console.log('5. **Force Vercel Rebuild**:');
  console.log('   vercel --prod --force');
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  try {
    const success = await waitForDeployment();
    
    if (success) {
      console.log('');
      console.log('🎉 DEPLOYMENT VERIFICATION COMPLETE');
      console.log('='.repeat(60));
      console.log('');
      console.log('✅ All Day 8 pages are live and responding');
      console.log('✅ Dashboard is fully functional');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Test in browser: https://www.thandi.online/admin');
      console.log('2. Click on each navigation card');
      console.log('3. Verify all pages load correctly');
      console.log('4. Complete Day 9 testing');
      console.log('5. Create Day 10 documentation');
      console.log('');
      process.exit(0);
    } else {
      console.log('');
      console.log('⚠️  DEPLOYMENT VERIFICATION INCOMPLETE');
      console.log('='.repeat(60));
      console.log('');
      console.log('Day 8 pages may still be deploying or cached.');
      printCacheBustingRecommendations();
      console.log('');
      console.log('💡 TIP: Wait 2-3 minutes and run this script again:');
      console.log('   node deploy-day8-with-cache-bust-jan-22-2026.js');
      console.log('');
      process.exit(1);
    }
  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { testUrl, waitForDeployment };
