#!/usr/bin/env node

/**
 * FORCE VERCEL REDEPLOY FOR RESULTS PAGE FIX
 * 
 * The code is committed and pushed, but the live site still has the old version.
 * This suggests a Vercel deployment issue. We need to force a redeploy.
 */

const https = require('https');

console.log('🚀 FORCE VERCEL REDEPLOY FOR RESULTS PAGE FIX');
console.log('==============================================\n');

async function checkCurrentDeployment() {
  console.log('1. 🔍 Checking Current Live Deployment');
  console.log('   Testing if results page has been updated...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.thandi.online',
      path: '/results',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const hasLocalStorageLogic = data.includes('localStorage.getItem') && data.includes('thandi_results');
        const hasResultsContainer = data.includes('results-container');
        const hasUseEffect = data.includes('useEffect');
        const contentLength = data.length;
        
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content Length: ${contentLength} bytes`);
        console.log(`   Has localStorage logic: ${hasLocalStorageLogic ? '✅' : '❌'}`);
        console.log(`   Has results container: ${hasResultsContainer ? '✅' : '❌'}`);
        console.log(`   Has useEffect: ${hasUseEffect ? '✅' : '❌'}`);
        
        const isFixed = hasLocalStorageLogic && hasResultsContainer && hasUseEffect && contentLength > 20000;
        
        resolve({
          success: res.statusCode === 200,
          isFixed,
          contentLength,
          hasLocalStorageLogic,
          hasResultsContainer,
          hasUseEffect
        });
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ Timeout');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

function generateRedeployCommands() {
  console.log('2. 🔧 REDEPLOY COMMANDS');
  console.log('');
  console.log('   Since the code is already committed but not deployed, try these options:');
  console.log('');
  console.log('   OPTION A - Force Git Push:');
  console.log('   ```bash');
  console.log('   git push --force-with-lease origin main');
  console.log('   ```');
  console.log('');
  console.log('   OPTION B - Trigger Empty Commit:');
  console.log('   ```bash');
  console.log('   git commit --allow-empty -m "Force redeploy: Results page fix"');
  console.log('   git push origin main');
  console.log('   ```');
  console.log('');
  console.log('   OPTION C - Touch File and Recommit:');
  console.log('   ```bash');
  console.log('   touch app/results/page.jsx');
  console.log('   git add app/results/page.jsx');
  console.log('   git commit -m "Force redeploy: Touch results page"');
  console.log('   git push origin main');
  console.log('   ```');
  console.log('');
  console.log('   OPTION D - Vercel CLI Redeploy:');
  console.log('   ```bash');
  console.log('   npx vercel --prod');
  console.log('   ```');
  console.log('');
}

function generateTestScript() {
  console.log('3. 🧪 POST-DEPLOYMENT TEST SCRIPT');
  console.log('');
  console.log('   After redeployment, test with this browser script:');
  console.log('   Navigate to: https://www.thandi.online/results');
  console.log('   Open browser console and run:');
  console.log('');
  console.log('   ```javascript');
  console.log('   // Clear any existing data');
  console.log('   localStorage.removeItem("thandi_results");');
  console.log('   ');
  console.log('   // Set test data');
  console.log('   localStorage.setItem("thandi_results", JSON.stringify({');
  console.log('     success: true,');
  console.log('     response: "# Test Career Guidance\\n\\nThis is a test response to verify the results page is working.\\n\\n⚠️ **Verify before you decide**: This is AI-generated advice.",');
  console.log('     metadata: { grade: "grade12" }');
  console.log('   }));');
  console.log('   ');
  console.log('   // Reload to test');
  console.log('   location.reload();');
  console.log('   ```');
  console.log('');
  console.log('   Expected Result: Page should show career guidance instead of "Loading your results..."');
  console.log('');
}

async function main() {
  try {
    const deploymentStatus = await checkCurrentDeployment();
    console.log('');
    
    if (deploymentStatus.isFixed) {
      console.log('✅ RESULTS PAGE IS FIXED!');
      console.log('   The deployment has been successful.');
      console.log('   All critical functionality is now present on the live site.');
      return;
    }
    
    console.log('❌ RESULTS PAGE STILL NEEDS DEPLOYMENT');
    console.log('   The live site still has the incomplete version.');
    console.log('');
    
    generateRedeployCommands();
    generateTestScript();
    
    console.log('4. 📋 DEPLOYMENT CHECKLIST');
    console.log('');
    console.log('   □ Run one of the redeploy commands above');
    console.log('   □ Wait 2-3 minutes for Vercel deployment');
    console.log('   □ Check Vercel dashboard for deployment status');
    console.log('   □ Test results page with browser script');
    console.log('   □ Verify "Loading your results..." issue is resolved');
    console.log('');
    
    console.log('5. 📊 CURRENT STATUS');
    console.log('');
    console.log(`   Live Site Status: ${deploymentStatus.isFixed ? '✅ Fixed' : '❌ Needs Deployment'}`);
    console.log(`   Content Length: ${deploymentStatus.contentLength} bytes (should be >20,000)`);
    console.log(`   localStorage Logic: ${deploymentStatus.hasLocalStorageLogic ? '✅' : '❌'}`);
    console.log(`   Results Container: ${deploymentStatus.hasResultsContainer ? '✅' : '❌'}`);
    console.log(`   React useEffect: ${deploymentStatus.hasUseEffect ? '✅' : '❌'}`);
    console.log('');
    
    if (!deploymentStatus.isFixed) {
      console.log('🚨 ACTION REQUIRED: Run redeploy commands to fix the results page');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkCurrentDeployment };