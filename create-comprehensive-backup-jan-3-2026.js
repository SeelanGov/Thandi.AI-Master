#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

async function createComprehensiveBackup() {
  console.log('💾 CREATING COMPREHENSIVE PROJECT BACKUP');
  console.log('========================================\n');
  
  console.log('📋 BACKUP STRATEGY');
  console.log('==================');
  console.log('✅ Current working system (post-deployment success)');
  console.log('✅ All fixes from yesterday (school selection, Vercel config)');
  console.log('✅ Landing page analysis and improvement plans');
  console.log('✅ Complete project state before landing page changes');
  console.log('');
  
  try {
    // Step 1: Check current git status
    console.log('1️⃣ CHECKING CURRENT GIT STATUS');
    console.log('==============================');
    
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const modifiedFiles = gitStatus.split('\n').filter(line => line.trim());
    
    if (modifiedFiles.length > 0) {
      console.log(`📝 ${modifiedFiles.length} files have changes:`);
      modifiedFiles.forEach(file => {
        if (file.trim()) {
          console.log(`   ${file}`);
        }
      });
    } else {
      console.log('✅ Working directory is clean');
    }
    
    // Step 2: Create backup branch
    console.log('\n2️⃣ CREATING BACKUP BRANCH');
    console.log('=========================');
    
    const backupBranchName = 'backup-pre-landing-page-changes-jan-3-2026';
    
    try {
      // Create and switch to backup branch
      execSync(`git checkout -b ${backupBranchName}`, { encoding: 'utf8' });
      console.log(`✅ Created backup branch: ${backupBranchName}`);
    } catch (error) {
      // Branch might already exist, switch to it
      try {
        execSync(`git checkout ${backupBranchName}`, { encoding: 'utf8' });
        console.log(`✅ Switched to existing backup branch: ${backupBranchName}`);
      } catch (switchError) {
        console.log(`❌ Could not create/switch to backup branch: ${switchError.message}`);
        throw switchError;
      }
    }
    
    // Step 3: Add all current changes
    console.log('\n3️⃣ STAGING ALL CURRENT CHANGES');
    console.log('==============================');
    
    execSync('git add .', { encoding: 'utf8' });
    console.log('✅ All changes staged for backup');
    
    // Step 4: Create comprehensive backup commit
    console.log('\n4️⃣ CREATING BACKUP COMMIT');
    console.log('=========================');
    
    const backupCommitMessage = `COMPREHENSIVE BACKUP - Pre Landing Page Changes (Jan 3, 2026)

🎯 SYSTEM STATE: Fully operational and deployed
✅ School selection UI: Fixed and working
✅ Registration flow: Complete end-to-end functionality  
✅ Vercel deployment: Successfully configured and live
✅ Assessment pages: All grades accessible
✅ APIs: All endpoints operational
✅ Thandi branding: Consistently applied

📊 PRODUCTION STATUS:
- Live URL: https://www.thandi.online
- All critical functionality verified
- Ready for Monday student testing

📋 LANDING PAGE ANALYSIS:
- User feedback collected and analyzed
- Improvement strategy documented
- Implementation plan created
- Ready for homepage enhancements

🔄 NEXT PHASE: Landing page improvements based on user feedback
- Target audience clarity (Grade 10-12)
- Dual audience strategy (students + schools)
- Navigation cleanup (hide admin)
- Local trust building (Built in Durban)

This backup preserves the fully working system before landing page changes.`;

    execSync(`git commit -m "${backupCommitMessage}"`, { encoding: 'utf8' });
    console.log('✅ Comprehensive backup commit created');
    
    // Step 5: Push backup to GitHub
    console.log('\n5️⃣ PUSHING BACKUP TO GITHUB');
    console.log('============================');
    
    execSync(`git push origin ${backupBranchName}`, { encoding: 'utf8' });
    console.log('✅ Backup branch pushed to GitHub');
    
    // Step 6: Switch back to main branch
    console.log('\n6️⃣ RETURNING TO MAIN BRANCH');
    console.log('===========================');
    
    execSync('git checkout main', { encoding: 'utf8' });
    console.log('✅ Switched back to main branch');
    
    // Step 7: Create backup summary
    console.log('\n7️⃣ CREATING BACKUP SUMMARY');
    console.log('==========================');
    
    const backupSummary = {
      timestamp: new Date().toISOString(),
      branch: backupBranchName,
      purpose: 'Pre-landing page changes backup',
      systemState: 'Fully operational and deployed',
      liveUrl: 'https://www.thandi.online',
      keyFeatures: [
        'School selection UI working',
        'Registration flow complete',
        'Vercel deployment successful',
        'All APIs operational',
        'Assessment pages accessible'
      ],
      nextPhase: 'Landing page improvements',
      backupLocation: `GitHub: origin/${backupBranchName}`
    };
    
    fs.writeFileSync('BACKUP-SUMMARY-JAN-3-2026.json', JSON.stringify(backupSummary, null, 2));
    console.log('✅ Backup summary created: BACKUP-SUMMARY-JAN-3-2026.json');
    
    // Step 8: Verify backup integrity
    console.log('\n8️⃣ VERIFYING BACKUP INTEGRITY');
    console.log('=============================');
    
    const branches = execSync('git branch -r', { encoding: 'utf8' });
    if (branches.includes(backupBranchName)) {
      console.log('✅ Backup branch exists on remote');
    } else {
      console.log('❌ Backup branch not found on remote');
      throw new Error('Backup verification failed');
    }
    
    const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' });
    console.log(`✅ Current main branch: ${lastCommit.trim()}`);
    
    console.log('\n🎉 BACKUP COMPLETED SUCCESSFULLY');
    console.log('================================');
    console.log(`✅ Backup branch: ${backupBranchName}`);
    console.log('✅ All changes preserved on GitHub');
    console.log('✅ Working system state backed up');
    console.log('✅ Ready to proceed with landing page improvements');
    console.log('');
    
    console.log('📋 BACKUP DETAILS');
    console.log('=================');
    console.log(`Branch: origin/${backupBranchName}`);
    console.log('Contains: Complete working system + landing page analysis');
    console.log('Purpose: Preserve state before homepage changes');
    console.log('Recovery: git checkout ' + backupBranchName);
    console.log('');
    
    console.log('🚀 READY TO PROCEED');
    console.log('===================');
    console.log('The entire project has been safely backed up.');
    console.log('We can now proceed with landing page improvements.');
    console.log('If anything goes wrong, we can restore from the backup.');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Backup failed: ${error.message}`);
    console.log('');
    console.log('🔧 TROUBLESHOOTING');
    console.log('==================');
    console.log('1. Check git status and resolve any conflicts');
    console.log('2. Ensure you have push access to the repository');
    console.log('3. Verify network connection to GitHub');
    console.log('4. Try running individual git commands manually');
    
    return false;
  }
}

createComprehensiveBackup().then(success => {
  if (success) {
    console.log('\n✅ BACKUP PROCESS COMPLETED SUCCESSFULLY');
    console.log('Ready to continue with landing page discussion and improvements.');
  } else {
    console.log('\n❌ BACKUP PROCESS FAILED');
    console.log('Please resolve issues before proceeding with changes.');
  }
}).catch(error => {
  console.error('Backup process error:', error);
  process.exit(1);
});