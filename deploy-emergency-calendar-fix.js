// deploy-emergency-calendar-fix.js
// Deployment preparation script for emergency calendar fix

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 EMERGENCY CALENDAR FIX - DEPLOYMENT PREPARATION');
console.log('='.repeat(60));

const DEPLOYMENT_CHECKLIST = [
  'Verify emergency calendar fix implementation',
  'Run comprehensive tests',
  'Check build process',
  'Verify environment variables',
  'Prepare Git commit',
  'Stage for GitHub push',
  'Prepare Vercel deployment'
];

let currentStep = 0;

function logStep(message) {
  currentStep++;
  console.log(`\n${currentStep}. ${message}`);
  console.log('-'.repeat(50));
}

function runCommand(command, description) {
  try {
    console.log(`   Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`   ✅ ${description} - Success`);
    return { success: true, output };
  } catch (error) {
    console.log(`   ❌ ${description} - Failed`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

async function main() {
  console.log('📋 Deployment Checklist:');
  DEPLOYMENT_CHECKLIST.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item}`);
  });

  // Step 1: Verify emergency calendar fix files
  logStep('Verify Emergency Calendar Fix Implementation');
  
  const requiredFiles = [
    { path: 'lib/academic/emergency-calendar.js', desc: 'Emergency calendar engine' },
    { path: 'app/assessment/components/AssessmentForm.jsx', desc: 'Updated assessment form' },
    { path: 'app/assessment/components/DeepDiveQuestions.jsx', desc: 'Updated deep dive questions' },
    { path: 'test-emergency-calendar-fix.js', desc: 'Calendar fix tests' },
    { path: 'test-assessment-emergency-fix.js', desc: 'Assessment flow tests' }
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (!checkFileExists(file.path, file.desc)) {
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log('❌ Missing required files - cannot proceed with deployment');
    process.exit(1);
  }

  // Step 2: Run comprehensive tests
  logStep('Run Comprehensive Tests');
  
  const testResults = [
    runCommand('node test-emergency-calendar-fix.js', 'Emergency calendar fix tests'),
    runCommand('node test-assessment-emergency-fix.js', 'Assessment flow tests')
  ];

  const allTestsPassed = testResults.every(result => result.success);
  if (!allTestsPassed) {
    console.log('❌ Tests failed - cannot proceed with deployment');
    process.exit(1);
  }

  // Step 3: Check build process
  logStep('Verify Build Process');
  
  const buildResult = runCommand('npm run build', 'Next.js build');
  if (!buildResult.success) {
    console.log('❌ Build failed - cannot proceed with deployment');
    process.exit(1);
  }

  // Step 4: Check environment variables
  logStep('Verify Environment Variables');
  
  const envFile = '.env.local';
  if (checkFileExists(envFile, 'Environment file')) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredEnvVars = [
      'GROQ_API_KEY',
      'OPENAI_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    let allEnvVarsPresent = true;
    requiredEnvVars.forEach(envVar => {
      const present = envContent.includes(envVar);
      console.log(`   ${present ? '✅' : '❌'} ${envVar}`);
      if (!present) allEnvVarsPresent = false;
    });

    if (!allEnvVarsPresent) {
      console.log('⚠️  Some environment variables missing - check Vercel deployment');
    }
  }

  // Step 5: Prepare Git commit
  logStep('Prepare Git Commit');
  
  // Check git status
  const gitStatus = runCommand('git status --porcelain', 'Check git status');
  if (gitStatus.success && gitStatus.output.trim()) {
    console.log('   📝 Changes detected:');
    console.log(gitStatus.output);
    
    // Add files
    runCommand('git add .', 'Stage all changes');
    
    // Create commit message
    const commitMessage = `fix: Emergency calendar fix for December 2025 Grade 12 students

- Fix critical bug where Grade 12 students in December 2025 received "finals in 1 month" message
- Implement dynamic academic calendar intelligence with South African academic year
- Replace hardcoded date assumptions with getAcademicContext() function
- Update AssessmentForm.jsx and DeepDiveQuestions.jsx with accurate timeline messaging
- Add comprehensive test coverage for all academic phases
- Ensure post-finals guidance for completed Grade 12 students

Files modified:
- lib/academic/emergency-calendar.js (NEW)
- app/assessment/components/AssessmentForm.jsx
- app/assessment/components/DeepDiveQuestions.jsx
- test-emergency-calendar-fix.js (NEW)
- test-assessment-emergency-fix.js (NEW)

Fixes: Grade 12 December 2025 timeline bug
Ready for: Production deployment`;

    console.log('   📝 Commit message prepared');
    console.log('   🎯 Ready to commit with: git commit -m "fix: Emergency calendar fix..."');
  } else {
    console.log('   ✅ No changes to commit (already committed)');
  }

  // Step 6: GitHub preparation
  logStep('GitHub Push Preparation');
  
  console.log('   📋 GitHub push commands:');
  console.log('   git commit -m "fix: Emergency calendar fix for December 2025 Grade 12 students"');
  console.log('   git push origin main');
  console.log('   ✅ Ready for GitHub push');

  // Step 7: Vercel deployment preparation
  logStep('Vercel Deployment Preparation');
  
  console.log('   📋 Vercel deployment checklist:');
  console.log('   ✅ Build process verified');
  console.log('   ✅ Environment variables checked');
  console.log('   ✅ Tests passing');
  console.log('   📝 Deployment commands:');
  console.log('   vercel --prod');
  console.log('   OR: Push to GitHub (auto-deploy if connected)');

  // Final summary
  console.log('\n🎉 DEPLOYMENT PREPARATION COMPLETE!');
  console.log('='.repeat(60));
  console.log('✅ Emergency calendar fix verified and tested');
  console.log('✅ Build process successful');
  console.log('✅ All tests passing');
  console.log('✅ Ready for GitHub and Vercel deployment');
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Run: git commit -m "fix: Emergency calendar fix for December 2025 Grade 12 students"');
  console.log('2. Run: git push origin main');
  console.log('3. Deploy to Vercel: vercel --prod');
  console.log('4. Verify deployment with Grade 12 December 2025 test');
  
  console.log('\n🎯 CRITICAL BUG STATUS: FIXED AND READY FOR PRODUCTION');
}

main().catch(error => {
  console.error('❌ Deployment preparation failed:', error);
  process.exit(1);
});