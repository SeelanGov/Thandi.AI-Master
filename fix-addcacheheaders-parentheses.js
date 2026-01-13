#!/usr/bin/env node

/**
 * FIX ADDCACHEHEADERS PARENTHESES - JAN 13 2026
 * 
 * Specifically fix the missing closing parentheses for addCacheHeaders calls
 */

const fs = require('fs');

class AddCacheHeadersFixer {
  constructor() {
    this.results = {
      totalFiles: 0,
      fixedFiles: 0,
      errors: []
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  // Get list of API files that need fixing
  getAPIFiles() {
    return [
      'app/api/pdf/generate/route.js',
      'app/api/pdf/[sessionId]/route.js',
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

  // Fix addCacheHeaders parentheses in a file
  fixFile(filePath) {
    this.log(`🔧 Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'WARNING');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Pattern 1: return addCacheHeaders(NextResponse.json(...);
    // Should be: return addCacheHeaders(NextResponse.json(...));
    const pattern1 = /return addCacheHeaders\(NextResponse\.json\([^)]*\)\);/g;
    const matches1 = content.match(pattern1);
    if (matches1) {
      for (const match of matches1) {
        if (!match.endsWith('));')) {
          const fixedMatch = match.replace(/\);$/, '));');
          content = content.replace(match, fixedMatch);
          fixed = true;
          this.log(`  ✅ Fixed: ${match.substring(0, 50)}...`);
        }
      }
    }

    // Pattern 2: return addCacheHeaders(NextResponse.json({...}, {...});
    // Should be: return addCacheHeaders(NextResponse.json({...}, {...}));
    const pattern2 = /return addCacheHeaders\(NextResponse\.json\(\{[\s\S]*?\}, \{[^}]*\}\)\);/g;
    const matches2 = content.match(pattern2);
    if (matches2) {
      for (const match of matches2) {
        if (!match.endsWith('));')) {
          const fixedMatch = match.replace(/\);$/, '));');
          content = content.replace(match, fixedMatch);
          fixed = true;
          this.log(`  ✅ Fixed complex pattern: ${match.substring(0, 50)}...`);
        }
      }
    }

    // More comprehensive fix: look for addCacheHeaders( followed by NextResponse.json
    // and ensure proper closing
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // If line contains return addCacheHeaders(NextResponse.json
      if (line.includes('return addCacheHeaders(NextResponse.json')) {
        // Count parentheses in this line and following lines until we find the end
        let parenCount = 0;
        let currentLine = i;
        let foundEnd = false;
        
        while (currentLine < lines.length && !foundEnd) {
          const checkLine = lines[currentLine];
          
          for (const char of checkLine) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
          }
          
          // If we're back to 0 parentheses and the line ends with );
          if (parenCount === 1 && checkLine.trim().endsWith(');')) {
            // This means we need one more closing parenthesis
            lines[currentLine] = checkLine.replace(/\);$/, '));');
            fixed = true;
            foundEnd = true;
            this.log(`  ✅ Fixed line ${currentLine + 1}: added missing closing parenthesis`);
          } else if (parenCount === 0 && checkLine.trim().endsWith('));')) {
            // Already correct
            foundEnd = true;
          }
          
          currentLine++;
        }
      }
      
      fixedLines.push(line);
    }

    if (fixed) {
      fs.writeFileSync(filePath, lines.join('\n'));
      this.results.fixedFiles++;
      this.log(`  ✅ Successfully fixed ${filePath}`);
    } else {
      this.log(`  ℹ️ No fixes needed for ${filePath}`);
    }

    return fixed;
  }

  // Test file syntax
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
        this.log(`  ❌ ${filePath} - Unmatched parentheses: ${parenCount}`, 'ERROR');
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
      this.log('🚀 FIXING ADDCACHEHEADERS PARENTHESES');
      console.log('Target: Fix missing closing parentheses in addCacheHeaders calls');
      console.log('');

      const files = this.getAPIFiles();
      this.results.totalFiles = files.length;

      for (const filePath of files) {
        this.fixFile(filePath);
        this.testFile(filePath);
        console.log('');
      }

      console.log('='.repeat(60));
      console.log('📊 RESULTS');
      console.log('='.repeat(60));
      console.log(`Files Processed: ${this.results.totalFiles}`);
      console.log(`Files Fixed: ${this.results.fixedFiles}`);
      console.log(`Errors: ${this.results.errors.length}`);
      console.log('='.repeat(60));

      this.log('🎉 Parentheses fixing completed!');

    } catch (error) {
      this.log(`❌ Fix failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Execute
const fixer = new AddCacheHeadersFixer();
fixer.execute().catch(console.error);