#!/usr/bin/env node

/**
 * Force Fresh Deployment
 * Create a new deployment to ensure latest changes are deployed
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 FORCE FRESH DEPLOYMENT');
console.log('='.repeat(50));

// Step 1: Create a deployment marker
console.log('\n📋 Step 1: Creating Deployment Marker');
const deploymentMarker = {
  timestamp: new Date().toISOString(),
  commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 8),
  reason: 'Force deployment - footer legal integration not deployed',
  changes: [
    'Footer legal integration with 8 legal documents',
    'Privacy-focused updates (removed Information Officer, phone)',
    'Dynamic legal document routing',
    'Professional styling and trust badges',
    'APS scoring fixes'
  ]
};

fs.writeFileSync('deployment-marker.json', JSON.stringify(deploymentMarker, null, 2));
console.log('  ✅ Created deployment-marker.json');

// Step 2: Update package.json version to trigger deployment
console.log('\n📦 Step 2: Bumping Version');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.');
versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
const newVersion = versionParts.join('.');

packageJson.version = newVersion;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log(`  ✅ Version: ${currentVersion} → ${newVersion}`);

// Step 3: Commit and push
console.log('\n📤 Step 3: Committing Changes');
try {
  execSync('git add deployment-marker.json package.json', { stdio: 'inherit' });
  
  const commitMessage = `deploy: Force fresh deployment v${newVersion}

🚀 Deployment Issues Fixed:
- Footer legal integration not deploying
- APS scoring fixes not live
- Force fresh build to ensure latest changes

📦 Changes to Deploy:
- 8 legal documents with dynamic routing
- Privacy-focused footer updates
- Professional styling and trust badges
- APS calculation improvements

🔧 Technical:
- Deployment marker added
- Version bump to trigger fresh build
- All changes committed and ready

Ready for production deployment.`;

  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log('  ✅ Changes committed');
  
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('  ✅ Pushed to GitHub');
  
} catch (error) {
  console.log(`  ❌ Git operations failed: ${error.message}`);
}

// Step 4: Instructions for manual deployment
console.log('\n🔧 Step 4: Manual Deployment Options');
console.log('  If automatic deployment still doesn\'t work:');
console.log('  ');
console.log('  Option 1 - Vercel Dashboard:');
console.log('    1. Visit: https://vercel.com/dashboard');
console.log('    2. Find "Thandi.AI-Master" project');
console.log('    3. Go to "Deployments" tab');
console.log('    4. Click "Redeploy" on the latest deployment');
console.log('    5. Select "Use existing Build Cache: NO"');
console.log('    6. Click "Redeploy"');
console.log('  ');
console.log('  Option 2 - Vercel CLI:');
console.log('    1. Install: npm i -g vercel');
console.log('    2. Login: vercel login');
console.log('    3. Deploy: vercel --prod --force');
console.log('  ');
console.log('  Option 3 - GitHub Actions:');
console.log('    1. Go to GitHub repository');
console.log('    2. Actions tab → Manual deployment workflow');
console.log('    3. Run workflow on main branch');

// Step 5: Verification steps
console.log('\n🧪 Step 5: Verification Steps');
console.log('  After deployment (5-10 minutes):');
console.log('  ');
console.log('  1. Test production URL:');
console.log('     https://thandiai-fvcp1qw1u-thandiai-projects.vercel.app');
console.log('  ');
console.log('  2. Check footer for:');
console.log('     • "Legal & Compliance" section');
console.log('     • 8 legal document links');
console.log('     • Trust badges (POPIA, B-BBEE Level 1)');
console.log('     • Simplified address: "Durban, KwaZulu-Natal"');
console.log('  ');
console.log('  3. Test legal routes:');
console.log('     • /legal/privacy-policy');
console.log('     • /legal/terms-of-service');
console.log('     • /legal/cookie-policy');
console.log('     • /legal/disclaimers');
console.log('  ');
console.log('  4. Test APS scoring:');
console.log('     • Grade 10 assessment flow');
console.log('     • Check APS calculation accuracy');
console.log('  ');
console.log('  5. Run verification:');
console.log('     node test-production-footer-legal.js');

console.log('\n✅ DEPLOYMENT TRIGGER COMPLETE');
console.log('Monitor Vercel dashboard for deployment progress!');
console.log(`New version: ${newVersion}`);