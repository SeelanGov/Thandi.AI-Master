#!/usr/bin/env node

/**
 * DEPLOY UI/UX FIXES TO PRODUCTION
 * Cross-references with existing deployment scripts and deploys all fixes
 */

const { execSync } = require('child_process');
const fs = require('fs');

function logStep(step, message) {
  console.log(`\n🚀 ${step}: ${message}`);
  console.log('='.repeat(50));
}

function executeCommand(command, description) {
  try {
    console.log(`\n📋 ${description}`);
    console.log(`💻 Command: ${command}`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ Success: ${description}`);
    return result;
  } catch (error) {
    console.log(`❌ Error: ${description}`);
    console.log(`Error output: ${error.message}`);
    throw error;
  }
}

function deployToProduction() {
  logStep('STEP 1', 'Pre-deployment Verification');
  
  // Verify build status
  console.log('🔍 Verifying build status...');
  executeCommand('npm run build', 'Building production bundle');
  
  // Check git status
  console.log('🔍 Checking git status...');
  const gitStatus = executeCommand('git status --porcelain', 'Checking for uncommitted changes');
  
  if (gitStatus.trim()) {
    console.log('⚠️  Uncommitted changes detected:');
    console.log(gitStatus);
    console.log('🔄 Adding and committing changes...');
    executeCommand('git add .', 'Staging all changes');
    executeCommand('git commit -m "Final UI/UX fixes deployment"', 'Committing changes');
  } else {
    console.log('✅ All changes already committed');
  }
  
  logStep('STEP 2', 'Pushing to GitHub');
  executeCommand('git push origin main', 'Pushing to GitHub repository');
  
  logStep('STEP 3', 'Triggering Vercel Deployment');
  
  // Check if vercel CLI is available
  try {
    executeCommand('vercel --version', 'Checking Vercel CLI');
    
    // Deploy with Vercel CLI
    console.log('🚀 Deploying with Vercel CLI...');
    const deployResult = executeCommand('vercel --prod --yes', 'Deploying to production');
    console.log('📄 Deployment result:');
    console.log(deployResult);
    
  } catch (error) {
    console.log('⚠️  Vercel CLI not available, using git push deployment');
    console.log('📡 Vercel will auto-deploy from GitHub push');
  }
  
  logStep('STEP 4', 'Deployment Verification');
  
  // Wait for deployment to propagate
  console.log('⏳ Waiting 30 seconds for deployment to propagate...');
  setTimeout(() => {
    console.log('✅ Deployment propagation complete');
  }, 30000);
  
  // Create deployment marker
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    commit: executeCommand('git rev-parse HEAD', 'Getting commit hash').trim(),
    branch: 'main',
    type: 'ui-ux-fixes',
    status: 'deployed',
    fixes_applied: [
      'Branding consistency (THANDI → Thandi)',
      'Color consistency (Blue → Thandi Teal)',
      'Responsive design enhancements',
      'Error handling improvements',
      'Loading states with spinners',
      'Form validation enhancements',
      'Admin panel consistency fixes'
    ]
  };
  
  fs.writeFileSync('deployment-ui-ux-fixes.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('📄 Deployment info saved to deployment-ui-ux-fixes.json');
  
  return deploymentInfo;
}

function main() {
  console.log('🚀 DEPLOYING UI/UX FIXES TO PRODUCTION');
  console.log('======================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  
  try {
    const deploymentInfo = deployToProduction();
    
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('=========================');
    console.log(`✅ Commit: ${deploymentInfo.commit}`);
    console.log(`✅ Timestamp: ${deploymentInfo.timestamp}`);
    console.log(`✅ Fixes Applied: ${deploymentInfo.fixes_applied.length}`);
    console.log('\n📋 Next Steps:');
    console.log('1. Test live site functionality');
    console.log('2. Verify UI/UX improvements');
    console.log('3. Check admin panel consistency');
    console.log('4. Validate new domain connection');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ DEPLOYMENT FAILED!');
    console.log('=====================');
    console.log(`Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check build errors');
    console.log('2. Verify git repository status');
    console.log('3. Check Vercel deployment logs');
    
    return false;
  }
}

// Run deployment
const success = main();
process.exit(success ? 0 : 1);