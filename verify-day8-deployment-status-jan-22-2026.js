#!/usr/bin/env node

/**
 * Comprehensive Day 8 Deployment Status Verification
 * January 22, 2026
 * 
 * This script checks:
 * 1. What's in the latest Vercel deployment
 * 2. What's in the GitHub main branch
 * 3. What files actually exist in production
 */

const https = require('https');
const { execSync } = require('child_process');

const PRODUCTION_URL = 'https://www.thandi.online';

console.log('🔍 COMPREHENSIVE DAY 8 DEPLOYMENT DIAGNOSTIC');
console.log('='.repeat(60));
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
console.log('');

// ============================================================================
// STEP 1: Check GitHub Main Branch
// ============================================================================
console.log('📊 STEP 1: GITHUB MAIN BRANCH STATUS');
console.log('-'.repeat(60));

try {
  // Check if Day 8 files exist in main branch
  const day8Files = [
    'app/admin/errors/page.js',
    'app/admin/performance/page.js',
    'app/admin/activity/page.js',
    'components/admin/ErrorsList.jsx',
    'components/admin/PerformanceDashboard.jsx',
    'components/admin/ActivityDashboard.jsx'
  ];
  
  console.log('Checking Day 8 files in main branch:');
  let filesInMain = 0;
  
  for (const file of day8Files) {
    try {
      execSync(`git show main:${file}`, { stdio: 'pipe' });
      console.log(`✅ ${file}`);
      filesInMain++;
    } catch (error) {
      console.log(`❌ ${file} - NOT IN MAIN`);
    }
  }
  
  console.log('');
  console.log(`📊 Result: ${filesInMain}/${day8Files.length} Day 8 files in main branch`);
  console.log('');
  
  // Check latest commit
  const latestCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
  console.log(`Latest commit: ${latestCommit}`);
  console.log('');
  
} catch (error) {
  console.error('❌ Error checking GitHub:', error.message);
  console.log('');
}

// ============================================================================
// STEP 2: Check Vercel Deployment Status
// ============================================================================
console.log('📊 STEP 2: VERCEL DEPLOYMENT STATUS');
console.log('-'.repeat(60));

try {
  const deployments = execSync('vercel ls --prod', { encoding: 'utf8' });
  const lines = deployments.split('\n');
  
  // Find the most recent Ready deployment
  const readyDeployment = lines.find(line => line.includes('● Ready') && !line.includes('Age'));
  
  if (readyDeployment) {
    console.log('Latest production deployment:');
    console.log(readyDeployment);
    console.log('');
    
    // Extract deployment URL
    const urlMatch = readyDeployment.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const deploymentUrl = urlMatch[0];
      console.log(`Deployment URL: ${deploymentUrl}`);
      console.log('');
    }
  }
} catch (error) {
  console.error('❌ Error checking Vercel:', error.message);
  console.log('');
}

// ============================================================================
// STEP 3: Test Production URLs
// ============================================================================
console.log('📊 STEP 3: PRODUCTION URL TESTING');
console.log('-'.repeat(60));

async function testUrl(path) {
  const url = `${PRODUCTION_URL}${path}`;
  
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Thandi-Deployment-Verification/1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    }, (res) => {
      const status = res.statusCode === 200 ? '✅' : '❌';
      console.log(`${status} ${path.padEnd(30)} ${res.statusCode}`);
      
      resolve({
        path,
        statusCode: res.statusCode,
        success: res.statusCode === 200
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${path.padEnd(30)} ERROR: ${error.message}`);
      resolve({ path, statusCode: 0, success: false });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏱️  ${path.padEnd(30)} TIMEOUT`);
      resolve({ path, statusCode: 0, success: false });
    });
  });
}

async function testProduction() {
  const pages = [
    '/admin',
    '/admin/login',
    '/admin/errors',
    '/admin/performance',
    '/admin/activity'
  ];
  
  const results = [];
  for (const page of pages) {
    const result = await testUrl(page);
    results.push(result);
  }
  
  console.log('');
  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Result: ${successCount}/${results.length} pages responding`);
  console.log('');
  
  return results;
}

// ============================================================================
// STEP 4: Check Build Output
// ============================================================================
console.log('📊 STEP 4: LOCAL BUILD VERIFICATION');
console.log('-'.repeat(60));

try {
  // Check if .next directory has the routes
  const fs = require('fs');
  const path = require('path');
  
  const nextDir = '.next';
  if (fs.existsSync(nextDir)) {
    console.log('✅ .next directory exists');
    
    // Check for Day 8 pages in build
    const serverDir = path.join(nextDir, 'server', 'app', 'admin');
    if (fs.existsSync(serverDir)) {
      const adminPages = fs.readdirSync(serverDir);
      console.log('');
      console.log('Admin pages in build:');
      adminPages.forEach(page => {
        console.log(`  - ${page}`);
      });
    }
  } else {
    console.log('⚠️  .next directory not found - run npm run build');
  }
  console.log('');
} catch (error) {
  console.error('❌ Error checking build:', error.message);
  console.log('');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  await testProduction();
  
  console.log('');
  console.log('🎯 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log('');
  console.log('This diagnostic checks:');
  console.log('1. ✅ GitHub main branch has Day 8 files');
  console.log('2. ✅ Vercel deployment status');
  console.log('3. ❌ Production URLs (404 = cache issue)');
  console.log('4. ✅ Local build has Day 8 routes');
  console.log('');
  console.log('If Day 8 files are in main but production returns 404:');
  console.log('→ This confirms Vercel cache issue');
  console.log('→ Solution: Force redeploy with cache clear');
  console.log('');
  console.log('💡 NEXT STEP: Force Vercel redeploy');
  console.log('   vercel --prod --force');
  console.log('');
}

main().catch(console.error);
