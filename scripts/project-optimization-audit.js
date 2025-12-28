#!/usr/bin/env node

/**
 * Project Optimization Audit
 * Comprehensive analysis of project size and cleanup opportunities
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 PROJECT OPTIMIZATION AUDIT\n');
console.log('Analyzing project structure for cleanup opportunities...\n');

const projectRoot = '.';
const results = {
  totalSize: 0,
  fileCount: 0,
  directories: {},
  largeFiles: [],
  duplicates: [],
  cleanupOpportunities: []
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function shouldSkipDirectory(dirName) {
  const skipDirs = [
    'node_modules',
    '.git',
    '.next',
    '.vercel'
  ];
  return skipDirs.includes(dirName);
}

function analyzeDirectory(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath);
  let dirSize = 0;
  let dirFileCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativeItemPath = path.join(relativePath, item);
    
    try {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        if (!shouldSkipDirectory(item)) {
          const subDirResults = analyzeDirectory(fullPath, relativeItemPath);
          dirSize += subDirResults.size;
          dirFileCount += subDirResults.fileCount;
        }
      } else {
        const fileSize = stats.size;
        dirSize += fileSize;
        dirFileCount++;
        results.totalSize += fileSize;
        results.fileCount++;
        
        // Track large files (>1MB)
        if (fileSize > 1024 * 1024) {
          results.largeFiles.push({
            path: relativeItemPath,
            size: fileSize,
            sizeFormatted: formatBytes(fileSize)
          });
        }
      }
    } catch (error) {
      // Skip files we can't access
    }
  }
  
  if (relativePath) {
    results.directories[relativePath] = {
      size: dirSize,
      fileCount: dirFileCount,
      sizeFormatted: formatBytes(dirSize)
    };
  }
  
  return { size: dirSize, fileCount: dirFileCount };
}

function identifyCleanupOpportunities() {
  console.log('🧹 CLEANUP OPPORTUNITIES ANALYSIS\n');
  
  // 1. Backup folders
  const backupFolders = Object.keys(results.directories).filter(dir => 
    dir.toLowerCase().includes('backup') || 
    dir.toLowerCase().includes('BACKUP') ||
    dir.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)
  );
  
  if (backupFolders.length > 0) {
    let backupSize = 0;
    backupFolders.forEach(folder => {
      backupSize += results.directories[folder].size;
    });
    
    results.cleanupOpportunities.push({
      category: 'Backup Folders',
      items: backupFolders,
      totalSize: backupSize,
      recommendation: 'SAFE TO DELETE - Already backed up to Google Drive',
      priority: 'HIGH'
    });
  }
  
  // 2. Test files
  const testFiles = Object.keys(results.directories).filter(dir => 
    dir.includes('test-') || 
    dir.includes('debug-') ||
    dir.includes('check-') ||
    dir.includes('analyze-')
  );
  
  // 3. Documentation files (keep essential ones)
  const docFiles = [];
  try {
    const rootFiles = fs.readdirSync('.');
    const mdFiles = rootFiles.filter(file => 
      file.endsWith('.md') && 
      !['README.md', 'DEPLOYMENT-STATUS-FINAL.md', 'FINAL-DEPLOYMENT-ALIGNMENT-SUMMARY.md'].includes(file)
    );
    docFiles.push(...mdFiles);
  } catch (error) {
    // Skip if can't read root
  }
  
  if (docFiles.length > 0) {
    let docSize = 0;
    docFiles.forEach(file => {
      try {
        const stats = fs.statSync(file);
        docSize += stats.size;
      } catch (error) {
        // Skip
      }
    });
    
    results.cleanupOpportunities.push({
      category: 'Documentation Files',
      items: docFiles,
      totalSize: docSize,
      recommendation: 'REVIEW - Keep essential docs, archive others',
      priority: 'MEDIUM'
    });
  }
  
  // 4. Temporary/build files
  const tempFiles = ['.next', 'node_modules'];
  results.cleanupOpportunities.push({
    category: 'Build/Cache Files',
    items: tempFiles,
    totalSize: 0,
    recommendation: 'REGENERABLE - Can be rebuilt with npm install & npm run build',
    priority: 'LOW'
  });
  
  // 5. Large individual files
  if (results.largeFiles.length > 0) {
    results.cleanupOpportunities.push({
      category: 'Large Files',
      items: results.largeFiles.map(f => `${f.path} (${f.sizeFormatted})`),
      totalSize: results.largeFiles.reduce((sum, f) => sum + f.size, 0),
      recommendation: 'REVIEW - Check if these large files are necessary',
      priority: 'MEDIUM'
    });
  }
}

function generateOptimizationPlan() {
  console.log('📋 PROJECT OPTIMIZATION PLAN\n');
  
  // Calculate potential savings
  let totalSavings = 0;
  const highPriorityItems = [];
  const mediumPriorityItems = [];
  
  results.cleanupOpportunities.forEach(opportunity => {
    if (opportunity.priority === 'HIGH') {
      totalSavings += opportunity.totalSize;
      highPriorityItems.push(opportunity);
    } else if (opportunity.priority === 'MEDIUM') {
      mediumPriorityItems.push(opportunity);
    }
  });
  
  console.log('🎯 IMMEDIATE CLEANUP (HIGH PRIORITY):');
  highPriorityItems.forEach(item => {
    console.log(`\n📁 ${item.category}:`);
    console.log(`   Items: ${item.items.length}`);
    console.log(`   Size: ${formatBytes(item.totalSize)}`);
    console.log(`   Action: ${item.recommendation}`);
    
    if (item.items.length <= 10) {
      item.items.forEach(itemName => {
        console.log(`   - ${itemName}`);
      });
    } else {
      item.items.slice(0, 5).forEach(itemName => {
        console.log(`   - ${itemName}`);
      });
      console.log(`   ... and ${item.items.length - 5} more`);
    }
  });
  
  console.log('\n⚠️  REVIEW ITEMS (MEDIUM PRIORITY):');
  mediumPriorityItems.forEach(item => {
    console.log(`\n📁 ${item.category}:`);
    console.log(`   Items: ${item.items.length}`);
    console.log(`   Size: ${formatBytes(item.totalSize)}`);
    console.log(`   Action: ${item.recommendation}`);
  });
  
  console.log(`\n💾 POTENTIAL SPACE SAVINGS: ${formatBytes(totalSavings)}`);
  
  return { totalSavings, highPriorityItems, mediumPriorityItems };
}

function createCleanupScript(optimizationPlan) {
  const scriptContent = `#!/usr/bin/env node

/**
 * Project Cleanup Script
 * GENERATED BY PROJECT OPTIMIZATION AUDIT
 * 
 * WARNING: This script will DELETE files and folders.
 * Make sure you have backups before running!
 */

import fs from 'fs';
import path from 'path';

console.log('🧹 PROJECT CLEANUP SCRIPT\\n');
console.log('⚠️  WARNING: This will delete files and folders!\\n');

const itemsToDelete = [
${optimizationPlan.highPriorityItems
  .filter(item => item.category === 'Backup Folders')
  .flatMap(item => item.items)
  .map(item => `  '${item}'`)
  .join(',\\n')}
];

function deleteItem(itemPath) {
  try {
    if (fs.existsSync(itemPath)) {
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(\`✅ Deleted directory: \${itemPath}\`);
      } else {
        fs.unlinkSync(itemPath);
        console.log(\`✅ Deleted file: \${itemPath}\`);
      }
    } else {
      console.log(\`⚠️  Not found: \${itemPath}\`);
    }
  } catch (error) {
    console.log(\`❌ Error deleting \${itemPath}: \${error.message}\`);
  }
}

// Confirmation prompt
console.log('Items to be deleted:');
itemsToDelete.forEach(item => console.log(\`  - \${item}\`));
console.log('\\n⚠️  Are you sure you want to proceed? (This action cannot be undone)');
console.log('   Run with --confirm flag to proceed: node scripts/cleanup-project.js --confirm\\n');

if (process.argv.includes('--confirm')) {
  console.log('🚀 Starting cleanup...\\n');
  
  itemsToDelete.forEach(deleteItem);
  
  console.log('\\n✅ Cleanup completed!');
  console.log('💡 Run "npm install" and "npm run build" to regenerate build files if needed.');
} else {
  console.log('❌ Cleanup cancelled. Use --confirm flag to proceed.');
}
`;

  fs.writeFileSync('scripts/cleanup-project.js', scriptContent);
  console.log('\n📝 Created cleanup script: scripts/cleanup-project.js');
  console.log('   Run with: node scripts/cleanup-project.js --confirm');
}

// Main execution
async function main() {
  console.log('🔍 Scanning project structure...\n');
  
  analyzeDirectory(projectRoot);
  
  console.log('📊 PROJECT SIZE ANALYSIS\n');
  console.log(`Total Size: ${formatBytes(results.totalSize)}`);
  console.log(`Total Files: ${results.fileCount.toLocaleString()}`);
  
  // Show largest directories
  console.log('\n📁 LARGEST DIRECTORIES:\n');
  const sortedDirs = Object.entries(results.directories)
    .sort(([,a], [,b]) => b.size - a.size)
    .slice(0, 10);
  
  sortedDirs.forEach(([dirPath, info]) => {
    console.log(`${info.sizeFormatted.padEnd(10)} ${dirPath}`);
  });
  
  // Show large files
  if (results.largeFiles.length > 0) {
    console.log('\n📄 LARGE FILES (>1MB):\n');
    results.largeFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(file => {
        console.log(`${file.sizeFormatted.padEnd(10)} ${file.path}`);
      });
  }
  
  console.log('\n');
  identifyCleanupOpportunities();
  
  const optimizationPlan = generateOptimizationPlan();
  
  if (optimizationPlan.totalSavings > 0) {
    createCleanupScript(optimizationPlan);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Current Size: ${formatBytes(results.totalSize)}`);
  console.log(`Potential Savings: ${formatBytes(optimizationPlan.totalSavings)}`);
  console.log(`Efficiency Gain: ${((optimizationPlan.totalSavings / results.totalSize) * 100).toFixed(1)}%`);
  console.log('\n✅ Audit completed! Review recommendations above.');
}

main().catch(console.error);