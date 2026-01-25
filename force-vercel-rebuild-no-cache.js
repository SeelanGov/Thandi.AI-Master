#!/usr/bin/env node

/**
 * FORCE VERCEL REBUILD WITHOUT CACHE
 * Permanent solution for Day 8 deployment issue
 * 
 * This script forces Vercel to rebuild without using cached build artifacts,
 * which is the ONLY way to fix the route manifest caching issue.
 */

const { execSync } = require('child_process');
const https = require('https');

console.log('🚀 FORCE VERCEL REBUILD - NO CACHE');
console.log('='.repeat(60));
console.log('');

// Step 1: Verify we're on the right commit
console.log('📋 Step 1: Verifying Git Status');
console.log('-'.repeat(60));

try {
  const currentCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  
  console.log(`✅ Current Branch: ${currentBranch}`);
  console.log(`✅ Current Commit: ${currentCommit}`);
  console.log(`✅ Expected Commit: a8e84e00`);
  
  if (!currentCommit.startsWith('a8e84e0')) {
    console.log('');
    console.log('⚠️  WARNING: Not on expected commit');
    console.log('   Expected: a8e84e00 (Day 8 chart components fix)');
    console.log(`   Current:  ${currentCommit}`);
    console.log('');
    console.log('   Proceeding anyway...');
  }
} catch (error) {
  console.error('❌ Git check failed:', error.message);
  process.exit(1);
}

console.log('');

// Step 2: Trigger Vercel deployment without cache
console.log('🔨 Step 2: Triggering Vercel Rebuild (NO CACHE)');
console.log('-'.repeat(60));
console.log('');
console.log('This will:');
console.log('  1. Force Vercel to rebuild from scratch');
console.log('  2. Regenerate all route manifests');
console.log('  3. Deploy fresh build to production');
console.log('');
console.log('⏳ Starting deployment...');
console.log('');

try {
  // Use --force flag to skip cache
  const output = execSync('vercel --prod --force --yes', {
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  console.log('');
  console.log('✅ Deployment triggered successfully!');
  console.log('');
} catch (error) {
  console.error('');
  console.error('❌ Deployment failed:', error.message);
  console.error('');
  console.error('MANUAL FALLBACK REQUIRED:');
  console.error('1. Go to https://vercel.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to Deployments tab');
  console.error('4. Click "..." on latest deployment');
  console.error('5. Click "Redeploy"');
  console.error('6. UNCHECK "Use existing Build Cache"');
  console.error('7. Click "Redeploy"');
  console.error('');
  process.exit(1);
}

// Step 3: Wait for deployment to complete
console.log('⏳ Step 3: Waiting for Deployment to Complete');
console.log('-'.repeat(60));
console.log('');
console.log('Vercel is rebuilding from scratch...');
console.log('This typically takes 2-3 minutes.');
console.log('');

// Wait 30 seconds before starting checks
console.log('Waiting 30 seconds for build to start...');
setTimeout(() => {
  console.log('');
  console.log('🔍 Step 4: Monitoring Deployment Progress');
  console.log('-'.repeat(60));
  console.log('');
  console.log('Checking deployment status every 15 seconds...');
  console.log('');
  
  let attempts = 0;
  const maxAttempts = 12; // 3 minutes total
  
  const checkInterval = setInterval(async () => {
    attempts++;
    
    // Test if Day 8 pages are accessible
    const testUrl = 'https://thandi.vercel.app/admin/errors';
    
    https.get(testUrl, (res) => {
      if (res.statusCode === 200) {
        clearInterval(checkInterval);
        console.log('');
        console.log('✅ SUCCESS! Day 8 pages are now accessible!');
        console.log('');
        console.log('🎉 DEPLOYMENT COMPLETE');
        console.log('='.repeat(60));
        console.log('');
        console.log('Next steps:');
        console.log('1. Run verification test:');
        console.log('   node test-day8-vercel-deployment-jan-22-2026.js');
        console.log('');
        console.log('2. Expected result: 8/8 tests passing (100%)');
        console.log('');
        console.log('3. Test in browser:');
        console.log('   - https://thandi.vercel.app/admin/errors');
        console.log('   - https://thandi.vercel.app/admin/performance');
        console.log('   - https://thandi.vercel.app/admin/activity');
        console.log('');
        process.exit(0);
      } else {
        console.log(`Attempt ${attempts}/${maxAttempts}: Still building... (Status: ${res.statusCode})`);
        
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.log('');
          console.log('⏱️  Deployment is taking longer than expected');
          console.log('');
          console.log('This is normal for fresh builds. Please:');
          console.log('1. Wait another 2-3 minutes');
          console.log('2. Run verification test:');
          console.log('   node test-day8-vercel-deployment-jan-22-2026.js');
          console.log('');
          console.log('If still failing after 10 minutes total:');
          console.log('1. Check Vercel dashboard for build errors');
          console.log('2. Look for deployment logs');
          console.log('');
          process.exit(1);
        }
      }
    }).on('error', (error) => {
      console.log(`Attempt ${attempts}/${maxAttempts}: Network error (${error.message})`);
      
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('');
        console.log('⚠️  Unable to verify deployment');
        console.log('');
        console.log('Please manually verify:');
        console.log('1. Go to https://vercel.com/dashboard');
        console.log('2. Check deployment status');
        console.log('3. Run: node test-day8-vercel-deployment-jan-22-2026.js');
        console.log('');
        process.exit(1);
      }
    });
  }, 15000); // Check every 15 seconds
  
}, 30000); // Wait 30 seconds before starting checks
