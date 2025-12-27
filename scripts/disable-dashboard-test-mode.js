#!/usr/bin/env node

/**
 * Disable test mode and restore original middleware
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 Disabling Dashboard Test Mode...');

const middlewarePath = path.join(process.cwd(), 'middleware.js');
const backupPath = path.join(process.cwd(), 'middleware.js.backup');

if (fs.existsSync(backupPath)) {
  const originalMiddleware = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(middlewarePath, originalMiddleware);
  fs.unlinkSync(backupPath);
  
  console.log('✅ Original middleware restored');
  console.log('✅ Test mode disabled');
  console.log('✅ Backup file removed');
} else {
  console.log('❌ Backup file not found');
}
