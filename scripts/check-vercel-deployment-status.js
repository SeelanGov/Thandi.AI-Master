#!/usr/bin/env node

/**
 * Check Vercel Deployment Status
 * Verify current deployment and alignment with local changes
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

console.log('🚀 Checking Vercel Deployment Status\n');

async function checkDeploymentInfo() {
  console.log('📋 Deployment Information:');
  
  // Check if we have deployment info
  try {
    const fs = await import('fs');
    if (fs.existsSync('deployment-info.json')) {
      const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
      console.log(`   📅 Last deployment: ${deploymentInfo.timestamp || 'Unknown'}`);
      console.log(`   🔗 URL: ${deploymentInfo.url || 'Not found'}`);
      console.log(`   📝 Version: ${deploymentInfo.version || 'Unknown'}`);
    } else {
      console.log('   ⚠️  No deployment-info.json found');
    }
  } catch (error) {
    console.log('   ⚠️  Could not read deployment info');
  }
  
  // Check environment variables
  console.log('\n🔧 Environment Configuration:');
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];
  
  requiredEnvs.forEach(env => {
    if (process.env[env]) {
      console.log(`   ✅ ${env}: Configured`);
    } else {
      console.log(`   ❌ ${env}: Missing`);
    }
  });
}

async function checkLiveEndpoints() {
  console.log('\n🌐 Testing Live Endpoints:');
  
  // We'll need to determine the actual Vercel URL
  const possibleUrls = [
    'https://thandi-ai-master.vercel.app',
    'https://thandi-ai.vercel.app',
    'https://thandi.vercel.app'
  ];
  
  console.log('   📋 Potential URLs to check:');
  possibleUrls.forEach(url => {
    console.log(`      - ${url}`);
  });
  
  console.log('\n   ℹ️  Manual verification needed for live endpoints');
  console.log('   ℹ️  Use browser or curl to test actual deployment');
}

async function checkGitAlignment() {
  console.log('\n📦 Git Alignment Check:');
  
  try {
    const { execSync } = await import('child_process');
    
    // Check current branch
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`   📍 Current branch: ${branch}`);
    
    // Check last commit
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    console.log(`   📝 Last commit: ${lastCommit}`);
    
    // Check if there are uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status) {
      console.log(`   ⚠️  Uncommitted changes found:`);
      const lines = status.split('\n').slice(0, 5); // Show first 5 changes
      lines.forEach(line => console.log(`      ${line}`));
      if (status.split('\n').length > 5) {
        console.log(`      ... and ${status.split('\n').length - 5} more`);
      }
    } else {
      console.log('   ✅ No uncommitted changes');
    }
    
  } catch (error) {
    console.log('   ⚠️  Could not check git status');
  }
}

async function generateAlignmentReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT ALIGNMENT REPORT');
  console.log('='.repeat(60));
  
  console.log('\n🎯 Next Steps for Alignment:');
  console.log('   1. Verify Vercel deployment URL');
  console.log('   2. Test live endpoints manually');
  console.log('   3. Check environment variables in Vercel dashboard');
  console.log('   4. Ensure database migrations are applied');
  console.log('   5. Test core functionality end-to-end');
  
  console.log('\n🔧 Commands to run:');
  console.log('   # Check Vercel deployments');
  console.log('   vercel ls');
  console.log('   ');
  console.log('   # Deploy latest changes');
  console.log('   vercel --prod');
  console.log('   ');
  console.log('   # Test live deployment');
  console.log('   node scripts/test-live-deployment.js');
  
  console.log('\n📋 Manual Verification Checklist:');
  console.log('   □ Landing page loads correctly');
  console.log('   □ Assessment flow works for all grades');
  console.log('   □ School search returns results');
  console.log('   □ Results generation functions');
  console.log('   □ THANDI branding is consistent');
  console.log('   □ No console errors in browser');
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
  try {
    await checkDeploymentInfo();
    await checkLiveEndpoints();
    await checkGitAlignment();
    await generateAlignmentReport();
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
  }
}

main();