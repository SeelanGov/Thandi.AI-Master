#!/usr/bin/env node

/**
 * Prepare for Commit Script
 * Final verification before GitHub commit and Vercel deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

async function runSecurityAudit() {
  logBold('🔒 Running Security Audit...', 'cyan');
  
  try {
    execSync('node security-audit-pre-commit.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    log('❌ Security audit failed!', 'red');
    return false;
  }
}

function checkCriticalFiles() {
  logBold('\n📋 Checking Critical Files...', 'blue');
  
  const checks = [
    {
      file: '.env.local',
      shouldExist: false,
      message: '.env.local should not exist in repository'
    },
    {
      file: '.gitignore',
      shouldExist: true,
      message: '.gitignore should exist'
    },
    {
      file: '.env.example',
      shouldExist: true,
      message: '.env.example should exist for documentation'
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(({ file, shouldExist, message }) => {
    const exists = fs.existsSync(file);
    if (exists === shouldExist) {
      log(`✅ ${message}`, 'green');
    } else {
      log(`❌ ${message}`, 'red');
      allPassed = false;
    }
  });
  
  return allPassed;
}

function showCommitInstructions() {
  logBold('\n🚀 READY FOR COMMIT & DEPLOY', 'green');
  log('=====================================', 'green');
  
  logBold('\n📝 Git Commit Commands:', 'cyan');
  log('git add .', 'white');
  log('git commit -m "Security cleanup: Remove all exposed secrets and prepare for deployment"', 'white');
  log('git push origin main', 'white');
  
  logBold('\n🌐 Vercel Deployment:', 'cyan');
  log('1. Go to Vercel dashboard', 'white');
  log('2. Set environment variables manually:', 'white');
  log('   - GROQ_API_KEY', 'yellow');
  log('   - OPENAI_API_KEY', 'yellow');
  log('   - ANTHROPIC_API_KEY', 'yellow');
  log('   - NEXT_PUBLIC_SUPABASE_URL', 'yellow');
  log('   - SUPABASE_SERVICE_ROLE_KEY', 'yellow');
  log('3. Deploy from GitHub', 'white');
  
  logBold('\n⚠️  IMPORTANT REMINDERS:', 'yellow');
  log('• Never commit .env.local to GitHub', 'white');
  log('• Always use Vercel dashboard for production secrets', 'white');
  log('• Keep API keys secure and rotate regularly', 'white');
  log('• Use .env.example for documentation only', 'white');
}

async function main() {
  logBold('🎯 COMMIT PREPARATION CHECKLIST', 'cyan');
  log('Verifying security and readiness for GitHub & Vercel\n', 'white');
  
  // Step 1: Security Audit
  const securityPassed = await runSecurityAudit();
  if (!securityPassed) {
    log('\n❌ Security audit failed. Please fix issues before committing.', 'red');
    process.exit(1);
  }
  
  // Step 2: File Checks
  const filesPassed = checkCriticalFiles();
  if (!filesPassed) {
    log('\n❌ Critical file checks failed. Please fix issues before committing.', 'red');
    process.exit(1);
  }
  
  // Step 3: Success
  showCommitInstructions();
  
  logBold('\n✅ ALL CHECKS PASSED - READY TO COMMIT!', 'green');
}

main().catch(error => {
  console.error('Preparation failed:', error);
  process.exit(1);
});