#!/usr/bin/env node

/**
 * FIX API SYNTAX ERRORS - JAN 13 2026
 * 
 * Systematically fix the missing closing parentheses in API files
 * caused by the automated cache header fixes
 */

const fs = require('fs');
const path = require('path');

class APISyntaxFixer {
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

  // List of API files that need syntax fixes based on audit report
  getAPIFilesToFix() {
    return [
      'app/api/cache/health/route.js',
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

  // Fix syntax errors in API file
  fixAPISyntax(filePath) {
    this.log(`🔧 Fixing syntax in ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'WARNING');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Fix missing closing parentheses for addCacheHeaders calls
    // Pattern: addCacheHeaders(NextResponse.json(...); should be addCacheHeaders(NextResponse.json(...));
    
    // First, let's identify lines that have addCacheHeaders calls
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Check if this line contains addCacheHeaders(NextResponse.json
      if (line.includes('addCacheHeaders(NextResponse.json')) {
        // Count parentheses to see if we need to add closing ones
        let openParens = 0;
        let closeParens = 0;
        
        // Count in this line
        for (const char of line) {
          if (char === '(') openParens++;
          if (char === ')') closeParens++;
        }
        
        // If we have more opens than closes, we might need to look ahead
        if (openParens > closeParens) {
          // Look ahead to find the closing pattern
          let lookAhead = i + 1;
          let totalOpenParens = openParens;
          let totalCloseParens = closeParens;
          
          while (lookAhead < lines.length && totalOpenParens > totalCloseParens) {
            const nextLine = lines[lookAhead];
            
            for (const char of nextLine) {
              if (char === '(') totalOpenParens++;
              if (char === ')') totalCloseParens++;
            }
            
            // If this line ends with ); or }); and we're balanced except for the outer addCacheHeaders
            if ((nextLine.trim().endsWith(');') || nextLine.trim().endsWith('});')) && 
                totalOpenParens === totalCloseParens + 1) {
              // Fix this line by adding the missing closing parenthesis
              lines[lookAhead] = nextLine.replace(/\);$/, '));').replace(/\}\);$/, '}));');
              fixed = true;
              this.log(`  ✅ Fixed closing parenthesis on line ${lookAhead + 1}`);
              break;
            }
            
            lookAhead++;
          }
        }
      }
      
      fixedLines.push(line);
    }

    // Additional cleanup patterns
    content = fixedLines.join('\n');
    
    // Fix any double closing parentheses that might have been created
    const originalContent = content;
    content = content.replace(/\)\)\);/g, '));');
    content = content.replace(/\}\)\)\);/g, '}));');
    
    if (content !== originalContent) {
      fixed = true;
      this.log(`  ✅ Cleaned up double parentheses`);
    }

    // Write the fixed content back
    if (fixed) {
      fs.writeFileSync(filePath, content);
      this.results.fixedFiles++;
      this.log(`  ✅ Fixed syntax errors in ${filePath}`);
    } else {
      this.log(`  ℹ️ No syntax fixes needed for ${filePath}`);
    }

    return fixed;
  }

  // Test API file for syntax errors
  testAPISyntax(filePath) {
    this.log(`🧪 Testing syntax for ${filePath}...`);
    
    try {
      // Try to parse the file as JavaScript
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic syntax validation - check for unmatched parentheses
      let parenCount = 0;
      let braceCount = 0;
      let bracketCount = 0;
      
      for (const char of content) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
      }
      
      if (parenCount !== 0) {
        this.log(`  ❌ Unmatched parentheses: ${parenCount}`, 'ERROR');
        return false;
      }
      
      if (braceCount !== 0) {
        this.log(`  ❌ Unmatched braces: ${braceCount}`, 'ERROR');
        return false;
      }
      
      if (bracketCount !== 0) {
        this.log(`  ❌ Unmatched brackets: ${bracketCount}`, 'ERROR');
        return false;
      }
      
      this.log(`  ✅ Syntax validation passed`);
      return true;
      
    } catch (error) {
      this.log(`  ❌ Syntax error: ${error.message}`, 'ERROR');
      this.results.errors.push(`${filePath}: ${error.message}`);
      return false;
    }
  }

  // Generate report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 API SYNTAX FIX REPORT');
    console.log('='.repeat(60));
    console.log(`Files Processed: ${this.results.totalFiles}`);
    console.log(`Files Fixed: ${this.results.fixedFiles}`);
    console.log(`Errors: ${this.results.errors.length}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ REMAINING ERRORS:');
      this.results.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    console.log('='.repeat(60));
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 STARTING API SYNTAX ERROR FIXES');
      console.log('Target: Fix missing closing parentheses in API files');
      console.log('');

      const filesToFix = this.getAPIFilesToFix();
      this.results.totalFiles = filesToFix.length;

      this.log(`Found ${filesToFix.length} API files to fix`);
      console.log('');

      // Fix each file
      for (const filePath of filesToFix) {
        this.fixAPISyntax(filePath);
        this.testAPISyntax(filePath);
        console.log(''); // Add spacing
      }

      this.generateReport();

      this.log('🎉 API syntax fixes completed!');
      
      if (this.results.fixedFiles > 0) {
        console.log('\n💡 Next Steps:');
        console.log('1. Test the fixed APIs locally');
        console.log('2. Run comprehensive verification');
        console.log('3. Deploy if all tests pass');
      }

    } catch (error) {
      this.log(`❌ Syntax fixing failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Execute syntax fixes
const fixer = new APISyntaxFixer();
fixer.execute().catch(console.error);