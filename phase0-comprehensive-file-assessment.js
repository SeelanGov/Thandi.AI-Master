#!/usr/bin/env node

/**
 * Phase 0 Comprehensive File Assessment
 * Purpose: Identify exactly what files we have vs what we need before deployment
 * User Request: Ensure all files are in place before GitHub/Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 PHASE 0 COMPREHENSIVE FILE ASSESSMENT');
console.log('========================================');
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log('');

const assessment = {
  timestamp: new Date().toISOString(),
  branches: {},
  files: {
    main: [],
    task4: [],
    task56: [],
    missing: [],
    conflicts: []
  },
  tests: {
    status: 'unknown',
    failures: []
  },
  build: {
    status: 'unknown',
    errors: []
  },
  migrations: {
    present: [],
    missing: []
  },
  readiness: {
    score: 0,
    blockers: [],
    warnings: []
  }
};

// Helper function to safely execute git commands
function safeExec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    }).trim();
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return null;
  }
}

// Helper function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Helper function to get file list from directory
function getFileList(dir, extensions = ['.js', '.jsx', '.sql', '.md']) {
  const files = [];
  
  function scanDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath.replace(process.cwd() + path.sep, ''));
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  if (fs.existsSync(dir)) {
    scanDir(dir);
  }
  
  return files;
}

console.log('📋 STEP 1: BRANCH ANALYSIS');
console.log('==========================');

// Get current branch
const currentBranch = safeExec('git branch --show-current');
console.log(`Current branch: ${currentBranch}`);

// Get all remote branches
const remoteBranches = safeExec('git branch -r');
if (remoteBranches) {
  const branches = remoteBranches.split('\n').map(b => b.trim()).filter(b => b && !b.includes('HEAD'));
  console.log('Remote branches:');
  branches.forEach(branch => {
    console.log(`  ${branch}`);
    assessment.branches[branch] = { exists: true };
  });
}

// Check for Phase 0 specific branches
const requiredBranches = [
  'origin/backup-2026-01-10-task4-popia-consent',
  'origin/backup-2026-01-10-phase0-task6-rls-implementation'
];

console.log('\nPhase 0 branch status:');
requiredBranches.forEach(branch => {
  const exists = remoteBranches && remoteBranches.includes(branch);
  console.log(`  ${exists ? '✅' : '❌'} ${branch}`);
  if (!exists) {
    assessment.readiness.blockers.push(`Missing branch: ${branch}`);
  }
});

console.log('\n📁 STEP 2: FILE INVENTORY - MAIN BRANCH');
console.log('=======================================');

// Inventory files in main branch
const mainFiles = {
  components: getFileList('components'),
  api: getFileList('app/api'),
  pages: getFileList('app'),
  migrations: getFileList('supabase/migrations'),
  tests: getFileList('__tests__'),
  lib: getFileList('lib')
};

console.log('Files in main branch:');
Object.entries(mainFiles).forEach(([category, files]) => {
  console.log(`\n${category.toUpperCase()}:`);
  files.forEach(file => {
    console.log(`  ✅ ${file}`);
    assessment.files.main.push(file);
  });
});

console.log('\n🔍 STEP 3: PHASE 0 SPECIFIC FILE CHECK');
console.log('=====================================');

// Define expected Phase 0 files
const expectedFiles = {
  task1: [
    'components/BulletproofStudentRegistration.jsx',
    'app/api/schools/validate-code/route.js',
    'app/api/schools/request-addition/route.js',
    '__tests__/phase0/registration-form.test.js'
  ],
  task2: [
    'supabase/migrations/20260110_phase0_student_school_integration.sql',
    'app/api/student/register/route.js',
    'app/api/schools/login/route.js',
    'app/school/claim/page.js'
  ],
  task3: [
    'app/api/rag/query/route.js' // Should have school association
  ],
  task4: [
    'app/api/consent/manage/route.js',
    'app/student/consent/page.js',
    'lib/middleware/consent-verification.js',
    'supabase/migrations/20260110_popia_consent_management.sql'
  ],
  task5: [
    'app/student/school-selection/page.js',
    'app/api/student/retroactive-association/route.js',
    'app/admin/bulk-association/page.js',
    'app/api/admin/bulk-association/route.js',
    'scripts/retroactive-data-migration.js'
  ],
  task6: [
    'supabase/migrations/20260110_phase0_task6_rls_implementation.sql',
    '__tests__/phase0/task6-rls-property-tests.test.js'
  ],
  routes: [
    'app/register/page.js' // Missing route to registration component
  ]
};

// Check which files exist in main
console.log('Phase 0 file status in main branch:');
Object.entries(expectedFiles).forEach(([task, files]) => {
  console.log(`\n${task.toUpperCase()}:`);
  files.forEach(file => {
    const exists = fileExists(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) {
      assessment.files.missing.push({ task, file });
    }
  });
});

console.log('\n🧪 STEP 4: BUILD AND TEST STATUS');
console.log('=================================');

// Check if we can build
console.log('Checking build status...');
try {
  const buildOutput = safeExec('npm run build');
  if (buildOutput !== null) {
    console.log('✅ Build successful');
    assessment.build.status = 'success';
  } else {
    console.log('❌ Build failed');
    assessment.build.status = 'failed';
    assessment.readiness.blockers.push('Build failure');
  }
} catch (error) {
  console.log('❌ Build failed:', error.message);
  assessment.build.status = 'failed';
  assessment.build.errors.push(error.message);
  assessment.readiness.blockers.push('Build failure');
}

// Check test status
console.log('\nChecking test status...');
try {
  const testOutput = safeExec('npm test -- --passWithNoTests');
  if (testOutput !== null) {
    console.log('✅ Tests passing');
    assessment.tests.status = 'passing';
  } else {
    console.log('❌ Tests failing');
    assessment.tests.status = 'failing';
    assessment.readiness.blockers.push('Test failures');
  }
} catch (error) {
  console.log('❌ Tests failing:', error.message);
  assessment.tests.status = 'failing';
  assessment.tests.failures.push(error.message);
  assessment.readiness.blockers.push('Test failures');
}

console.log('\n📊 STEP 5: MIGRATION STATUS');
console.log('============================');

// Check migration files
const requiredMigrations = [
  'supabase/migrations/20260110_phase0_student_school_integration.sql',
  'supabase/migrations/20260110_popia_consent_management.sql',
  'supabase/migrations/20260110_phase0_task6_rls_implementation.sql'
];

console.log('Migration file status:');
requiredMigrations.forEach(migration => {
  const exists = fileExists(migration);
  console.log(`  ${exists ? '✅' : '❌'} ${migration}`);
  if (exists) {
    assessment.migrations.present.push(migration);
  } else {
    assessment.migrations.missing.push(migration);
    assessment.readiness.warnings.push(`Missing migration: ${migration}`);
  }
});

console.log('\n🔄 STEP 6: GIT STATUS CHECK');
console.log('============================');

// Check git status
const gitStatus = safeExec('git status --porcelain');
if (gitStatus) {
  const uncommittedFiles = gitStatus.split('\n').filter(line => line.trim());
  console.log(`Uncommitted changes: ${uncommittedFiles.length} files`);
  if (uncommittedFiles.length > 0) {
    console.log('Uncommitted files:');
    uncommittedFiles.slice(0, 10).forEach(file => {
      console.log(`  ${file}`);
    });
    if (uncommittedFiles.length > 10) {
      console.log(`  ... and ${uncommittedFiles.length - 10} more`);
    }
    assessment.readiness.warnings.push(`${uncommittedFiles.length} uncommitted files`);
  }
} else {
  console.log('✅ Working directory clean');
}

console.log('\n📋 STEP 7: BRANCH FILE COMPARISON');
console.log('==================================');

// Check what files are in backup branches (if accessible)
const backupBranches = [
  'backup-2026-01-10-task4-popia-consent',
  'backup-2026-01-10-phase0-task6-rls-implementation'
];

backupBranches.forEach(branch => {
  console.log(`\nChecking branch: ${branch}`);
  
  // Try to checkout branch and list files
  const currentBranch = safeExec('git branch --show-current');
  
  try {
    safeExec(`git checkout ${branch}`);
    
    // Get file list for this branch
    const branchFiles = getFileList('.', ['.js', '.jsx', '.sql']);
    const phase0Files = branchFiles.filter(file => 
      file.includes('consent') || 
      file.includes('popia') || 
      file.includes('retroactive') || 
      file.includes('rls') ||
      file.includes('bulk') ||
      file.includes('phase0')
    );
    
    console.log(`  Phase 0 related files in ${branch}:`);
    phase0Files.forEach(file => {
      console.log(`    📄 ${file}`);
    });
    
    // Store in assessment
    if (branch.includes('task4')) {
      assessment.files.task4 = phase0Files;
    } else if (branch.includes('task6')) {
      assessment.files.task56 = phase0Files;
    }
    
  } catch (error) {
    console.log(`  ❌ Could not access branch: ${error.message}`);
  }
  
  // Return to original branch
  if (currentBranch) {
    safeExec(`git checkout ${currentBranch}`);
  }
});

console.log('\n🎯 STEP 8: READINESS ASSESSMENT');
console.log('===============================');

// Calculate readiness score
let score = 0;
const maxScore = 100;

// Branch availability (20 points)
const availableBranches = requiredBranches.filter(branch => 
  remoteBranches && remoteBranches.includes(branch)
).length;
score += (availableBranches / requiredBranches.length) * 20;

// File completeness (30 points)
const totalExpectedFiles = Object.values(expectedFiles).flat().length;
const presentFiles = Object.values(expectedFiles).flat().filter(file => fileExists(file)).length;
score += (presentFiles / totalExpectedFiles) * 30;

// Build status (25 points)
if (assessment.build.status === 'success') score += 25;

// Test status (15 points)
if (assessment.tests.status === 'passing') score += 15;

// Migration status (10 points)
score += (assessment.migrations.present.length / requiredMigrations.length) * 10;

assessment.readiness.score = Math.round(score);

console.log(`\n📊 READINESS SCORE: ${assessment.readiness.score}/100`);

if (assessment.readiness.blockers.length > 0) {
  console.log('\n🚨 CRITICAL BLOCKERS:');
  assessment.readiness.blockers.forEach(blocker => {
    console.log(`  ❌ ${blocker}`);
  });
}

if (assessment.readiness.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  assessment.readiness.warnings.forEach(warning => {
    console.log(`  ⚠️  ${warning}`);
  });
}

console.log('\n🎯 RECOMMENDATIONS');
console.log('==================');

if (assessment.readiness.score < 70) {
  console.log('❌ NOT READY FOR DEPLOYMENT');
  console.log('\nImmediate actions required:');
  
  if (assessment.readiness.blockers.length > 0) {
    console.log('\n1. RESOLVE CRITICAL BLOCKERS:');
    assessment.readiness.blockers.forEach((blocker, i) => {
      console.log(`   ${i + 1}. ${blocker}`);
    });
  }
  
  if (assessment.files.missing.length > 0) {
    console.log('\n2. ADD MISSING FILES:');
    assessment.files.missing.forEach(({ task, file }) => {
      console.log(`   ${task}: ${file}`);
    });
  }
  
  console.log('\n3. SYSTEMATIC CONSOLIDATION NEEDED:');
  console.log('   - Create consolidation branch');
  console.log('   - Merge backup branches systematically');
  console.log('   - Resolve conflicts');
  console.log('   - Test thoroughly');
  
} else if (assessment.readiness.score < 90) {
  console.log('⚠️  PARTIALLY READY - PROCEED WITH CAUTION');
  console.log('\nRecommended actions before deployment:');
  assessment.readiness.warnings.forEach((warning, i) => {
    console.log(`   ${i + 1}. Address: ${warning}`);
  });
  
} else {
  console.log('✅ READY FOR DEPLOYMENT');
  console.log('\nAll systems go! You can proceed with confidence.');
}

console.log('\n📄 DETAILED REPORT');
console.log('==================');

// Save detailed assessment to file
const reportFile = `phase0-file-assessment-report-${new Date().toISOString().split('T')[0]}.json`;
fs.writeFileSync(reportFile, JSON.stringify(assessment, null, 2));
console.log(`Detailed assessment saved to: ${reportFile}`);

console.log('\n🚀 NEXT STEPS');
console.log('=============');

if (assessment.readiness.score < 70) {
  console.log('1. Run: git add . && git commit -m "docs: Phase 0 assessment"');
  console.log('2. Create consolidation branch: git checkout -b phase0-consolidation-jan-12-2026');
  console.log('3. Systematically merge backup branches');
  console.log('4. Fix all test failures');
  console.log('5. Verify build works');
  console.log('6. Re-run this assessment');
} else {
  console.log('1. Address any remaining warnings');
  console.log('2. Create final backup');
  console.log('3. Proceed with deployment');
}

console.log('\n✅ ASSESSMENT COMPLETE');
console.log(`Final Score: ${assessment.readiness.score}/100`);
console.log(`Status: ${assessment.readiness.score >= 90 ? 'READY' : assessment.readiness.score >= 70 ? 'CAUTION' : 'NOT READY'}`);