/**
 * Check Deployment vs GitHub Main Branch
 * Verifies what's deployed in Vercel vs what's in GitHub main
 */

const PRODUCTION_URL = 'https://www.thandi.online';

async function checkDeploymentVsGithub() {
  console.log('🔍 CHECKING DEPLOYMENT VS GITHUB MAIN BRANCH');
  console.log('=============================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    production: {},
    github: {},
    comparison: {}
  };

  // Test 1: Check what's deployed in production
  console.log('📦 STEP 1: Checking Production Deployment');
  console.log('==========================================');
  
  const productionPages = [
    '/admin',
    '/admin/login',
    '/admin/errors',
    '/admin/performance',
    '/admin/activity'
  ];

  for (const page of productionPages) {
    try {
      const response = await fetch(`${PRODUCTION_URL}${page}`);
      const status = response.status;
      const exists = status === 200 || status === 302 || status === 401;
      
      results.production[page] = {
        status,
        exists,
        deployed: exists
      };
      
      console.log(`${exists ? '✅' : '❌'} ${page}: ${status} ${exists ? '(Deployed)' : '(NOT Deployed)'}`);
    } catch (error) {
      results.production[page] = {
        status: 'ERROR',
        exists: false,
        deployed: false,
        error: error.message
      };
      console.log(`❌ ${page}: ERROR - ${error.message}`);
    }
  }

  // Test 2: Check GitHub main branch
  console.log('\n📂 STEP 2: Checking GitHub Main Branch');
  console.log('======================================');
  
  const fs = require('fs');
  const path = require('path');
  
  const localFiles = [
    'app/admin/page.js',
    'app/admin/login/page.js',
    'app/admin/errors/page.js',
    'app/admin/performance/page.js',
    'app/admin/activity/page.js',
    'components/admin/DashboardOverview.jsx',
    'components/admin/ErrorsList.jsx',
    'components/admin/PerformanceDashboard.jsx',
    'components/admin/ActivityDashboard.jsx'
  ];

  for (const file of localFiles) {
    const exists = fs.existsSync(file);
    results.github[file] = {
      exists,
      inRepo: exists
    };
    console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS in repo' : 'NOT FOUND'}`);
  }

  // Test 3: Check git status
  console.log('\n🔄 STEP 3: Checking Git Status');
  console.log('==============================');
  
  const { execSync } = require('child_process');
  
  try {
    // Check current branch
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`Current branch: ${branch}`);
    results.git = { branch };
    
    // Check if there are uncommitted changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const hasChanges = status.trim().length > 0;
    console.log(`Uncommitted changes: ${hasChanges ? 'YES' : 'NO'}`);
    results.git.uncommittedChanges = hasChanges;
    
    if (hasChanges) {
      console.log('\n⚠️  Uncommitted files:');
      console.log(status);
    }
    
    // Check last commit
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    console.log(`\nLast commit: ${lastCommit}`);
    results.git.lastCommit = lastCommit;
    
    // Check if admin files are in the last few commits
    console.log('\n📝 Recent commits with admin files:');
    const adminCommits = execSync(
      'git log --oneline --all -10 -- "app/admin/*" "components/admin/*"',
      { encoding: 'utf8' }
    ).trim();
    
    if (adminCommits) {
      console.log(adminCommits);
      results.git.adminCommits = adminCommits.split('\n');
    } else {
      console.log('❌ No commits found for admin files in last 10 commits');
      results.git.adminCommits = [];
    }
    
  } catch (error) {
    console.error(`Git error: ${error.message}`);
    results.git = { error: error.message };
  }

  // Test 4: Summary and Analysis
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  const deployedCount = Object.values(results.production).filter(p => p.deployed).length;
  const totalPages = productionPages.length;
  const filesInRepo = Object.values(results.github).filter(f => f.exists).length;
  const totalFiles = localFiles.length;
  
  console.log(`\n✅ Production Deployment:`);
  console.log(`   - ${deployedCount}/${totalPages} pages deployed`);
  console.log(`   - Login: ${results.production['/admin/login']?.deployed ? 'YES' : 'NO'}`);
  console.log(`   - Dashboard: ${results.production['/admin']?.deployed ? 'YES' : 'NO'}`);
  console.log(`   - Errors: ${results.production['/admin/errors']?.deployed ? 'YES' : 'NO'}`);
  console.log(`   - Performance: ${results.production['/admin/performance']?.deployed ? 'YES' : 'NO'}`);
  console.log(`   - Activity: ${results.production['/admin/activity']?.deployed ? 'YES' : 'NO'}`);
  
  console.log(`\n✅ GitHub Repository:`);
  console.log(`   - ${filesInRepo}/${totalFiles} files exist in repo`);
  console.log(`   - All Day 8 files present: ${filesInRepo === totalFiles ? 'YES' : 'NO'}`);
  
  console.log(`\n🔍 Root Cause Analysis:`);
  
  if (filesInRepo === totalFiles && deployedCount < totalPages) {
    console.log(`   ⚠️  FILES EXIST BUT NOT DEPLOYED`);
    console.log(`   - All Day 8 files are in the repository`);
    console.log(`   - But only ${deployedCount}/${totalPages} pages are live in production`);
    console.log(`   - This means: Code exists but hasn't been deployed to Vercel`);
    
    if (results.git?.uncommittedChanges) {
      console.log(`   - Uncommitted changes detected - files may not be pushed to GitHub`);
    } else if (results.git?.adminCommits?.length > 0) {
      console.log(`   - Admin files were committed to git`);
      console.log(`   - Need to verify if they're pushed to GitHub main branch`);
    }
  } else if (filesInRepo < totalFiles) {
    console.log(`   ❌ MISSING FILES IN REPOSITORY`);
    console.log(`   - Only ${filesInRepo}/${totalFiles} files found`);
    console.log(`   - Day 8 work may not be complete or committed`);
  } else if (deployedCount === totalPages) {
    console.log(`   ✅ EVERYTHING IS DEPLOYED`);
    console.log(`   - All files exist and all pages are live`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RECOMMENDED ACTIONS');
  console.log('='.repeat(60));
  
  if (filesInRepo === totalFiles && deployedCount < totalPages) {
    console.log('\n1. Check if files are committed:');
    console.log('   git status');
    console.log('\n2. If uncommitted, commit them:');
    console.log('   git add app/admin/* components/admin/*');
    console.log('   git commit -m "Deploy Day 8 admin dashboard pages"');
    console.log('\n3. Push to GitHub main:');
    console.log('   git push origin main');
    console.log('\n4. Verify Vercel auto-deploys from GitHub push');
    console.log('   (Vercel should automatically deploy when main branch is updated)');
  }
  
  console.log('\n');
  
  return results;
}

// Run the check
checkDeploymentVsGithub()
  .then(results => {
    console.log('✅ Check completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
