#!/usr/bin/env node

/**
 * DIAGNOSE DAY 8 DEPLOYMENT GAP
 * January 22, 2026
 * 
 * Checks what Day 8 files exist locally and if they're committed to git
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 DAY 8 DEPLOYMENT GAP DIAGNOSIS');
console.log('==================================\n');

// Day 8 files that should exist
const day8Files = [
  'app/admin/errors/page.js',
  'app/admin/errors/[id]/page.js',
  'app/admin/performance/page.js',
  'app/admin/activity/page.js',
  'components/admin/ErrorsList.jsx',
  'components/admin/ErrorFilters.jsx',
  'components/admin/ErrorDetails.jsx',
  'components/admin/PerformanceDashboard.jsx',
  'components/admin/PerformanceCharts.jsx',
  'components/admin/ActivityDashboard.jsx',
  'components/admin/ActivityCharts.jsx',
  'app/api/admin/errors/export/route.js'
];

console.log('📁 CHECKING LOCAL FILES');
console.log('=======================');

let localExists = 0;
let localMissing = 0;

day8Files.forEach(file => {
  const exists = fs.existsSync(file);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${file}`);
  
  if (exists) {
    localExists++;
  } else {
    localMissing++;
  }
});

console.log(`\nLocal: ${localExists} exist, ${localMissing} missing\n`);

// Check git status
console.log('📝 CHECKING GIT STATUS');
console.log('======================');

try {
  const gitStatus = execSync('git status --short', { encoding: 'utf-8' });
  
  if (gitStatus.trim()) {
    console.log('Uncommitted changes detected:\n');
    console.log(gitStatus);
    
    // Check if Day 8 files are uncommitted
    const uncommittedDay8 = day8Files.filter(file => {
      return gitStatus.includes(file);
    });
    
    if (uncommittedDay8.length > 0) {
      console.log(`\n⚠️  ${uncommittedDay8.length} Day 8 files are uncommitted:`);
      uncommittedDay8.forEach(file => console.log(`   - ${file}`));
    }
  } else {
    console.log('✅ No uncommitted changes\n');
  }
} catch (error) {
  console.log(`❌ Git status check failed: ${error.message}\n`);
}

// Check last commit
console.log('📅 CHECKING LAST COMMIT');
console.log('=======================');

try {
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf-8' });
  console.log(`Last commit: ${lastCommit.trim()}`);
  
  const commitDate = execSync('git log -1 --format=%cd', { encoding: 'utf-8' });
  console.log(`Commit date: ${commitDate.trim()}\n`);
} catch (error) {
  console.log(`❌ Git log check failed: ${error.message}\n`);
}

// Check if files are in git
console.log('🔎 CHECKING IF DAY 8 FILES ARE IN GIT');
console.log('======================================');

let inGit = 0;
let notInGit = 0;

day8Files.forEach(file => {
  try {
    execSync(`git ls-files --error-unmatch ${file}`, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(`✅ ${file} - IN GIT`);
    inGit++;
  } catch (error) {
    console.log(`❌ ${file} - NOT IN GIT`);
    notInGit++;
  }
});

console.log(`\nGit: ${inGit} tracked, ${notInGit} untracked\n`);

// Summary and recommendations
console.log('📊 DIAGNOSIS SUMMARY');
console.log('====================');

if (localMissing > 0) {
  console.log(`❌ ${localMissing} Day 8 files are missing locally`);
  console.log('   → Files were not created or were deleted');
}

if (notInGit > 0) {
  console.log(`❌ ${notInGit} Day 8 files are not tracked by git`);
  console.log('   → Files need to be committed');
}

if (localExists === day8Files.length && inGit === day8Files.length) {
  console.log('✅ All Day 8 files exist locally and are tracked by git');
  console.log('\n🔧 LIKELY ISSUE: Vercel cache problem');
  console.log('   → Run: node deploy-day8-with-cache-bust-jan-22-2026.js');
} else {
  console.log('\n🔧 REQUIRED ACTIONS:');
  if (notInGit > 0) {
    console.log('1. Commit Day 8 files to git:');
    console.log('   git add app/admin/* components/admin/* app/api/admin/errors/export/*');
    console.log('   git commit -m "Add Day 8 admin dashboard pages"');
    console.log('   git push');
  }
  if (localMissing > 0) {
    console.log('2. Recreate missing Day 8 files');
  }
  console.log('3. Deploy to Vercel with cache bust');
}

console.log('');
