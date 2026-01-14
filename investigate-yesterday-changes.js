// investigate-yesterday-changes.js
// Find what changed on Jan 13 that broke RAG system
import { execSync } from 'child_process';
import fs from 'fs';

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 INVESTIGATING YESTERDAY\'S CHANGES (JAN 13, 2026)');
console.log('   What broke the RAG system that was working?');
console.log('═══════════════════════════════════════════════════════\n');

// Get git commits from Jan 13
console.log('📅 Git Commits from January 13, 2026:\n');
try {
  const commits = execSync('git log --since="2026-01-13 00:00" --until="2026-01-14 00:00" --oneline', { encoding: 'utf-8' });
  console.log(commits);
  console.log('');
} catch (error) {
  console.log('Could not retrieve git commits\n');
}

// Check what files were modified yesterday
console.log('📝 Files Modified on January 13:\n');
try {
  const modifiedFiles = execSync('git log --since="2026-01-13 00:00" --until="2026-01-14 00:00" --name-only --pretty=format:', { encoding: 'utf-8' });
  const uniqueFiles = [...new Set(modifiedFiles.split('\n').filter(f => f.trim()))];
  
  // Filter for RAG-related files
  const ragFiles = uniqueFiles.filter(f => 
    f.includes('rag') || 
    f.includes('api') || 
    f.includes('route') ||
    f.includes('embeddings') ||
    f.includes('search') ||
    f.includes('supabase')
  );
  
  if (ragFiles.length > 0) {
    console.log('🚨 RAG-RELATED FILES MODIFIED:');
    ragFiles.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log('⚠️  No obvious RAG-related files in git history');
  }
  console.log('');
} catch (error) {
  console.log('Could not retrieve modified files\n');
}

// Check deployment logs
console.log('📋 Checking Deployment Documents from Jan 13:\n');
const jan13Docs = [
  'DEPLOYMENT-SUCCESS-FINAL-JAN-13-2026.md',
  'BULLETPROOF-SYSTEM-LIVE-DEPLOYMENT-SUCCESS-JAN-13-2026.md',
  'PHASE0-COMPLETION-STATUS-JAN-13-2026.md',
  'HOTFIX-DEPLOYMENT-PROTOCOL-JAN-13-2026.md'
];

jan13Docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    console.log(`✅ Found: ${doc}`);
    const content = fs.readFileSync(doc, 'utf-8');
    
    // Look for mentions of RAG, API routes, or database changes
    if (content.toLowerCase().includes('rag') || 
        content.toLowerCase().includes('api/rag') ||
        content.toLowerCase().includes('route.js')) {
      console.log('   🚨 MENTIONS RAG SYSTEM!');
    }
  }
});

console.log('\n');

// Check if RAG route was deleted or renamed
console.log('📂 Checking RAG Route Files Status:\n');
const ragRouteFiles = [
  'app/api/rag/query/route.js',
  'app/api/rag/query/route.js.disabled',
  'app/api/rag/query/route.js.backup',
  'app/api/rag/query/route.js.broken',
  'app/api/rag/query/route-real-db.js',
  'app/api/rag/query/route-with-cag.js',
  'app/api/rag/query/route-simple.js'
];

ragRouteFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const modDate = stats.mtime.toISOString().split('T')[0];
    console.log(`✅ ${file}`);
    console.log(`   Modified: ${modDate}`);
    
    if (modDate === '2026-01-13') {
      console.log('   🚨 MODIFIED YESTERDAY!');
    }
  } else {
    console.log(`❌ ${file} - DOES NOT EXIST`);
  }
});

console.log('\n');

// Check backup files from Jan 10 (when it was working)
console.log('📦 Checking Backup from Jan 10 (When RAG Was Working):\n');
const backupPath = 'backups/pre-deployment-jan-10-2026-1768035398875/app/api/rag/query';
if (fs.existsSync(backupPath)) {
  console.log(`✅ Backup exists: ${backupPath}`);
  const backupFiles = fs.readdirSync(backupPath);
  console.log('   Files in backup:');
  backupFiles.forEach(f => console.log(`   - ${f}`));
} else {
  console.log('❌ No backup found from Jan 10');
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('🎯 HYPOTHESIS: What Likely Happened');
console.log('═══════════════════════════════════════════════════════\n');

console.log('Based on file status:');
console.log('1. route.js does NOT exist (main RAG endpoint)');
console.log('2. Multiple .disabled, .backup, .broken versions exist');
console.log('3. This suggests route.js was RENAMED/DISABLED during yesterday\'s work');
console.log('');
console.log('🔍 NEXT STEP: Compare backup route.js with current state');
console.log('   to see exactly what changed\n');
