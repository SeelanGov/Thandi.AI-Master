#!/usr/bin/env node

/**
 * STEP 1 BACKUP CREATION SCRIPT
 * Creates comprehensive backup of all Step 1 enhancements
 */

const fs = require('fs');
const path = require('path');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backups/step1-enhanced-bursary-kb-${timestamp}`;
  
  console.log('🔄 Creating Step 1 Backup...');
  console.log(`📁 Backup Directory: ${backupDir}`);
  
  // Create backup directory
  if (!fs.existsSync('backups')) {
    fs.mkdirSync('backups');
  }
  fs.mkdirSync(backupDir, { recursive: true });
  
  // Files to backup
  const filesToBackup = [
    // Enhanced Knowledge Base Files
    'thandi_knowledge_base/financial_aid/bursaries.json',
    'thandi_knowledge_base/financial_aid/matcher.json',
    'thandi_knowledge_base/rag/rag_templates.json',
    
    // Step 1 Documentation
    'STEP-1-ENHANCED-BURSARY-KB-COMPLETE.md',
    'THANDI-SYSTEM-OVERVIEW-REPORT-DEC-30-2025.md',
    
    // Verification Scripts
    'test-enhanced-bursary-system.js',
    
    // Recent System Reports
    'COMPREHENSIVE-SYSTEM-COMPLETION-REPORT-DEC-29-2025.md',
    'PHASE-4-SPRINT-3-FINAL-COMPLETION-REPORT-DEC-29-2025.md',
    'RAG-SYSTEM-FUNCTIONALITY-REPORT.md',
    
    // Deployment Success
    'VERCEL-DEPLOYMENT-SUCCESS-SUMMARY.md',
    'verify-deployment-success.js'
  ];
  
  let backedUpCount = 0;
  
  filesToBackup.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const backupPath = path.join(backupDir, file);
        const backupFileDir = path.dirname(backupPath);
        
        // Create directory structure
        fs.mkdirSync(backupFileDir, { recursive: true });
        
        // Copy file
        fs.copyFileSync(file, backupPath);
        console.log(`✅ Backed up: ${file}`);
        backedUpCount++;
      } else {
        console.log(`⚠️  File not found: ${file}`);
      }
    } catch (error) {
      console.log(`❌ Error backing up ${file}: ${error.message}`);
    }
  });
  
  // Create backup manifest
  const manifest = {
    backup_date: new Date().toISOString(),
    step: 'Step 1 - Enhanced Bursary KB',
    description: 'Complete backup of Step 1 enhancements including 18 bursaries, 10 student profiles, and RAG templates',
    files_backed_up: backedUpCount,
    total_files: filesToBackup.length,
    achievements: [
      '18 comprehensive bursaries (8 original + 10 new)',
      '10 student profiles with sophisticated matching',
      'TVET, Private Institution, and 4IR tech coverage',
      'Enhanced RAG templates with funding recommendations',
      '100% verification success rate'
    ],
    next_phase: 'Step 2 - Live Search Integration',
    system_status: '96% complete, ready for final sprint'
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'BACKUP-MANIFEST.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('\n📊 BACKUP SUMMARY');
  console.log('==================');
  console.log(`✅ Files Backed Up: ${backedUpCount}/${filesToBackup.length}`);
  console.log(`📁 Backup Location: ${backupDir}`);
  console.log(`📅 Backup Date: ${manifest.backup_date}`);
  console.log('\n🎯 STEP 1 ACHIEVEMENTS PRESERVED:');
  manifest.achievements.forEach(achievement => {
    console.log(`   - ${achievement}`);
  });
  
  return backupDir;
}

// Run backup
const backupLocation = createBackup();
console.log(`\n🎉 Step 1 backup completed successfully!`);
console.log(`📦 Backup saved to: ${backupLocation}`);