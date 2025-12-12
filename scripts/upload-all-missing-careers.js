#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const scripts = [
  'scripts/upload-graphic-designer.js',
  // Add more as needed
];

console.log('📦 UPLOADING ALL MISSING CAREERS\n');

for (const script of scripts) {
  console.log(`Running: ${script}`);
  try {
    const { stdout, stderr } = await execAsync(`node ${script}`);
    console.log(stdout);
    if (stderr && !stderr.includes('dotenv')) {
      console.error(stderr);
    }
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    // Continue with next script
  }
  console.log('');
}

console.log('✅ Batch upload complete!');
