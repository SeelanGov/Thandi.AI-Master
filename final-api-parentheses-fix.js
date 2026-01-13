#!/usr/bin/env node

/**
 * FINAL API PARENTHESES FIX - JAN 13 2026
 * 
 * Fix all addCacheHeaders calls to have proper closing parentheses
 */

const fs = require('fs');

class FinalAPIFixer {
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

  // Get list of failed API files
  getFailedAPIFiles() {
    return [
      'app/api/pdf/generate/route.js',
      'app/api/rag/query/route.js',
      'app/api/school/dashboard/stats/route.js',
      'app/api/school/login/route.js',
      'app/api/school/students/at-risk/route.js',
      'app/api/school/students/route.js',
      'app/api/schools/claim/route.js',
      'app/api/schools/login/route.js',
      'app/api/schools/request-addition/route.js',
      'app/api/schools/search/route.js',
      'app/api/student/retroactive-association/route.js'
    ];
  }

  // Fix a single API file
  fixAPIFile(filePath) {
    this.log(`🔧 Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'WARNING');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Replace all patterns where addCacheHeaders calls are missing closing parentheses
    
    // Pattern 1: addCacheHeaders(NextResponse.json(...);
    // Should be: addCacheHeaders(NextResponse.json(...));
    const pattern1 = /addCacheHeaders\(NextResponse\.json\([^)]*\)\);/g;
    content = content.replace(pattern1, (match) => {
      if (!match.endsWith('));')) {
        fixed = true;
        return match.replace(/\);$/, '));');
      }
      return match;
    });

    // Pattern 2: addCacheHeaders(NextResponse.json({...}, {...});
    // Should be: addCacheHeaders(NextResponse.json({...}, {...}));
    const pattern2 = /addCacheHeaders\(NextResponse\.json\(\{[\s\S]*?\}, \{[^}]*\}\)\);/g;
    content = content.replace(pattern2, (match) => {
      if (!match.endsWith('));')) {
        fixed = true;
        return match.replace(/\);$/, '));');
      }
      return match;
    });

    // Pattern 3: More complex multi-line patterns
    // Split into lines and fix line by line
    const lines = content.split('\n');
    const fixedLines = [];
    let inAddCacheHeaders = false;
    let parenCount = 0;
    let startLine = -1;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Check if this line starts an addCacheHeaders call
      if (line.includes('addCacheHeaders(NextResponse.json(')) {
        inAddCacheHeaders = true;
        parenCount = 0;
        startLine = i;
        
        // Count parentheses in this line
        for (const char of line) {
          if (char === '(') parenCount++;
          if (char === ')') parenCount--;
        }
      } else if (inAddCacheHeaders) {
        // Count parentheses in continuation lines
        for (const char of line) {
          if (char === '(') parenCount++;
          if (char === ')') parenCount--;
        }
      }
      
      // If we're in an addCacheHeaders call and parentheses are balanced except for the outer one
      if (inAddCacheHeaders && parenCount === 1 && line.trim().endsWith(');')) {
        // This line needs an extra closing parenthesis
        line = line.replace(/\);$/, '));');
        fixed = true;
        inAddCacheHeaders = false;
        this.log(`  ✅ Fixed line ${i + 1}: added missing closing parenthesis`);
      } else if (inAddCacheHeaders && parenCount === 0 && line.trim().endsWith('));')) {
        // Already correct
        inAddCacheHeaders = false;
      }
      
      fixedLines.push(line);
    }

    // Additional cleanup for simple cases
    const finalContent = fixedLines.join('\n');
    
    // Fix simple single-line cases that might have been missed
    let cleanedContent = finalContent;
    cleanedContent = cleanedContent.replace(/addCacheHeaders\(NextResponse\.json\(\s*\{[^}]*\}\s*\)\);/g, (match) => {
      if (!match.endsWith('));')) {
        fixed = true;
        return match.replace(/\);$/, '));');
      }
      return match;
    });

    // Fix cases with status parameter
    cleanedContent = cleanedContent.replace(/addCacheHeaders\(NextResponse\.json\(\s*\{[^}]*\},\s*\{\s*status:\s*\d+\s*\}\s*\)\);/g, (match) => {
      if (!match.endsWith('));')) {
        fixed = true;
        return match.replace(/\);$/, '));');
      }
      return match;
    });

    if (fixed) {
      fs.writeFileSync(filePath, cleanedContent);
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
      
      // Count parentheses
      let parenCount = 0;
      for (const char of content) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }
      
      if (parenCount === 0) {
        this.log(`  ✅ ${filePath} - Parentheses balanced`);
        return true;
      } else {
        this.log(`  ❌ ${filePath} - Still unmatched parentheses: ${parenCount}`, 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`  ❌ ${filePath} - Error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 FINAL API PARENTHESES FIX');
      console.log('Target: Fix all addCacheHeaders parentheses issues');
      console.log('');

      const files = this.getFailedAPIFiles();
      this.results.totalFiles = files.length;

      for (const filePath of files) {
        this.fixAPIFile(filePath);
        this.testFile(filePath);
        console.log('');
      }

      console.log('='.repeat(60));
      console.log('📊 FINAL FIX RESULTS');
      console.log('='.repeat(60));
      console.log(`Files Processed: ${this.results.totalFiles}`);
      console.log(`Files Fixed: ${this.results.fixedFiles}`);
      console.log('='.repeat(60));

      this.log('🎉 Final API fixes completed!');

      console.log('\n💡 NEXT STEPS:');
      console.log('1. Run syntax test again to verify all fixes');
      console.log('2. Test critical APIs locally');
      console.log('3. Deploy and test user registration');

    } catch (error) {
      this.log(`❌ Final fix failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Execute
const fixer = new FinalAPIFixer();
fixer.execute().catch(console.error);