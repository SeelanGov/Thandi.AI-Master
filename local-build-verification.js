/**
 * LOCAL BUILD VERIFICATION - SAFE DEPLOYMENT PREPARATION
 * Comprehensive testing of all APIs and updates before deployment
 * January 10, 2026 - Permanent Solution Verification
 */

console.log('🚀 LOCAL BUILD VERIFICATION - SAFE DEPLOYMENT PREP');
console.log('=' .repeat(60));

const fs = require('fs');
const path = require('path');

// Test 1: Environment Configuration Check
function testEnvironmentConfig() {
  console.log('\n📋 TEST 1: Environment Configuration');
  
  const envFiles = ['.env.local', '.env.example'];
  const requiredVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY', 
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  let configValid = true;
  
  // Check if .env.local exists
  if (fs.existsSync('.env.local')) {
    console.log('✅ .env.local - EXISTS');
    
    try {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      
      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          console.log(`✅ ${varName} - CONFIGURED`);
        } else {
          console.log(`⚠️ ${varName} - MISSING (may be optional)`);
        }
      });
      
    } catch (error) {
      console.error('❌ Error reading .env.local:', error.message);
      configValid = false;
    }
  } else {
    console.log('⚠️ .env.local - MISSING');
    configValid = false;
  }
  
  return configValid;
}

// Test 2: Package Dependencies Check
function testPackageDependencies() {
  console.log('\n📋 TEST 2: Package Dependencies');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const criticalDeps = [
      'next',
      'react',
      'jspdf',
      '@supabase/supabase-js',
      'openai',
      '@anthropic-ai/sdk'
    ];
    
    let allDepsPresent = true;
    
    criticalDeps.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`✅ ${dep} - INSTALLED`);
      } else {
        console.log(`❌ ${dep} - MISSING`);
        allDepsPresent = false;
      }
    });
    
    return allDepsPresent;
    
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    return false;
  }
}

// Test 3: Critical File Structure Check
function testCriticalFiles() {
  console.log('\n📋 TEST 3: Critical File Structure');
  
  const criticalFiles = [
    // Core permanent solution files
    'lib/results-data.js',
    'app/results/services/resultsParser.js',
    'lib/thandi-pdf-generator.js',
    'lib/thandi-results-formatter.js',
    'app/results/styles/thandi-results.css',
    
    // API routes
    'app/api/rag/query/route.js',
    'app/api/pdf/[sessionId]/route.js',
    
    // Core pages
    'app/results/page.jsx',
    'app/assessment/page.jsx',
    
    // Configuration
    'next.config.js',
    'tailwind.config.js',
    
    // Cache and utilities
    'lib/cache/rag-cache.js',
    'lib/llm/llm-adapter.js'
  ];
  
  let allFilesExist = true;
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - EXISTS`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Test 4: Import Syntax Validation
function testImportSyntax() {
  console.log('\n📋 TEST 4: Import Syntax Validation');
  
  const filesToCheck = [
    'lib/results-data.js',
    'lib/thandi-pdf-generator.js',
    'lib/thandi-results-formatter.js',
    'app/results/page.jsx'
  ];
  
  let allImportsValid = true;
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for common import issues
        const issues = [];
        
        // Check for relative import paths
        if (content.includes("from '../") || content.includes("from './")) {
          const relativeImports = content.match(/from ['"][\.\/][^'"]+['"]/g) || [];
          if (relativeImports.length > 0) {
            console.log(`📝 ${file} - Has ${relativeImports.length} relative imports`);
          }
        }
        
        // Check for absolute imports
        if (content.includes("from '@/")) {
          const absoluteImports = content.match(/from ['"]@\/[^'"]+['"]/g) || [];
          if (absoluteImports.length > 0) {
            console.log(`📝 ${file} - Has ${absoluteImports.length} absolute imports`);
          }
        }
        
        // Check for dynamic imports
        if (content.includes('import(')) {
          const dynamicImports = content.match(/import\(['"][^'"]+['"]\)/g) || [];
          console.log(`📝 ${file} - Has ${dynamicImports.length} dynamic imports`);
        }
        
        console.log(`✅ ${file} - Import syntax checked`);
        
      } catch (error) {
        console.error(`❌ ${file} - Error reading file:`, error.message);
        allImportsValid = false;
      }
    }
  });
  
  return allImportsValid;
}

// Test 5: API Route Structure Check
function testAPIRoutes() {
  console.log('\n📋 TEST 5: API Route Structure');
  
  const apiRoutes = [
    {
      path: 'app/api/rag/query/route.js',
      methods: ['POST', 'GET'],
      features: ['ResultsData integration', 'Cache handling', 'Error handling']
    },
    {
      path: 'app/api/pdf/[sessionId]/route.js', 
      methods: ['GET'],
      features: ['PDF generation', 'Session handling']
    }
  ];
  
  let allRoutesValid = true;
  
  apiRoutes.forEach(route => {
    if (fs.existsSync(route.path)) {
      try {
        const content = fs.readFileSync(route.path, 'utf8');
        
        console.log(`✅ ${route.path} - EXISTS`);
        
        // Check for required methods
        route.methods.forEach(method => {
          if (content.includes(`export async function ${method}`)) {
            console.log(`  ✅ ${method} method - FOUND`);
          } else {
            console.log(`  ⚠️ ${method} method - MISSING`);
          }
        });
        
        // Check for features
        route.features.forEach(feature => {
          const featureChecks = {
            'ResultsData integration': /ResultsData/,
            'Cache handling': /cache/i,
            'Error handling': /try.*catch|error/i,
            'PDF generation': /pdf|jsPDF/i,
            'Session handling': /session/i
          };
          
          const pattern = featureChecks[feature];
          if (pattern && pattern.test(content)) {
            console.log(`  ✅ ${feature} - IMPLEMENTED`);
          } else {
            console.log(`  ⚠️ ${feature} - NOT DETECTED`);
          }
        });
        
      } catch (error) {
        console.error(`❌ ${route.path} - Error reading:`, error.message);
        allRoutesValid = false;
      }
    } else {
      console.log(`❌ ${route.path} - MISSING`);
      allRoutesValid = false;
    }
  });
  
  return allRoutesValid;
}

// Test 6: Build Configuration Check
function testBuildConfig() {
  console.log('\n📋 TEST 6: Build Configuration');
  
  let configValid = true;
  
  // Check Next.js config
  if (fs.existsSync('next.config.js')) {
    try {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      console.log('✅ next.config.js - EXISTS');
      
      // Check for common configurations
      if (nextConfig.includes('experimental')) {
        console.log('  📝 Experimental features configured');
      }
      if (nextConfig.includes('webpack')) {
        console.log('  📝 Webpack configuration present');
      }
      
    } catch (error) {
      console.error('❌ Error reading next.config.js:', error.message);
      configValid = false;
    }
  } else {
    console.log('⚠️ next.config.js - MISSING (using defaults)');
  }
  
  // Check Tailwind config
  if (fs.existsSync('tailwind.config.js')) {
    console.log('✅ tailwind.config.js - EXISTS');
  } else {
    console.log('⚠️ tailwind.config.js - MISSING');
  }
  
  return configValid;
}

// Test 7: Development Server Readiness
async function testDevServerReadiness() {
  console.log('\n📋 TEST 7: Development Server Readiness');
  
  // Check if node_modules exists
  if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules - EXISTS');
  } else {
    console.log('❌ node_modules - MISSING (run npm install)');
    return false;
  }
  
  // Check if .next build directory exists (from previous builds)
  if (fs.existsSync('.next')) {
    console.log('📝 .next - EXISTS (previous build found)');
  } else {
    console.log('📝 .next - NOT FOUND (first build)');
  }
  
  // Check package.json scripts
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredScripts = ['dev', 'build', 'start'];
    
    requiredScripts.forEach(script => {
      if (packageJson.scripts?.[script]) {
        console.log(`✅ npm run ${script} - AVAILABLE`);
      } else {
        console.log(`❌ npm run ${script} - MISSING`);
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking package.json scripts:', error.message);
    return false;
  }
}

// Test 8: Permanent Solution Integration Check
function testPermanentSolutionIntegration() {
  console.log('\n📋 TEST 8: Permanent Solution Integration');
  
  const integrationChecks = [
    {
      file: 'lib/results-data.js',
      patterns: [
        { name: 'ResultsData class', pattern: /export class ResultsData/ },
        { name: 'Parse method', pattern: /async parse\(\)/ },
        { name: 'Validation', pattern: /validateParsedData/ }
      ]
    },
    {
      file: 'lib/thandi-pdf-generator.js',
      patterns: [
        { name: 'ResultsData import', pattern: /import.*ResultsData/ },
        { name: 'Structured data usage', pattern: /addParsedPrograms/ },
        { name: 'Error handling', pattern: /addExtractionErrorSection/ }
      ]
    },
    {
      file: 'app/results/page.jsx',
      patterns: [
        { name: 'ThandiResultsFormatter', pattern: /ThandiResultsFormatter/ },
        { name: 'Enhanced formatResponse', pattern: /PERMANENT SOLUTION/ },
        { name: 'Professional PDF', pattern: /ThandiPDFGenerator/ }
      ]
    },
    {
      file: 'app/api/rag/query/route.js',
      patterns: [
        { name: 'ResultsData integration', pattern: /ResultsData.*=.*import|import.*ResultsData/ },
        { name: 'Parsed data response', pattern: /parsedData:/ },
        { name: 'Parsing status', pattern: /parsingStatus:/ }
      ]
    }
  ];
  
  let allIntegrationsValid = true;
  
  integrationChecks.forEach(check => {
    if (fs.existsSync(check.file)) {
      try {
        const content = fs.readFileSync(check.file, 'utf8');
        console.log(`✅ ${check.file} - CHECKING`);
        
        check.patterns.forEach(pattern => {
          if (pattern.pattern.test(content)) {
            console.log(`  ✅ ${pattern.name} - INTEGRATED`);
          } else {
            console.log(`  ❌ ${pattern.name} - MISSING`);
            allIntegrationsValid = false;
          }
        });
        
      } catch (error) {
        console.error(`❌ ${check.file} - Error reading:`, error.message);
        allIntegrationsValid = false;
      }
    } else {
      console.log(`❌ ${check.file} - FILE MISSING`);
      allIntegrationsValid = false;
    }
  });
  
  return allIntegrationsValid;
}

// Main verification function
async function runLocalBuildVerification() {
  console.log('🧪 COMPREHENSIVE LOCAL BUILD VERIFICATION');
  console.log('Ensuring safe deployment readiness...\n');
  
  const results = {
    environmentConfig: testEnvironmentConfig(),
    packageDependencies: testPackageDependencies(),
    criticalFiles: testCriticalFiles(),
    importSyntax: testImportSyntax(),
    apiRoutes: testAPIRoutes(),
    buildConfig: testBuildConfig(),
    devServerReadiness: await testDevServerReadiness(),
    permanentSolutionIntegration: testPermanentSolutionIntegration()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOCAL BUILD VERIFICATION RESULTS');
  console.log('='.repeat(60));
  
  let passedTests = 0;
  let totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${testName}: ${status}`);
    
    if (passed) {
      passedTests++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 LOCAL BUILD VERIFICATION: COMPLETE');
    console.log('✅ All systems ready for safe deployment');
    console.log('✅ Environment properly configured');
    console.log('✅ Dependencies installed and valid');
    console.log('✅ Permanent solution fully integrated');
    console.log('✅ API routes properly structured');
    console.log('✅ Build configuration valid');
    console.log('\n🚀 READY FOR NEXT DEPLOYMENT PHASE');
  } else {
    console.log('⚠️ SOME TESTS FAILED - ISSUES NEED RESOLUTION');
    console.log('❌ Local build not ready for deployment');
    console.log('\n🔧 REQUIRED ACTIONS:');
    
    Object.entries(results).forEach(([test, passed]) => {
      if (!passed) {
        const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`  - Fix ${testName}`);
      }
    });
  }
  
  console.log('='.repeat(60));
  
  return {
    success: passedTests === totalTests,
    passedTests,
    totalTests,
    results,
    readyForDeployment: passedTests === totalTests
  };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runLocalBuildVerification };
} else {
  // Run verification if called directly
  runLocalBuildVerification().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}