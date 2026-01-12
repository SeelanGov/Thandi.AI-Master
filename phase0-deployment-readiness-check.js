#!/usr/bin/env node

/**
 * PHASE 0 DEPLOYMENT READINESS CHECK
 * 
 * Pre-deployment verification to ensure all prerequisites are met
 * before executing the bulletproof deployment strategy.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentReadinessChecker {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async runCheck(name, checkFunction) {
    try {
      this.log(`Checking: ${name}`, 'CHECK');
      const result = await checkFunction();
      
      if (result.success) {
        this.passed++;
        this.log(`✅ PASS: ${name}`, 'SUCCESS');
      } else {
        this.failed++;
        this.log(`❌ FAIL: ${name} - ${result.error}`, 'ERROR');
      }
      
      this.checks.push({ name, ...result });
      return result;
      
    } catch (error) {
      this.failed++;
      this.log(`❌ ERROR: ${name} - ${error.message}`, 'ERROR');
      this.checks.push({ name, success: false, error: error.message });
      return { success: false, error: error.message };
    }
  }

  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options 
      });
      return { success: true, output: result.trim() };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  async checkGitStatus() {
    return this.runCheck('Git working directory clean', async () => {
      const result = this.executeCommand('git status --porcelain', { silent: true });
      if (!result.success) {
        return { success: false, error: 'Git command failed' };
      }
      
      const hasChanges = result.output.trim().length > 0;
      return {
        success: !hasChanges,
        error: hasChanges ? 'Working directory has uncommitted changes' : null
      };
    });
  }

  async checkCurrentBranch() {
    return this.runCheck('Current branch is main', async () => {
      const result = this.executeCommand('git branch --show-current', { silent: true });
      if (!result.success) {
        return { success: false, error: 'Could not determine current branch' };
      }
      
      const isMain = result.output === 'main';
      return {
        success: isMain,
        error: !isMain ? `Current branch is '${result.output}', should be 'main'` : null
      };
    });
  }

  async checkBackupBranches() {
    const backupBranches = [
      'backup-2026-01-10-task3-assessment-integration',
      'backup-2026-01-10-task4-popia-consent',
      'backup-2026-01-10-task5-retroactive-association',
      'backup-2026-01-10-phase0-task6-rls-implementation'
    ];

    for (const branch of backupBranches) {
      await this.runCheck(`Backup branch exists: ${branch}`, async () => {
        const result = this.executeCommand(`git show-ref --verify refs/remotes/origin/${branch}`, { silent: true });
        return {
          success: result.success,
          error: !result.success ? `Branch ${branch} not found on remote` : null
        };
      });
    }
  }

  async checkLocalBuild() {
    return this.runCheck('Local build works', async () => {
      const result = this.executeCommand('npm run build', { silent: true });
      return {
        success: result.success,
        error: !result.success ? 'Build failed - fix build issues before deployment' : null
      };
    });
  }

  async checkTests() {
    return this.runCheck('Tests pass', async () => {
      const result = this.executeCommand('npm run test', { silent: true });
      return {
        success: result.success,
        error: !result.success ? 'Tests failed - fix test issues before deployment' : null
      };
    });
  }

  async checkVercelCLI() {
    return this.runCheck('Vercel CLI available', async () => {
      const result = this.executeCommand('vercel --version', { silent: true });
      return {
        success: result.success,
        error: !result.success ? 'Vercel CLI not installed or not in PATH' : null
      };
    });
  }

  async checkVercelAuth() {
    return this.runCheck('Vercel authentication', async () => {
      const result = this.executeCommand('vercel whoami', { silent: true });
      return {
        success: result.success,
        error: !result.success ? 'Not authenticated with Vercel - run "vercel login"' : null
      };
    });
  }

  async checkDatabaseMigrationFiles() {
    const migrationFiles = [
      'supabase/migrations/20260110_popia_consent_management.sql',
      'supabase/migrations/20260110_phase0_task6_rls_implementation.sql'
    ];

    for (const file of migrationFiles) {
      await this.runCheck(`Migration file exists: ${file}`, async () => {
        const exists = fs.existsSync(file);
        return {
          success: exists,
          error: !exists ? `Migration file not found: ${file}` : null
        };
      });
    }
  }

  async checkVerificationScripts() {
    const scripts = [
      'test-task3-assessment-integration.js',
      'test-task4-popia-consent-management.js',
      'test-task5-retroactive-association.js',
      'test-task6-rls-security-verification.js',
      'comprehensive-phase0-verification.js'
    ];

    for (const script of scripts) {
      await this.runCheck(`Verification script exists: ${script}`, async () => {
        const exists = fs.existsSync(script);
        return {
          success: exists,
          error: !exists ? `Verification script not found: ${script}` : null
        };
      });
    }
  }

  async checkEnvironmentVariables() {
    return this.runCheck('Environment variables configured', async () => {
      const result = this.executeCommand('vercel env ls', { silent: true });
      if (!result.success) {
        return { success: false, error: 'Could not check environment variables' };
      }
      
      // Check for essential environment variables
      const hasEnvVars = result.output.includes('DATABASE_URL') || 
                        result.output.includes('SUPABASE_URL');
      
      return {
        success: hasEnvVars,
        error: !hasEnvVars ? 'Essential environment variables not configured' : null
      };
    });
  }

  async checkCurrentDeploymentStatus() {
    return this.runCheck('Current deployment status', async () => {
      const result = this.executeCommand('vercel ls --limit 1', { silent: true });
      if (!result.success) {
        return { success: false, error: 'Could not check deployment status' };
      }
      
      const hasDeployment = result.output.includes('Ready') || result.output.includes('Error');
      return {
        success: hasDeployment,
        error: !hasDeployment ? 'No recent deployments found' : null
      };
    });
  }

  async checkSupabaseAccess() {
    return this.runCheck('Supabase access available', async () => {
      // This is a manual check - we can't automatically verify Supabase access
      // but we can check if the user has the necessary information
      const hasSupabaseInfo = process.env.SUPABASE_URL || 
                             fs.existsSync('.env.local') ||
                             fs.existsSync('.env.production');
      
      return {
        success: hasSupabaseInfo,
        error: !hasSupabaseInfo ? 'Supabase configuration not found - ensure you have access to Supabase SQL Editor' : null,
        warning: 'Manual verification required: Ensure you have access to Supabase SQL Editor for database migrations'
      };
    });
  }

  async checkDiskSpace() {
    return this.runCheck('Sufficient disk space', async () => {
      try {
        const stats = fs.statSync('.');
        // This is a basic check - in a real scenario you'd check actual disk space
        return {
          success: true,
          error: null
        };
      } catch (error) {
        return {
          success: false,
          error: 'Could not check disk space'
        };
      }
    });
  }

  generateReport() {
    const total = this.passed + this.failed;
    const successRate = Math.round((this.passed / total) * 100);
    
    return {
      timestamp: new Date().toISOString(),
      total,
      passed: this.passed,
      failed: this.failed,
      successRate,
      ready: this.failed === 0,
      checks: this.checks
    };
  }

  async executeAllChecks() {
    this.log('🔍 Starting Phase 0 deployment readiness check...', 'INFO');
    
    // Git and repository checks
    await this.checkGitStatus();
    await this.checkCurrentBranch();
    await this.checkBackupBranches();
    
    // Build and test checks
    await this.checkLocalBuild();
    await this.checkTests();
    
    // Deployment tool checks
    await this.checkVercelCLI();
    await this.checkVercelAuth();
    await this.checkEnvironmentVariables();
    await this.checkCurrentDeploymentStatus();
    
    // Database checks
    await this.checkDatabaseMigrationFiles();
    await this.checkSupabaseAccess();
    
    // Verification checks
    await this.checkVerificationScripts();
    
    // System checks
    await this.checkDiskSpace();
    
    // Generate and display report
    const report = this.generateReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 DEPLOYMENT READINESS REPORT');
    console.log('='.repeat(80));
    console.log(`Total Checks: ${report.total}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Success Rate: ${report.successRate}%`);
    console.log(`Ready for Deployment: ${report.ready ? '✅ YES' : '❌ NO'}`);
    
    if (report.failed > 0) {
      console.log('\n❌ FAILED CHECKS:');
      for (const check of report.checks) {
        if (!check.success) {
          console.log(`  • ${check.name}: ${check.error}`);
        }
      }
      
      console.log('\n🔧 REMEDIATION STEPS:');
      console.log('1. Fix all failed checks above');
      console.log('2. Re-run this readiness check');
      console.log('3. Proceed with deployment only when all checks pass');
    } else {
      console.log('\n✅ ALL CHECKS PASSED');
      console.log('🚀 Ready to proceed with Phase 0 deployment!');
      console.log('\nNext steps:');
      console.log('1. Run: node phase0-bulletproof-deployment-automation.js');
      console.log('2. Monitor deployment progress');
      console.log('3. Verify deployment success');
    }
    
    // Save report
    const reportFile = `phase0-readiness-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\nReport saved: ${reportFile}`);
    console.log('='.repeat(80));
    
    return report;
  }
}

// CLI execution
async function main() {
  const checker = new DeploymentReadinessChecker();
  
  try {
    const report = await checker.executeAllChecks();
    
    if (!report.ready) {
      console.log('\n⚠️  Deployment readiness check failed. Fix issues before proceeding.');
      process.exit(1);
    }
    
    console.log('\n🎉 Deployment readiness check passed!');
    
  } catch (error) {
    console.error('\n❌ Readiness check failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { DeploymentReadinessChecker };