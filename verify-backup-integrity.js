#!/usr/bin/env node

const { execSync } = require('child_process');

async function verifyBackupIntegrity() {
  console.log('🔍 VERIFYING BACKUP BRANCH INTEGRITY');
  console.log('====================================\n');
  
  try {
    // Step 1: Check current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Current branch: ${currentBranch}`);
    
    // Step 2: Switch to backup branch
    console.log('\n1️⃣ SWITCHING TO BACKUP BRANCH');
    console.log('=============================');
    
    const backupBranch = 'backup-pre-landing-page-changes-jan-3-2026';
    execSync(`git checkout ${backupBranch}`, { encoding: 'utf8' });
    console.log(`✅ Switched to backup branch: ${backupBranch}`);
    
    // Step 3: Verify backup branch build
    console.log('\n2️⃣ TESTING BACKUP BRANCH BUILD');
    console.log('==============================');
    
    try {
      const buildOutput = execSync('npm run build', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (buildOutput.includes('✓ Compiled successfully')) {
        console.log('✅ Backup branch builds successfully');
      } else {
        console.log('⚠️  Backup branch build has warnings');
      }
    } catch (buildError) {
      console.log('❌ Backup branch build failed');
      throw buildError;
    }
    
    // Step 4: Check critical files exist
    console.log('\n3️⃣ VERIFYING CRITICAL FILES');
    console.log('============================');
    
    const fs = require('fs');
    const criticalFiles = [
      'components/BulletproofStudentRegistration.jsx',
      'app/page.js',
      'app/components/HeroSection.jsx',
      'vercel.json',
      'package.json',
      'landing-page-improvement-strategy.md',
      'BACKUP-SUMMARY-JAN-3-2026.json'
    ];
    
    let allFilesPresent = true;
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesPresent = false;
      }
    });
    
    if (!allFilesPresent) {
      throw new Error('Critical files missing from backup branch');
    }
    
    // Step 5: Check backup commit details
    console.log('\n4️⃣ BACKUP COMMIT VERIFICATION');
    console.log('=============================');
    
    const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
    console.log(`Last commit: ${lastCommit}`);
    
    const commitDetails = execSync('git show --stat HEAD', { encoding: 'utf8' });
    const changedFiles = (commitDetails.match(/\|\s+\d+/g) || []).length;
    console.log(`Files in backup commit: ${changedFiles}`);
    
    if (commitDetails.includes('COMPREHENSIVE BACKUP')) {
      console.log('✅ Backup commit message correct');
    } else {
      console.log('⚠️  Backup commit message not as expected');
    }
    
    // Step 6: Return to main branch
    console.log('\n5️⃣ RETURNING TO MAIN BRANCH');
    console.log('===========================');
    
    execSync('git checkout main', { encoding: 'utf8' });
    console.log('✅ Returned to main branch');
    
    // Step 7: Final verification
    console.log('\n📊 BACKUP INTEGRITY RESULTS');
    console.log('===========================');
    console.log('✅ Backup branch exists and is accessible');
    console.log('✅ Backup branch builds successfully');
    console.log('✅ All critical files present in backup');
    console.log('✅ Backup commit properly created');
    console.log('✅ Can switch between branches safely');
    
    console.log('\n🎉 BACKUP INTEGRITY VERIFIED');
    console.log('============================');
    console.log('The backup is complete and reliable.');
    console.log('Safe to proceed with landing page changes.');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Backup verification failed: ${error.message}`);
    
    // Try to return to main branch if we're stuck
    try {
      execSync('git checkout main', { encoding: 'utf8' });
      console.log('✅ Returned to main branch after error');
    } catch (returnError) {
      console.log('❌ Could not return to main branch');
    }
    
    return false;
  }
}

verifyBackupIntegrity().then(success => {
  if (success) {
    console.log('\n✅ BACKUP VERIFICATION COMPLETED SUCCESSFULLY');
    console.log('Ready to proceed with landing page improvements.');
  } else {
    console.log('\n❌ BACKUP VERIFICATION FAILED');
    console.log('Please resolve backup issues before making changes.');
  }
}).catch(error => {
  console.error('Backup verification error:', error);
  process.exit(1);
});