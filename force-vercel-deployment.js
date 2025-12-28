#!/usr/bin/env node

/**
 * Force Vercel Deployment
 * Triggers a new deployment to ensure latest changes are deployed
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 FORCE VERCEL DEPLOYMENT');
console.log('='.repeat(50));

// Step 1: Check current commit
console.log('\n📋 Step 1: Checking Current Commit');
try {
  const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const shortCommit = currentCommit.substring(0, 8);
  console.log(`  Current commit: ${shortCommit}`);
  
  const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  console.log(`  Message: ${commitMessage.split('\n')[0]}`);
} catch (error) {
  console.log(`  ❌ Error checking commit: ${error.message}`);
}

// Step 2: Create deployment trigger file
console.log('\n🔄 Step 2: Creating Deployment Trigger');
const triggerContent = `# Deployment Trigger - ${new Date().toISOString()}

This file triggers a new Vercel deployment to ensure the latest footer legal integration changes are deployed.

## Changes to Deploy:
- Footer legal integration with 8 legal documents
- Privacy-focused updates (removed Information Officer, phone number)
- Dynamic legal document routing
- Professional styling and trust badges

## Commit: ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 8)}
## Timestamp: ${new Date().toISOString()}
`;

fs.writeFileSync('DEPLOYMENT-TRIGGER.md', triggerContent);
console.log('  ✅ Created DEPLOYMENT-TRIGGER.md');

// Step 3: Commit and push trigger
console.log('\n📤 Step 3: Pushing Deployment Trigger');
try {
  execSync('git add DEPLOYMENT-TRIGGER.md', { stdio: 'inherit' });
  execSync('git commit -m "trigger: Force deployment for footer legal integration"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('  ✅ Deployment trigger pushed to GitHub');
} catch (error) {
  console.log(`  ❌ Error pushing trigger: ${error.message}`);
}

// Step 4: Instructions
console.log('\n📋 Step 4: Manual Deployment Options');
console.log('  If automatic deployment doesn\'t start:');
console.log('  1. Visit: https://vercel.com/dashboard');
console.log('  2. Find your "Thandi.AI-Master" project');
console.log('  3. Click "Deployments" tab');
console.log('  4. Click "Redeploy" on the latest deployment');
console.log('  5. Or click "Deploy" to create a new deployment');

console.log('\n⏱️  Step 5: Wait and Monitor');
console.log('  • Deployment typically takes 2-5 minutes');
console.log('  • Check Vercel dashboard for build progress');
console.log('  • Test the production URL once deployment completes');

console.log('\n🔗 Production URLs to Test:');
console.log('  • Main: https://thandiai-fvcp1qw1u-thandiai-projects.vercel.app');
console.log('  • Legal: https://thandiai-fvcp1qw1u-thandiai-projects.vercel.app/legal/privacy-policy');

console.log('\n✅ DEPLOYMENT TRIGGER COMPLETE');
console.log('Monitor Vercel dashboard for deployment progress!');