#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileCounter {
  constructor() {
    this.totalFiles = 0;
    this.totalFolders = 0;
    this.totalSize = 0;
    this.extensions = new Map();
    this.errors = [];
    this.progressInterval = 1000;
  }

  async countFiles(folderPath, showProgress = true) {
    console.log(`Scanning folder: ${folderPath}`);
    console.log('Press Ctrl+C to stop\n');

    try {
      await this.scanDirectory(folderPath, showProgress);
    } catch (error) {
      console.error(`Error scanning directory: ${error.message}`);
      return null;
    }

    return this.getResults();
  }

  async scanDirectory(dirPath, showProgress) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        try {
          if (entry.isDirectory()) {
            this.totalFolders++;
            // Recursively scan subdirectories
            await this.scanDirectory(fullPath, showProgress);
          } else if (entry.isFile()) {
            this.totalFiles++;
            
            // Get file stats for size
            try {
              const stats = await fs.stat(fullPath);
              this.totalSize += stats.size;
              
              // Track file extensions
              const ext = path.extname(entry.name).toLowerCase() || 'no extension';
              this.extensions.set(ext, (this.extensions.get(ext) || 0) + 1);
            } catch (statError) {
              // File might have been deleted or permission denied
              this.errors.push(`Cannot stat ${fullPath}: ${statError.message}`);
            }
            
            // Show progress
            if (showProgress && this.totalFiles % this.progressInterval === 0) {
              process.stdout.write(`\rScanned ${this.totalFiles.toLocaleString()} files, ${this.totalFolders.toLocaleString()} folders...`);
            }
          }
        } catch (entryError) {
          this.errors.push(`Cannot access ${fullPath}: ${entryError.message}`);
        }
      }
    } catch (error) {
      this.errors.push(`Cannot read directory ${dirPath}: ${error.message}`);
    }
  }

  getResults() {
    return {
      totalFiles: this.totalFiles,
      totalFolders: this.totalFolders,
      totalSize: this.totalSize,
      totalSizeGB: (this.totalSize / (1024 ** 3)).toFixed(2),
      extensions: this.extensions,
      errors: this.errors
    };
  }

  printResults(results) {
    console.log('\n' + '='.repeat(50));
    console.log('SCAN RESULTS');
    console.log('='.repeat(50));
    console.log(`Total files: ${results.totalFiles.toLocaleString()}`);
    console.log(`Total folders: ${results.totalFolders.toLocaleString()}`);
    console.log(`Total size: ${(results.totalSize / (1024 ** 2)).toFixed(2)} MB (${results.totalSizeGB} GB)`);
    
    if (results.extensions.size > 0) {
      console.log('\nTop 10 file extensions:');
      console.log('-'.repeat(30));
      
      const sortedExtensions = Array.from(results.extensions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      sortedExtensions.forEach(([ext, count]) => {
        const percentage = ((count / results.totalFiles) * 100).toFixed(1);
        console.log(`${ext.padEnd(15)} ${count.toLocaleString().padStart(8)} (${percentage}%)`);
      });
    }
    
    if (results.errors.length > 0) {
      console.log(`\nErrors encountered: ${results.errors.length}`);
      if (results.errors.length <= 5) {
        results.errors.forEach(error => console.log(`  - ${error}`));
      } else {
        results.errors.slice(0, 3).forEach(error => console.log(`  - ${error}`));
        console.log(`  ... and ${results.errors.length - 3} more errors`);
      }
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node count-files.js <folder-path> [--no-progress]');
    console.log('Example: node count-files.js ./my-large-folder');
    process.exit(1);
  }
  
  const folderPath = args[0];
  const showProgress = !args.includes('--no-progress');
  
  // Check if folder exists
  try {
    const stats = await fs.stat(folderPath);
    if (!stats.isDirectory()) {
      console.error(`Error: ${folderPath} is not a directory`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: Cannot access ${folderPath} - ${error.message}`);
    process.exit(1);
  }
  
  const counter = new FileCounter();
  const startTime = Date.now();
  
  const results = await counter.countFiles(folderPath, showProgress);
  
  if (results) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    counter.printResults(results);
    console.log(`\nScan completed in ${duration} seconds`);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nScan interrupted by user');
  process.exit(0);
});

if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export default FileCounter;