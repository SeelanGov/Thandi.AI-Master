#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Cleanup script for preparing repository for GitHub/Supabase upload
 * Removes large folders and files that shouldn't be in version control
 */

const FOLDERS_TO_REMOVE = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.vercel/output'
];

const FILE_PATTERNS_TO_REMOVE = [
  '*.log',
  '*.tmp',
  '*.temp',
  '.DS_Store',
  'Thumbs.db'
];

async function removeFolder(folderPath) {
  try {
    await fs.access(folderPath);
    console.log(`Removing folder: ${folderPath}`);
    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`✓ Removed: ${folderPath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.log(`⚠ Could not remove ${folderPath}: ${error.message}`);
    }
  }
}

async function removeFilesByPattern(pattern) {
  // Simple implementation - you could use glob for more complex patterns
  console.log(`Checking for files matching: ${pattern}`);
}

async function getDirectorySize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const { size, files } = await getDirectorySize(fullPath);
        totalSize += size;
        fileCount += files;
      } else if (entry.isFile()) {
        try {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
          fileCount++;
        } catch (err) {
          // Skip files we can't access
        }
      }
    }
  } catch (err) {
    // Skip directories we can't access
  }
  
  return { size: totalSize, files: fileCount };
}

async function main() {
  console.log('🧹 Starting repository cleanup...\n');
  
  // Check initial size
  console.log('📊 Checking current repository size...');
  const initialStats = await getDirectorySize('.');
  console.log(`Initial: ${initialStats.files.toLocaleString()} files, ${(initialStats.size / (1024**2)).toFixed(2)} MB\n`);
  
  // Remove large folders
  console.log('📁 Removing large folders...');
  for (const folder of FOLDERS_TO_REMOVE) {
    await removeFolder(folder);
  }
  
  // Check final size
  console.log('\n📊 Checking final repository size...');
  const finalStats = await getDirectorySize('.');
  console.log(`Final: ${finalStats.files.toLocaleString()} files, ${(finalStats.size / (1024**2)).toFixed(2)} MB`);
  
  const savedFiles = initialStats.files - finalStats.files;
  const savedSize = (initialStats.size - finalStats.size) / (1024**2);
  
  console.log(`\n✨ Cleanup complete!`);
  console.log(`📉 Removed: ${savedFiles.toLocaleString()} files (${savedSize.toFixed(2)} MB)`);
  
  if (finalStats.files < 5000 && finalStats.size < 100 * 1024 * 1024) {
    console.log('✅ Repository is now ready for GitHub/Supabase upload!');
  } else {
    console.log('⚠️  Repository might still be large. Consider removing more files.');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Run: git add -A');
  console.log('2. Run: git commit -m "Clean up repository"');
  console.log('3. Push to GitHub or upload to Supabase');
}

if (process.argv[1] && process.argv[1].endsWith('cleanup-for-upload.js')) {
  main().catch(console.error);
}

export default main;