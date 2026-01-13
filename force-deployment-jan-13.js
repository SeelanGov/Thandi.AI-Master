#!/usr/bin/env node

/**
 * FORCE DEPLOYMENT - JAN 13 2026
 * 
 * Force a fresh deployment to ensure Phase 0 components are live
 */

const { execSync } = require('child_process');

function executeCommand(command) {
  console.log(`🔄 Executing: ${command}`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    return { success: true, output: result };
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 FORCE DEPLOYMENT - JAN 13 2026');
  console.log('='.repeat(50));
  
  // Step 1: Check git status
  console.log('\n📋 Step 1: Check git status');
  executeCommand('git status --porcelain');
  
  // Step 2: Add any remaining files
  console.log('\n📋 Step 2: Add remaining Phase 0 files');
  executeCommand('git add .');
  
  // Step 3: Check if there are changes to commit
  const statusResult = executeCommand('git status --porcelain');
  
  if (statusResult.success) {
    // Step 4: Commit if there are changes
    console.log('\n📋 Step 3: Commit changes');
    executeCommand('git commit -m "fix: ensure all Phase 0 components are committed for deployment"');
    
    // Step 5: Push to trigger deployment
    console.log('\n📋 Step 4: Push to trigger deployment');
    executeCommand('git push origin main');
  } else {
    console.log('\n✅ No changes to commit - triggering empty commit to force deployment');
    executeCommand('git commit --allow-empty -m "deploy: force fresh deployment of Phase 0 components"');
    executeCommand('git push origin main');
  }
  
  console.log('\n🎯 Deployment triggered successfully!');
  console.log('⏳ Wait 2-3 minutes for Vercel deployment to complete');
  console.log('📊 Then run: node comprehensive-phase0-verification.js');
  console.log('='.repeat(50));
}

main().catch(console.error);