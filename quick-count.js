#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function quickCount(folderPath) {
  let files = 0;
  let folders = 0;
  let errors = 0;

  async function scan(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        try {
          if (entry.isDirectory()) {
            folders++;
            await scan(path.join(dir, entry.name));
          } else if (entry.isFile()) {
            files++;
            if (files % 5000 === 0) {
              process.stdout.write(`\r${files.toLocaleString()} files...`);
            }
          }
        } catch (err) {
          errors++;
        }
      }
    } catch (err) {
      errors++;
    }
  }

  console.log(`Counting files in: ${folderPath}`);
  const start = Date.now();
  
  await scan(folderPath);
  
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  
  console.log(`\n\nResults:`);
  console.log(`Files: ${files.toLocaleString()}`);
  console.log(`Folders: ${folders.toLocaleString()}`);
  console.log(`Errors: ${errors}`);
  console.log(`Time: ${duration}s`);
  
  return { files, folders, errors };
}

// CLI
if (process.argv[1] === __filename) {
  const folderPath = process.argv[2];
  if (!folderPath) {
    console.log('Usage: node quick-count.js <folder-path>');
    process.exit(1);
  }
  
  quickCount(folderPath).catch(console.error);
}

export default quickCount;