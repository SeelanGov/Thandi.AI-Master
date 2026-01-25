#!/usr/bin/env node

/**
 * ADMIN DASHBOARD FINAL DEPLOYMENT
 * 
 * Handles deployment with Vercel cache awareness
 * Date: January 25, 2026
 */

const { execSync } = require('child_process');
const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bold');
  console.log('='.repeat(80) + '\n');
}

function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// STEP 1: PRE-DEPLOYMENT CHECKS
// ============================================================================
function preDeploymentChecks() {
  logSection('STEP 1: Pre-Deployment Checks');
  
  log('Running preflight checks...', 'cyan');
  const result = exec('node preflight-admin-dashboard-deployment.js');
  
  if (!result.success) {
    log('❌ Preflight checks failed!', 'red');
    log('Fix issues before deploying', 'yellow');
    process.exit(1);
  }
  
  log('✅ All preflight checks passed', 'green');
}

// ============================================================================
// STEP 2: CREATE DEPLOYMENT BACKUP
// ============================================================================
function createBackup() {
  logSection('STEP 2: Create Deployment Backup');
  
  const timestamp = new Date().toISOString().split('T')[0];
  const backupBranch = `backup-admin-dashboard-${timestamp}`;
  
  log(`Creating backup branch: ${backupBranch}`, 'cyan');
  
  // Create backup branch
  const createResult = exec(`git checkout -b ${backupBranch}`, { silent: true });
  if (!createResult.success) {
    log('⚠️  Could not create backup branch (may already exist)', 'yellow');
  } else {
    log(`✅ Backup branch created: ${backupBranch}`, 'green');
  }
  
  // Switch back to main
  exec('git checkout main', { silent: true });
  
  return backupBranch;
}

// ============================================================================
// STEP 3: COMMIT CHANGES
// ============================================================================
function commitChanges() {
  logSection('STEP 3: Commit Changes');
  
  // Check if there are changes to commit
  const status = exec('git status --porcelain', { silent: true });
  
  if (!status.output || !status.output.trim()) {
    log('ℹ️  No changes to commit', 'cyan');
    return false;
  }
  
  log('Changes to commit:', 'cyan');
  console.log(status.output);
  
  // Add all changes
  log('\nAdding changes...', 'cyan');
  exec('git add .');
  
  // Commit with descriptive message
  const commitMessage = 'feat: complete admin dashboard deployment with cron jobs and monitoring';
  log(`\nCommitting: ${commitMessage}`, 'cyan');
  exec(`git commit -m "${commitMessage}"`);
  
  log('✅ Changes committed', 'green');
  return true;
}

// ============================================================================
// STEP 4: PUSH TO ORIGIN
// ============================================================================
function pushToOrigin() {
  logSection('STEP 4: Push to Origin');
  
  log('Pushing to origin...', 'cyan');
  
  const result = exec('git push origin main');
  
  if (!result.success) {
    log('❌ Failed to push to origin', 'red');
    log('Error: ' + result.error, 'red');
    process.exit(1);
  }
  
  log('✅ Pushed to origin', 'green');
}

// ============================================================================
// STEP 5: MONITOR VERCEL DEPLOYMENT
// ============================================================================
function monitorDeployment() {
  logSection('STEP 5: Monitor Vercel Deployment');
  
  log('Vercel will automatically deploy from main branch', 'cyan');
  log('This typically takes 3-5 minutes', 'cyan');
  
  console.log('\n📊 Monitor deployment:');
  console.log('   1. Open Vercel Dashboard: https://vercel.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Watch deployment progress');
  console.log('   4. Check deployment logs for any errors');
  
  console.log('\n⚠️  IMPORTANT - Vercel Cache Issues:');
  console.log('   If changes are not visible after deployment:');
  console.log('   1. Wait 2-3 minutes for cache to clear');
  console.log('   2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)');
  console.log('   3. Test in incognito/private window');
  console.log('   4. If still not visible, force redeploy:');
  console.log('      vercel --prod --force');
}

// ============================================================================
// STEP 6: POST-DEPLOYMENT VERIFICATION
// ============================================================================
function postDeploymentVerification() {
  logSection('STEP 6: Post-Deployment Verification');
  
  console.log('After deployment completes, verify:');
  console.log('\n1️⃣  Dashboard Access (2 min):');
  console.log('   - Visit: https://thandi.online/admin/login');
  console.log('   - Login: admin@thandi.online / Thandi@Admin2026!');
  console.log('   - Verify: Dashboard loads and displays metrics');
  
  console.log('\n2️⃣  All Pages Work (3 min):');
  console.log('   - Dashboard: https://thandi.online/admin');
  console.log('   - Errors: https://thandi.online/admin/errors');
  console.log('   - Performance: https://thandi.online/admin/performance');
  console.log('   - Activity: https://thandi.online/admin/activity');
  
  console.log('\n3️⃣  Cron Jobs Configured (2 min):');
  console.log('   - Open Vercel Dashboard → Cron Jobs');
  console.log('   - Verify: health-check (every 5 minutes)');
  console.log('   - Verify: check-alerts (every 5 minutes)');
  
  console.log('\n4️⃣  Run Test Suites (10 min):');
  console.log('   npm run admin:test:errors');
  console.log('   npm run admin:test:performance');
  console.log('   npm run admin:test:day4');
  console.log('   npm run admin:test:health');
  console.log('   npm run admin:test:alerts');
  
  console.log('\n5️⃣  Verify Alerts (5 min):');
  console.log('   - Check Supabase: alert_configurations table');
  console.log('   - Verify: Recipients configured');
  console.log('   - Test: Trigger an alert manually');
}

// ============================================================================
// STEP 7: TROUBLESHOOTING GUIDE
// ============================================================================
function troubleshootingGuide() {
  logSection('TROUBLESHOOTING GUIDE');
  
  console.log('🔧 Common Issues and Solutions:\n');
  
  console.log('❌ Dashboard won\'t load:');
  console.log('   → Check Vercel deployment logs');
  console.log('   → Verify environment variables in Vercel');
  console.log('   → Check browser console for errors');
  console.log('   → Verify database schema is deployed\n');
  
  console.log('❌ Changes not visible (CACHE ISSUE):');
  console.log('   → Wait 2-3 minutes for Vercel cache to clear');
  console.log('   → Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)');
  console.log('   → Test in incognito/private window');
  console.log('   → Force redeploy: vercel --prod --force\n');
  
  console.log('❌ Cron jobs not running:');
  console.log('   → Check Vercel Dashboard → Cron Jobs section');
  console.log('   → Verify CRON_SECRET is set in Vercel');
  console.log('   → Check cron job logs in Vercel');
  console.log('   → Test endpoints manually\n');
  
  console.log('❌ Alerts not sending:');
  console.log('   → Verify alert_configurations table has recipients');
  console.log('   → Check RESEND_API_KEY is set in Vercel');
  console.log('   → Verify email addresses are valid');
  console.log('   → Check alert_history table for triggered alerts\n');
  
  console.log('❌ Tests failing:');
  console.log('   → Ensure dev server is running: npm run dev');
  console.log('   → Check .env.local has ADMIN_API_KEY');
  console.log('   → Verify database schema is deployed');
  console.log('   → Check test output for specific errors\n');
}

// ============================================================================
// STEP 8: NEXT STEPS
// ============================================================================
function nextSteps() {
  logSection('NEXT STEPS');
  
  console.log('📋 Immediate Actions (Required):');
  console.log('   1. Configure alert recipients in Supabase');
  console.log('      → Run: CORRECTED-ALERT-CONFIG-SQL-JAN-24-2026.sql');
  console.log('      → Replace YOUR_EMAIL@example.com with actual email');
  console.log('   2. Verify deployment in production');
  console.log('   3. Run test suites to confirm everything works');
  console.log('   4. Monitor cron jobs in Vercel Dashboard\n');
  
  console.log('📚 Documentation:');
  console.log('   - API Reference: docs/admin-dashboard-api.md');
  console.log('   - User Guide: docs/admin-dashboard-user-guide.md');
  console.log('   - Kiro Integration: docs/admin-dashboard-kiro-integration.md\n');
  
  console.log('🎯 Optional (Week 3):');
  console.log('   - Performance optimization');
  console.log('   - User feedback integration');
  console.log('   - Kiro AI integration testing\n');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                            ║', 'cyan');
  log('║              ADMIN DASHBOARD - FINAL DEPLOYMENT SCRIPT                    ║', 'cyan');
  log('║                                                                            ║', 'cyan');
  log('║                        Date: January 25, 2026                             ║', 'cyan');
  log('║                                                                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  
  console.log('\n⚠️  This script will:');
  console.log('   1. Run preflight checks');
  console.log('   2. Create backup branch');
  console.log('   3. Commit changes');
  console.log('   4. Push to origin (triggers Vercel deployment)');
  console.log('   5. Provide verification instructions\n');
  
  // Prompt for confirmation
  console.log('Press Ctrl+C to cancel, or press Enter to continue...');
  
  try {
    // Run deployment steps
    preDeploymentChecks();
    const backupBranch = createBackup();
    const hasChanges = commitChanges();
    
    if (hasChanges) {
      pushToOrigin();
    } else {
      log('ℹ️  No changes to deploy', 'cyan');
    }
    
    monitorDeployment();
    postDeploymentVerification();
    troubleshootingGuide();
    nextSteps();
    
    // Success summary
    logSection('🎉 DEPLOYMENT INITIATED');
    log('✅ Code pushed to origin', 'green');
    log('✅ Vercel deployment triggered', 'green');
    log('⏳ Waiting for deployment to complete (3-5 minutes)', 'yellow');
    
    console.log('\n📊 Monitor deployment at: https://vercel.com/dashboard');
    console.log('📖 Follow verification steps above');
    console.log('\n🚀 Admin Dashboard deployment in progress!\n');
    
    if (backupBranch) {
      console.log(`💾 Backup branch created: ${backupBranch}`);
      console.log(`   Rollback command: git checkout ${backupBranch}\n`);
    }
    
  } catch (error) {
    log('\n❌ Deployment failed!', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
