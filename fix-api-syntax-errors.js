#!/usr/bin/env node
/**
 * FIX API SYNTAX ERRORS
 * Fixes missing closing parentheses in addCacheHeaders calls
 * Date: January 14, 2026
 */

const fs = require('fs');

const FILES_TO_FIX = [
  'app/api/school/students/route.js',
  'app/api/schools/claim/route.js',
  'app/api/schools/login/route.js',
  'app/api/schools/request-addition/route.js',
  'app/api/student/retroactive-association/route.js'
];

function fixFile(filePath) {
  console.log(`\n🔧 Fixing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;
  
  // Pattern 1: Single line - }, { status: XXX });
  let pattern1 = /(}, \{ status: \d+ \});/g;
  content = content.replace(pattern1, (match) => {
    fixCount++;
    return match.slice(0, -2) + '));';
  });
  
  // Pattern 2: Multi-line - \n      }, { status: XXX });
  let pattern2 = /(\n\s+}, \{ status: \d+ \});/g;
  content = content.replace(pattern2, (match) => {
    fixCount++;
    return match.slice(0, -2) + '));';
  });
  
  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${fixCount} syntax error(s)`);
  } else {
    console.log(`ℹ️  No errors found`);
  }
  
  return fixCount;
}

console.log('🛡️  FIXING API SYNTAX ERRORS');
console.log('============================\n');

let totalFixes = 0;

for (const file of FILES_TO_FIX) {
  try {
    totalFixes += fixFile(file);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
}

console.log(`\n📊 SUMMARY`);
console.log(`==========`);
console.log(`Files processed: ${FILES_TO_FIX.length}`);
console.log(`Total fixes: ${totalFixes}`);
console.log(`\n✅ COMPLETE`);
