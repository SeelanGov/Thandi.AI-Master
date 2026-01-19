#!/usr/bin/env node
/**
 * BATCH API RESTORATION SCRIPT
 * Systematically restores all disabled APIs with syntax fixes
 * Date: January 14, 2026
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of all disabled APIs to restore
const DISABLED_APIS = [
  // MEDIUM PRIORITY
  {
    path: 'app/api/schools/login/route.js.disabled',
    priority: 'MEDIUM',
    description: 'Schools Login - Check for duplicate'
  },
  {
    path: 'app/api/schools/claim/route.js.disabled',
    priority: 'MEDIUM',
    description: 'School Claiming - Schools can\'t claim profiles'
  },
  {
    path: 'app/api/schools/request-addition/route.js.disabled',
    priority: 'MEDIUM',
    description: 'School Addition Requests - Can\'t request new schools'
  },
  
  // LOWER PRIORITY
  {
    path: 'app/api/school/dashboard/stats/route.js.disabled',
    priority: 'LOW',
    description: 'Dashboard Stats - Evaluate usage'
  },
  {
    path: 'app/api/school/students/at-risk/route.js.disabled',
    priority: 'LOW',
    description: 'At-Risk Students - Evaluate usage'
  },
  {
    path: 'app/api/school/students/route.js.disabled',
    priority: 'LOW',
    description: 'Student Management - Evaluate usage'
  },
  {
    path: 'app/api/student/retroactive-association/route.js.disabled',
    priority: 'LOW',
    description: 'Retroactive Association - Evaluate usage'
  },
  
  // EXTRA (Found during scan)
  {
    path: 'app/api/assess/route.js.disabled',
    priority: 'LOW',
    description: 'Assessment API - Evaluate usage'
  }
];

/**
 * Fix addCacheHeaders syntax errors
 * Pattern: addCacheHeaders(NextResponse.json(..., { status: XXX });
 * Fix: addCacheHeaders(NextResponse.json(..., { status: XXX }));
 */
function fixAddCacheHeadersSyntax(content) {
  let fixed = content;
  let fixCount = 0;
  
  // Split into lines for line-by-line processing
  const lines = fixed.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if this line contains addCacheHeaders with potential syntax error
    if (line.includes('addCacheHeaders(NextResponse.json(')) {
      // Look ahead to find the closing pattern
      let fullStatement = line;
      let j = i + 1;
      
      // Collect multi-line statement
      while (j < lines.length && !fullStatement.includes(');')) {
        fullStatement += '\n' + lines[j];
        j++;
      }
      
      // Check if it's missing a closing parenthesis
      // Pattern: ends with }); instead of }));
      if (fullStatement.match(/\{ status: \d+ \}\);[\s]*$/)) {
        // Fix: add extra closing parenthesis
        fullStatement = fullStatement.replace(/(\{ status: \d+ \});([\s]*)$/, '$1));$2');
        fixCount++;
      }
      
      // Add the fixed statement
      const statementLines = fullStatement.split('\n');
      fixedLines.push(...statementLines);
      
      // Skip the lines we already processed
      i = j - 1;
    } else {
      fixedLines.push(line);
    }
  }
  
  fixed = fixedLines.join('\n');
  
  return { fixed, fixCount };
}

/**
 * Restore a single API file
 */
function restoreAPI(api) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📦 RESTORING: ${api.description}`);
  console.log(`   File: ${api.path}`);
  console.log(`   Priority: ${api.priority}`);
  console.log(`${'='.repeat(80)}`);
  
  if (api.skip) {
    console.log('✅ SKIPPED: Already restored');
    return { success: true, skipped: true };
  }
  
  const disabledPath = api.path;
  const activePath = disabledPath.replace('.disabled', '');
  
  // Check if disabled file exists
  if (!fs.existsSync(disabledPath)) {
    console.log(`⚠️  WARNING: Disabled file not found: ${disabledPath}`);
    return { success: false, error: 'File not found' };
  }
  
  // Read disabled file
  console.log('📖 Reading disabled file...');
  const content = fs.readFileSync(disabledPath, 'utf8');
  
  // Fix syntax errors
  console.log('🔧 Fixing syntax errors...');
  const { fixed, fixCount } = fixAddCacheHeadersSyntax(content);
  
  if (fixCount > 0) {
    console.log(`✅ Fixed ${fixCount} syntax error(s)`);
  } else {
    console.log('ℹ️  No syntax errors found');
  }
  
  // Write to active path
  console.log(`💾 Writing to: ${activePath}`);
  fs.writeFileSync(activePath, fixed, 'utf8');
  
  // Remove disabled file
  console.log(`🗑️  Removing disabled file: ${disabledPath}`);
  fs.unlinkSync(disabledPath);
  
  console.log('✅ RESTORATION COMPLETE');
  
  return {
    success: true,
    fixCount,
    activePath
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('\n');
  console.log('🛡️  BULLETPROOF API RESTORATION SYSTEM');
  console.log('=====================================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`APIs to restore: ${DISABLED_APIS.filter(a => !a.skip).length}`);
  console.log('\n');
  
  const results = {
    total: DISABLED_APIS.length,
    restored: 0,
    skipped: 0,
    failed: 0,
    totalFixes: 0,
    restoredFiles: []
  };
  
  // Process each API
  for (const api of DISABLED_APIS) {
    try {
      const result = restoreAPI(api);
      
      if (result.skipped) {
        results.skipped++;
      } else if (result.success) {
        results.restored++;
        results.totalFixes += result.fixCount || 0;
        results.restoredFiles.push(result.activePath);
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`❌ ERROR: ${error.message}`);
      results.failed++;
    }
  }
  
  // Summary
  console.log('\n');
  console.log('📊 RESTORATION SUMMARY');
  console.log('======================');
  console.log(`Total APIs: ${results.total}`);
  console.log(`✅ Restored: ${results.restored}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`🔧 Total Syntax Fixes: ${results.totalFixes}`);
  console.log('\n');
  
  if (results.restoredFiles.length > 0) {
    console.log('📝 RESTORED FILES:');
    results.restoredFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('\n');
  }
  
  // Save results
  const resultsFile = 'api-restoration-results.json';
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: ${resultsFile}`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  main()
    .then(results => {
      if (results.failed > 0) {
        console.error('\n⚠️  Some APIs failed to restore. Check errors above.');
        process.exit(1);
      } else {
        console.log('\n✅ ALL APIS RESTORED SUCCESSFULLY!');
        console.log('\n📋 NEXT STEPS:');
        console.log('   1. Run: npm run build');
        console.log('   2. Commit changes');
        console.log('   3. Deploy with: vercel --prod --force');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('\n❌ FATAL ERROR:', error);
      process.exit(1);
    });
}

module.exports = { restoreAPI, fixAddCacheHeadersSyntax };
