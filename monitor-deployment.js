#!/usr/bin/env node

/**
 * Monitor Deployment Progress
 * Check when the new deployment is live
 */

import https from 'https';

const PRODUCTION_URL = 'https://thandiai-fvcp1qw1u-thandiai-projects.vercel.app';
const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CHECKS = 20; // 10 minutes total

console.log('🔍 MONITORING DEPLOYMENT PROGRESS');
console.log('='.repeat(50));
console.log(`🌐 URL: ${PRODUCTION_URL}`);
console.log(`⏱️  Checking every 30 seconds for up to 10 minutes`);
console.log('');

let checkCount = 0;

function checkDeployment() {
  return new Promise((resolve) => {
    const url = new URL(PRODUCTION_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Thandi.ai-Deployment-Monitor/1.0',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Check for deployment indicators
          const hasLegalSection = data.includes('Legal & Compliance');
          const hasLegalRoutes = data.includes('/legal/privacy-policy');
          const hasNewFooter = data.includes('B-BBEE Level 1');
          const hasStudentProtected = data.includes('Student Data Protected');
          
          const deploymentScore = [
            hasLegalSection,
            hasLegalRoutes, 
            hasNewFooter,
            hasStudentProtected
          ].filter(Boolean).length;
          
          resolve({
            status: res.statusCode,
            deploymentScore,
            isDeployed: deploymentScore >= 3,
            checks: {
              legalSection: hasLegalSection,
              legalRoutes: hasLegalRoutes,
              newFooter: hasNewFooter,
              studentProtected: hasStudentProtected
            }
          });
        } else {
          resolve({ status: res.statusCode, deploymentScore: 0, isDeployed: false });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 'ERROR', deploymentScore: 0, isDeployed: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', deploymentScore: 0, isDeployed: false });
    });

    req.end();
  });
}

async function monitorDeployment() {
  console.log('🔄 Starting deployment monitoring...\n');
  
  while (checkCount < MAX_CHECKS) {
    checkCount++;
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`[${timestamp}] Check ${checkCount}/${MAX_CHECKS}:`);
    
    const result = await checkDeployment();
    
    if (result.status === 200) {
      console.log(`  Status: ✅ ${result.status}`);
      console.log(`  Deployment Score: ${result.deploymentScore}/4`);
      
      if (result.checks) {
        console.log(`  Legal Section: ${result.checks.legalSection ? '✅' : '❌'}`);
        console.log(`  Legal Routes: ${result.checks.legalRoutes ? '✅' : '❌'}`);
        console.log(`  New Footer: ${result.checks.newFooter ? '✅' : '❌'}`);
        console.log(`  Student Protected: ${result.checks.studentProtected ? '✅' : '❌'}`);
      }
      
      if (result.isDeployed) {
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('✅ Footer legal integration is now live');
        console.log('✅ All legal documents should be accessible');
        console.log('\n🧪 Next Steps:');
        console.log('  1. Test the production URL manually');
        console.log('  2. Click through all legal links in footer');
        console.log('  3. Test Grade 10 assessment for APS fixes');
        console.log('  4. Run: node test-production-footer-legal.js');
        console.log(`\n🌐 Production URL: ${PRODUCTION_URL}`);
        return true;
      }
    } else {
      console.log(`  Status: ❌ ${result.status}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }
    
    if (checkCount < MAX_CHECKS) {
      console.log('  ⏳ Waiting 30 seconds for next check...\n');
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }
  
  console.log('\n⏰ MONITORING TIMEOUT');
  console.log('❌ Deployment not detected after 10 minutes');
  console.log('\n🔧 Manual Actions Required:');
  console.log('  1. Check Vercel dashboard for build status');
  console.log('  2. Look for build errors or failures');
  console.log('  3. Try manual redeploy from Vercel dashboard');
  console.log('  4. Check environment variables are set');
  console.log('\n📋 Vercel Dashboard:');
  console.log('  https://vercel.com/dashboard');
  
  return false;
}

monitorDeployment().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Monitoring failed:', error);
  process.exit(1);
});