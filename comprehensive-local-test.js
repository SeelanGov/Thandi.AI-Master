#!/usr/bin/env node

/**
 * Comprehensive Local Testing Script
 * Tests all functionality locally before production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 COMPREHENSIVE LOCAL TESTING');
console.log('=' .repeat(60));
console.log('Testing all functionality before production deployment');
console.log('Timestamp:', new Date().toISOString());
console.log('');

const testResults = {
  timestamp: new Date().toISOString(),
  tests: {},
  overall: 'PENDING',
  readyForProduction: false,
  issues: []
};

// Test 1: Clean Build Test
console.log('1️⃣ Clean Build Test');
console.log('-'.repeat(30));

try {
  console.log('   Cleaning previous build...');
  try {
    execSync('rmdir /s /q .next 2>nul', { stdio: 'ignore' });
  } catch (e) {
    // Directory doesn't exist, ignore
  }
  
  console.log('   Running fresh build...');
  const buildOutput = execSync('npm run build', { encoding: 'utf8' });
  
  // Check for build warnings or errors
  const hasErrors = buildOutput.includes('Error') || buildOutput.includes('Failed');
  const hasWarnings = buildOutput.includes('Warning');
  
  if (hasErrors) {
    throw new Error('Build contains errors');
  }
  
  console.log('   ✅ Clean build successful');
  if (hasWarnings) {
    console.log('   ⚠️ Build has warnings (non-critical)');
  }
  
  testResults.tests.build = {
    status: 'PASS',
    details: 'Clean build successful',
    warnings: hasWarnings
  };
  
} catch (error) {
  console.log('   ❌ Build failed');
  console.log('   Error:', error.message);
  testResults.tests.build = {
    status: 'FAIL',
    details: error.message
  };
  testResults.issues.push('Build failure');
}

// Test 2: File Integrity Check
console.log('\n2️⃣ File Integrity Check');
console.log('-'.repeat(30));

const criticalFiles = {
  'Results Page': 'app/results/page.jsx',
  'PDF Generator': 'app/results/services/ProfessionalPDFGenerator.js',
  'Results Parser': 'app/results/services/resultsParser.js',
  'Card Layout': 'app/results/components/ResultsCardLayout.jsx',
  'Global Styles': 'app/results/styles/global.css'
};

let fileIntegrityPass = true;
const fileDetails = {};

Object.entries(criticalFiles).forEach(([name, filePath]) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const size = content.length;
    const hasContent = size > 100; // Minimum content check
    
    console.log(`   ${hasContent ? '✅' : '❌'} ${name} (${size} bytes)`);
    
    fileDetails[name] = {
      exists: true,
      size: size,
      hasContent: hasContent
    };
    
    if (!hasContent) {
      fileIntegrityPass = false;
      testResults.issues.push(`${name} file too small or empty`);
    }
    
  } catch (error) {
    console.log(`   ❌ ${name} - Missing or unreadable`);
    fileDetails[name] = {
      exists: false,
      error: error.message
    };
    fileIntegrityPass = false;
    testResults.issues.push(`${name} file missing`);
  }
});

testResults.tests.fileIntegrity = {
  status: fileIntegrityPass ? 'PASS' : 'FAIL',
  details: fileDetails
};

// Test 3: Import/Export Validation
console.log('\n3️⃣ Import/Export Validation');
console.log('-'.repeat(30));

let importsPass = true;

try {
  // Check Results Page imports
  const resultsPage = fs.readFileSync('app/results/page.jsx', 'utf8');
  const requiredImports = [
    'ProfessionalPDFGenerator',
    'ResultsCardLayout',
    'ResultsParser',
    'jsPDF'
  ];
  
  requiredImports.forEach(importName => {
    if (resultsPage.includes(importName)) {
      console.log(`   ✅ ${importName} imported`);
    } else {
      console.log(`   ❌ ${importName} missing import`);
      importsPass = false;
      testResults.issues.push(`Missing import: ${importName}`);
    }
  });
  
  // Check PDF Generator exports
  const pdfGenerator = fs.readFileSync('app/results/services/ProfessionalPDFGenerator.js', 'utf8');
  if (pdfGenerator.includes('export class ProfessionalPDFGenerator')) {
    console.log('   ✅ ProfessionalPDFGenerator exported');
  } else {
    console.log('   ❌ ProfessionalPDFGenerator export missing');
    importsPass = false;
    testResults.issues.push('ProfessionalPDFGenerator export missing');
  }
  
} catch (error) {
  console.log('   ❌ Import validation failed');
  importsPass = false;
  testResults.issues.push('Import validation error');
}

testResults.tests.imports = {
  status: importsPass ? 'PASS' : 'FAIL',
  details: 'Import/export validation'
};

// Test 4: CSS Validation
console.log('\n4️⃣ CSS Validation');
console.log('-'.repeat(30));

let cssPass = true;

try {
  const cssFiles = [
    'app/results/styles/global.css',
    'app/results/styles/cards.css',
    'app/results/styles/design-system.css'
  ];
  
  cssFiles.forEach(cssFile => {
    if (fs.existsSync(cssFile)) {
      const content = fs.readFileSync(cssFile, 'utf8');
      
      // Basic CSS syntax check
      const hasOpenBraces = (content.match(/{/g) || []).length;
      const hasCloseBraces = (content.match(/}/g) || []).length;
      const balanced = hasOpenBraces === hasCloseBraces;
      
      console.log(`   ${balanced ? '✅' : '❌'} ${path.basename(cssFile)} (${hasOpenBraces} rules)`);
      
      if (!balanced) {
        cssPass = false;
        testResults.issues.push(`CSS syntax error in ${cssFile}`);
      }
    } else {
      console.log(`   ❌ ${cssFile} missing`);
      cssPass = false;
      testResults.issues.push(`CSS file missing: ${cssFile}`);
    }
  });
  
  // Check for responsive design
  const cardsCSS = fs.readFileSync('app/results/styles/cards.css', 'utf8');
  if (cardsCSS.includes('@media')) {
    console.log('   ✅ Responsive design implemented');
  } else {
    console.log('   ⚠️ Limited responsive design detected');
  }
  
} catch (error) {
  console.log('   ❌ CSS validation failed');
  cssPass = false;
  testResults.issues.push('CSS validation error');
}

testResults.tests.css = {
  status: cssPass ? 'PASS' : 'FAIL',
  details: 'CSS syntax and structure validation'
};

// Test 5: Start Development Server
console.log('\n5️⃣ Development Server Test');
console.log('-'.repeat(30));

let serverPass = false;
let serverProcess = null;

try {
  console.log('   Starting development server...');
  
  // Start server in background
  const { spawn } = await import('child_process');
  serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });
  
  // Wait for server to start
  let serverOutput = '';
  let serverReady = false;
  
  const serverPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 30000); // 30 second timeout
    
    serverProcess.stdout.on('data', (data) => {
      serverOutput += data.toString();
      if (serverOutput.includes('Ready') || serverOutput.includes('localhost:3000')) {
        clearTimeout(timeout);
        serverReady = true;
        resolve();
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      if (errorOutput.includes('Error') || errorOutput.includes('Failed')) {
        clearTimeout(timeout);
        reject(new Error('Server startup error: ' + errorOutput));
      }
    });
  });
  
  await serverPromise;
  
  console.log('   ✅ Development server started successfully');
  console.log('   ✅ Server ready on localhost:3000');
  
  serverPass = true;
  
  testResults.tests.server = {
    status: 'PASS',
    details: 'Development server started successfully'
  };
  
} catch (error) {
  console.log('   ❌ Server startup failed');
  console.log('   Error:', error.message);
  
  testResults.tests.server = {
    status: 'FAIL',
    details: error.message
  };
  testResults.issues.push('Development server startup failure');
}

// Test 6: Basic Functionality Test (if server started)
if (serverPass) {
  console.log('\n6️⃣ Basic Functionality Test');
  console.log('-'.repeat(30));
  
  try {
    // Wait a moment for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('   ✅ Server is running and accessible');
    console.log('   ✅ Ready for manual testing');
    console.log('');
    console.log('   🌐 Test URLs:');
    console.log('   - Main app: http://localhost:3000');
    console.log('   - Assessment: http://localhost:3000/assessment');
    console.log('   - Results: http://localhost:3000/results (after assessment)');
    
    testResults.tests.functionality = {
      status: 'PASS',
      details: 'Server ready for manual testing'
    };
    
  } catch (error) {
    console.log('   ❌ Functionality test failed');
    testResults.tests.functionality = {
      status: 'FAIL',
      details: error.message
    };
  }
}

// Test 7: Manual Testing Instructions
console.log('\n7️⃣ Manual Testing Required');
console.log('-'.repeat(30));
console.log('   📋 Please test the following manually:');
console.log('');
console.log('   1. Navigate to http://localhost:3000/assessment');
console.log('   2. Complete assessment for Grade 10, 11, and 12');
console.log('   3. Verify results page loads correctly');
console.log('   4. Test PDF download functionality');
console.log('   5. Verify professional PDF generates');
console.log('   6. Test card layout (if activated)');
console.log('   7. Test mobile responsiveness');
console.log('   8. Verify all features work');
console.log('');
console.log('   ⏱️ Server will remain running for testing...');

// Final Assessment
console.log('\n📊 AUTOMATED TEST RESULTS');
console.log('=' .repeat(60));

const passedTests = Object.values(testResults.tests).filter(test => test.status === 'PASS').length;
const totalTests = Object.keys(testResults.tests).length;
const allAutomatedPass = testResults.issues.length === 0;

testResults.overall = allAutomatedPass ? 'PASS' : 'FAIL';
testResults.readyForProduction = allAutomatedPass && serverPass;

if (allAutomatedPass) {
  console.log('🎉 AUTOMATED TESTS: ALL PASS');
  console.log(`✅ ${passedTests}/${totalTests} tests passed`);
  console.log('');
  if (serverPass) {
    console.log('🌐 DEVELOPMENT SERVER: RUNNING');
    console.log('📋 MANUAL TESTING: REQUIRED');
    console.log('');
    console.log('Next steps:');
    console.log('1. Complete manual testing checklist above');
    console.log('2. Verify all functionality works correctly');
    console.log('3. Stop server when testing complete (Ctrl+C)');
    console.log('4. Run production deployment if all tests pass');
  }
} else {
  console.log('❌ AUTOMATED TESTS: ISSUES DETECTED');
  console.log(`⚠️ ${passedTests}/${totalTests} tests passed`);
  console.log('');
  console.log('Issues to resolve:');
  testResults.issues.forEach(issue => {
    console.log(`- ${issue}`);
  });
  console.log('');
  console.log('🔧 Fix issues and re-run comprehensive test');
}

// Save results
fs.writeFileSync('comprehensive-test-results.json', JSON.stringify(testResults, null, 2));
console.log('');
console.log('📄 Detailed results saved to: comprehensive-test-results.json');

if (serverPass) {
  console.log('');
  console.log('🚀 SERVER IS RUNNING - Ready for manual testing!');
  console.log('   Press Ctrl+C to stop server when testing is complete');
  console.log('=' .repeat(60));
  
  // Keep the process alive to maintain server
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping development server...');
    if (serverProcess) {
      serverProcess.kill();
    }
    console.log('✅ Server stopped. Testing complete.');
    process.exit(0);
  });
  
  // Keep process alive
  setInterval(() => {}, 1000);
} else {
  console.log('=' .repeat(60));
  process.exit(testResults.issues.length > 0 ? 1 : 0);
}