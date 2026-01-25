#!/usr/bin/env node

/**
 * PREFLIGHT CHECK - ADMIN DASHBOARD DEPLOYMENT
 * 
 * Comprehensive pre-deployment verification with Vercel cache awareness
 * Date: January 25, 2026
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const results = {
  passed: [],
  failed: [],
  warnings: [],
  info: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bold');
  console.log('='.repeat(80) + '\n');
}

function pass(message) {
  results.passed.push(message);
  log(`✅ ${message}`, 'green');
}

function fail(message) {
  results.failed.push(message);
  log(`❌ ${message}`, 'red');
}

function warn(message) {
  results.warnings.push(message);
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  results.info.push(message);
  log(`ℹ️  ${message}`, 'cyan');
}

// ============================================================================
// CHECK 1: GIT STATUS
// ============================================================================
function checkGitStatus() {
  logSection('CHECK 1: Git Status');
  
  try {
    // Check if we're in a git repo
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    pass('Git repository detected');
    
    // Check current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    info(`Current branch: ${branch}`);
    
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      warn('Uncommitted changes detected');
      info('Files to commit:');
      status.split('\n').filter(Boolean).forEach(line => {
        console.log(`  ${line}`);
      });
    } else {
      pass('No uncommitted changes');
    }
    
    // Check if we're ahead of origin
    try {
      const ahead = execSync('git rev-list --count @{u}..HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (parseInt(ahead) > 0) {
        warn(`${ahead} commit(s) not pushed to origin`);
      } else {
        pass('All commits pushed to origin');
      }
    } catch (e) {
      warn('Could not check remote status (no upstream branch?)');
    }
    
  } catch (error) {
    fail('Not a git repository or git not available');
  }
}

// ============================================================================
// CHECK 2: CRITICAL FILES EXIST
// ============================================================================
function checkCriticalFiles() {
  logSection('CHECK 2: Critical Files');
  
  const criticalFiles = [
    // Admin Dashboard Core
    'app/admin/page.js',
    'app/admin/login/page.js',
    'app/admin/errors/page.js',
    'app/admin/performance/page.js',
    'app/admin/activity/page.js',
    
    // API Endpoints
    'app/api/admin/auth/login/route.js',
    'app/api/admin/dashboard/overview/route.js',
    'app/api/admin/errors/route.js',
    'app/api/admin/errors/log/route.js',
    'app/api/admin/performance/route.js',
    'app/api/admin/activity/route.js',
    'app/api/admin/health/route.js',
    'app/api/admin/alerts/config/route.js',
    
    // Cron Jobs
    'app/api/cron/health-check/route.js',
    'app/api/cron/check-alerts/route.js',
    
    // Libraries
    'lib/admin/auth.js',
    'lib/admin/error-logger.js',
    'lib/admin/performance-analyzer.js',
    'lib/admin/activity-analyzer.js',
    'lib/admin/health-checker.js',
    'lib/admin/alert-engine.js',
    
    // Configuration
    'vercel.json',
    'next.config.js',
    'package.json',
    
    // Documentation
    'docs/admin-dashboard-api.md',
    'docs/admin-dashboard-user-guide.md',
    'docs/admin-dashboard-kiro-integration.md'
  ];
  
  let allExist = true;
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      pass(`${file}`);
    } else {
      fail(`Missing: ${file}`);
      allExist = false;
    }
  });
  
  if (allExist) {
    pass('All critical files present');
  }
}

// ============================================================================
// CHECK 3: VERCEL.JSON CONFIGURATION
// ============================================================================
function checkVercelConfig() {
  logSection('CHECK 3: Vercel Configuration');
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    pass('vercel.json is valid JSON');
    
    // Check cron jobs
    if (vercelConfig.crons && Array.isArray(vercelConfig.crons)) {
      pass(`${vercelConfig.crons.length} cron job(s) configured`);
      
      vercelConfig.crons.forEach(cron => {
        info(`  - ${cron.path} (${cron.schedule})`);
      });
      
      // Verify critical cron jobs
      const healthCheck = vercelConfig.crons.find(c => c.path === '/api/cron/health-check');
      const alertCheck = vercelConfig.crons.find(c => c.path === '/api/cron/check-alerts');
      
      if (healthCheck) {
        pass('Health check cron configured');
      } else {
        fail('Health check cron missing');
      }
      
      if (alertCheck) {
        pass('Alert check cron configured');
      } else {
        fail('Alert check cron missing');
      }
    } else {
      warn('No cron jobs configured in vercel.json');
    }
    
    // Check headers (for cache busting)
    if (vercelConfig.headers) {
      pass('Custom headers configured');
    } else {
      warn('No custom headers configured (may affect caching)');
    }
    
  } catch (error) {
    fail(`vercel.json error: ${error.message}`);
  }
}

// ============================================================================
// CHECK 4: ENVIRONMENT VARIABLES
// ============================================================================
function checkEnvironmentVariables() {
  logSection('CHECK 4: Environment Variables');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_API_KEY',
    'JWT_SECRET',
    'CRON_SECRET'
  ];
  
  const optionalEnvVars = [
    'RESEND_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ];
  
  // Check .env.local
  if (fs.existsSync('.env.local')) {
    pass('.env.local file exists');
    
    const envContent = fs.readFileSync('.env.local', 'utf8');
    
    requiredEnvVars.forEach(varName => {
      if (envContent.includes(varName)) {
        pass(`${varName} present in .env.local`);
      } else {
        fail(`${varName} missing from .env.local`);
      }
    });
    
    optionalEnvVars.forEach(varName => {
      if (envContent.includes(varName)) {
        pass(`${varName} present in .env.local`);
      } else {
        warn(`${varName} not in .env.local (optional)`);
      }
    });
    
  } else {
    fail('.env.local file not found');
  }
  
  info('\n⚠️  Remember to verify these are also set in Vercel Dashboard:');
  info('   Settings → Environment Variables → Production');
}

// ============================================================================
// CHECK 5: DATABASE SCHEMA
// ============================================================================
function checkDatabaseSchema() {
  logSection('CHECK 5: Database Schema');
  
  const migrationFiles = [
    'supabase/migrations/20260119_admin_dashboard_schema.sql',
    'CORRECTED-ALERT-CONFIG-SQL-JAN-24-2026.sql'
  ];
  
  migrationFiles.forEach(file => {
    if (fs.existsSync(file)) {
      pass(`Migration file exists: ${file}`);
    } else {
      warn(`Migration file not found: ${file}`);
    }
  });
  
  info('\n⚠️  Verify these tables exist in Supabase:');
  const tables = [
    'system_errors',
    'api_performance_logs',
    'user_activity_logs',
    'system_health_checks',
    'alert_configurations',
    'alert_history',
    'admin_users',
    'admin_sessions',
    'admin_api_keys'
  ];
  
  tables.forEach(table => {
    info(`   - ${table}`);
  });
}

// ============================================================================
// CHECK 6: BUILD TEST
// ============================================================================
function checkBuild() {
  logSection('CHECK 6: Build Test');
  
  info('Running production build test...');
  info('This may take 2-3 minutes...\n');
  
  try {
    execSync('npm run build', { 
      stdio: 'inherit',
      timeout: 300000 // 5 minute timeout
    });
    pass('Production build successful');
  } catch (error) {
    fail('Production build failed');
    fail('Fix build errors before deploying');
  }
}

// ============================================================================
// CHECK 7: VERCEL CACHE AWARENESS
// ============================================================================
function checkVercelCacheIssues() {
  logSection('CHECK 7: Vercel Cache Awareness');
  
  info('Checking for potential Vercel cache issues...\n');
  
  // Check for cache-busting headers in vercel.json
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelConfig.headers) {
      const hasNoCacheHeaders = vercelConfig.headers.some(h => 
        h.headers && h.headers.some(header => 
          header.key === 'Cache-Control' && 
          header.value.includes('no-cache')
        )
      );
      
      if (hasNoCacheHeaders) {
        pass('Cache-Control headers configured');
      } else {
        warn('No Cache-Control headers found');
        info('Consider adding cache-busting headers for admin routes');
      }
    }
  } catch (e) {
    // Already handled in CHECK 3
  }
  
  // Check middleware for cache headers
  if (fs.existsSync('middleware.js')) {
    const middlewareContent = fs.readFileSync('middleware.js', 'utf8');
    
    if (middlewareContent.includes('Cache-Control')) {
      pass('Middleware includes cache control');
    } else {
      warn('Middleware does not set cache headers');
    }
  }
  
  info('\n📝 Vercel Cache Best Practices:');
  info('   1. After deployment, verify changes are live');
  info('   2. If changes not visible, force redeploy with:');
  info('      vercel --prod --force');
  info('   3. Clear browser cache when testing');
  info('   4. Use incognito/private browsing for testing');
}

// ============================================================================
// CHECK 8: DEPLOYMENT READINESS
// ============================================================================
function checkDeploymentReadiness() {
  logSection('CHECK 8: Deployment Readiness');
  
  // Check if admin user is documented
  if (fs.existsSync('ADMIN-ACCESS-CREDENTIALS-JAN-22-2026.md')) {
    pass('Admin credentials documented');
  } else {
    warn('Admin credentials not documented');
  }
  
  // Check if deployment guide exists
  if (fs.existsSync('QUICK-ACTION-FINAL-DEPLOYMENT-JAN-24-2026.md')) {
    pass('Deployment guide available');
  } else {
    warn('Deployment guide not found');
  }
  
  // Check if alert config SQL exists
  if (fs.existsSync('CORRECTED-ALERT-CONFIG-SQL-JAN-24-2026.sql')) {
    pass('Alert configuration SQL ready');
  } else {
    fail('Alert configuration SQL missing');
  }
  
  info('\n📋 Pre-Deployment Checklist:');
  info('   [ ] Alert recipients configured in Supabase');
  info('   [ ] Environment variables set in Vercel');
  info('   [ ] Admin user created in database');
  info('   [ ] API key generated for Kiro AI');
  info('   [ ] Email service (Resend) configured');
}

// ============================================================================
// CHECK 9: TEST SUITES
// ============================================================================
function checkTestSuites() {
  logSection('CHECK 9: Test Suites');
  
  const testScripts = [
    'scripts/test-error-tracking-system.js',
    'scripts/test-performance-tracking-system.js',
    'scripts/test-activity-tracking-system.js',
    'scripts/test-health-monitoring-system.js',
    'scripts/test-alert-system.js'
  ];
  
  testScripts.forEach(script => {
    if (fs.existsSync(script)) {
      pass(`Test script exists: ${path.basename(script)}`);
    } else {
      warn(`Test script missing: ${path.basename(script)}`);
    }
  });
  
  info('\n🧪 Run tests after deployment:');
  info('   npm run admin:test:errors');
  info('   npm run admin:test:performance');
  info('   npm run admin:test:day4');
  info('   npm run admin:test:health');
  info('   npm run admin:test:alerts');
}

// ============================================================================
// CHECK 10: DOCUMENTATION
// ============================================================================
function checkDocumentation() {
  logSection('CHECK 10: Documentation');
  
  const docs = [
    { file: 'docs/admin-dashboard-api.md', name: 'API Documentation' },
    { file: 'docs/admin-dashboard-user-guide.md', name: 'User Guide' },
    { file: 'docs/admin-dashboard-kiro-integration.md', name: 'Kiro Integration Guide' }
  ];
  
  docs.forEach(doc => {
    if (fs.existsSync(doc.file)) {
      const content = fs.readFileSync(doc.file, 'utf8');
      const lines = content.split('\n').length;
      pass(`${doc.name} (${lines} lines)`);
    } else {
      fail(`${doc.name} missing`);
    }
  });
}

// ============================================================================
// SUMMARY
// ============================================================================
function printSummary() {
  logSection('PREFLIGHT CHECK SUMMARY');
  
  console.log(`${colors.green}✅ Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings.length}${colors.reset}`);
  console.log(`${colors.cyan}ℹ️  Info: ${results.info.length}${colors.reset}`);
  
  if (results.failed.length > 0) {
    console.log('\n' + '='.repeat(80));
    log('❌ FAILED CHECKS:', 'red');
    console.log('='.repeat(80));
    results.failed.forEach(item => {
      console.log(`  - ${item}`);
    });
    console.log('\n⚠️  Fix failed checks before deploying!');
    process.exit(1);
  }
  
  if (results.warnings.length > 0) {
    console.log('\n' + '='.repeat(80));
    log('⚠️  WARNINGS:', 'yellow');
    console.log('='.repeat(80));
    results.warnings.forEach(item => {
      console.log(`  - ${item}`);
    });
    console.log('\n⚠️  Review warnings before deploying');
  }
  
  console.log('\n' + '='.repeat(80));
  log('🚀 DEPLOYMENT READY', 'green');
  console.log('='.repeat(80));
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Configure alert recipients (5 min)');
  console.log('   2. Commit and push to deploy (5 min)');
  console.log('   3. Verify production (20 min)');
  console.log('\n📖 Follow: QUICK-ACTION-FINAL-DEPLOYMENT-JAN-24-2026.md');
  console.log('\n✨ Total time to deployment: ~30 minutes\n');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                            ║', 'cyan');
  log('║              ADMIN DASHBOARD DEPLOYMENT - PREFLIGHT CHECK                 ║', 'cyan');
  log('║                                                                            ║', 'cyan');
  log('║                        Date: January 25, 2026                             ║', 'cyan');
  log('║                                                                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');
  
  try {
    checkGitStatus();
    checkCriticalFiles();
    checkVercelConfig();
    checkEnvironmentVariables();
    checkDatabaseSchema();
    checkBuild();
    checkVercelCacheIssues();
    checkDeploymentReadiness();
    checkTestSuites();
    checkDocumentation();
    
    printSummary();
  } catch (error) {
    console.error('\n❌ Preflight check failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
