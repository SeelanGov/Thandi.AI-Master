#!/usr/bin/env node

/**
 * COMPREHENSIVE API AUDIT AND FIX - JAN 13 2026
 * 
 * Systematically audit and fix ALL API routes to ensure proper cache headers
 * and eliminate the broken cache busting code once and for all
 */

const fs = require('fs');
const path = require('path');

class APIAuditor {
  constructor() {
    this.results = {
      totalFiles: 0,
      fixedFiles: 0,
      errors: [],
      summary: []
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  // Find all API route files
  findAPIRoutes(dir = 'app/api', routes = []) {
    if (!fs.existsSync(dir)) {
      return routes;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.findAPIRoutes(fullPath, routes);
      } else if (item === 'route.js' || item === 'route.ts') {
        routes.push(fullPath);
      }
    }
    
    return routes;
  }

  // Analyze API route file
  analyzeAPIRoute(filePath) {
    this.log(`🔍 Analyzing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      this.results.errors.push(`File not found: ${filePath}`);
      return { needsFix: false, issues: ['File not found'] };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    let needsFix = false;

    // Check for broken cache busting headers
    if (content.includes('response.headers.set') && content.includes('Cache-Control')) {
      const brokenHeaderPattern = /\/\/ Cache busting headers[\s\S]*?response\.headers\.set\('X-Cache-Bust'/g;
      if (brokenHeaderPattern.test(content)) {
        issues.push('Contains broken cache busting headers');
        needsFix = true;
      }
    }

    // Check for undefined response variable usage
    if (content.includes('response.headers.set') && !content.includes('const response = NextResponse')) {
      issues.push('Uses undefined response variable');
      needsFix = true;
    }

    // Check if it has proper cache header function
    if (!content.includes('addCacheHeaders') && content.includes('NextResponse.json')) {
      issues.push('Missing addCacheHeaders function');
      needsFix = true;
    }

    // Check for proper error handling
    if (!content.includes('try') || !content.includes('catch')) {
      issues.push('Missing proper error handling');
    }

    return { needsFix, issues };
  }

  // Fix API route file
  fixAPIRoute(filePath) {
    this.log(`🔧 Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Remove all broken cache busting header insertions
    const brokenHeaderPattern = /\s*\/\/ Cache busting headers - [\d\-T:\.Z]+\s*response\.headers\.set\('Cache-Control', 'no-cache, no-store, must-revalidate'\);\s*response\.headers\.set\('Pragma', 'no-cache'\);\s*response\.headers\.set\('Expires', '0'\);\s*response\.headers\.set\('X-Cache-Bust', '[\d\-T:\.Z]+'\);\s*/g;
    
    if (brokenHeaderPattern.test(content)) {
      content = content.replace(brokenHeaderPattern, '');
      fixed = true;
      this.log(`  ✅ Removed broken cache headers`);
    }

    // Add cache headers function if missing
    if (!content.includes('addCacheHeaders')) {
      const cacheHeadersFunction = `
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
        content = content.slice(0, nextLineIndex + 1) + cacheHeadersFunction + content.slice(nextLineIndex + 1);
        fixed = true;
        this.log(`  ✅ Added addCacheHeaders function`);
      }
    }

    // Fix NextResponse.json calls to use addCacheHeaders
    if (content.includes('NextResponse.json') && !content.includes('addCacheHeaders(NextResponse.json')) {
      // Only wrap NextResponse.json calls that are being returned
      content = content.replace(/return NextResponse\.json\(/g, 'return addCacheHeaders(NextResponse.json(');
      
      // Fix any unmatched parentheses by ensuring proper closing
      const lines = content.split('\n');
      const fixedLines = [];
      let inNextResponseCall = false;
      let parenCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        if (line.includes('return addCacheHeaders(NextResponse.json(')) {
          inNextResponseCall = true;
          parenCount = 0;
        }
        
        if (inNextResponseCall) {
          // Count parentheses
          for (const char of line) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
          }
          
          // If we've closed all parentheses and this line ends with ); or });
          if (parenCount <= 0 && (line.trim().endsWith(');') || line.trim().endsWith('})'))) {
            if (!line.includes('));')) {
              line = line.replace(/\);$/, '));');
            }
            inNextResponseCall = false;
          }
        }
        
        fixedLines.push(line);
      }
      
      content = fixedLines.join('\n');
      fixed = true;
      this.log(`  ✅ Wrapped NextResponse.json calls with addCacheHeaders`);
    }

    // Clean up any double closing parentheses
    content = content.replace(/\)\)\);/g, '));');
    content = content.replace(/\}\)\);/g, '}));');

    if (fixed) {
      fs.writeFileSync(filePath, content);
      this.results.fixedFiles++;
      this.log(`  ✅ Fixed ${filePath}`);
    } else {
      this.log(`  ℹ️  No fixes needed for ${filePath}`);
    }

    return fixed;
  }

  // Test API route locally
  async testAPIRoute(filePath) {
    this.log(`🧪 Testing ${filePath}...`);
    
    try {
      // Basic syntax check by requiring the file
      const relativePath = './' + filePath.replace(/\\/g, '/');
      delete require.cache[require.resolve(relativePath)];
      
      // This will throw if there are syntax errors
      require(relativePath);
      
      this.log(`  ✅ Syntax check passed`);
      return true;
    } catch (error) {
      this.log(`  ❌ Syntax error: ${error.message}`, 'ERROR');
      this.results.errors.push(`${filePath}: ${error.message}`);
      return false;
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.results.totalFiles,
        fixedFiles: this.results.fixedFiles,
        errorCount: this.results.errors.length
      },
      details: this.results.summary,
      errors: this.results.errors
    };

    const reportFile = `api-audit-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE API AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`Total API Routes Found: ${report.summary.totalFiles}`);
    console.log(`Files Fixed: ${report.summary.fixedFiles}`);
    console.log(`Errors Encountered: ${report.summary.errorCount}`);
    console.log(`Report Saved: ${reportFile}`);
    
    if (report.summary.errorCount > 0) {
      console.log('\n❌ ERRORS:');
      report.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    report.details.forEach(detail => {
      const status = detail.fixed ? '✅ FIXED' : detail.needsFix ? '⚠️  NEEDS ATTENTION' : '✅ OK';
      console.log(`  ${status} ${detail.file}`);
      if (detail.issues.length > 0) {
        detail.issues.forEach(issue => console.log(`    - ${issue}`));
      }
    });
    
    console.log('='.repeat(80));
    
    return report;
  }

  // Main audit and fix process
  async executeAudit() {
    try {
      this.log('🚀 STARTING COMPREHENSIVE API AUDIT AND FIX');
      console.log('Target: Fix ALL API routes to eliminate cache header issues');
      console.log('');

      // Find all API routes
      const apiRoutes = this.findAPIRoutes();
      this.results.totalFiles = apiRoutes.length;
      
      this.log(`Found ${apiRoutes.length} API route files`);
      console.log('');

      // Process each API route
      for (const routePath of apiRoutes) {
        const analysis = this.analyzeAPIRoute(routePath);
        
        let fixed = false;
        if (analysis.needsFix) {
          fixed = this.fixAPIRoute(routePath);
        }

        // Test the route after fixing
        const syntaxOK = await this.testAPIRoute(routePath);

        this.results.summary.push({
          file: routePath,
          needsFix: analysis.needsFix,
          fixed: fixed,
          syntaxOK: syntaxOK,
          issues: analysis.issues
        });

        console.log(''); // Add spacing between files
      }

      // Generate final report
      const report = this.generateReport();

      this.log('🎉 API audit and fix completed!');
      
      if (report.summary.fixedFiles > 0) {
        console.log('\n💡 Next Steps:');
        console.log('1. Test the fixed APIs locally');
        console.log('2. Commit and deploy the changes');
        console.log('3. Run comprehensive verification');
      }

      return report;

    } catch (error) {
      this.log(`❌ Audit failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Execute audit
const auditor = new APIAuditor();
auditor.executeAudit().catch(console.error);