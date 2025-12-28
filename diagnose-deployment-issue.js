#!/usr/bin/env node

/**
 * Diagnose Deployment Issue
 * Check why recent changes aren't deploying to production
 */

import { execSync } from 'child_process';
import fs from 'fs';
import https from 'https';

console.log('🔍 DEPLOYMENT ISSUE DIAGNOSIS');
console.log('='.repeat(60));

// Step 1: Check Git status
console.log('\n📋 Step 1: Git Status Check');
try {
  const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const shortCommit = currentCommit.substring(0, 8);
  console.log(`  Current commit: ${shortCommit}`);
  
  const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();
  const shortRemote = remoteCommit.substring(0, 8);
  console.log(`  Remote commit: ${shortRemote}`);
  
  if (currentCommit === remoteCommit) {
    console.log('  ✅ Local and remote are in sync');
  } else {
    console.log('  ❌ Local and remote are out of sync');
  }
  
  // Check recent commits
  console.log('\n  📝 Recent commits:');
  const recentCommits = execSync('git log --oneline -3', { encoding: 'utf8' });
  console.log(recentCommits.split('\n').map(line => `    ${line}`).join('\n'));
  
} catch (error) {
  console.log(`  ❌ Git check failed: ${error.message}`);
}

// Step 2: Check key files exist
console.log('\n📁 Step 2: Key Files Check');
const keyFiles = [
  'app/components/Footer.jsx',
  'app/legal/[slug]/page.jsx',
  'app/legal/components/PrintButton.jsx',
  'legal/privacy-policy.md',
  'legal/terms-of-service.md'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`  ✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

// Step 3: Check production URL
console.log('\n🌐 Step 3: Production URL Check');
const PRODUCTION_URL = 'https://thandiai-fvcp1qw1u-thandiai-projects.vercel.app';

const testProduction = () => {
  return new Promise((resolve) => {
    const url = new URL(PRODUCTION_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Thandi.ai-Deployment-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          // Check for deployment indicators
          const hasLegalSection = data.includes('Legal & Compliance');
          const hasLegalRoutes = data.includes('/legal/privacy-policy');
          const hasNewFooter = data.includes('B-BBEE Level 1');
          
          console.log(`  Legal Section: ${hasLegalSection ? '✅' : '❌'}`);
          console.log(`  Legal Routes: ${hasLegalRoutes ? '✅' : '❌'}`);
          console.log(`  New Footer: ${hasNewFooter ? '✅' : '❌'}`);
          
          resolve({
            status: res.statusCode,
            hasUpdates: hasLegalSection && hasLegalRoutes && hasNewFooter
          });
        } else {
          resolve({ status: res.statusCode, hasUpdates: false });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ Request failed: ${error.message}`);
      resolve({ status: 'ERROR', hasUpdates: false });
    });

    req.on('timeout', () => {
      console.log(`  ❌ Request timeout`);
      req.destroy();
      resolve({ status: 'TIMEOUT', hasUpdates: false });
    });

    req.end();
  });
};

// Step 4: Check deployment info
console.log('\n📄 Step 4: Deployment Info Check');
if (fs.existsSync('deployment-info.json')) {
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  console.log(`  Last deployment: ${deploymentInfo.timestamp}`);
  console.log(`  URL: ${deploymentInfo.url}`);
  console.log(`  Status: ${deploymentInfo.status}`);
  
  const deploymentAge = Date.now() - new Date(deploymentInfo.timestamp).getTime();
  const hoursOld = Math.round(deploymentAge / (1000 * 60 * 60));
  console.log(`  Age: ${hoursOld} hours old`);
} else {
  console.log('  ❌ No deployment-info.json found');
}

// Step 5: Check vercel.json
console.log('\n⚙️ Step 5: Vercel Config Check');
if (fs.existsSync('vercel.json')) {
  console.log('  ✅ vercel.json exists');
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log(`  Version: ${vercelConfig.version || 'not specified'}`);
} else {
  console.log('  ❌ vercel.json missing');
}

// Main execution
async function diagnoseDeployment() {
  const productionResult = await testProduction();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSIS SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n🌐 Production Status: ${productionResult.status}`);
  console.log(`📦 Has Updates: ${productionResult.hasUpdates ? '✅ YES' : '❌ NO'}`);
  
  if (!productionResult.hasUpdates) {
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('  1. Check Vercel dashboard for build failures');
    console.log('  2. Force redeploy from Vercel dashboard');
    console.log('  3. Check environment variables are set');
    console.log('  4. Verify GitHub webhook is working');
    console.log('  5. Try manual deployment with Vercel CLI');
    
    console.log('\n💡 QUICK FIXES:');
    console.log('  • Visit: https://vercel.com/dashboard');
    console.log('  • Find "Thandi.AI-Master" project');
    console.log('  • Click "Redeploy" on latest deployment');
    console.log('  • Or run: vercel --prod');
  } else {
    console.log('\n✅ Production appears to be up to date!');
  }
  
  console.log(`\n🔗 Test URL: ${PRODUCTION_URL}`);
}

diagnoseDeployment().catch(console.error);