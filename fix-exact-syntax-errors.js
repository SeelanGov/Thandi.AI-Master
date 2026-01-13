#!/usr/bin/env node

/**
 * FIX EXACT SYNTAX ERRORS - JAN 13 2026
 * 
 * Fix the exact syntax errors identified by the build process
 */

const fs = require('fs');

class ExactSyntaxFixer {
  constructor() {
    this.results = {
      totalFiles: 0,
      fixedFiles: 0
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  // Fix the exact syntax error pattern
  fixFile(filePath) {
    this.log(`🔧 Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'WARNING');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Fix the exact pattern that's causing build errors:
    // return addCacheHeaders(NextResponse.json(..., { status: ... });
    // Should be:
    // return addCacheHeaders(NextResponse.json(..., { status: ... }));

    // Pattern 1: Single line with status parameter
    const pattern1 = /return addCacheHeaders\(NextResponse\.json\([^)]+, \{ status: \d+ \}\);/g;
    const newContent1 = content.replace(pattern1, (match) => {
      fixed = true;
      this.log(`  ✅ Fixed single-line pattern: ${match.substring(0, 60)}...`);
      return match.replace(/\);$/, '));');
    });

    // Pattern 2: Multi-line with status parameter
    const pattern2 = /return addCacheHeaders\(NextResponse\.json\(\s*\{[^}]*\},\s*\{\s*status:\s*\d+\s*\}\s*\);/g;
    const newContent2 = newContent1.replace(pattern2, (match) => {
      fixed = true;
      this.log(`  ✅ Fixed multi-line pattern: ${match.substring(0, 60)}...`);
      return match.replace(/\);$/, '));');
    });

    // Pattern 3: Simple object without status
    const pattern3 = /return addCacheHeaders\(NextResponse\.json\(\s*\{[^}]*\}\s*\);/g;
    const newContent3 = newContent2.replace(pattern3, (match) => {
      fixed = true;
      this.log(`  ✅ Fixed simple object pattern: ${match.substring(0, 60)}...`);
      return match.replace(/\);$/, '));');
    });

    // Pattern 4: Variable or function call
    const pattern4 = /return addCacheHeaders\(NextResponse\.json\(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\);/g;
    const newContent4 = newContent3.replace(pattern4, (match) => {
      fixed = true;
      this.log(`  ✅ Fixed variable pattern: ${match.substring(0, 60)}...`);
      return match.replace(/\);$/, '));');
    });

    if (fixed) {
      fs.writeFileSync(filePath, newContent4);
      this.results.fixedFiles++;
      this.log(`  ✅ Successfully fixed ${filePath}`);
    } else {
      this.log(`  ℹ️ No fixes needed for ${filePath}`);
    }

    return fixed;
  }

  // Test file after fixing
  testFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for the specific pattern that causes build errors
      const problematicPattern = /return addCacheHeaders\(NextResponse\.json\([^)]+\);(?!\))/g;
      const matches = content.match(problematicPattern);
      
      if (matches && matches.length > 0) {
        this.log(`  ❌ ${filePath} - Still has problematic patterns: ${matches.length}`, 'ERROR');
        matches.forEach(match => this.log(`    • ${match}`, 'ERROR'));
        return false;
      } else {
        this.log(`  ✅ ${filePath} - No problematic patterns found`);
        return true;
      }
    } catch (error) {
      this.log(`  ❌ ${filePath} - Error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 FIXING EXACT SYNTAX ERRORS');
      console.log('Target: Fix the specific addCacheHeaders syntax errors causing build failures');
      console.log('');

      // Files that have build errors based on the error output
      const files = [
        'app/api/pdf/generate/route.js',
        'app/api/rag/query/route.js',
        'app/api/school/dashboard/stats/route.js',
        'app/api/school/login/route.js',
        'app/api/school/students/at-risk/route.js'
      ];

      this.results.totalFiles = files.length;

      for (const filePath of files) {
        this.fixFile(filePath);
        this.testFile(filePath);
        console.log('');
      }

      console.log('='.repeat(60));
      console.log('📊 EXACT SYNTAX FIX RESULTS');
      console.log('='.repeat(60));
      console.log(`Files Processed: ${this.results.totalFiles}`);
      console.log(`Files Fixed: ${this.results.fixedFiles}`);
      console.log('='.repeat(60));

      this.log('🎉 Exact syntax fixes completed!');

      console.log('\n💡 NEXT STEPS:');
      console.log('1. Test local build again');
      console.log('2. If build passes, deploy to production');
      console.log('3. Test user registration in browser');

    } catch (error) {
      this.log(`❌ Exact syntax fix failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Execute
const fixer = new ExactSyntaxFixer();
fixer.execute().catch(console.error);