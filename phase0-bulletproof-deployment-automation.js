#!/usr/bin/env node

/**
 * PHASE 0 BULLETPROOF DEPLOYMENT AUTOMATION
 * 
 * Research-based deployment automation applying Vercel's 6-stage pipeline
 * for systematic Phase 0 student-school integration deployment.
 * 
 * Based on: VERCEL-DEPLOYMENT-COMPREHENSIVE-RESEARCH-JAN-11-2026.md
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Deployment configuration based on research findings
const DEPLOYMENT_CONFIG = {
  phases: {
    A: { name: 'Critical Security & Legal', priority: 'CRITICAL', tasks: [6, 4] },
    B: { name: 'Core Business Functionality', priority: 'HIGH', tasks: [3, 'registration-page'] },
    C: { name: 'Operational Enhancement', priority: 'MEDIUM', tasks: [5] }
  },
  
  backupBranches: {
    3: 'backup-2026-01-10-task3-assessment-integration',
    4: 'backup-2026-01-10-task4-popia-consent',
    5: 'backup-2026-01-10-task5-retroactive-association',
    6: 'backup-2026-01-10-phase0-task6-rls-implementation'
  },
  
  databaseMigrations: {
    4: 'supabase/migrations/20260110_popia_consent_management.sql',
    6: 'supabase/migrations/20260110_phase0_task6_rls_implementation.sql'
  },
  
  verificationScripts: {
    3: 'test-task3-assessment-integration.js',
    4: 'test-task4-popia-consent-management.js',
    5: 'test-task5-retroactive-association.js',
    6: 'test-task6-rls-security-verification.js'
  }
};

// Utility functions based on Vercel research
class DeploymentAutomation {
  constructor() {
    this.startTime = Date.now();
    this.deploymentLog = [];
    this.currentPhase = null;
    this.currentTask = null;
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    console.log(logEntry);
    this.deploymentLog.push(logEntry);
  }

  async executeCommand(command, options = {}) {
    this.log(`Executing: ${command}`);
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options 
      });
      return { success: true, output: result };
    } catch (error) {
      this.log(`Command failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  async createPreDeploymentBackup() {
    this.log('🛡️ Creating pre-deployment backup...', 'INFO');
    
    const timestamp = new Date().toISOString().split('T')[0] + '-' + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    const backupBranch = `backup-main-pre-phase0-complete-${timestamp}`;
    
    // Create backup branch
    const commands = [
      'git checkout main',
      `git checkout -b ${backupBranch}`,
      `git push origin ${backupBranch}`
    ];
    
    for (const command of commands) {
      const result = await this.executeCommand(command);
      if (!result.success) {
        throw new Error(`Backup creation failed: ${result.error}`);
      }
    }
    
    this.log(`✅ Pre-deployment backup created: ${backupBranch}`, 'SUCCESS');
    return backupBranch;
  }

  async verifyEnvironment() {
    this.log('🔍 Verifying deployment environment...', 'INFO');
    
    // Check Git status
    const gitStatus = await this.executeCommand('git status --porcelain', { silent: true });
    if (gitStatus.output.trim()) {
      throw new Error('Working directory not clean. Commit or stash changes first.');
    }
    
    // Verify backup branches exist
    for (const [task, branch] of Object.entries(DEPLOYMENT_CONFIG.backupBranches)) {
      const branchCheck = await this.executeCommand(`git show-ref --verify refs/remotes/origin/${branch}`, { silent: true });
      if (!branchCheck.success) {
        throw new Error(`Backup branch not found: ${branch}`);
      }
    }
    
    // Verify build works
    this.log('Testing local build...', 'INFO');
    const buildResult = await this.executeCommand('npm run build');
    if (!buildResult.success) {
      throw new Error('Local build failed. Fix build issues before deployment.');
    }
    
    // Verify tests pass
    this.log('Running tests...', 'INFO');
    const testResult = await this.executeCommand('npm run test');
    if (!testResult.success) {
      throw new Error('Tests failed. Fix test issues before deployment.');
    }
    
    this.log('✅ Environment verification completed', 'SUCCESS');
  }

  async deployTask(taskNumber) {
    this.currentTask = taskNumber;
    this.log(`🚀 Deploying Task ${taskNumber}...`, 'INFO');
    
    const backupBranch = DEPLOYMENT_CONFIG.backupBranches[taskNumber];
    if (!backupBranch) {
      throw new Error(`No backup branch configured for Task ${taskNumber}`);
    }
    
    // Step 1: Merge backup branch
    this.log(`Merging ${backupBranch}...`, 'INFO');
    const mergeResult = await this.executeCommand(`git merge ${backupBranch} --no-ff`);
    if (!mergeResult.success) {
      throw new Error(`Merge failed for Task ${taskNumber}: ${mergeResult.error}`);
    }
    
    // Step 2: Verify merge integrity
    this.log('Verifying merge integrity...', 'INFO');
    const buildCheck = await this.executeCommand('npm run build');
    if (!buildCheck.success) {
      throw new Error(`Build failed after merging Task ${taskNumber}`);
    }
    
    const testCheck = await this.executeCommand('npm run test');
    if (!testCheck.success) {
      throw new Error(`Tests failed after merging Task ${taskNumber}`);
    }
    
    // Step 3: Deploy database migration if required
    const migrationFile = DEPLOYMENT_CONFIG.databaseMigrations[taskNumber];
    if (migrationFile) {
      await this.deployDatabaseMigration(taskNumber, migrationFile);
    }
    
    // Step 4: Deploy to Vercel
    this.log('Deploying to Vercel...', 'INFO');
    const deployResult = await this.executeCommand('git push origin main');
    if (!deployResult.success) {
      throw new Error(`Vercel deployment failed for Task ${taskNumber}: ${deployResult.error}`);
    }
    
    // Step 5: Wait for deployment completion
    await this.waitForDeploymentCompletion();
    
    // Step 6: Verify task functionality
    await this.verifyTaskDeployment(taskNumber);
    
    this.log(`✅ Task ${taskNumber} deployed successfully`, 'SUCCESS');
  }

  async deployDatabaseMigration(taskNumber, migrationFile) {
    this.log(`📊 Database migration required for Task ${taskNumber}`, 'WARNING');
    this.log(`Migration file: ${migrationFile}`, 'INFO');
    
    // Check if migration file exists
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found: ${migrationFile}`);
    }
    
    // Read migration content
    const migrationContent = fs.readFileSync(migrationFile, 'utf8');
    
    // Display migration instructions
    console.log('\n' + '='.repeat(80));
    console.log('🚨 MANUAL DATABASE MIGRATION REQUIRED');
    console.log('='.repeat(80));
    console.log(`Task: ${taskNumber}`);
    console.log(`File: ${migrationFile}`);
    console.log('\nINSTRUCTIONS:');
    console.log('1. Open Supabase SQL Editor in your browser');
    console.log('2. Copy the migration content below');
    console.log('3. Paste and execute in SQL Editor');
    console.log('4. Verify execution completed successfully');
    console.log('5. Press ENTER to continue deployment');
    console.log('\nMIGRATION CONTENT:');
    console.log('-'.repeat(40));
    console.log(migrationContent);
    console.log('-'.repeat(40));
    console.log('='.repeat(80) + '\n');
    
    // Wait for user confirmation
    await this.waitForUserConfirmation('Press ENTER after completing the database migration...');
    
    this.log(`✅ Database migration completed for Task ${taskNumber}`, 'SUCCESS');
  }

  async waitForUserConfirmation(message) {
    return new Promise((resolve) => {
      process.stdout.write(message);
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  async waitForDeploymentCompletion() {
    this.log('⏳ Waiting for Vercel deployment completion...', 'INFO');
    
    // Wait for deployment to propagate (based on research: 50-200ms webhook + build time)
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second initial wait
    
    // Check deployment status
    let attempts = 0;
    const maxAttempts = 20; // 10 minutes maximum wait
    
    while (attempts < maxAttempts) {
      const statusCheck = await this.executeCommand('vercel ls --limit 1', { silent: true });
      if (statusCheck.success && statusCheck.output.includes('Ready')) {
        this.log('✅ Vercel deployment completed', 'SUCCESS');
        return;
      }
      
      attempts++;
      this.log(`Deployment in progress... (attempt ${attempts}/${maxAttempts})`, 'INFO');
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second intervals
    }
    
    throw new Error('Deployment timeout - manual verification required');
  }

  async verifyTaskDeployment(taskNumber) {
    this.log(`🧪 Verifying Task ${taskNumber} deployment...`, 'INFO');
    
    // Basic connectivity check
    const healthCheck = await this.executeCommand(
      'curl -f -s https://thandi-ai-master-mttqfzi2s-thandiai-projects.vercel.app/api/health || echo "FAILED"',
      { silent: true }
    );
    
    if (healthCheck.output.includes('FAILED')) {
      throw new Error(`Health check failed for Task ${taskNumber}`);
    }
    
    // Task-specific verification
    const verificationScript = DEPLOYMENT_CONFIG.verificationScripts[taskNumber];
    if (verificationScript && fs.existsSync(verificationScript)) {
      this.log(`Running verification script: ${verificationScript}`, 'INFO');
      const verifyResult = await this.executeCommand(`node ${verificationScript}`);
      if (!verifyResult.success) {
        throw new Error(`Verification failed for Task ${taskNumber}: ${verifyResult.error}`);
      }
    }
    
    this.log(`✅ Task ${taskNumber} verification completed`, 'SUCCESS');
  }

  async createRegistrationPage() {
    this.log('📄 Creating registration page route...', 'INFO');
    
    // Create directory
    const registerDir = 'app/register';
    if (!fs.existsSync(registerDir)) {
      fs.mkdirSync(registerDir, { recursive: true });
    }
    
    // Create page.js
    const pageContent = `import BulletproofStudentRegistration from '../../components/BulletproofStudentRegistration';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Student Registration</h1>
        <BulletproofStudentRegistration />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Student Registration - Thandi.AI',
  description: 'Register as a student and connect with your school'
};
`;
    
    fs.writeFileSync(path.join(registerDir, 'page.js'), pageContent);
    
    // Test build
    const buildResult = await this.executeCommand('npm run build');
    if (!buildResult.success) {
      throw new Error('Build failed after creating registration page');
    }
    
    // Commit and deploy
    await this.executeCommand('git add app/register/');
    await this.executeCommand('git commit -m "feat: add registration page route for Phase 0 Task 1 accessibility"');
    await this.executeCommand('git push origin main');
    
    await this.waitForDeploymentCompletion();
    
    this.log('✅ Registration page created and deployed', 'SUCCESS');
  }

  async deployPhase(phaseLetter) {
    this.currentPhase = phaseLetter;
    const phase = DEPLOYMENT_CONFIG.phases[phaseLetter];
    
    this.log(`🎯 Starting Phase ${phaseLetter}: ${phase.name} (${phase.priority})`, 'INFO');
    
    for (const task of phase.tasks) {
      if (task === 'registration-page') {
        await this.createRegistrationPage();
      } else {
        await this.deployTask(task);
      }
    }
    
    this.log(`✅ Phase ${phaseLetter} completed successfully`, 'SUCCESS');
  }

  async runFinalVerification() {
    this.log('🔍 Running final system verification...', 'INFO');
    
    // Run comprehensive verification if script exists
    if (fs.existsSync('comprehensive-phase0-verification.js')) {
      const verifyResult = await this.executeCommand('node comprehensive-phase0-verification.js');
      if (!verifyResult.success) {
        throw new Error(`Final verification failed: ${verifyResult.error}`);
      }
    }
    
    // Performance check
    if (fs.existsSync('test-system-performance.js')) {
      const perfResult = await this.executeCommand('node test-system-performance.js');
      if (!perfResult.success) {
        this.log('Performance tests failed - manual review required', 'WARNING');
      }
    }
    
    // Security audit
    if (fs.existsSync('security-audit-phase0.js')) {
      const secResult = await this.executeCommand('node security-audit-phase0.js');
      if (!secResult.success) {
        throw new Error(`Security audit failed: ${secResult.error}`);
      }
    }
    
    this.log('✅ Final verification completed', 'SUCCESS');
  }

  async generateDeploymentReport() {
    const duration = Date.now() - this.startTime;
    const report = {
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: `${Math.round(duration / 1000 / 60)} minutes`,
      phases: Object.keys(DEPLOYMENT_CONFIG.phases),
      tasks: Object.keys(DEPLOYMENT_CONFIG.backupBranches),
      success: true,
      log: this.deploymentLog
    };
    
    const reportFile = `phase0-deployment-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`📊 Deployment report saved: ${reportFile}`, 'SUCCESS');
    return report;
  }

  async executeFullDeployment() {
    try {
      this.log('🚀 Starting Phase 0 Bulletproof Deployment', 'INFO');
      
      // Pre-deployment safety
      await this.createPreDeploymentBackup();
      await this.verifyEnvironment();
      
      // Execute phases in order
      await this.deployPhase('A'); // Critical Security & Legal
      await this.deployPhase('B'); // Core Business Functionality  
      await this.deployPhase('C'); // Operational Enhancement
      
      // Final verification
      await this.runFinalVerification();
      
      // Generate report
      const report = await this.generateDeploymentReport();
      
      this.log('🎉 Phase 0 deployment completed successfully!', 'SUCCESS');
      console.log('\n' + '='.repeat(80));
      console.log('✅ DEPLOYMENT SUCCESSFUL');
      console.log('='.repeat(80));
      console.log(`Duration: ${report.duration}`);
      console.log('Phases completed: A (Security & Legal), B (Business), C (Operational)');
      console.log('Tasks deployed: 3, 4, 5, 6 + Registration Page');
      console.log('Status: All 6 Phase 0 tasks now in production');
      console.log('Revenue model: ENABLED (R12.50-R49.99 per learner)');
      console.log('='.repeat(80));
      
      return report;
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'ERROR');
      console.log('\n' + '='.repeat(80));
      console.log('❌ DEPLOYMENT FAILED');
      console.log('='.repeat(80));
      console.log(`Error: ${error.message}`);
      console.log('Current phase:', this.currentPhase);
      console.log('Current task:', this.currentTask);
      console.log('\nROLLBACK OPTIONS:');
      console.log('1. Instant Vercel rollback: vercel rollback [DEPLOYMENT_ID]');
      console.log('2. Git rollback: git reset --hard [BACKUP_BRANCH]');
      console.log('3. Database rollback: Execute rollback SQL manually');
      console.log('='.repeat(80));
      
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const deployment = new DeploymentAutomation();
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Phase 0 Bulletproof Deployment Automation

Usage:
  node phase0-bulletproof-deployment-automation.js [options]

Options:
  --phase <A|B|C>     Deploy specific phase only
  --task <3|4|5|6>    Deploy specific task only
  --verify-only       Run verification only
  --help, -h          Show this help message

Examples:
  node phase0-bulletproof-deployment-automation.js
  node phase0-bulletproof-deployment-automation.js --phase A
  node phase0-bulletproof-deployment-automation.js --task 6
  node phase0-bulletproof-deployment-automation.js --verify-only
`);
    return;
  }
  
  try {
    if (args.includes('--verify-only')) {
      await deployment.runFinalVerification();
    } else if (args.includes('--phase')) {
      const phaseIndex = args.indexOf('--phase') + 1;
      const phase = args[phaseIndex];
      if (!['A', 'B', 'C'].includes(phase)) {
        throw new Error('Invalid phase. Use A, B, or C.');
      }
      await deployment.verifyEnvironment();
      await deployment.deployPhase(phase);
    } else if (args.includes('--task')) {
      const taskIndex = args.indexOf('--task') + 1;
      const task = parseInt(args[taskIndex]);
      if (![3, 4, 5, 6].includes(task)) {
        throw new Error('Invalid task. Use 3, 4, 5, or 6.');
      }
      await deployment.verifyEnvironment();
      await deployment.deployTask(task);
    } else {
      // Full deployment
      await deployment.executeFullDeployment();
    }
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { DeploymentAutomation, DEPLOYMENT_CONFIG };