#!/usr/bin/env node

/**
 * FIX ALL REMAINING SYNTAX ERRORS - JAN 13 2026
 * 
 * Fix all remaining addCacheHeaders syntax errors in all API files
 */

const fs = require('fs');

class ComprehensiveSyntaxFixer {
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

  // Get all API files that need fixing
  getAllAPIFiles() {
    return [
      'app/api/pdf/generate/route.js',
      'app/api/school/students/route.js',
      'app/api/schools/claim/route.js',
      'app/api/schools/login/route.js',
      'app/api/schools/request-addition/route.js',
      'app/api/schools/search/route.js',
      'app/api/student/retroactive-association/route.js'
    ];
  }

  // Fix all syntax issues in a file
  fixFile(filePath) {
    this.log(`🔧 Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      this.log(`⚠️ File not found: ${filePath}`, 'WARNING');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Fix issue where addCacheHeaders function is inserted in wrong place
    // Look for patterns like: error: 'message',\n\n// Add cache busting headers...
    const wrongPlacementPattern = /,\s*\n\s*\/\/ Add cache busting headers to response\s*\nfunction addCacheHeaders\(response\) \{[\s\S]*?\}\s*\n/g;
    if (wrongPlacementPattern.test(content)) {
      // Remove the wrongly placed function
      content = content.replace(wrongPlacementPattern, ',\n');
      fixed = true;
      this.log(`  ✅ Removed wrongly placed addCacheHeaders function`);
    }

    // Ensure addCacheHeaders function is at the top after imports
    if (!content.includes('function addCacheHeaders(response)')) {
      const addCacheHeadersFunction = `
// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}

`;
      
      // Insert after imports
      const importEndIndex = content.lastIndexOf('import');
      if (importEndIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', importEndIndex);
        content = content.slice(0, nextLineIndex + 1) + addCacheHeadersFunction + content.slice(nextLineIndex + 1);
        fixed = true;
        this.log(`  ✅ Added addCacheHeaders function at top`);
      }
    }

    // Fix all addCacheHeaders calls to have proper closing parentheses
    // Pattern: return addCacheHeaders(NextResponse.json(...);
    // Should be: return addCacheHeaders(NextResponse.json(...));

    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // If line contains return addCacheHeaders(NextResponse.json
      if (line.includes('return addCacheHeaders(NextResponse.json')) {
        // Look ahead to find the complete statement
        let statementLines = [line];
        let j = i + 1;
        let openParens = 0;
        let closeParens = 0;
        
        // Count parentheses in first line
        for (const char of line) {
          if (char === '(') openParens++;
          if (char === ')') closeParens++;
        }
        
        // Continue reading lines until we find the end of the statement
        while (j < lines.length && (openParens > closeParens || !lines[j - 1].trim().endsWith(';'))) {
          const nextLine = lines[j];
          statementLines.push(nextLine);
          
          for (const char of nextLine) {
            if (char === '(') openParens++;
            if (char === ')') closeParens++;
          }
          
          j++;
        }
        
        // Now check if we need to fix the closing
        const lastLine = statementLines[statementLines.length - 1];
        if (lastLine.trim().endsWith(');') && openParens === closeParens + 1) {
          // We need to add one more closing parenthesis
          statementLines[statementLines.length - 1] = lastLine.replace(/\);$/, '));');
          fixed = true;
          this.log(`  ✅ Fixed closing parenthesis for lines ${i + 1}-${j}`);
        }
        
        // Add all the statement lines to fixedLines
        fixedLines.push(...statementLines);
        i = j - 1; // Skip the lines we just processed
      } else {
        fixedLines.push(line);
      }
    }

    if (fixed) {
      fs.writeFileSync(filePath, fixedLines.join('\n'));
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
      
      // Check for balanced parentheses
      let parenCount = 0;
      for (const char of content) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }
      
      // Check for problematic patterns
      const problematicPatterns = [
        /return addCacheHeaders\(NextResponse\.json\([^)]+\);(?!\))/g,
        /,\s*\/\/ Add cache busting headers/g,
        /function addCacheHeaders\(response\) \{[\s\S]*?\}\s*\n\s*\}/g
      ];
      
      let hasIssues = false;
      
      if (parenCount !== 0) {
        this.log(`  ❌ ${filePath} - Unmatched parentheses: ${parenCount}`, 'ERROR');
        hasIssues = true;
      }
      
      for (const pattern of problematicPatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          this.log(`  ❌ ${filePath} - Found problematic pattern: ${matches[0].substring(0, 50)}...`, 'ERROR');
          hasIssues = true;
        }
      }
      
      if (!hasIssues) {
        this.log(`  ✅ ${filePath} - All syntax checks passed`);
        return true;
      }
      
      return false;
    } catch (error) {
      this.log(`  ❌ ${filePath} - Error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // Main execution
  async execute() {
    try {
      this.log('🚀 FIXING ALL REMAINING SYNTAX ERRORS');
      console.log('Target: Fix all addCacheHeaders syntax errors in API files');
      console.log('');

      const files = this.getAllAPIFiles();
      this.results.totalFiles = files.length;

      for (const filePath of files) {
        this.fixFile(filePath);
        this.testFile(filePath);
        console.log('');
      }

      console.log('='.repeat(60));
      console.log('📊 COMPREHENSIVE SYNTAX FIX RESULTS');
      console.log('='.repeat(60));
      console.log(`Files Processed: ${this.results.totalFiles}`);
      console.log(`Files Fixed: ${this.results.fixedFiles}`);
      console.log('='.repeat(60));

      this.log('🎉 Comprehensive syntax fixes completed!');

      console.log('\n💡 NEXT STEPS:');
      console.log('1. Test local build to verify all fixes');
      console.log('2. Deploy if build passes');
      console.log('3. Test user registration functionality');

    } catch (error) {
      this.log(`❌ Comprehensive syntax fix failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Execute
const fixer = new ComprehensiveSyntaxFixer();
fixer.execute().catch(console.error);