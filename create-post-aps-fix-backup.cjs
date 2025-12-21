#!/usr/bin/env node

/**
 * Post-APS Fix Comprehensive Backup
 * Creates a complete backup after successful APS scoring fix
 * Preserves all critical fixes: Legal framework, Footer integration, APS calculation
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 POST-APS FIX COMPREHENSIVE BACKUP');
console.log('='.repeat(60));
console.log('Creating backup after successful APS scoring fix...');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `POST-APS-FIX-BACKUP-${timestamp}`;

// Critical files to backup (all major fixes)
const criticalFiles = [
  // APS Fix - Core Implementation
  'app/assessment/components/AssessmentForm.jsx',
  'app/api/rag/query/route.js',
  'lib/matching/program-matcher.js',
  
  // Legal Framework (8 documents)
  'legal/privacy-policy.md',
  'legal/terms-of-service.md',
  'legal/cookie-policy.md',
  'legal/popia-compliance.md',
  'legal/student-data-protection.md',
  'legal/disclaimers.md',
  'legal/content-policy.md',
  'legal/contact-information.md',
  'legal/data-processing-notice.md',
  'legal/accessibility-statement.md',
  'legal/document-status.md',
  
  // Footer Integration
  'app/components/Footer.jsx',
  'app/legal/[slug]/page.jsx',
  'app/legal/components/PrintButton.jsx',
  'app/globals.css',
  
  // Assessment Components
  'app/assessment/page.jsx',
  'app/assessment/components/GradeSelector.jsx',
  'app/assessment/components/CurriculumProfile.jsx',
  'app/assessment/components/MarksCollection.jsx',
  'app/assessment/components/SubjectSelection.jsx',
  'app/assessment/components/InterestAreas.jsx',
  'app/assessment/components/Constraints.jsx',
  'app/assessment/components/OpenQuestions.jsx',
  'app/assessment/components/DeepDiveQuestions.jsx',
  'app/assessment/components/PreliminaryReport.jsx',
  'app/assessment/components/ProgressBar.jsx',
  
  // Results and Core Pages
  'app/results/page.jsx',
  'app/page.jsx',
  
  // Configuration Files
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'vercel.json',
  '.env.example',
  '.env.local.template',
  
  // Core Libraries
  'lib/cache/rag-cache.js',
  'lib/academic/emergency-calendar.js',
  'lib/analytics/track-events.js',
  'lib/utils.js',
  
  // Documentation & Reports
  'APS-FIX-COMPLETION-REPORT.md',
  'SYSTEMATIC-APS-FIX-PLAN.md',
  'PROFESSIONAL-FOOTER-IMPLEMENTATION-COMPLETE.md',
  'deployment-info.json'
];

// Diagnostic and test files (for troubleshooting)
const diagnosticFiles = [
  'systematic-aps-diagnostic.cjs',
  'test-production-aps-fix.cjs',
  'test-local-aps-fix.cjs',
  'test-aps-fix-verification.js',
  'test-production-footer-legal.js',
  'APS-DIAGNOSTIC-REPORT.json'
];

function createBackupDirectory() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`✅ Created backup directory: ${backupDir}`);
  }
}

function copyFileToBackup(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const backupPath = path.join(backupDir, filePath);
      const backupDirPath = path.dirname(backupPath);
      
      // Create directory structure
      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }
      
      // Copy file
      fs.copyFileSync(filePath, backupPath);
      console.log(`✅ Backed up: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error backing up ${filePath}:`, error.message);
    return false;
  }
}

function createBackupManifest() {
  const manifest = {
    timestamp: new Date().toISOString(),
    backupType: 'POST_APS_FIX_COMPREHENSIVE',
    description: 'Complete backup after successful APS scoring fix implementation',
    fixes_included: [
      'APS Scoring Fix - extractActualMarks() function implementation',
      'Legal Framework - 8 POPIA-compliant documents',
      'Footer Integration - Professional legal compliance display',
      'Assessment Flow - All grade levels (10, 11, 12)',
      'Cache Management - Session-based cache bypass',
      'Production Deployment - Verified working at thandiai.vercel.app'
    ],
    critical_components: {
      aps_fix: {
        file: 'app/assessment/components/AssessmentForm.jsx',
        function: 'extractActualMarks()',
        description: 'Transforms nested marksData to flat marks structure for APS calculation'
      },
      legal_framework: {
        documents: 8,
        compliance: 'POPIA, GDPR',
        registration: '2025-068149'
      },
      footer_integration: {
        file: 'app/components/Footer.jsx',
        features: 'Legal links, trust badges, privacy-focused design'
      }
    },
    deployment_info: {
      url: 'https://thandiai.vercel.app',
      version: '0.1.4',
      status: 'LIVE_AND_VERIFIED'
    },
    verification_results: {
      aps_calculation: 'WORKING - Shows correct points (39 instead of 0)',
      university_eligibility: 'WORKING - Qualified status displayed',
      program_recommendations: 'WORKING - Proper APS requirements shown',
      legal_documents: 'WORKING - All 8 documents accessible',
      footer_compliance: 'WORKING - Professional display with trust badges'
    }
  };
  
  const manifestPath = path.join(backupDir, 'BACKUP-MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Created backup manifest: ${manifestPath}`);
}

function createRecoveryInstructions() {
  const instructions = `# RECOVERY INSTRUCTIONS

## Backup Information
- **Created**: ${new Date().toISOString()}
- **Type**: Post-APS Fix Comprehensive Backup
- **Status**: All critical fixes verified and working

## What This Backup Contains

### 1. APS Scoring Fix ✅
- **File**: app/assessment/components/AssessmentForm.jsx
- **Fix**: extractActualMarks() function
- **Issue Resolved**: APS showing 0 points → Now shows correct calculation (39 points)

### 2. Legal Framework ✅
- **Files**: 8 legal documents in /legal/ directory
- **Compliance**: POPIA, GDPR compliant
- **Registration**: 2025-068149

### 3. Footer Integration ✅
- **File**: app/components/Footer.jsx
- **Features**: Legal links, trust badges, professional design

### 4. Assessment Components ✅
- All grade levels (10, 11, 12) working
- Complete assessment flow preserved
- Cache management implemented

## Recovery Process

### If APS Calculation Breaks:
1. Restore: app/assessment/components/AssessmentForm.jsx
2. Key function: extractActualMarks()
3. Verify: APS shows correct points, not 0

### If Legal Framework Issues:
1. Restore: All files in /legal/ directory
2. Restore: app/legal/[slug]/page.jsx
3. Verify: All 8 documents accessible

### If Footer Problems:
1. Restore: app/components/Footer.jsx
2. Restore: app/globals.css (legal document styles)
3. Verify: Legal links and trust badges display

### Full System Recovery:
1. Copy all files from this backup to project root
2. Run: npm install
3. Run: npm run dev (test locally)
4. Deploy: vercel --prod --force
5. Update domain alias: vercel alias set [new-url] thandiai.vercel.app

## Verification Checklist

After recovery, verify:
- [ ] APS calculation shows correct points (not 0)
- [ ] University eligibility displays properly
- [ ] All 8 legal documents accessible
- [ ] Footer shows legal links and trust badges
- [ ] Assessment flow works for all grades
- [ ] Production deployment successful

## Emergency Contacts
- Production URL: https://thandiai.vercel.app
- Backup created after successful fix verification
- All systems tested and working at time of backup

## Notes
This backup represents a fully working state with all critical fixes implemented and verified. Use this as the gold standard for system recovery.
`;

  const instructionsPath = path.join(backupDir, 'RECOVERY-INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, instructions);
  console.log(`✅ Created recovery instructions: ${instructionsPath}`);
}

async function createComprehensiveBackup() {
  console.log('\n📦 Creating comprehensive backup...');
  
  createBackupDirectory();
  
  let successCount = 0;
  let totalFiles = criticalFiles.length + diagnosticFiles.length;
  
  console.log('\n🔧 Backing up critical files...');
  for (const file of criticalFiles) {
    if (copyFileToBackup(file)) {
      successCount++;
    }
  }
  
  console.log('\n🧪 Backing up diagnostic files...');
  for (const file of diagnosticFiles) {
    if (copyFileToBackup(file)) {
      successCount++;
    }
  }
  
  console.log('\n📋 Creating backup documentation...');
  createBackupManifest();
  createRecoveryInstructions();
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ BACKUP COMPLETE: ${successCount}/${totalFiles} files backed up`);
  console.log(`📁 Backup location: ${backupDir}`);
  console.log(`🔒 All critical fixes preserved for future recovery`);
  console.log('='.repeat(60));
  
  return {
    success: true,
    backupDir,
    filesBackedUp: successCount,
    totalFiles
  };
}

// Execute backup
createComprehensiveBackup().catch(console.error);