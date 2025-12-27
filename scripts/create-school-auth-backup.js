#!/usr/bin/env node

/**
 * Create comprehensive backup of school authentication system
 * Includes all files, migrations, and documentation created during development
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `SCHOOL-AUTH-BACKUP-${timestamp}`;

console.log('📦 Creating School Authentication System Backup...\n');
console.log(`Backup directory: ${backupDir}\n`);

// Files to backup - organized by category
const filesToBackup = {
  // Frontend Pages
  'Frontend Pages': [
    'app/admin/page.js',
    'app/school/claim/page.js',
    'app/school/verify/page.js',
    'app/unauthorized/page.js'
  ],
  
  // API Routes
  'API Routes': [
    'app/api/schools/search/route.js',
    'app/api/schools/claim/route.js'
  ],
  
  // Database Migrations
  'Database Migrations': [
    'supabase/migrations/20251224_add_school_auth_master.sql',
    'supabase/migrations/20251224_add_school_magic_links.sql'
  ],
  
  // Configuration & Middleware
  'Configuration': [
    'middleware.js',
    'next.config.js',
    'tailwind.config.js'
  ],
  
  // Scripts & Tools
  'Scripts': [
    'scripts/seed-school-auth-system.js',
    'scripts/extract-school-auth-data.js',
    'scripts/create-school-master-table.js',
    'scripts/run-school-auth-migration.js',
    'scripts/test-school-auth-system.js',
    'scripts/test-school-auth-flow.js',
    'scripts/test-hydration-fix.js',
    'scripts/test-branded-school-auth.js',
    'scripts/extract-auth-ready-schools.js'
  ],
  
  // Documentation & Specs
  'Documentation': [
    '.kiro/specs/school-auth-hydration-fix/requirements.md',
    'LOCAL-TESTING-GUIDE.md'
  ],
  
  // Data Files
  'Data Files': [
    'auth_ready_schools.csv',
    'auth_ready_schools.json',
    'school-auth-master.csv'
  ]
};

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Function to copy file with directory structure
function copyFileWithStructure(srcPath, destDir) {
  const fullSrcPath = path.join(process.cwd(), srcPath);
  const fullDestPath = path.join(destDir, srcPath);
  
  if (!fs.existsSync(fullSrcPath)) {
    console.log(`   ⚠️  File not found: ${srcPath}`);
    return false;
  }
  
  // Create directory structure
  const destDirPath = path.dirname(fullDestPath);
  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }
  
  // Copy file
  fs.copyFileSync(fullSrcPath, fullDestPath);
  return true;
}

// Backup all files by category
let totalFiles = 0;
let copiedFiles = 0;

for (const [category, files] of Object.entries(filesToBackup)) {
  console.log(`📁 ${category}:`);
  
  for (const file of files) {
    totalFiles++;
    if (copyFileWithStructure(file, backupDir)) {
      console.log(`   ✅ ${file}`);
      copiedFiles++;
    }
  }
  console.log('');
}

// Create backup summary
const summaryContent = `# School Authentication System Backup
Created: ${new Date().toISOString()}

## System Overview
Complete school authentication system with magic link verification, THANDI branding, and hydration fixes.

## Key Features Implemented
- ✅ School search and claim functionality
- ✅ Magic link email verification
- ✅ THANDI branded UI/UX
- ✅ Next.js 13+ hydration fixes
- ✅ Middleware route protection
- ✅ 11,816+ schools database
- ✅ Admin portal integration

## Files Backed Up
Total files: ${totalFiles}
Successfully copied: ${copiedFiles}

## Database Tables Created
- \`school_master\` - 11,816 schools with search capability
- \`school_magic_links\` - Token storage for verification

## API Endpoints
- \`GET /api/schools/search\` - School search with fuzzy matching
- \`POST /api/schools/claim\` - Magic link generation
- \`GET /api/schools/claim?token=X\` - Token verification

## User Flow
1. Landing page → Admin link → /admin
2. Auto-redirect → /school/claim (branded portal)
3. Search & select school
4. Enter principal email
5. Magic link sent & clicked
6. Verification → Dashboard access

## Testing
- All hydration errors resolved
- Suspense boundaries implemented
- THANDI branding applied
- Middleware properly configured

## Ready for 7-Day Pilot
System is production-ready with:
- Professional school portal
- Secure magic link authentication
- Full THANDI brand integration
- Comprehensive error handling

## Next Steps
1. Deploy to production
2. Test with pilot schools
3. Monitor magic link delivery
4. Gather user feedback
`;

fs.writeFileSync(path.join(backupDir, 'BACKUP-SUMMARY.md'), summaryContent);

// Create restoration script
const restoreScript = `#!/usr/bin/env node

/**
 * Restore school authentication system from backup
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 Restoring School Authentication System...');

const filesToRestore = ${JSON.stringify(Object.values(filesToBackup).flat(), null, 2)};

let restored = 0;
for (const file of filesToRestore) {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(process.cwd(), file);
  
  if (fs.existsSync(srcPath)) {
    // Create directory if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(srcPath, destPath);
    console.log(\`✅ Restored: \${file}\`);
    restored++;
  }
}

console.log(\`\\n🎉 Restored \${restored} files successfully!\`);
console.log('\\n📋 Next steps:');
console.log('1. Run database migrations');
console.log('2. Seed school data');
console.log('3. Test the system');
`;

fs.writeFileSync(path.join(backupDir, 'restore-backup.js'), restoreScript);

console.log('📊 Backup Summary:');
console.log(`   Total files: ${totalFiles}`);
console.log(`   Successfully copied: ${copiedFiles}`);
console.log(`   Backup location: ${backupDir}`);

console.log('\n📋 Backup Contents:');
console.log('   - Complete school authentication system');
console.log('   - Database migrations and seed scripts');
console.log('   - THANDI branded frontend pages');
console.log('   - API routes and middleware');
console.log('   - Testing and diagnostic scripts');
console.log('   - Documentation and specs');

console.log('\n🔄 To restore this backup:');
console.log(`   cd ${backupDir}`);
console.log('   node restore-backup.js');

console.log('\n✨ School Authentication System backup complete!');