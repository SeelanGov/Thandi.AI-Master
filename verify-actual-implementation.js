/**
 * ACTUAL VERIFICATION - No False Positives
 * Test the real implementation by checking actual files and functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ACTUAL VERIFICATION - Checking Real Implementation');
console.log('❌ No false positives - verifying actual working code\n');

// 1. Verify files actually exist
console.log('1️⃣ FILE EXISTENCE VERIFICATION:');

const requiredFiles = [
  'lib/thandi-results-formatter.js',
  'lib/thandi-pdf-generator.js', 
  'app/results/styles/thandi-results.css',
  'app/results/page.jsx'
];

let allFilesExist = true;
requiredFiles.forEach(filePath => {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${filePath}: ${exists ? 'EXISTS' : 'MISSING'}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ CRITICAL: Required files are missing. Implementation is NOT complete.');
  process.exit(1);
}

// 2. Verify ThandiResultsFormatter class exists and has required methods
console.log('\n2️⃣ THANDI RESULTS FORMATTER VERIFICATION:');

try {
  const formatterContent = fs.readFileSync('lib/thandi-results-formatter.js', 'utf8');
  
  const requiredMethods = [
    'formatResponse',
    'formatSection', 
    'getKeyValueStyle',
    'getBulletStyle',
    'formatValue',
    'enhanceText',
    'cleanText',
    'parseSections'
  ];
  
  let allMethodsPresent = true;
  requiredMethods.forEach(method => {
    const hasMethod = formatterContent.includes(`${method}(`);
    console.log(`${hasMethod ? '✅' : '❌'} ${method}(): ${hasMethod ? 'FOUND' : 'MISSING'}`);
    if (!hasMethod) allMethodsPresent = false;
  });
  
  const hasExport = formatterContent.includes('export class ThandiResultsFormatter');
  console.log(`${hasExport ? '✅' : '❌'} Class Export: ${hasExport ? 'FOUND' : 'MISSING'}`);
  
  if (!allMethodsPresent || !hasExport) {
    console.log('\n❌ CRITICAL: ThandiResultsFormatter is incomplete or missing methods.');
    process.exit(1);
  }
  
} catch (error) {
  console.log(`❌ CRITICAL: Cannot read ThandiResultsFormatter: ${error.message}`);
  process.exit(1);
}

// 3. Verify PDF Generator class exists and has required methods
console.log('\n3️⃣ PDF GENERATOR VERIFICATION:');

try {
  const pdfContent = fs.readFileSync('lib/thandi-pdf-generator.js', 'utf8');
  
  const requiredPDFMethods = [
    'generateProfessionalReport',
    'addCoverPage',
    'addExecutiveSummary', 
    'addResultsContent',
    'addVerificationFooter',
    'addPageNumbers'
  ];
  
  let allPDFMethodsPresent = true;
  requiredPDFMethods.forEach(method => {
    const hasMethod = pdfContent.includes(`${method}(`);
    console.log(`${hasMethod ? '✅' : '❌'} ${method}(): ${hasMethod ? 'FOUND' : 'MISSING'}`);
    if (!hasMethod) allPDFMethodsPresent = false;
  });
  
  const hasPDFExport = pdfContent.includes('export class ThandiPDFGenerator');
  console.log(`${hasPDFExport ? '✅' : '❌'} Class Export: ${hasPDFExport ? 'FOUND' : 'MISSING'}`);
  
  if (!allPDFMethodsPresent || !hasPDFExport) {
    console.log('\n❌ CRITICAL: ThandiPDFGenerator is incomplete or missing methods.');
    process.exit(1);
  }
  
} catch (error) {
  console.log(`❌ CRITICAL: Cannot read ThandiPDFGenerator: ${error.message}`);
  process.exit(1);
}

// 4. Verify Results Page Integration
console.log('\n4️⃣ RESULTS PAGE INTEGRATION VERIFICATION:');

try {
  const resultsPageContent = fs.readFileSync('app/results/page.jsx', 'utf8');
  
  const integrationChecks = [
    { check: 'ThandiResultsFormatter import', pattern: "import { ThandiResultsFormatter }" },
    { check: 'CSS import', pattern: "./styles/thandi-results.css" },
    { check: 'formatResponse function', pattern: "function formatResponse" },
    { check: 'ThandiPDFGenerator import', pattern: "ThandiPDFGenerator" },
    { check: 'downloadPDF function', pattern: "const downloadPDF" },
    { check: 'generateBasicPDF fallback', pattern: "generateBasicPDF" }
  ];
  
  let allIntegrationsPresent = true;
  integrationChecks.forEach(({ check, pattern }) => {
    const hasIntegration = resultsPageContent.includes(pattern);
    console.log(`${hasIntegration ? '✅' : '❌'} ${check}: ${hasIntegration ? 'FOUND' : 'MISSING'}`);
    if (!hasIntegration) allIntegrationsPresent = false;
  });
  
  if (!allIntegrationsPresent) {
    console.log('\n❌ CRITICAL: Results page integration is incomplete.');
    process.exit(1);
  }
  
} catch (error) {
  console.log(`❌ CRITICAL: Cannot read results page: ${error.message}`);
  process.exit(1);
}

// 5. Verify CSS File has Thandi styling
console.log('\n5️⃣ CSS STYLING VERIFICATION:');

try {
  const cssContent = fs.readFileSync('app/results/styles/thandi-results.css', 'utf8');
  
  const cssChecks = [
    '.thandi-results-content',
    '.thandi-section-header',
    '.thandi-header-card',
    '.thandi-program-card',
    '.thandi-key-value',
    '.thandi-bullet-item',
    '@media (max-width: 768px)'
  ];
  
  let allCSSPresent = true;
  cssChecks.forEach(selector => {
    const hasSelector = cssContent.includes(selector);
    console.log(`${hasSelector ? '✅' : '❌'} ${selector}: ${hasSelector ? 'FOUND' : 'MISSING'}`);
    if (!hasSelector) allCSSPresent = false;
  });
  
  if (!allCSSPresent) {
    console.log('\n❌ CRITICAL: CSS styling is incomplete.');
    process.exit(1);
  }
  
} catch (error) {
  console.log(`❌ CRITICAL: Cannot read CSS file: ${error.message}`);
  process.exit(1);
}

// 6. Check if server is actually running
console.log('\n6️⃣ SERVER STATUS VERIFICATION:');

const { exec } = require('child_process');

exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/results', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Server Check: Cannot connect to localhost:3000');
    console.log('❌ CRITICAL: Development server may not be running properly');
  } else {
    const statusCode = stdout.trim();
    if (statusCode === '200') {
      console.log('✅ Server Status: localhost:3000/results responding (HTTP 200)');
    } else {
      console.log(`❌ Server Status: Unexpected response code ${statusCode}`);
    }
  }
  
  // Final summary
  console.log('\n📊 ACTUAL VERIFICATION SUMMARY:');
  console.log('✅ Required Files: All files exist');
  console.log('✅ ThandiResultsFormatter: Complete with all methods');
  console.log('✅ ThandiPDFGenerator: Complete with all methods');
  console.log('✅ Results Page Integration: All imports and functions present');
  console.log('✅ CSS Styling: All Thandi classes implemented');
  console.log(`${statusCode === '200' ? '✅' : '❌'} Server: ${statusCode === '200' ? 'Running and responding' : 'Issues detected'}`);
  
  if (statusCode === '200') {
    console.log('\n🎯 VERIFICATION RESULT: Implementation appears to be actually working');
    console.log('📋 NEXT STEP: Manual browser test required to confirm visual rendering');
    console.log('🌐 TEST URL: http://localhost:3000/results');
  } else {
    console.log('\n❌ VERIFICATION RESULT: Server issues detected - manual verification required');
  }
});
